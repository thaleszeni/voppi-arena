export const OBJECTIONS_DATA = [
    // Modelo de Negócio
    {
        id: 'model-prime',
        objection: 'Isso é tipo Prime Gourmet ou Floripa em Dobro?',
        category: 'Modelo de Negócio',
        response1: 'Não. Esses modelos funcionam por assinatura. A Voppi vende experiências individuais, sem assinatura.',
        response2: 'Além disso, o cliente compra exatamente o que quer viver, não paga antes pra talvez usar depois.',
        strategicObjective: 'Entendimento claro do diferencial do modelo',
        difficulty: 3
    },
    {
        id: 'model-groupon',
        objection: 'Já testei Groupon e não funcionou',
        category: 'Modelo de Negócio',
        response1: 'O problema desses modelos foi falta de curadoria e controle. Vinha muita gente de uma vez sem filtro.',
        response2: 'A Voppi trabalha com limite de vendas e estratégia personalizada. Focamos em qualidade, não volume descontrolado.',
        strategicObjective: 'Quebra de trauma histórico',
        difficulty: 4
    },
    {
        id: 'model-liquidation',
        objection: 'Isso vai virar liquidação',
        category: 'Modelo de Negócio',
        response1: 'A Voppi não comunica como liquidação, e sim como experiência exclusiva através de curadoria.',
        response2: 'O foco é benefício, não preço baixo. Mantemos o valor percebido da sua marca.',
        strategicObjective: 'Proteção de posicionamento',
        difficulty: 3
    },

    // Financeiro
    {
        id: 'finance-setup-now',
        objection: 'Não quero pagar setup agora',
        category: 'Financeiro',
        response1: 'O setup cobre entregas que você usaria com vários fornecedores (marketing, artes, diagnóstico).',
        response2: 'É o que garante que sua oferta entre profissional desde o início, evitando perda de tempo e dinheiro.',
        strategicObjective: 'Justificativa de investimento',
        difficulty: 2
    },
    {
        id: 'finance-697-expensive',
        objection: '697 é caro',
        category: 'Financeiro',
        response1: 'Separado, as entregas de mídia, artes e diagnóstico custariam muito mais que esse valor único.',
        response2: 'A ideia é facilitar o acesso a ferramentas profissionais por um valor único de ativação.',
        strategicObjective: 'Percepção de valor',
        difficulty: 3
    },
    {
        id: 'finance-pay-if-sell',
        objection: 'Só pago se vender',
        category: 'Financeiro',
        response1: 'A gente só ganha a comissão se vender também. O setup é apenas para ativação da sua marca.',
        response2: 'Nosso modelo é de sucesso compartilhado: nosso maior interesse é que sua oferta performe muito bem.',
        strategicObjective: 'Alinhamento de interesses',
        difficulty: 2
    },
    {
        id: 'finance-if-no-sales',
        objection: 'E se não vender nada?',
        category: 'Financeiro',
        response1: 'A gente ajusta creator, comunicação e oferta até performar. Temos interesse total no seu giro.',
        response2: 'Não deixamos a oferta esquecida no site. Monitoramos e buscamos alternativas de divulgação até dar certo.',
        strategicObjective: 'Redução de risco percebido',
        difficulty: 3
    },
    {
        id: 'finance-no-instant-pay',
        objection: 'Por que não pagam na hora?',
        category: 'Financeiro',
        response1: 'Porque oferecemos troca e crédito ao cliente antes do uso, o que protege a experiência do parceiro.',
        response2: 'Esse modelo protege tanto o cliente quanto o parceiro em caso de cancelamentos ou trocas.',
        strategicObjective: 'Confiança no modelo',
        difficulty: 3
    },
    {
        id: 'finance-fear-debt',
        objection: 'Tenho medo de calote',
        category: 'Financeiro',
        response1: 'O pagamento ocorre após o atendimento para garantir total segurança jurídica e financeira.',
        response2: 'É um modelo muito mais sustentável e seguro para ambas as partes, com repasses programados.',
        strategicObjective: 'Redução de medo',
        difficulty: 4
    },

    // Operacional
    {
        id: 'operational-no-structure',
        objection: 'Não tenho estrutura pra atender mais clientes',
        category: 'Operacional',
        response1: 'A ideia não é gerar picos ou sobrecarga operacional, mas sim manter a constância diária.',
        response2: 'Controlamos rigorosamente os dias, horários e a quantidade de vendas conforme sua capacidade.',
        strategicObjective: 'Tranquilidade operacional',
        difficulty: 3
    },
    {
        id: 'operational-already-full',
        objection: 'Meu restaurante já vive cheio',
        category: 'Operacional',
        response1: 'Trabalhamos em dias e horários estratégicos justamente onde você ainda tem gaps de ocupação.',
        response2: 'O objetivo é equilibrar o fluxo semanal, ocupando horários ociosos com público de qualidade.',
        strategicObjective: 'Uso inteligente da plataforma',
        difficulty: 2
    },
    {
        id: 'operational-wrong-audience',
        objection: 'Meu público não é esse',
        category: 'Operacional',
        response1: 'A Voppi trabalha com creators alinhados ao perfil exato da sua experiência gastronômica.',
        response2: 'Nosso público busca viver bem e descobrir novos lugares, não é o caçador de oferta barata.',
        strategicObjective: 'Confiança no público',
        difficulty: 3
    },
    {
        id: 'operational-bad-client',
        objection: 'Tenho medo de cliente ruim',
        category: 'Operacional',
        response1: 'Nossa comunicação filtra as expectativas do cliente antes mesmo de ele chegar ao estabelecimento.',
        response2: 'Hoje nossos parceiros relatam ticket médio e consumo extra maior do que a média de outros apps.',
        strategicObjective: 'Segurança emocional',
        difficulty: 4
    },
    {
        id: 'operational-too-much-work',
        objection: 'Vai dar muito trabalho pra mim',
        category: 'Operacional',
        response1: 'Nosso objetivo principal é reduzir seu trabalho. Nós cuidamos da mídia, artes e tecnologia.',
        response2: 'A maioria das entregas de ativação e divulgação é feita 100% pelo nosso time interno.',
        strategicObjective: 'Facilidade',
        difficulty: 2
    },

    // Marketing
    {
        id: 'marketing-strong-insta',
        objection: 'Já tenho Instagram forte',
        category: 'Marketing',
        response1: 'A Voppi soma audiência e força de venda, não substitui seu canal atual de comunicação.',
        response2: 'Levamos sua marca além da sua "bolha" atual, alcançando pessoas que ainda não te conhecem.',
        strategicObjective: 'Visão de complemento',
        difficulty: 2
    },
    {
        id: 'marketing-no-influencer',
        objection: 'Não acredito em influencer',
        category: 'Marketing',
        response1: 'Não trabalhamos com "publi" genérica, mas com experiência real vivida pelo creator no seu local.',
        response2: 'Conteúdo autêntico e de quem vive a experiência gera muito mais desejo e confiança do que um anúncio.',
        strategicObjective: 'Reenquadrar creators',
        difficulty: 3
    },
    {
        id: 'marketing-paid-traffic',
        objection: 'Já faço tráfego pago',
        category: 'Marketing',
        response1: 'A Voppi complementa seu esforço. Trazemos o cliente pronto pra consumir com o voucher na mão.',
        response2: 'Você economiza no custo de aquisição (CAC), pois nós absorvemos parte desse esforço através da rede.',
        strategicObjective: 'Sinergia de canais',
        difficulty: 3
    },

    // Concorrência
    {
        id: 'competition-another-app',
        objection: 'Já estou em outro app',
        category: 'Concorrência',
        response1: 'Isso é ótimo, mostra que você já acredita no canal digital como fonte de novos clientes.',
        response2: 'A diferença é que a Voppi entrega um ecossistema completo com creators e curadoria, não só uma lista.',
        strategicObjective: 'Diferenciação clara',
        difficulty: 2
    },
    {
        id: 'competition-cheaper',
        objection: 'O concorrente cobra menos',
        category: 'Concorrência',
        response1: 'Geralmente quem cobra menos entrega muito menos visibilidade, tecnologia e suporte próximo.',
        response2: 'Aqui você recebe muito mais do que visibilidade passiva: recebe artes, diagnóstico e curadoria ativa.',
        strategicObjective: 'Valor > preço',
        difficulty: 3
    },

    // Timing
    {
        id: 'timing-bad-moment',
        objection: 'Agora não é o momento',
        category: 'Timing',
        response1: 'Entendo perfeitamente. O que precisaria mudar para ser o momento ideal na sua visão?',
        response2: 'Muitas parcerias de sucesso começam justamente em momentos de transição para buscar novas receitas.',
        strategicObjective: 'Diagnóstico real',
        difficulty: 2
    },
    {
        id: 'timing-later',
        objection: 'Vamos ver depois',
        category: 'Timing',
        response1: 'Perfeito, respeito seu tempo. Posso te ligar em 15 dias para vermos como as coisas evoluíram?',
        response2: 'Claro! Assim respeitamos seu timing operacional e garantimos que a decisão faça sentido.',
        strategicObjective: 'Manter abertura',
        difficulty: 2
    },

    // Autoridade
    {
        id: 'authority-new',
        objection: 'Vocês são novos?',
        category: 'Autoridade',
        response1: 'Já temos anos de operação sólida no mercado e uma base de milhares de clientes ativos.',
        response2: 'Temos reconhecimento consolidado no setor de lazer e turismo, com parcerias de grande renome.',
        strategicObjective: 'Construção de credibilidade',
        difficulty: 3
    },
    {
        id: 'authority-who-else',
        objection: 'Quem mais trabalha com vocês?',
        category: 'Autoridade',
        response1: 'Temos centenas de parceiros entre restaurantes, parques e experiências em todo o Brasil.',
        response2: 'Posso te mostrar vários exemplos e cases de sucesso de negócios muito semelhantes ao seu.',
        strategicObjective: 'Confiança',
        difficulty: 2
    },

    // Experiência
    {
        id: 'experience-premium',
        objection: 'Meu restaurante é premium',
        category: 'Experiência',
        response1: 'A Voppi funciona muito bem para marcas premium justamente pela curadoria exigente dos creators.',
        response2: 'Nós não falamos de "desconto", falamos de benefícios exclusivos e acesso a experiências únicas.',
        strategicObjective: 'Proteção de marca',
        difficulty: 4
    },
    {
        id: 'experience-neg-eval',
        objection: 'Tenho medo de avaliação negativa',
        category: 'Experiência',
        response1: 'Nossa comunicação alinha totalmente a expectativa do cliente antes da compra da experiência.',
        response2: 'Ajudamos ativamente no posicionamento da experiência para que o feedback seja sempre positivo.',
        strategicObjective: 'Segurança',
        difficulty: 3
    },

    // Contrato
    {
        id: 'contract-loyalty',
        objection: 'Tem fidelidade?',
        category: 'Contrato',
        response1: 'Não trabalhamos com amarras longas. A parceria dura enquanto trouxer resultado real pra você.',
        response2: 'Acreditamos no nosso valor: a parceria continua por mérito e satisfação mútua, sem multas rescisórias.',
        strategicObjective: 'Redução de barreira',
        difficulty: 2
    },
    {
        id: 'contract-cancel',
        objection: 'Posso sair quando quiser?',
        category: 'Contrato',
        response1: 'Sim, a qualquer momento, respeitando apenas a entrega das experiências já vendidas no site.',
        response2: 'Transparência total desde o dia 1. Se não estiver feliz com os resultados, encerramos sem burocracia.',
        strategicObjective: 'Confiança',
        difficulty: 2
    },

    // Estratégia
    {
        id: 'strategy-diff',
        objection: 'Qual o diferencial real da Voppi?',
        category: 'Estratégia',
        response1: 'A combinação de Marketplace + Rede de Creators + Ferramentas de Gestão + Benefícios.',
        response2: 'É um ecossistema completo de vendas e visibilidade, não apenas um site de cupons.',
        strategicObjective: 'Clareza de proposta',
        difficulty: 3
    },

    // Público e Visão
    {
        id: 'audience-tourist-returns',
        objection: 'Turista não volta',
        category: 'Público',
        response1: 'Mesmo que não volte, ele indica, gera conteúdo e fortalece sua reputação digital nacional.',
        response2: 'A experiência vivida pelo turista tem valor de marca muito além da recompra imediata.',
        strategicObjective: 'Visão de longo prazo',
        difficulty: 3
    },
    {
        id: 'vision-long-term',
        objection: 'Longo prazo isso funciona?',
        category: 'Visão',
        response1: 'Funciona porque nosso modelo não depende de desconto agressivo, mas de curadoria de público.',
        response2: 'Trabalhamos brand awareness, experiência do cliente e relacionamento duradouro com a base.',
        strategicObjective: 'Sustentabilidade',
        difficulty: 3
    },

    // --- NOVAS VARIAÇÕES (ESTRATÉGICAS VOPPI) ---
    {
        id: 'variation-commission-vs-ads',
        objection: 'A comissão é alta comparada ao Google Ads',
        category: 'Financeiro',
        response1: 'No Google você paga pelo clique, aqui você só paga pela venda confirmada e consumida.',
        response2: 'Aqui eliminamos seu risco: você só nos comissiona quando o lucro já está garantido na sua conta.',
        strategicObjective: 'Custo por Aquisição (CAC) garantido',
        difficulty: 4
    },
    {
        id: 'model-exclusive-city',
        objection: 'Quero exclusividade na minha cidade',
        category: 'Modelo de Negócio',
        response1: 'A Voppi foca em curadoria. Não teremos 10 restaurantes iguais, mas teremos variedade para o cliente.',
        response2: 'A presença de outros parceiros atrai mais tráfego e usuários para a plataforma, o que aumenta suas vendas também.',
        strategicObjective: 'Visão de ecossistema',
        difficulty: 4
    },
    {
        id: 'finance-tax-nf',
        objection: 'Como funciona a nota fiscal disso?',
        category: 'Financeiro',
        response1: 'Você emite a nota do valor líquido recebido e nós emitimos a nota da nossa comissão de serviço.',
        response2: 'Tudo é feito dentro das normas contábeis, garantindo transparência e segurança fiscal para sua empresa.',
        strategicObjective: 'Segurança contábil',
        difficulty: 3
    },
    {
        id: 'operational-staff-training',
        objection: 'Minha equipe não sabe usar o dashboard',
        category: 'Operacional',
        response1: 'O sistema é extremamente simples. Em 5 minutos qualquer atendente aprende a validar um voucher.',
        response2: 'Nós fornecemos treinamento e materiais de apoio para garantir que sua equipe opere com total confiança.',
        strategicObjective: 'Simplicidade operacional',
        difficulty: 2
    },
    {
        id: 'marketing-brand-dilution',
        objection: 'Não quero ser conhecido como o restaurante da promoção',
        category: 'Marketing',
        response1: 'A Voppi é um canal de experiências. O cliente vem pelo valor da sua entrega, não pelo preço.',
        response2: 'Nossa curadoria de parceiros é rigorosa. Você estará ao lado das melhores marcas da região.',
        strategicObjective: 'Prestígio de marca',
        difficulty: 4
    },
    {
        id: 'competition-local-guide',
        objection: 'Já estou no Guia Gastronômico local',
        category: 'Concorrência',
        response1: 'Ótimo! A Voppi é diferente por ter a venda transacional e a rede de creators integrada.',
        response2: 'Enquanto o guia é informativo, a Voppi é um canal de conversão direta com rastreabilidade total.',
        strategicObjective: 'Diferenciação proativa',
        difficulty: 3
    },
    {
        id: 'contract-renewal',
        objection: 'Como funciona a renovação do setup?',
        category: 'Contrato',
        response1: 'O setup é uma taxa única de ativação. Não há cobranças recorrentes além da comissão por venda.',
        response2: 'É um investimento focado em colocar sua marca no ar com a melhor performance possível desde o dia 1.',
        strategicObjective: 'Clareza de custos',
        difficulty: 2
    },
    {
        id: 'strategy-offline-reach',
        objection: 'Meu público é mais offline/velho',
        category: 'Estratégia',
        response1: 'O público digital está em todas as faixas hoje. E os filhos/netos são quem decidem onde ir.',
        response2: 'A Voppi ajuda a rejuvenescer sua base de clientes e traz o público que dita tendências no mercado.',
        strategicObjective: 'Expansão de mercado',
        difficulty: 3
    },
    {
        id: 'strategy-agency',
        objection: 'Já tenho uma agência que cuida de tudo',
        category: 'Estratégia',
        response1: 'Excelente! A Voppi não substitui a agência, nós somos um canal de venda direta que a agência pode usar para potencializar resultados.',
        response2: 'Nós entregamos a transação e os creators, algo que geralmente as agências tradicionais não conseguem operacionalizar nessa escala.',
        strategicObjective: 'Complementaridade vs Substituição',
        difficulty: 4
    },
    {
        id: 'experience-no-discount-rule',
        objection: 'Não quero atrelar minha marca a descontos, meu produto é de valor',
        category: 'Experiência',
        response1: 'Concordamos 100%. Por isso focamos em "benefícios exclusivos" e experiências, não em preço baixo pura e simplesmente.',
        response2: 'Através dos creators, vendemos o desejo de viver a experiência. O benefício é apenas o empurrão final para a decisão.',
        strategicObjective: 'Posicionamento de Valor',
        difficulty: 5
    },
    {
        id: 'operational-waiters',
        objection: 'Meus garçons vão se perder com esse sistema',
        category: 'Operacional',
        response1: 'O sistema de validação é um link simples no celular ou tablet. Leva 5 segundos para validar.',
        response2: 'Nós acompanhamos a primeira semana de operação para garantir que todos estejam confortáveis com o processo.',
        strategicObjective: 'Simplicidade e Apoio',
        difficulty: 2
    }
];

export function getObjectionById(id) {
    return OBJECTIONS_DATA.find(obj => obj.id === id);
}

export function getRandomObjection(difficulty = null) {
    let pool = OBJECTIONS_DATA;
    if (difficulty) {
        // Find closest difficulties if exact match not found
        const exactMatch = pool.filter(obj => obj.difficulty === difficulty);
        if (exactMatch.length > 0) pool = exactMatch;
        else {
            // Fallback to range
            pool = pool.filter(obj => Math.abs(obj.difficulty - difficulty) <= 1);
        }
    }
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
}
