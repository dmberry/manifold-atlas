/**
 * Manifold Atlas Benchmark Set
 * A standard reference vocabulary of concepts spanning domains.
 * Used across operations for comparable, citable results.
 *
 * To cite: "Using the Manifold Atlas benchmark set (Berry 2026)"
 *
 * Edit this file to add or modify benchmark concepts.
 */

export interface BenchmarkCategory {
  name: string;
  concepts: string[];
}

export const BENCHMARK_CATEGORIES: BenchmarkCategory[] = [
  {
    name: "Philosophy",
    concepts: [
      "truth", "knowledge", "consciousness", "existence", "reason",
      "beauty", "justice", "virtue", "freedom", "reality",
      "dialectics", "phenomenology", "hermeneutics", "ontology", "epistemology",
    ],
  },
  {
    name: "Political Theory",
    concepts: [
      "democracy", "sovereignty", "legitimacy", "revolution", "hegemony",
      "solidarity", "resistance", "authority", "citizenship", "emancipation",
      "ideology", "class", "power", "state", "commons",
    ],
  },
  {
    name: "Economics",
    concepts: [
      "capitalism", "labour", "commodity", "value", "exchange",
      "property", "market", "profit", "exploitation", "accumulation",
      "debt", "austerity", "growth", "inequality", "redistribution",
    ],
  },
  {
    name: "Technology",
    concepts: [
      "algorithm", "computation", "data", "automation", "artificial intelligence",
      "network", "platform", "surveillance", "optimisation", "interface",
      "code", "software", "hardware", "infrastructure", "protocol",
    ],
  },
  {
    name: "Science",
    concepts: [
      "experiment", "hypothesis", "measurement", "observation", "theory",
      "evidence", "replication", "causation", "correlation", "model",
      "physics", "biology", "chemistry", "mathematics", "ecology",
    ],
  },
  {
    name: "Culture & Art",
    concepts: [
      "creativity", "expression", "aesthetics", "narrative", "imagination",
      "culture", "tradition", "modernity", "representation", "meaning",
      "music", "literature", "painting", "cinema", "architecture",
    ],
  },
  {
    name: "Society",
    concepts: [
      "community", "individual", "family", "education", "health",
      "religion", "gender", "race", "class", "migration",
      "urbanisation", "globalisation", "inequality", "welfare", "care",
    ],
  },
  {
    name: "Nature & Environment",
    concepts: [
      "nature", "ecology", "sustainability", "biodiversity", "climate",
      "wilderness", "agriculture", "pollution", "extinction", "conservation",
      "energy", "water", "forest", "ocean", "soil",
    ],
  },
  {
    name: "Everyday Life",
    concepts: [
      "home", "food", "work", "sleep", "play",
      "friendship", "love", "grief", "memory", "hope",
      "body", "touch", "silence", "warmth", "light",
    ],
  },
  {
    name: "Negation Pairs",
    concepts: [
      "this policy is fair", "this policy is not fair",
      "this is true", "this is not true",
      "this is just", "this is unjust",
      "progress is inevitable", "progress is not inevitable",
      "violence is justified", "violence is never justified",
    ],
  },
];

/**
 * Get all benchmark concepts as a flat array.
 */
export function getAllBenchmarkConcepts(): string[] {
  const all: string[] = [];
  const seen = new Set<string>();
  for (const cat of BENCHMARK_CATEGORIES) {
    for (const concept of cat.concepts) {
      if (!seen.has(concept)) {
        seen.add(concept);
        all.push(concept);
      }
    }
  }
  return all;
}

/**
 * Get benchmark concepts by category name.
 */
export function getBenchmarkCategory(name: string): string[] {
  return BENCHMARK_CATEGORIES.find(c => c.name === name)?.concepts || [];
}

/**
 * Total unique concepts in the benchmark set.
 */
export const BENCHMARK_SIZE = getAllBenchmarkConcepts().length;
