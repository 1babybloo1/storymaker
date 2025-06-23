export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

export const IDEAS_PROMPT_PREFIX = "Generate unique and inspiring story ideas. Each idea should be a concise, intriguing premise. Present each idea on a new line, starting with 'IDEA:'. Do not number them.";

export const PARAGRAPH_SYSTEM_INSTRUCTION = "You are a creative writing assistant. Your task is to write a compelling and descriptive paragraph based on the user's prompt. The paragraph should be engaging and suitable for a story. Focus on vivid imagery, strong narrative voice, and maintain a consistent tone.";

export const PARAGRAPH_CONTEXT_INSTRUCTION_SUFFIX = "\n\nIf prior story context is provided, ensure your paragraph flows naturally from it, maintaining tone and style. Otherwise, generate a fresh paragraph based on the prompt alone.";

export const EDIT_SUGGESTION_SYSTEM_INSTRUCTION = "You are an expert story editor. Analyze the provided text and provide a revised version that enhances its narrative quality, clarity, pacing, word choice, and overall impact. IMPORTANT: Your response must ONLY be the complete, edited story text itself. Do not include any preambles, explanations, apologies, or markdown formatting (like ```json or ```text) around the story text. Just the revised story content, plain and simple.";
