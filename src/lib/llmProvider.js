/**
 * LLM Provider Layer
 * Handles communication with GroqCloud API.
 */

import { LLM_CONFIG } from '../config/llm';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function sendChatRequest({ systemPrompt, messages, temperature, maxTokens }) {
    const apiKey = LLM_CONFIG.apiKey;

    if (!apiKey) {
        throw new Error('GROQ_API_KEY_MISSING');
    }

    const payload = {
        model: LLM_CONFIG.model,
        messages: [
            { role: 'system', content: systemPrompt },
            ...messages
        ],
        temperature: temperature || LLM_CONFIG.defaultSettings.temperature,
        max_tokens: maxTokens || LLM_CONFIG.defaultSettings.max_tokens,
        top_p: LLM_CONFIG.defaultSettings.top_p,
        stream: false
    };

    let lastError = null;

    for (let i = 0; i <= LLM_CONFIG.retry.maxRetries; i++) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 429) {
                const delay = LLM_CONFIG.retry.baseDelay * Math.pow(2, i) + Math.random() * 500;
                console.warn(`Groq Rate Limit (429). Retrying in ${Math.round(delay)}ms...`);
                await sleep(delay);
                continue;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `Groq API Error: ${response.status}`);
            }

            const data = await response.json();
            return {
                text: data.choices[0].message.content.trim(),
                usage: data.usage,
                model: data.model
            };

        } catch (error) {
            console.error(`LLM Provider Attempt ${i + 1} failed:`, error.message);
            lastError = error;
            if (i < LLM_CONFIG.retry.maxRetries) {
                await sleep(LLM_CONFIG.retry.baseDelay);
            }
        }
    }

    throw lastError || new Error('Unknown LLM Provider Error');
}
