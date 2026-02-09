import { COMPANY_CONTEXT } from './companyContext';
import { getEnrichedProfile, generatePromptContext, generateResponseRules } from './personaProfiles';

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
        // 🔍 DEBUG: Log para verificar se enrichedProfileId está chegando
        console.log('[AI Debug] Scenario context:', {
            title: scenarioContext.title,
            enrichedProfileId: scenarioContext.enrichedProfileId,
            hasProfile: !!scenarioContext.enrichedProfileId
        });

        // Tenta carregar perfil enriquecido se existir
        const enrichedProfile = scenarioContext.enrichedProfileId
            ? getEnrichedProfile(scenarioContext.enrichedProfileId)
            : null;

        let systemPrompt = "";

        if (enrichedProfile) {
            // ========== PROMPT AVANÇADO COM CONTEXTO RICO ==========
            const contextBlock = generatePromptContext(enrichedProfile);
            const rulesBlock = generateResponseRules(enrichedProfile);

            systemPrompt = `
Você é um LEAD REALÍSTICO em uma cold call de vendas. Sua tarefa é atuar como ${enrichedProfile.decisionMaker.name}, atendendo o telefone no seu estabelecimento.

${contextBlock}

${rulesBlock}

INFORMAÇÕES SOBRE O QUE ESTÃO TE VENDENDO (VOPPI):
${COMPANY_CONTEXT.valueProposition}

Modelo de negócio: ${COMPANY_CONTEXT.distributionAndMarketing}
Pricing: ${COMPANY_CONTEXT.pricing}

==========================================
INSTRUÇÕES CRÍTICAS DE ATUAÇÃO:
==========================================

1️⃣ COERÊNCIA ABSOLUTA:
   - SEMPRE responda ao que o vendedor acabou de dizer
   - NÃO ignore perguntas ou informações dele
   - Se ele mencionar algo específico do SEU negócio (ex: Instagram, dias fracos), RECONHEÇA isso

2️⃣ MEMÓRIA CONVERSACIONAL:
   - Lembre do que JÁ foi dito na conversa
   - Se você já perguntou algo, não pergunte de novo
   - Se ele já se apresentou, não pergunte o nome novamente

3️⃣ NATURALIDADE:
   - Máximo 2 frases por resposta (você está ocupado)
   - Use detalhes do SEU estabelecimento (${enrichedProfile.businessProfile.name})
   - Fale como uma pessoa real, não como chatbot
   - Pode interromper se ele enrolar muito

4️⃣ REAÇÕES CONTEXTUAIS:
   ${enrichedProfile.interestTriggers.positive.map((t, i) => `   ${String.fromCharCode(97 + i)}) Se ele ${t.toLowerCase()} → mostre um pouco mais de interesse`).join('\n')}
   
   ${enrichedProfile.interestTriggers.negative.map((t, i) => `   ${String.fromCharCode(97 + i)}) Se ele ${t.toLowerCase()} → fique mais seco e desconfiado`).join('\n')}

5️⃣ EXEMPLOS DE BOAS RESPOSTAS:
   ❌ RUIM: "Não tenho interesse."
   ✅ BOM: "Olha, tá corrido aqui. O que você quer?"
   
   ❌ RUIM: "Me manda no WhatsApp."
   ✅ BOM: "Quarta-feira é meu dia mais fraco mesmo... mas o que vocês fazem diferente do iFood?"

==========================================
            `.trim();
        } else {
            // ========== PROMPT BÁSICO (FALLBACK) ==========
            const leadName = LEAD_NAMES[Math.floor(Math.random() * LEAD_NAMES.length)];

            systemPrompt = `
Você é um lead comercial REALÍSTICO (${COMPANY_CONTEXT.segment}).
Seu nome é ${leadName}. 
No momento você é: ${scenarioContext.leadType?.name || 'um proprietário de estabelecimento'}.

ESTILO DE CONVERSA:
- Aja como se estivesse atendendo o telefone no seu negócio (pode haver barulho de fundo).
- Não fale como um robô. Fale como uma pessoa real.
- Seja direto: donos de negócios têm pouco tempo.
- SEMPRE responda ao que foi perguntado.

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
5. Use gírias corporativas de forma leve.
6. SEMPRE responda ao que o vendedor realmente disse, não ignore perguntas.
            `.trim();
        }

        // Preparar histórico da conversa
        const historyContext = messages.map(m => `${m.role === 'user' ? 'Vendedor' : 'Você (Lead)'}:  ${m.content}`).join('\n');

        // Análise rápida do último contexto para reforçar coerência
        const lastUserMessage = messages[messages.length - 1]?.content || "";
        const coherenceCheck = `
        
⚠️ O VENDEDOR ACABOU DE DIZER: "${lastUserMessage}"
→ Sua resposta DEVE reagir diretamente a isso. Não mude de assunto.
        `.trim();

        const finalPrompt = `${systemPrompt}\n\n${'='.repeat(60)}\nHISTÓRICO DA CONVERSA:\n${'='.repeat(60)}\n${historyContext}\n\n${coherenceCheck}\n\nSua resposta (máx 2 frases):`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: finalPrompt }]
                }],
                generationConfig: {
                    temperature: 0.8,  // Um pouco de variabilidade natural
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 150  // Forçar respostas curtas
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return callSimulation(messages, scenarioContext);
        }

        let aiResponse = data.candidates[0].content.parts[0].text.trim();

        // Limpar possíveis artefatos de formatação
        aiResponse = aiResponse.replace(/^(Lead|Você \(Lead\)|Ricardo|Patrícia):?\s*/i, '').trim();

        return aiResponse;
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

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
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
