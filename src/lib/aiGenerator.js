export async function generateScenarioStructure(topic, difficulty = 'normal') {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("API Key não configurada.");
    }

    const systemPrompt = `
        Você é um especialista em Treinamento de Vendas e Criador de Cenários de Roleplay.
        Sua tarefa é criar um cenário de vendas realista para treinamento de vendedores.
        
        TEMA DO CENÁRIO: "${topic}"
        DIFICULDADE: ${difficulty} (1 = Fácil, 5 = Difícil)

        Você deve retornar APENAS um objeto JSON válido (sem markdown, sem \`\`\`) que corresponda EXATAMENTE à estrutura de dados abaixo para ser importado em um Builder.
        
        ESTRUTURA JSON ESPERADA:
        {
            "metadata": {
                "title": "Título curto e atrativo (ex: Venda de Software para RH)",
                "description": "Descrição do contexto e objetivo do aluno.",
                "difficulty": ${difficulty === 'hard' ? 5 : difficulty === 'easy' ? 1 : 3},
                "category": "sales_negotiation",
                "icon": "Emoji representativo",
                "minLevel": 1,
                "duration": "10-15 min"
            },
            "persona": {
                "name": "Nome do Lead (Cliente)",
                "role": "Cargo do Lead",
                "tone": "Descrição do comportamento (ex: Cético, Apressado, Amigável)",
                "objections": "Lista de 3 principais objeções separadas por vírgula"
            },
            "nodes": [
                {
                    "id": "start",
                    "type": "npc",
                    "text": "Fala inicial do Lead quando atende o telefone ou recebe o vendedor.",
                    "options": [
                        { "label": "Opção de resposta Ruim (Agressiva/Genérica)", "nextId": "node_2_bad", "feedback": "Feedback curto explicando o erro." },
                        { "label": "Opção de resposta Boa (Consultiva/Empática)", "nextId": "node_2_good", "feedback": "Feedback curto elogiando." }
                    ]
                },
                {
                    "id": "node_2_bad",
                    "type": "npc",
                    "text": "Reação negativa do Lead à abordagem ruim. Ele tenta encerrar.",
                    "options": [
                         { "label": "Tentar recuperar (Insistir)", "nextId": "failure", "feedback": "Insistir gera bloqueio." }
                    ]
                },
                {
                    "id": "node_2_good",
                    "type": "npc",
                    "text": "Reação positiva do Lead. Ele faz uma pergunta de qualificação ou objeção.",
                    "options": [
                        { "label": "Responder objeção com técnica", "nextId": "node_3_closing", "feedback": "Boa técnica de contorno." },
                         { "label": "Gaguejar ou concordar com a objeção", "nextId": "failure", "feedback": "Faltou firmeza." }
                    ]
                },
                {
                    "id": "node_3_closing",
                    "type": "npc",
                    "text": "Lead demonstrando interesse. Pergunta sobre próximos passos.",
                    "options": [
                        { "label": "Propor reunião/fechamento", "nextId": "success", "feedback": "Ótimo fechamento!" }
                    ]
                }
            ]
        }

        REGRAS IMPORTANTES:
        1. O JSON deve ser válido.
        2. Crie pelo menos 4 nós (steps).
        3. O nó inicial DEVE ter id "start".
        4. Use "success" e "failure" como nextId para fins de fluxo.
        5. Seja criativo e realista no texto do diálogo.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Gemini API Error:", data.error);
            throw new Error(data.error.message || "Erro na API Gemini");
        }

        const text = data.candidates[0].content.parts[0].text;
        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonStr);

    } catch (err) {
        console.error("AI Generation Error:", err);
        throw err;
    }
}
