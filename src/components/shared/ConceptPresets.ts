export interface ConceptGroup {
  name: string;
  seed: string;
  terms: string[];
}

export const PRESETS: ConceptGroup[] = [
  {
    name: "Justice & Law",
    seed: "justice",
    terms: ["fairness", "equity", "law", "punishment", "mercy", "rights", "obligation", "freedom", "authority", "legitimacy"],
  },
  {
    name: "Philosophy (Existentialism)",
    seed: "existentialism",
    terms: ["Heidegger", "Husserl", "Kant", "Hegel", "Aristotle", "Plato", "consciousness", "truth", "metaphysics", "epistemology", "ethics", "arguments", "phenomenology"],
  },
  {
    name: "Carpentry & Craft",
    seed: "woodwork",
    terms: ["wood", "oak", "pine", "plank", "hammer", "chisel", "saws", "workshop", "woodglue", "carpentry", "joinery", "lathe"],
  },
  {
    name: "Democracy & Power",
    seed: "democracy",
    terms: ["sovereignty", "legitimacy", "participation", "representation", "dissent", "consensus", "authority", "governance", "protest", "citizenship", "deliberation", "populism"],
  },
  {
    name: "AI & Computation",
    seed: "artificial intelligence",
    terms: ["machine learning", "neural network", "algorithm", "training", "inference", "embedding", "transformer", "attention", "optimisation", "loss function", "gradient", "parameter"],
  },
  {
    name: "Critical Theory",
    seed: "critical theory",
    terms: ["Adorno", "Horkheimer", "Marcuse", "Habermas", "reification", "dialectics", "ideology", "emancipation", "domination", "instrumental reason", "Frankfurt School", "negation"],
  },
  {
    name: "Solidarity & Compliance",
    seed: "solidarity",
    terms: ["compliance", "obedience", "resistance", "cooperation", "conformity", "dissent", "loyalty", "submission", "autonomy", "collective action", "duty", "consent"],
  },
];
