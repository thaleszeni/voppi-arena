import { COMPANY_CONTEXT } from './companyContext';

const SIMULATION_RESPONSES = {
    'skeptical': [
        "Olha, eu já recebi várias ligações dessa. O que vocês têm de diferente?",
        "Não estou convencido de que isso traga retorno real para o meu restaurante.",
        "Muitas taxas. Como eu sei que não vou perder dinheiro?",
        "Já uso outros apps e eles me dão muito trabalho."
    ],
    'busy': [
        "Estou no meio do serviço agora, pode ser rápido?",
        "Temos muito movimento hoje. O que você quer exatamente?",
        "Não tenho tempo para apresentações longas.",
        "Se for para vender anúncio, eu não quero."
    ],
    'innovator': [
        "Interessante... como funciona a integração com meu sistema?",
        "Estou buscando novas formas de atrair público jovem.",
        "Vocês trabalham com algum tipo de automação?",
        "Me conte mais sobre como a Voppi ajuda no meu marketing."
    ]
};

export async function getAIResponse(messages, scenarioContext) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
        return callRealLLM(messages, scenarioContext, apiKey);
    } else {
        return callSimulation(messages, scenarioContext);
    }
}

async function callRealLLM(messages, scenarioContext, apiKey) {
    try {
        const systemPrompt = `
            Você é um lead comercial da Voppi (${COMPANY_CONTEXT.segment}). 
            No momento você é: ${scenarioContext.leadType?.name || 'um dono de restaurante ocupado'}.
            
            SOBRE SEU NEGÓCIO:
            - Público Alvo: ${COMPANY_CONTEXT.targetAudience}
            - Dores Comuns: ${COMPANY_CONTEXT.mainObjections.join(', ')}
            
            O QUE ESTÃO TE VENDENDO (VOPPI):
            - Proposta de Valor: ${COMPANY_CONTEXT.valueProposition}
            - Marketing/Distribuição: ${COMPANY_CONTEXT.distributionAndMarketing}
            - Preço: ${COMPANY_CONTEXT.pricing}
            - Cases de Sucesso: ${COMPANY_CONTEXT.successCases}
            
            SUA PERSONA:
            - Perfil: ${scenarioContext.leadType?.description || 'Cético e focado em custos'}.
            - Objetivo: ${scenarioContext.leadType?.promptMod || 'agir como um lead real, difícil de convencer'}.
            - Contexto do Cenário: ${scenarioContext.title}. ${scenarioContext.description}.
            
            REGRAS DE INTERAÇÃO:
            1. Responda de forma curta e natural (máx 2 frases).
            2. Use as "Dores Comuns" para criar objeções reais.
            3. Se o vendedor citar dados errados sobre a Voppi (diferente do contexto acima), corrija-o ou mostre desconfiança.
            4. Se o vendedor for muito bom e cobrir suas objeções, comece a ceder aos poucos.
            5. NUNCA mencione que você é uma IA.
        `;

        // Prepare context from history
        const historyContext = messages.map(m => `${m.role === 'user' ? 'Comercial' : 'Lead'}: ${m.content}`).join('\n');

        const finalPrompt = `${systemPrompt}\n\nHistórico da conversa:\n${historyContext}\n\nResponda como o Lead:`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: finalPrompt }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return callSimulation(messages, scenarioContext);
        }

        return data.candidates[0].content.parts[0].text;
    } catch (err) {
        console.error("AI Error:", err);
        return callSimulation(messages, scenarioContext);
    }
}

function callSimulation(messages, scenarioContext) {
    const lastUserMsg = messages[messages.length - 1].content.toLowerCase();
    const type = scenarioContext.leadType?.id || 'skeptical';
    const responses = SIMULATION_RESPONSES[type] || SIMULATION_RESPONSES.skeptical;

    // Logic to select response based on keywords
    if (lastUserMsg.includes('preço') || lastUserMsg.includes('taxa')) {
        return "As taxas são sempre o problema. Como vocês justificam o valor que cobram?";
    }
    if (lastUserMsg.includes('olá') || lastUserMsg.includes('bom dia')) {
        return "Olá. Sou o dono. O que você deseja? Tenho pouco tempo.";
    }
    if (lastUserMsg.includes('parceria') || lastUserMsg.includes('ajudar')) {
        return "Todo mundo fala em parceria, mas no final eu que pago a conta. O que vocês trazem de clientes novos?";
    }

    // Default random from persona
    return responses[Math.floor(Math.random() * responses.length)];
}

