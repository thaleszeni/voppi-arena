
/**
 * Voppi Arena - Centralized Game Configuration
 * XP Table, Milestones, Lead Types, and Difficulty Rules.
 */

export const XP_TABLE = [
    0,      // L0 (unused)
    0,      // L1
    100,    // L2
    160,    // L3
    230,    // L4
    310,    // L5
    400,    // L6
    500,    // L7
    610,    // L8
    730,    // L9
    860,    // L10
];

export const getXPForLevel = (level) => {
    if (level <= 10) return XP_TABLE[level] || 1000;
    // For levels > 10, increment is 150 per level
    return 860 + (level - 10) * 150;
};

export const MILESTONES = [
    { id: 'opening', label: 'Abertura + Permissão', description: 'Respeito ao tempo e validação inicial' },
    { id: 'reason', label: 'Motivo do Contato', description: 'Gancho claro e relevante' },
    { id: 'qualification', label: 'Qualificação (2 perguntas)', description: 'Entender dor e contexto' },
    { id: 'objection', label: 'Contorno de Objeção', description: 'Lidar com a barreira inevitável' },
    { id: 'brief_handling', label: 'Contorno Curto', description: 'Sem palestra, 1-2 frases' },
    { id: 'micro_closing', label: 'Microfechamento', description: 'Propor o próximo passo' },
    { id: 'confirmation', label: 'Confirmação', description: 'Data/hora e próximos passos' },
];

export const LEAD_TYPES = {
    APRESSADO: {
        id: 'apressado',
        name: 'Apressado',
        icon: '⏱️',
        description: 'Sem tempo para conversa fiada. Quer objetividade total.',
        weights: { strategy: 1.2, tone: 1.0, clarity: 1.5 },
        promptMod: 'Seja extremamente curto nas respostas. Se o comercial enrolar, desligue.'
    },
    SCETICO: {
        id: 'scetico',
        name: 'Cético',
        icon: '🤨',
        description: 'Questiona tudo, foca em riscos e experiências passadas negativas.',
        weights: { strategy: 1.5, tone: 1.2, clarity: 1.0 },
        promptMod: 'Duvide das promessas. Peça provas ou casos reais.'
    },
    CONCORRENTE: {
        id: 'concorrente',
        name: 'Já usa Concorrente',
        icon: '⚔️',
        description: 'Está satisfeito com a solução atual (ex: iFood, Groupon).',
        weights: { diagnosis: 1.5, strategy: 1.5, tone: 1.0 },
        promptMod: 'Mencione que já está bem atendido e que não vê motivo para mudar.'
    },
    WHATSAPP_TRAP: {
        id: 'whatsapp-trap',
        name: 'WhatsApp-trap',
        icon: '📱',
        description: 'Pede para "mandar no zap" logo no início.',
        weights: { strategy: 1.5, diagnosis: 1.2, closing: 1.2 },
        promptMod: 'Tente encerrar a ligação pedindo o PDF pelo WhatsApp o tempo todo.'
    },
    RESPO_SECO: {
        id: 'responde-seco',
        name: 'Responde Seco',
        icon: '🧊',
        description: 'Monossilábico. Difícil de arrancar informações.',
        weights: { diagnosis: 1.8, tone: 1.2, strategy: 1.0 },
        promptMod: 'Responda apenas "Sim", "Não", "Talvez". O comercial precisa se esforçar no diagnóstico.'
    },
    SIMPATIZANTE: {
        id: 'simpatizante',
        name: 'Simpatizante',
        icon: '😊',
        description: 'Aberto, mas pode se perder no papo furado.',
        weights: { tone: 1.5, closing: 1.2, strategy: 1.0 },
        promptMod: 'Seja gentil, mas não feche se o comercial não for profissional.'
    }
};

export const DIFFICULTY_RULES = {
    beginner: {
        targetTurns: [8, 12],
        objectionsCount: 1,
        mode: 'guided',
        baseXP: 60,
        bonusXP: 0
    },
    intermediate: {
        targetTurns: [12, 18],
        objectionsCount: 2,
        mode: 'hybrid',
        baseXP: 80,
        bonusXP: 10
    },
    advanced: {
        targetTurns: [18, 25],
        objectionsCount: 3,
        mode: 'free',
        baseXP: 100,
        bonusXP: 20
    }
};

export const REWARDS = {
    CONCLUSION: 60,
    TIMEOUT: 15,
    PERFORMANCE: {
        GOD_LIKE: { min: 90, xp: 40 },
        PRO: { min: 75, xp: 25 },
        GOOD: { min: 60, xp: 15 },
        POOR: { min: 0, xp: 5 }
    },
    EVOLUTION_BONUS: 10,
    RECORE_BONUS: 20,
    CRITICAL_ERROR_PENALTY: -10
};
