/**
 * Rule-based negation generator.
 * Inserts "not" after the first auxiliary/copula verb.
 * Falls back to prepending "It is not the case that".
 */

const AUXILIARIES = [
  "is", "are", "was", "were", "am",
  "has", "have", "had",
  "will", "would", "shall", "should",
  "can", "could", "may", "might", "must",
  "do", "does", "did",
];

export function generateNegation(statement: string): string {
  const words = statement.split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    const lower = words[i].toLowerCase().replace(/[.,;:!?]$/, "");

    if (AUXILIARIES.includes(lower)) {
      // Check if already negated (next word is "not" or contraction)
      if (i + 1 < words.length) {
        const next = words[i + 1].toLowerCase();
        if (next === "not" || next === "n't") {
          // Remove the negation to produce positive
          words.splice(i + 1, 1);
          return words.join(" ");
        }
      }
      if (words[i].endsWith("n't")) {
        // Handle contractions like "isn't", "doesn't"
        words[i] = words[i].replace(/n't$/, "");
        return words.join(" ");
      }

      // Insert "not" after the auxiliary
      words.splice(i + 1, 0, "not");
      return words.join(" ");
    }
  }

  // Fallback: prepend "It is not the case that"
  const lowered = statement.charAt(0).toLowerCase() + statement.slice(1);
  return `It is not the case that ${lowered}`;
}
