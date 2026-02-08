/**
 * Voppi Company Context
 * This file contains the "brain" of the company for the AI Roleplay.
 * The AI will use this information to understand what it is buying or refusing.
 */

export const COMPANY_CONTEXT = {
  name: "Voppi",

  segment: "Marketplace de Experiências (Gastronomia, Entretenimento, Lazer e Turismo) + Creator Marketing",

  targetAudience: `
    Parceiros (B2B): donos e gestores de restaurantes, bares, cafeterias, parques,
    atrações de lazer e entretenimento, agências e operadores turísticos.

    Normalmente os decisores são: dono, sócio, gerente geral, gerente comercial ou marketing.
    Em cold calls, o primeiro contato pode ser um funcionário (gatekeeper).
  `,

  /**
   * PROPOSTA DE VALOR — DESCRIÇÃO COMPLETA DO NEGÓCIO
   * (base principal para a IA entender o que é e o que NÃO é a Voppi)
   */
  valueProposition: `
A Voppi é um marketplace de experiências. Nós criamos, publicamos e vendemos experiências
de parceiros (restaurantes, parques e atrações) diretamente ao consumidor final,
tanto público local quanto turistas, em diversas regiões do Brasil.

A Voppi NÃO é:
- delivery próprio
- SaaS de pedidos
- agência de marketing
- consultoria tradicional
- plataforma de assinatura (como Prime Gourmet ou Brasil em Dobro)

A Voppi É:
- um canal de venda de experiências
- uma vitrine curada
- um distribuidor de demanda via marketplace + creators

FUNCIONAMENTO DO MODELO:

1) Criação da experiência
- A Voppi e o parceiro definem juntos qual experiência será vendida
  (ex.: menu fechado, combo, prato especial, ingresso, pacote).
- São definidas regras claras:
  • dias e horários válidos
  • capacidade/limite de uso
  • condições da experiência
- O objetivo é gerar fluxo incremental sem bagunçar a operação
  e sem desvalorizar a marca do parceiro.

2) Venda ao consumidor
- O cliente compra a experiência diretamente no site/plataforma da Voppi.
- O pagamento é feito para a Voppi (cartão).
- Após a compra, o cliente recebe um ticket/voucher em sua conta na plataforma Voppi.

3) Consumo da experiência
- O cliente vai presencialmente ao estabelecimento parceiro.
- No momento do consumo/pagamento, ele apresenta o ticket/voucher da Voppi.
- O voucher funciona como método de pagamento da experiência já adquirida,
  dispensando novo pagamento no local.

4) Repasse financeiro ao parceiro
- A Voppi repassa o valor ao parceiro após o consumo confirmado.
- O repasse padrão ocorre após a virada do mês.
- O parceiro pode optar por:
  • antecipação de valores em aberto (mediante taxa)
  • planos com repasse mais rápido (14 dias ou 7 dias), com taxa maior

Esse modelo existe porque o cliente pode trocar ou reembolsar a experiência
em créditos antes do uso, protegendo o consumidor e evitando chargebacks
após o atendimento.
`,

  /**
   * DISTRIBUIÇÃO, MARKETING E DEMANDA
   */
  distributionAndMarketing: `
A geração de demanda ocorre principalmente por:

- Instagram da Voppi (mais de 150 mil seguidores)
- Rede de criadores de conteúdo (creators)

Os creators:
- vão presencialmente até o estabelecimento
- mostram a experiência real
- divulgam para sua própria audiência e para a audiência da Voppi
- ajudam a gerar desejo, prova social e descoberta da marca do parceiro

Além disso:
- A Voppi realiza campanhas de tráfego pago em escala,
  sempre levando para a marca Voppi e para o marketplace.
- O objetivo do tráfego é gerar interesse, descoberta e venda
  das melhores experiências disponíveis na plataforma.

A Voppi também trabalha a lógica de cashback,
incentivando recorrência do cliente final,
o que beneficia diretamente os parceiros.
`,

  /**
   * MODELO COMERCIAL E PREÇOS (SEM AMBIGUIDADE)
   */
  pricing: `
- NÃO existe mensalidade.
- NÃO existe taxa fixa para permanecer na plataforma.

SETUP (NOVOS PARCEIROS):
- Setup único de R$ 697,00 para ativação da parceria.
- O setup não é uma mensalidade; ele entrega contrapartidas reais, como:
  • cardápio virtual padrão/personalizado
  • pack de mockups e artes
  • diagnóstico comercial e digital (Google Meu Negócio, Instagram, WhatsApp, cardápio)
  • linktree personalizado
  • bio/texto do Instagram
  • MIV (one pager / landing page profissional)
  • agendamento de creator no início da parceria
  • 1 ano de vick.ia (IA brasileira)
  • benefícios e descontos com parceiros (contabilidade, design, PDV, tráfego pago, vídeo etc.)

COMISSIONAMENTO:
- Comissão de 15% sobre as vendas realizadas via marketplace Voppi.
- Taxa de cartão de 3,2% também é descontada do parceiro.
`,

  /**
   * OBJEÇÕES MAIS COMUNS (LINGUAGEM REAL DO PARCEIRO)
   */
  mainObjections: [
    "Não trabalho com desconto / isso desvaloriza meu restaurante.",
    "Já testei Groupon ou Peixe Urbano e foi ruim.",
    "Isso é tipo Prime Gourmet ou Brasil em Dobro?",
    "Não quero pagar setup.",
    "Prefiro só pagar se vender.",
    "Tenho medo de cliente ruim ou bagunça na operação.",
    "Meu restaurante já vive cheio.",
    "Não acredito em influencer / creator.",
    "Por que o pagamento não é imediato?",
    "Tenho medo de não receber.",
    "Agora não é o momento.",
    "Me manda no WhatsApp primeiro."
  ],

  /**
   * CASOS DE SUCESSO (SEM PROMESSAS FALSAS)
   */
  successCases: `
A Voppi gera resultados principalmente em:
- atração de clientes novos (locais e turistas)
- aumento de fluxo em dias e horários mais fracos
- maior descoberta da marca através de creators e redes sociais
- estruturação de ativos digitais do parceiro logo no início da parceria

Os melhores resultados acontecem com parceiros que:
- têm boa experiência e operação organizada
- respeitam as regras da experiência
- usam a Voppi como canal complementar, não como única fonte de venda
`,

  /**
   * DIRETRIZES PARA A IA AVALIAR ROLEPLAYS
   */
  salesGuidelines: {
    coldCallGoal: `
      O objetivo da cold call é agendar uma reunião curta (10–15 minutos)
      para apresentar o modelo, mostrar exemplos reais
      e desenhar uma experiência específica para o parceiro.
    `,

    whatGoodSoundsLike: [
      "Comercial contextualiza (analisou Instagram/perfil do parceiro).",
      "Fala de experiência, não apenas de desconto.",
      "Explica o voucher como método de pagamento.",
      "Diferencia claramente de Prime Gourmet e Groupon.",
      "Explica setup como ativação com entregáveis.",
      "Conduz para reunião com agenda clara."
    ],

    whatBadSoundsLike: [
      "Vender como delivery próprio ou SaaS.",
      "Prometer resultado garantido.",
      "Ignorar objeções sobre operação.",
      "Falar só de desconto.",
      "Encerrar a ligação sem próximo passo."
    ]
  }
};
