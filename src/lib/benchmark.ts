/**
 * Manifold Atlas Benchmark Set
 *
 * Loads benchmark vocabularies from markdown files.
 * Default benchmark at /public/benchmarks/default.md
 * Custom benchmarks can be loaded from any .md file.
 *
 * Markdown format:
 *   # Title (first H1 = benchmark name)
 *   Description text (ignored)
 *   ## Category Name
 *   term1, term2, term3, ...
 *
 * To cite: "Using the Manifold Atlas benchmark set (Berry 2026)"
 */

export interface BenchmarkCategory {
  name: string;
  concepts: string[];
}

export interface BenchmarkSet {
  name: string;
  categories: BenchmarkCategory[];
}

/**
 * Parse a markdown benchmark file into structured data.
 */
export function parseBenchmarkMarkdown(markdown: string): BenchmarkSet {
  const lines = markdown.split("\n");
  let name = "Benchmark";
  const categories: BenchmarkCategory[] = [];
  let currentCategory: BenchmarkCategory | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // H1 = benchmark name
    if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
      name = trimmed.replace(/^#\s+/, "");
      continue;
    }

    // H2 = category name
    if (trimmed.startsWith("## ")) {
      if (currentCategory && currentCategory.concepts.length > 0) {
        categories.push(currentCategory);
      }
      currentCategory = { name: trimmed.replace(/^##\s+/, ""), concepts: [] };
      continue;
    }

    // Non-empty, non-heading line under a category = comma-separated concepts
    if (currentCategory && trimmed.length > 0 && !trimmed.startsWith("#")) {
      const concepts = trimmed.split(",").map(s => s.trim()).filter(s => s.length > 0);
      currentCategory.concepts.push(...concepts);
    }
  }

  // Push last category
  if (currentCategory && currentCategory.concepts.length > 0) {
    categories.push(currentCategory);
  }

  return { name, categories };
}

/**
 * Load the default benchmark from the public folder.
 */
export async function loadDefaultBenchmark(): Promise<BenchmarkSet> {
  const response = await fetch("/benchmarks/default.md");
  if (!response.ok) {
    throw new Error("Failed to load default benchmark");
  }
  const markdown = await response.text();
  return parseBenchmarkMarkdown(markdown);
}

/**
 * Load a benchmark from a File object (user upload).
 */
export async function loadBenchmarkFromFile(file: File): Promise<BenchmarkSet> {
  const markdown = await file.text();
  return parseBenchmarkMarkdown(markdown);
}

/**
 * Get all concepts as a flat array (deduplicated).
 */
export function getAllConcepts(benchmark: BenchmarkSet): string[] {
  const seen = new Set<string>();
  const all: string[] = [];
  for (const cat of benchmark.categories) {
    for (const concept of cat.concepts) {
      if (!seen.has(concept)) {
        seen.add(concept);
        all.push(concept);
      }
    }
  }
  return all;
}
