
// Import objections data
import { OBJECTIONS_DATA, getRandomObjection } from './objections';

const generateScenario = (templateId, difficulty = 'normal') => {
    // Deep copy to avoid mutating the template
    const scenario = JSON.parse(JSON.stringify(SCENARIOS_DATA[templateId]));

    if (!scenario) return null;

    scenario.instanceId = `${templateId}-${Date.now()}`;

    // Logic to inject dynamic objections
    // We look for nodes with type 'objection_slot'
    if (scenario.nodes) {
        Object.keys(scenario.nodes).forEach(nodeKey => {
            const node = scenario.nodes[nodeKey];
            if (node.type === 'objection_slot') {
                const objection = getRandomObjection(node.difficultyFilter);

                if (objection) {
                    // Transform the generic objection into scenario nodes
                    // 1. The Objection Node (Client speaking)
                    scenario.nodes[node.id] = {
                        id: node.id,
                        type: 'dialogue',
                        speaker: 'decisor',
                        speakerName: 'Cliente',
                        content: objection.objection,
                        nextNodeId: `${node.id}-response`,
                    };

                    // 2. The Response Choice Node (User answer)
                    scenario.nodes[`${node.id}-response`] = {
                        id: `${node.id}-response`,
                        type: 'choice',
                        speaker: 'system',
                        content: `O cliente lançou uma objeção de ${objection.category}. Como responder?`,
                        choices: [
                            {
                                id: `${node.id}-c1`,
                                text: objection.response1, // Direct/Standard response
                                points: { strategy: 50, clarity: 80, tone: 70, diagnosis: 40, closing: 40 },
                                feedback: 'Boa resposta técnica, mas poderia ser mais estratégica.',
                                reasoning: objection.strategicObjective,
                                nextNodeId: node.nextNodeId // Continue flow
                            },
                            {
                                id: `${node.id}-c2`,
                                text: objection.response2, // Strategic/Better response
                                points: { strategy: 95, clarity: 90, tone: 90, diagnosis: 85, closing: 85 },
                                feedback: 'Excelente! Resposta estratégica que re-enquadra a situação.',
                                reasoning: `Perfeito alinhamento com o objetivo: ${objection.strategicObjective}`,
                                nextNodeId: node.nextNodeId // Continue flow
                            }
                        ]
                    };
                }
            }
        });
    }

    return scenario;
};