export async function evaluateRoleplay(history, scenarioContext) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // Default fallback structure
    const fallbackResult = {
        scores: { strategy: 50, clarity: 50, tone: 50, diagnosis: 50, closing: 50 },
        feedback: "Houve um erro na avaliação. Tente novamente.",
        totalXP: 50
    };

    try {
        // If we have an API key, use it for a much better evaluation
        if (apiKey) {
            try {
                const historyText = history.map(m => `${m.role === 'user' ? 'Vendedor' : 'Lead'}: ${m.content}`).join('\n');
                const guidelines = COMPANY_CONTEXT.salesGuidelines || {};

                const prompt = `
                Você é um treinador de vendas sênior da Voppi. Avalie a seguinte conversa de roleplay.
                
                CONTEXTO VOPPI:
                ${COMPANY_CONTEXT.valueProposition}
                
                DIRETRIZES DE SUCESSO DO TIME COMERCIAL:
                Objetivo: ${guidelines.coldCallGoal || 'Agendar reunião'}
                O que é BOM:
                ${(guidelines.whatGoodSoundsLike || []).join('\n- ')}
                
                O que é RUIM:
                ${(guidelines.whatBadSoundsLike || []).join('\n- ')}
                
                CONVERSA:
                ${historyText}
                
                TAREFA:
                Avalie o Vendedor e retorne APENAS um JSON (sem markdown) no seguinte formato:
                {
                    "scores": {
                        "strategy": 0-100, // Seguiu o processo?
                        "clarity": 0-100, // Foi claro sobre a proposta?
                        "tone": 0-100, // Foi educado e firme?
                        "diagnosis": 0-100, // Fez perguntas ou só falou?
                        "closing": 0-100 // Tentou fechar/agendar?
                    },
                    "feedback": "Uma frase resumindo o desempenho e uma dica prática baseada no erro principal."
                }
            `;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });

                const data = await response.json();
                const text = data.candidates[0].content.parts[0].text;

                // Clean markdown if present
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const result = JSON.parse(jsonStr);

                // Calculate total XP based on avg score
                const avg = Object.values(result.scores).reduce((a, b) => a + b, 0) / 5;

                return {
                    scores: result.scores,
                    feedback: result.feedback,
                    totalXP: Math.round(avg * 2.5) // Scale up slightly
                };

            } catch (err) {
                console.error("AI Eval Error:", err);
                // Fallback to heuristics below
            }
        }

        const userMessages = history.filter(m => m.role === 'user');
        const lastMessage = userMessages[userMessages.length - 1]?.content.toLowerCase() || '';

        // Default scores
        let scores = {
            strategy: 50,
            clarity: 50,
            tone: 50,
            diagnosis: 20,
            closing: 20
        };

        // Heuristics
        const totalWords = userMessages.reduce((acc, msg) => acc + msg.content.split(' ').length, 0);
        const avgWords = totalWords / (userMessages.length || 1);

        // 1. Clarity: Short messages are better in chat
        if (avgWords < 20) scores.clarity += 20;
        if (avgWords < 10) scores.clarity += 10;

        // 2. Diagnosis: Asking questions
        const questionCount = userMessages.filter(m => m.content.includes('?')).length;
        scores.diagnosis += Math.min(questionCount * 15, 60); // Max 80 total

        // 3. Tone: Politeness keywords
        const politeWords = ['obrigado', 'por favor', 'entendo', 'ótimo', 'certo'];
        const hasPolite = userMessages.some(m => politeWords.some(w => m.content.toLowerCase().includes(w)));
        if (hasPolite) scores.tone += 30;

        // 4. Closing: Action words in the end
        const closingWords = ['agendar', 'reunião', 'visita', 'amanhã', 'semana que vem', 'demo'];
        if (closingWords.some(w => lastMessage.includes(w))) {
            scores.closing += 60;
            scores.strategy += 20;
        }

        // 5. Strategy: Engagement length (too short = bad, too long = bad)
        if (userMessages.length >= 3 && userMessages.length <= 8) scores.strategy += 20;

        // Cap scores at 100
        Object.keys(scores).forEach(k => scores[k] = Math.min(100, scores[k]));

        const totalXP = Math.round(
            (scores.strategy + scores.clarity + scores.tone + scores.diagnosis + scores.closing) / 5 * 2 // ~200 XP avg
        );

        let feedback = "Bom esforço! ";
        if (scores.closing < 50) feedback += "Você precisa tentar fechar a venda ou agendar um próximo passo no final. ";
        if (scores.diagnosis < 50) feedback += "Faça mais perguntas para entender o cliente. ";
        if (scores.clarity > 80) feedback += "Sua comunicação foi direta e clara. Parabéns!";

        return {
            scores,
            feedback,
            totalXP
        };
    } catch (err) {
        console.error("Critical Error in evaluateRoleplay:", err);
        return fallbackResult;
    }
}
