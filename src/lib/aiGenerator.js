import { sendChatRequest } from './llmProvider';

export async function generateScenarioStructure(topic, difficulty = 'normal') {
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
        4. Use "success" e "failure" as nextId para fins de fluxo.
        5. Seja criativo e realista no texto do diálogo.
    `;

    try {
        const result = await sendChatRequest({
            systemPrompt: systemPrompt,
            messages: [],
            temperature: 0.8
        });

        // Clean markdown code blocks if present
        const jsonStr = result.text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonStr);

    } catch (err) {
        console.error("AI Generation Error:", err);
        throw err;
    }
}

