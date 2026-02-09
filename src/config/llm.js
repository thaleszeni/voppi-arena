/**
 * LLM Configuration
 * Centralized settings for AI models and providers.
 */

export const LLM_CONFIG = {
    provider: 'groq',

    // Chave de API (carregada das variáveis de ambiente)
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,

    // Modelos recomendados para Groq:
    // llama-3.3-70b-versatile (Alta qualidade)
    // llama-3.1-8b-instant (Muito rápido / Ideal para chat simples)
    // mixtral-8x7b-32768 (Bom para raciocínio)
    model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'llama-3.3-70b-versatile',

    defaultSettings: {
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
    },

    retry: {
        maxRetries: 2,
        baseDelay: 1000, // ms
    }
};