// Base scenarios with "Slots" for dynamic content
export const SCENARIOS_DATA = {
    'restaurante-decisor': {
        id: 'restaurante-decisor',
        title: 'Restaurante Grande - Decisor',
        description: 'Você está ligando para um restaurante de grande porte para oferecer a parceria Voppi.',
        category: 'restaurant_decision_maker',
        difficulty: 3,
        startNodeId: 'node-1',
        nodes: {
            'node-1': {
                id: 'node-1',
                type: 'dialogue',
                speaker: 'system',
                content: 'Você discou para o restaurante "Sabor & Arte". O telefone toca algumas vezes...',
                nextNodeId: 'node-2',
            },
            'node-2': {
                id: 'node-2',
                type: 'dialogue',
                speaker: 'decisor',
                speakerName: 'Dono do Restaurante',
                content: 'Alô? Restaurante Sabor & Arte, quem fala?',
                nextNodeId: 'node-3',
            },
            'node-3': {
                id: 'node-3',
                type: 'choice',
                speaker: 'system',
                content: 'Como você se apresenta?',
                choices: [
                    {
                        id: 'choice-1a',
                        text: 'Oi! Estou ligando pra oferecer uma promoção incrível pro seu restaurante!',
                        points: { strategy: 20, clarity: 30, tone: 20, diagnosis: 10, closing: 10 },
                        feedback: 'Abordagem muito agressiva e genérica. Não gera interesse genuíno.',
                        reasoning: 'Começar com "promoção" soa como telemarketing e gera resistência imediata.',
                        nextNodeId: 'node-4-bad',
                    },
                    {
                        id: 'choice-1b',
                        text: 'Olá! Meu nome é [seu nome], sou da Voppi. Falo com o responsável pelo restaurante?',
                        points: { strategy: 60, clarity: 70, tone: 80, diagnosis: 50, closing: 40 },
                        feedback: 'Boa apresentação, clara e profissional. Valida o interlocutor.',
                        reasoning: 'Identificar-se claramente e confirmar se está falando com o decisor é fundamental.',
                        nextNodeId: 'node-4-neutral',
                    },
                    {
                        id: 'choice-1c',
                        text: 'Bom dia! Aqui é [seu nome] da Voppi. Vi o perfil do Sabor & Arte e fiquei impressionado com as avaliações. Estou falando com o proprietário?',
                        points: { strategy: 90, clarity: 85, tone: 95, diagnosis: 70, closing: 60 },
                        feedback: 'Excelente! Personalização + elogio genuíno + validação do decisor.',
                        reasoning: 'Mostrar que pesquisou o restaurante gera credibilidade e diferencia de cold calls genéricas.',
                        nextNodeId: 'node-4-good',
                    },
                ],
            },
            'node-4-bad': {
                id: 'node-4-bad',
                type: 'dialogue',
                speaker: 'decisor',
                speakerName: 'Dono do Restaurante',
                content: 'Olha, não tenho interesse em promoções. Recebo várias ligações por dia oferecendo coisas. Obrigado.',
                nextNodeId: 'node-5-recovery',
            },
            'node-5-recovery': {
                id: 'node-5-recovery',
                type: 'choice',
                speaker: 'system',
                content: 'O cliente está resistente. Como você recupera a conversa?',
                choices: [
                    {
                        id: 'choice-2a',
                        text: 'Entendo, mas deixa eu explicar rapidinho...',
                        points: { strategy: 20, clarity: 40, tone: 30, diagnosis: 20, closing: 20 },
                        feedback: 'Insistir após negativa clara é contraproducente.',
                        reasoning: 'Respeitar o tempo do cliente é essencial. Forçar gera bloqueio total.',
                        nextNodeId: 'node-end-bad',
                    },
                    {
                        id: 'choice-2b',
                        text: 'Entendo perfeitamente. Posso em 30 segundos só explicar o que nos diferencia? Se não fizer sentido, agradeço e desligo.',
                        points: { strategy: 70, clarity: 75, tone: 80, diagnosis: 50, closing: 55 },
                        feedback: 'Recuperação razoável. Mostra respeito e oferece opção de saída.',
                        reasoning: 'Dar controle ao cliente e ser direto pode abrir uma brecha.',
                        nextNodeId: 'node-6-pitch',
                    },
                ],
            },
            'node-4-neutral': {
                id: 'node-4-neutral',
                type: 'dialogue',
                speaker: 'decisor',
                speakerName: 'Dono do Restaurante',
                content: 'Sim, sou eu, Carlos. Voppi? O que seria isso?',
                nextNodeId: 'node-6-pitch',
            },
            'node-4-good': {
                id: 'node-4-good',
                type: 'dialogue',
                speaker: 'decisor',
                speakerName: 'Carlos (Dono)',
                content: 'Ah, muito obrigado! Sim, sou eu, Carlos. Cuido do restaurante há 8 anos. Voppi... já ouvi falar, é tipo Groupon?',
                nextNodeId: 'node-5-differentiate',
            },
            'node-5-differentiate': {
                id: 'node-5-differentiate',
                type: 'choice',
                speaker: 'system',
                content: 'O cliente comparou com Groupon. Como você diferencia a Voppi?',
                choices: [
                    {
                        id: 'choice-3a',
                        text: 'Sim, é parecido! A gente divulga ofertas pro seu restaurante.',
                        points: { strategy: 30, clarity: 50, tone: 60, diagnosis: 30, closing: 30 },
                        feedback: 'Confirmar a comparação com Groupon pode trazer associações negativas.',
                        reasoning: 'Groupon tem histórico de descontos agressivos e clientes "caça-promoção".',
                        nextNodeId: 'node-6-pricing-objection',
                    },
                    {
                        id: 'choice-3b',
                        text: 'A gente é marketplace de experiências, não só descontos. Temos curadoria forte e trabalhamos com creators pra divulgar. É bem diferente do modelo tradicional.',
                        points: { strategy: 85, clarity: 80, tone: 85, diagnosis: 75, closing: 70 },
                        feedback: 'Ótimo! Curadoria + creators = proposta de valor única.',
                        reasoning: 'Destacar os diferenciais evita a armadilha de ser visto como "mais um Groupon".',
                        nextNodeId: 'node-6-pitch',
                    },
                ],
            },
            'node-6-pitch': {
                id: 'node-6-pitch',
                type: 'dialogue',
                speaker: 'decisor',
                speakerName: 'Carlos (Dono)',
                content: 'Interessante... Mas como funciona na prática? Tem algum custo?',
                nextNodeId: 'node-7-pricing',
            },
            'node-6-pricing-objection': {
                id: 'node-6-pricing-objection',
                type: 'dialogue',
                speaker: 'decisor',
                speakerName: 'Carlos (Dono)',
                content: 'Ah, tipo Groupon então... Tentei uma vez e não deu certo. Veio muita gente só atrás de desconto e nunca mais voltou.',
                nextNodeId: 'node-7-overcome-objection',
            },
            'node-7-overcome-objection': {
                id: 'node-7-overcome-objection',
                type: 'choice',
                speaker: 'system',
                content: 'Objeção clássica sobre clientes "caça-promoção". Como contornar?',
                choices: [
                    {
                        id: 'choice-4a',
                        text: 'Entendo sua preocupação. Mas nossos descontos são menores, então atrai um público melhor.',
                        points: { strategy: 50, clarity: 60, tone: 60, diagnosis: 40, closing: 40 },
                        feedback: 'Argumento fraco. Desconto menor não garante cliente melhor.',
                        reasoning: 'Precisa trazer dados ou diferencial concreto.',
                        nextNodeId: 'node-8-closing',
                    },
                    {
                        id: 'choice-4b',
                        text: 'Faz total sentido essa preocupação. Por isso trabalhamos diferente: nossa curadoria atrai pessoas que buscam experiências, não só preço. E você só paga ao parceiro após o atendimento - se o cliente não for, não tem custo.',
                        points: { strategy: 90, clarity: 90, tone: 90, diagnosis: 85, closing: 80 },
                        feedback: 'Excelente! Validou a dor, trouxe diferencial e reduziu risco percebido.',
                        reasoning: 'Modelo de pagamento pós-atendimento é argumento forte contra risco.',
                        nextNodeId: 'node-8-closing',
                    },
                ],
            },
            'node-7-pricing': {
                id: 'node-7-pricing',
                type: 'choice',
                speaker: 'system',
                content: 'Hora de falar sobre o modelo de negócio. Como apresentar?',
                choices: [
                    {
                        id: 'choice-5a',
                        text: 'Tem um setup inicial de R$ 697 que inclui várias entregas de marketing. Depois é só comissão sobre vendas.',
                        points: { strategy: 60, clarity: 70, tone: 65, diagnosis: 50, closing: 55 },
                        feedback: 'Direto, mas faltou construir valor antes de falar em preço.',
                        reasoning: 'Mencionar preço antes de mostrar o pacote completo pode gerar objeção prematura.',
                        nextNodeId: 'node-8-objection-price',
                    },
                    {
                        id: 'choice-5b',
                        text: 'Então, além da divulgação, no início a gente entrega um pacote completo: cardápio digital, linktree, pack de artes, diagnóstico comercial. Tudo isso por um setup único de R$ 697. Depois disso, você só paga comissão quando vender.',
                        points: { strategy: 90, clarity: 85, tone: 85, diagnosis: 80, closing: 75 },
                        feedback: 'Perfeito! Mostrou valor antes do preço e deixou claro o modelo.',
                        reasoning: 'Ancorar no valor das entregas faz o preço parecer justo.',
                        nextNodeId: 'node-8-closing',
                    },
                ],
            },
            'node-8-objection-price': {
                id: 'node-8-objection-price',
                type: 'dialogue',
                speaker: 'decisor',
                speakerName: 'Carlos (Dono)',
                content: 'R$ 697? Isso é caro só pra começar... Não sei se vale.',
                nextNodeId: 'node-9-handle-price',
            },
            'node-9-handle-price': {
                id: 'node-9-handle-price',
                type: 'choice',
                speaker: 'system',
                content: 'Objeção de preço. Como responder?',
                choices: [
                    {
                        id: 'choice-6a',
                        text: 'Posso ver se consigo um desconto pra você...',
                        points: { strategy: 20, clarity: 40, tone: 50, diagnosis: 20, closing: 30 },
                        feedback: 'Descontar imediatamente desvaloriza o serviço.',
                        reasoning: 'Melhor reforçar valor antes de considerar desconto.',
                        nextNodeId: 'node-end-discount',
                    },
                    {
                        id: 'choice-6b',
                        text: 'Entendo. Só pra você ter uma ideia: só o cardápio digital no mercado custa uns R$ 300. O pack de artes mais R$ 200. O diagnóstico comercial, se você contratar uma consultoria, sai mais de R$ 500. A gente entrega tudo isso junto. Faz sentido?',
                        points: { strategy: 95, clarity: 90, tone: 85, diagnosis: 90, closing: 85 },
                        feedback: 'Brilhante! Quebra o valor em partes mostrando que é um investimento que já vale.',
                        reasoning: 'Comparação de mercado é técnica poderosa para justificar preço.',
                        nextNodeId: 'node-8-closing',
                    },
                ],
            },
            'node-8-closing': {
                id: 'node-8-closing',
                type: 'dialogue',
                speaker: 'decisor',
                speakerName: 'Carlos (Dono)',
                content: 'hmm, faz sentido... E como a gente começa?',
                nextNodeId: 'node-9-close',
            },
            'node-9-close': {
                id: 'node-9-close',
                type: 'choice',
                speaker: 'system',
                content: 'Momento de fechamento! Como você conduz?',
                choices: [
                    {
                        id: 'choice-7a',
                        text: 'Vou mandar mais informações por email pra você analisar...',
                        points: { strategy: 30, clarity: 50, tone: 60, diagnosis: 40, closing: 20 },
                        feedback: 'Perder o momento de fechamento com "vou mandar email" geralmente significa perder a venda.',
                        reasoning: 'Cliente quente precisa de próximo passo concreto.',
                        nextNodeId: 'node-end-email',
                    },
                    {
                        id: 'choice-7b',
                        text: 'Ótimo, Carlos! Posso agendar uma call rápida de 15 min pra gente fazer seu cadastro e você conhecer a plataforma? Prefere amanhã de manhã ou à tarde?',
                        points: { strategy: 95, clarity: 90, tone: 90, diagnosis: 85, closing: 95 },
                        feedback: 'Perfeito! Ofereceu opções concretas e assumiu o próximo passo.',
                        reasoning: 'Técnica de escolha alternativa: não pergunta SE, mas QUANDO.',
                        nextNodeId: 'node-end-success',
                    },
                ],
            },
            'node-end-success': {
                id: 'node-end-success',
                type: 'end',
                speaker: 'system',
                content: '🎉 Parabéns! Você conseguiu agendar uma reunião de fechamento com Carlos!',
                result: 'success',
            },
            'node-end-bad': {
                id: 'node-end-bad',
                type: 'end',
                speaker: 'system',
                content: '❌ O cliente desligou. A abordagem inicial muito agressiva fechou as portas.',
                result: 'failure',
            },
            'node-end-email': {
                id: 'node-end-email',
                type: 'end',
                speaker: 'system',
                content: '📧 Você perdeu o momento de fechamento. Carlos disse "ok" mas provavelmente não lerá o email.',
                result: 'partial',
            },
            'node-end-discount': {
                id: 'node-end-discount',
                type: 'end',
                speaker: 'system',
                content: '💸 Você conseguiu o cliente, mas dando desconto desnecessário. Isso afeta sua margem e credibilidade.',
                result: 'partial',
            },
        },
    },
    'restaurante-gatekeeper': {
        id: 'restaurante-gatekeeper',
        title: 'Restaurante - Gatekeeper',
        description: 'Você liga para um restaurante e quem atende é um funcionário. Seu objetivo é chegar ao dono.',
        category: 'restaurant_gatekeeper',
        difficulty: 2,
        startNodeId: 'node-1',
        nodes: {
            'node-1': {
                id: 'node-1',
                type: 'dialogue',
                speaker: 'system',
                content: 'Você discou para o restaurante "Cantina da Nonna". Alguém atende...',
                nextNodeId: 'node-2',
            },
            'node-2': {
                id: 'node-2',
                type: 'dialogue',
                speaker: 'funcionario',
                speakerName: 'Funcionário',
                content: 'Cantina da Nonna, boa tarde! Em que posso ajudar?',
                nextNodeId: 'node-3',
            },
            'node-3': {
                id: 'node-3',
                type: 'choice',
                speaker: 'system',
                content: 'Como você aborda o funcionário?',
                choices: [
                    {
                        id: 'choice-1a',
                        text: 'Oi, é o dono que tá aí? Preciso falar com ele.',
                        points: { strategy: 30, clarity: 40, tone: 30, diagnosis: 20, closing: 25 },
                        feedback: 'Tom impaciente e sem rapport. Funcionário tende a proteger o dono.',
                        reasoning: 'Tratar funcionário como obstáculo gera resistência.',
                        nextNodeId: 'node-4-blocked',
                    },
                    {
                        id: 'choice-1b',
                        text: 'Boa tarde! Tudo bem? Quem eu tive o prazer de falar?',
                        points: { strategy: 80, clarity: 70, tone: 90, diagnosis: 70, closing: 60 },
                        feedback: 'Ótimo! Criar rapport com o funcionário abre portas.',
                        reasoning: 'Funcionário valorizado se torna aliado, não barreira.',
                        nextNodeId: 'node-4-rapport',
                    },
                ],
            },
            'node-4-blocked': {
                id: 'node-4-blocked',
                type: 'dialogue',
                speaker: 'funcionario',
                speakerName: 'Funcionário',
                content: 'O dono não está no momento. Quer deixar recado?',
                nextNodeId: 'node-5-recover',
            },
            'node-5-recover': {
                id: 'node-5-recover',
                type: 'choice',
                speaker: 'system',
                content: 'Funcionário bloqueou. Como recuperar?',
                choices: [
                    {
                        id: 'choice-2a',
                        text: 'Tá, deixa eu ligar depois então...',
                        points: { strategy: 20, clarity: 30, tone: 40, diagnosis: 20, closing: 15 },
                        feedback: 'Desistiu fácil. Não tentou criar conexão.',
                        reasoning: 'Oportunidade perdida de deixar uma mensagem impactante.',
                        nextNodeId: 'node-end-lost',
                    },
                    {
                        id: 'choice-2b',
                        text: 'Entendo! Qual o melhor horário pra encontrar ele? Ah, e qual o nome dele pra eu perguntar direto?',
                        points: { strategy: 85, clarity: 80, tone: 85, diagnosis: 80, closing: 75 },
                        feedback: 'Excelente! Coletou informações valiosas pro próximo contato.',
                        reasoning: 'Saber o nome do dono e o melhor horário aumenta muito a chance de sucesso.',
                        nextNodeId: 'node-end-info',
                    },
                ],
            },
            'node-4-rapport': {
                id: 'node-4-rapport',
                type: 'dialogue',
                speaker: 'funcionario',
                speakerName: 'Amanda (Garçonete)',
                content: 'Oi! Sou a Amanda. Trabalho aqui no salão. Tudo bem e você?',
                nextNodeId: 'node-5-rapport',
            },
            'node-5-rapport': {
                id: 'node-5-rapport',
                type: 'choice',
                speaker: 'system',
                content: 'Amanda se apresentou. Como continuar?',
                choices: [
                    {
                        id: 'choice-3a',
                        text: 'Prazer Amanda! Sou da Voppi, uma plataforma de experiências. O dono do restaurante tá aí?',
                        points: { strategy: 75, clarity: 80, tone: 80, diagnosis: 65, closing: 60 },
                        feedback: 'Ok, mas foi direto demais. Podia explorar mais o rapport.',
                        reasoning: 'Funcionário pode dar informações valiosas sobre o dono e o restaurante.',
                        nextNodeId: 'node-6-transfer',
                    },
                    {
                        id: 'choice-3b',
                        text: 'Prazer Amanda! Tô bem! Olha, vi que a Cantina tem umas avaliações incríveis no Google. Vocês são bem queridos ali no bairro, né? O dono tá por aí? Queria conversar com ele sobre uma parceria bem legal.',
                        points: { strategy: 95, clarity: 85, tone: 95, diagnosis: 90, closing: 80 },
                        feedback: 'Perfeito! Elogio genuíno + inclusão dela + pedido natural.',
                        reasoning: 'Amanda vai querer ajudar porque você valorizou o lugar onde ela trabalha.',
                        nextNodeId: 'node-6-ally',
                    },
                ],
            },
            'node-6-transfer': {
                id: 'node-6-transfer',
                type: 'dialogue',
                speaker: 'funcionario',
                speakerName: 'Amanda',
                content: 'O Seu Joaquim? Ele tá na cozinha agora. Vou ver se ele pode atender, um minutinho...',
                nextNodeId: 'node-end-transfer',
            },
            'node-6-ally': {
                id: 'node-6-ally',
                type: 'dialogue',
                speaker: 'funcionario',
                speakerName: 'Amanda',
                content: 'Ah, que legal você falar isso! A gente se esforça muito aqui. O Seu Joaquim é muito exigente com qualidade. Deixa eu chamar ele pra você - acho que ele vai gostar de ouvir sobre parceria!',
                nextNodeId: 'node-end-ally',
            },
            'node-end-lost': {
                id: 'node-end-lost',
                type: 'end',
                speaker: 'system',
                content: '❌ Você desistiu cedo demais. Volte a ligar com uma abordagem diferente.',
                result: 'failure',
            },
            'node-end-info': {
                id: 'node-end-info',
                type: 'end',
                speaker: 'system',
                content: '📝 Você coletou o nome do dono (Seu Joaquim) e o melhor horário (manhãs). Próxima ligação será mais eficiente!',
                result: 'partial',
            },
            'node-end-transfer': {
                id: 'node-end-transfer',
                type: 'end',
                speaker: 'system',
                content: '✅ Amanda transferiu a ligação para Seu Joaquim. Funcionou, mas sem criar aliada.',
                result: 'success',
            },
            'node-end-ally': {
                id: 'node-end-ally',
                type: 'end',
                speaker: 'system',
                content: '🎉 Excelente! Amanda virou sua aliada e até "vendeu" você pro dono. Rapport bem construído!',
                result: 'success',
            },
        },
    },
    'parque-atracao': {
        id: 'parque-atracao',
        title: 'Parque / Atração Turística',
        description: 'Você está abordando um parque temático de médio porte para parceria com a Voppi.',
        category: 'park',
        difficulty: 4,
        startNodeId: 'node-1',
        nodes: {
            'node-1': {
                id: 'node-1',
                type: 'dialogue',
                speaker: 'system',
                content: 'Você conseguiu o contato do gerente comercial do Parque Aventura. Está ligando...',
                nextNodeId: 'node-2',
            },
            'node-2': {
                id: 'node-2',
                type: 'dialogue',
                speaker: 'decisor',
                speakerName: 'Gerente Comercial',
                content: 'Comercial do Parque Aventura, Renata falando. Pois não?',
                nextNodeId: 'node-3',
            },
            'node-3': {
                id: 'node-3',
                type: 'choice',
                speaker: 'system',
                content: 'Parques têm dinâmica diferente de restaurantes. Como você abre?',
                choices: [
                    {
                        id: 'choice-1a',
                        text: 'Oi Renata! Sou da Voppi, a gente trabalha com cupons de desconto. Queria oferecer uma parceria.',
                        points: { strategy: 30, clarity: 50, tone: 50, diagnosis: 30, closing: 30 },
                        feedback: 'Abordagem genérica. "Cupons de desconto" pode soar como commoditização.',
                        reasoning: 'Parques grandes já recebem muitas propostas assim. Precisa se diferenciar.',
                        nextNodeId: 'node-4-generic',
                    },
                    {
                        id: 'choice-1b',
                        text: 'Oi Renata, prazer! Sou [nome] da Voppi. A gente trabalha com experiências e temos uma rede forte de creators. Vi que vocês têm uma pegada bem família - queria entender como está a ocupação de vocês fora de alta temporada.',
                        points: { strategy: 90, clarity: 85, tone: 90, diagnosis: 95, closing: 70 },
                        feedback: 'Excelente! Entrou com diagnóstico e tocou na dor de sazonalidade.',
                        reasoning: 'Parques sofrem muito com sazonalidade. Mostrar que entende o negócio gera credibilidade.',
                        nextNodeId: 'node-4-diagnostic',
                    },
                ],
            },
            'node-4-generic': {
                id: 'node-4-generic',
                type: 'dialogue',
                speaker: 'decisor',
                speakerName: 'Renata',
                content: 'Olha, a gente já trabalha com algumas plataformas de cupom. O que vocês têm de diferente?',
                nextNodeId: 'node-5-differentiate',
            },
            'node-5-differentiate': {
                id: 'node-5-differentiate',
                type: 'choice',
                speaker: 'system',
                content: 'Ela quer diferenciação. Como posicionar a Voppi?',
                choices: [
                    {
                        id: 'choice-2a',
                        text: 'A gente tem uma base grande de usuários e descontos atrativos.',
                        points: { strategy: 25, clarity: 40, tone: 50, diagnosis: 30, closing: 25 },
                        feedback: 'Isso qualquer plataforma tem. Não diferenciou.',
                        reasoning: 'Precisa trazer o elemento de creators e curadoria.',
                        nextNodeId: 'node-end-generic',
                    },
                    {
                        id: 'choice-2b',
                        text: 'Nosso diferencial está nos creators. Temos uma rede de mais de 100 influenciadores que fazem divulgação orgânica. Não é só cupom - é conteúdo de qualidade mostrando a experiência. Isso atrai um público diferente.',
                        points: { strategy: 90, clarity: 85, tone: 85, diagnosis: 80, closing: 80 },
                        feedback: 'Perfeito! Creators + conteúdo = diferencial tangível e desejável.',
                        reasoning: 'Parques precisam de divulgação visual. Creators resolvem isso.',
                        nextNodeId: 'node-6-interest',
                    },
                ],
            },
            'node-4-diagnostic': {
                id: 'node-4-diagnostic',
                type: 'dialogue',
                speaker: 'decisor',
                speakerName: 'Renata',
                content: 'Ah, a sazonalidade é nossa maior dor de cabeça, sim. De março a novembro a ocupação cai muito. Como vocês podem ajudar com isso?',
                nextNodeId: 'node-5-solution',
            },
            'node-5-solution': {
                id: 'node-5-solution',
                type: 'choice',
                speaker: 'system',
                content: 'Ela revelou a dor. Como apresentar a solução?',
                choices: [
                    {
                        id: 'choice-3a',
                        text: 'A gente pode fazer ofertas com bons descontos pra atrair mais gente nesses meses.',
                        points: { strategy: 50, clarity: 60, tone: 60, diagnosis: 50, closing: 50 },
                        feedback: 'Desconto sozinho não resolve. Faltou estratégia.',
                        reasoning: 'Precisa mostrar como vai atrair público de forma sustentável.',
                        nextNodeId: 'node-6-interest',
                    },
                    {
                        id: 'choice-3b',
                        text: 'Olha, a gente pode montar uma estratégia focada especificamente nesses meses mais fracos. Nossos creators podem produzir conteúdo mostrando o parque em épocas menos lotadas - que aliás é quando a experiência é melhor. E a gente consegue segmentar pra famílias da região, que podem visitar fora de temporada.',
                        points: { strategy: 95, clarity: 90, tone: 90, diagnosis: 95, closing: 85 },
                        feedback: 'Brilhante! Transformou o problema em oportunidade e mostrou estratégia clara.',
                        reasoning: 'Mostrar que "menos lotado = melhor experiência" é reframe poderoso.',
                        nextNodeId: 'node-6-excited',
                    },
                ],
            },
            'node-6-interest': {
                id: 'node-6-interest',
                type: 'dialogue',
                speaker: 'decisor',
                speakerName: 'Renata',
                content: 'Hmm, interessante. Qual seria o modelo comercial?',
                nextNodeId: 'node-7-pricing',
            },
            'node-6-excited': {
                id: 'node-6-excited',
                type: 'dialogue',
                speaker: 'decisor',
                speakerName: 'Renata',
                content: 'Isso é muito interessante! Nunca pensei por esse ângulo. Como funciona pra gente começar?',
                nextNodeId: 'node-7-close',
            },
            'node-7-pricing': {
                id: 'node-7-pricing',
                type: 'choice',
                speaker: 'system',
                content: 'Ela perguntou sobre modelo comercial. Como apresentar?',
                choices: [
                    {
                        id: 'choice-4a',
                        text: 'Tem um setup de R$ 697 e depois comissão sobre vendas.',
                        points: { strategy: 50, clarity: 60, tone: 55, diagnosis: 45, closing: 50 },
                        feedback: 'Direto demais. Com parques maiores, precisa justificar mais o investimento.',
                        reasoning: 'Parques avaliam ROI de forma mais criteriosa que restaurantes pequenos.',
                        nextNodeId: 'node-8-objection',
                    },
                    {
                        id: 'choice-4b',
                        text: 'Para parques, a gente customiza um pouco. O setup inclui produção de conteúdo com nossos creators, material de divulgação específico e estratégia de sazonalidade. Depois trabalhamos com comissão sobre vendas. Posso montar uma proposta personalizada pra vocês?',
                        points: { strategy: 90, clarity: 85, tone: 90, diagnosis: 85, closing: 85 },
                        feedback: 'Ótimo! Mostrou que entende que parque é diferente e ofereceu customização.',
                        reasoning: 'B2B maior precisa sentir que a solução é feita pra ele.',
                        nextNodeId: 'node-7-close',
                    },
                ],
            },
            'node-8-objection': {
                id: 'node-8-objection',
                type: 'dialogue',
                speaker: 'decisor',
                speakerName: 'Renata',
                content: 'Preciso avaliar com a diretoria. Me manda uma apresentação por email?',
                nextNodeId: 'node-9-handle',
            },
            'node-9-handle': {
                id: 'node-9-handle',
                type: 'choice',
                speaker: 'system',
                content: 'Pediu pra mandar por email. Como contornar?',
                choices: [
                    {
                        id: 'choice-5a',
                        text: 'Claro! Me passa seu email que mando agora.',
                        points: { strategy: 30, clarity: 50, tone: 60, diagnosis: 30, closing: 25 },
                        feedback: 'Perdeu controle do processo. Email raramente converte sozinho.',
                        reasoning: 'Melhor tentar conseguir uma reunião ou call.',
                        nextNodeId: 'node-end-email',
                    },
                    {
                        id: 'choice-5b',
                        text: 'Claro, posso mandar! Mas que tal a gente fazer uma call de 20 minutos pra eu apresentar direto pra você e quem mais precisar ver? Assim fica mais fácil tirar dúvidas na hora. Quinta ou sexta fica bom?',
                        points: { strategy: 90, clarity: 85, tone: 85, diagnosis: 80, closing: 90 },
                        feedback: 'Excelente! Manteve controle e ofereceu opções concretas.',
                        reasoning: 'Call com decisores é muito mais eficiente que email.',
                        nextNodeId: 'node-end-meeting',
                    },
                ],
            },
            'node-7-close': {
                id: 'node-7-close',
                type: 'choice',
                speaker: 'system',
                content: 'Ela está interessada! Como fechar?',
                choices: [
                    {
                        id: 'choice-6a',
                        text: 'Ótimo! Posso mandar mais detalhes por email.',
                        points: { strategy: 40, clarity: 50, tone: 55, diagnosis: 40, closing: 30 },
                        feedback: 'Perder momentum com email é arriscado quando cliente está quente.',
                        reasoning: 'Ela perguntou como começa - quer ação, não email.',
                        nextNodeId: 'node-end-email',
                    },
                    {
                        id: 'choice-6b',
                        text: 'Ótimo Renata! Posso agendar uma call de alinhamento com você e quem mais precisar participar? A gente apresenta a proposta personalizada e já define os próximos passos. Terça ou quarta funciona?',
                        points: { strategy: 95, clarity: 90, tone: 90, diagnosis: 85, closing: 95 },
                        feedback: 'Perfeito! Assumiu liderança e deu opções concretas.',
                        reasoning: 'Técnica de escolha alternativa funciona muito bem aqui.',
                        nextNodeId: 'node-end-success',
                    },
                ],
            },
            'node-end-generic': {
                id: 'node-end-generic',
                type: 'end',
                speaker: 'system',
                content: '❌ Renata disse que vai "avaliar". Sem diferenciação clara, dificilmente vai avançar.',
                result: 'failure',
            },
            'node-end-email': {
                id: 'node-end-email',
                type: 'end',
                speaker: 'system',
                content: '📧 Você mandou email. Taxa de conversão: baixa. Tente conseguir reunião na próxima.',
                result: 'partial',
            },
            'node-end-meeting': {
                id: 'node-end-meeting',
                type: 'end',
                speaker: 'system',
                content: '✅ Reunião agendada com Renata e possíveis decisores! Bem jogado.',
                result: 'success',
            },
            'node-end-success': {
                id: 'node-end-success',
                type: 'end',
                speaker: 'system',
                content: '🎉 Excelente! Reunião de proposta agendada com cliente muito engajada. Diagnóstico + solução + fechamento perfeitos!',
                result: 'success',
            },
        },
    },
};

export function getScenario(id) {
    if (SCENARIOS_DATA[id]) {
        return generateScenario(id);
    }
    return null;
}

export function getAllScenarios() {
    return Object.values(SCENARIOS_DATA);
}
