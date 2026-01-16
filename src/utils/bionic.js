/**
 * Splits text into words and calculates the bionic conversion for each.
 * @param {string} text - The input text to process.
 * @returns {Array<{ original: string, bold: string, regular: string }>}
 */
export function toBionic(text) {
    if (!text || typeof text !== 'string') return [];

    // Split by whitespace but keep punctuation attached
    return text.split(/\s+/).map(word => {
        if (!word) return null;

        // Separate word from trailing punctuation
        const match = word.match(/^([a-zA-Z]+)(.*)$/);
        if (!match) {
            // If no letters, treat as is (punctuation only)
            return {
                original: word,
                bold: '',
                regular: word
            };
        }

        const [_, letters, punctuation] = match;
        const len = letters.length;
        let mid;
        if (len <= 3) mid = 1;
        else mid = Math.ceil(len / 2);

        const bold = letters.slice(0, mid);
        const regular = letters.slice(mid) + punctuation;

        return {
            original: word,
            bold,
            regular
        };
    }).filter(Boolean);
}
