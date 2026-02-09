import { COMPANY_CONTEXT } from './companyContext';

const SIMULATION_RESPONSES = {
    'skeptical': [
        "Olha, eu já recebi várias ligações dessa. O que vocês têm de diferente?",
        "Não estou convencido de que isso traga retorno real para o meu restaurante.",
        "Muitas taxas. Como eu sei que não vou perder dinheiro?",
        "Já uso outros apps e eles me dão muito trabalho.",
        "O pessoal do Prime Gourmet já passou aqui e a conta não fechou."
    ],
    'busy': [
        "Estou no meio do serviço agora, pode ser rápido?",
        "Temos muito movimento hoje. O que você quer exatamente?",
        "Não tenho tempo para apresentações longas.",
        "Se for para vender anúncio, eu não quero.",
        "Estou com a cozinha cheia, me liga em outra hora?"
    ],
    'innovator': [
        "Interessante... como funciona a integração com meu sistema?",
        "Estou buscando novas formas de atrair público jovem.",
        "Vocês trabalham com algum tipo de automação?",
        "Me conte mais sobre como a Voppi ajuda no meu marketing.",
        "Vi algo parecido em São Paulo, vocês atendem essa região?"
    ]
};

const LEAD_NAMES = ["Ricardo", "Patrícia", "Sérgio", "Márcia", "Fernando", "Cláudia", "Roberto", "Silvana"];

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
            Você é um lead comercial REALÍSTICO (${COMPANY_CONTEXT.segment}).
            Seu nome é ${LEAD_NAMES[Math.floor(Math.random() * LEAD_NAMES.length)]}. 
            No momento você é: ${scenarioContext.leadType?.name || 'um proprietário de estabelecimento'}.
            
            ESTILO DE CONVERSA:
            - Aja como se estivesse atendendo o telefone no seu negócio (pode haver barulho de fundo).
            - Não fale como um robô ("Sou o dono"). Fale como uma pessoa ("Opa, pois não?", "Sou eu mesmo, quem fala?").
            - Seja direto: donos de negócios têm pouco tempo.
            - Responda apenas o que foi perguntado, mas mantenha a personalidade.
            
            SOBRE SEU NEGÓCIO:
            - Público: ${COMPANY_CONTEXT.targetAudience}
            - Dificuldades: ${COMPANY_CONTEXT.mainObjections.join(', ')}
            
            O QUE ESTÃO TE VENDENDO (VOPPI):
            ${COMPANY_CONTEXT.valueProposition}
            
            SUA PERSONA:
            - Perfil: ${scenarioContext.leadType?.description || 'Exigente com custos e resultados'}.
            - Objetivo: Agir como o lead no cenário "${scenarioContext.title}".
            
            REGRAS DE OURO:
            1. Máximo 2 frases por resposta.
            2. Não dê seu nome de cara se não confia no vendedor.
            3. Se o vendedor for vago ou "vendedorzão" demais, seja mais seco.
            4. Se ele citar um "case" ou algo específico do seu Instagram, mostre um pouco mais de atenção.
            5. Use gírias corporativas de forma leve (ex: "momento", "retorno", "fluxo").
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
    const historyCount = messages.filter(m => m.role === 'assistant').length;
    const type = scenarioContext.leadType?.id || 'skeptical';
    const responses = SIMULATION_RESPONSES[type] || SIMULATION_RESPONSES.skeptical;

    // Greeting logic
    if (historyCount <= 1) {
        if (lastUserMsg.includes('nome') || lastUserMsg.includes('quem fala')) {
            return `Aqui é o ${LEAD_NAMES[0]}. O que você quer exatamente?`;
        }
    }

    // Keyword logic with more variety
    if (lastUserMsg.includes('preço') || lastUserMsg.includes('taxa') || lastUserMsg.includes('quanto custa')) {
        return "Todo mundo fala que não tem custo, mas sempre tem uma pegadinha. Qual a porcentagem de vocês?";
    }
    if (lastUserMsg.includes('olá') || lastUserMsg.includes('bom dia') || lastUserMsg.includes('boa tarde')) {
        if (historyCount > 1) return "Como eu disse, estou corrido. Pode ir direto ao ponto?";
        return "Opa, tudo bem? Quem fala?";
    }
    if (lastUserMsg.includes('parceria') || lastUserMsg.includes('ajudar')) {
        return "Cara, recebo 5 ligações de 'parceria' por dia. O que a Voppi faz que o Instagram sozinho não faz?";
    }
    if (lastUserMsg.includes('agendar') || lastUserMsg.includes('reunião') || lastUserMsg.includes('visita')) {
        return "Não quero agendar nada antes de entender se isso faz sentido pro meu caixa. Me explica mais aqui.";
    }

    // Default random from persona with simple rotation to avoid repetition
    return responses[messages.length % responses.length];
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
