import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Client SOBRE-HUMANO com Service Role (pode tudo)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(req) {
    try {
        // 1. Verificação de Segurança (Quem está chamando?)
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Verificar se é admin mesmo (não confie no frontend)
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (profile?.role !== 'admin' && session.user.email !== 'thales@voppimais.com.br' && session.user.email !== 'admin@voppi.com') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 3. Processar a Ação
        const body = await req.json();
        const { action, userId, newPassword } = body;

        console.log(`[Admin API] Action: ${action} on User: ${userId}`);

        if (action === 'confirm_email') {
            const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
                userId,
                { email_confirm: true }
            );
            if (error) throw error;
            return NextResponse.json({ success: true, message: 'Email confirmado manualmente.' });
        }

        if (action === 'reset_password') {
            if (!newPassword) return NextResponse.json({ error: 'Senha nova obrigatória' }, { status: 400 });

            const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
                userId,
                { password: newPassword }
            );
            if (error) throw error;
            return NextResponse.json({ success: true, message: 'Senha atualizada com sucesso.' });
        }

        if (action === 'delete_user') {
            const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
            if (error) throw error;

            // Limpar profile também (embora cascade devesse cuidar)
            await supabaseAdmin.from('profiles').delete().eq('id', userId);

            return NextResponse.json({ success: true, message: 'Usuário deletado.' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('[Admin API Error]', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
