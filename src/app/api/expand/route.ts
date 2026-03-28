import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ExpandRequestSchema = z.object({
  seed: z.string().min(1),
  count: z.number().min(10).max(500).default(300),
  provider: z.enum(["openai", "anthropic", "google", "ollama", "openai-compatible"]),
  model: z.string().min(1),
  baseUrl: z.string().optional(),
});

const SYSTEM_PROMPT = `You are a concept expansion tool. Given a seed concept, generate a large list of related terms organised by category. Return ONLY valid JSON, no markdown, no explanation.

Categories to include:
- "synonyms": words with similar meaning
- "antonyms": words with opposite meaning
- "hypernyms": broader/more general terms
- "hyponyms": narrower/more specific terms
- "domain_terms": technical vocabulary from the concept's primary domain
- "adjacent_concepts": concepts from neighbouring intellectual domains
- "cross_domain": concepts from deliberately distant domains that create interesting comparisons
- "proper_names": relevant thinkers, theorists, historical figures
- "negations": phrases that negate or contradict the concept
- "collocations": common phrases and compound expressions using the concept

Each category should have 20-40 terms. Total should be approximately the requested count.

Format:
{"categories": {"synonyms": ["term1", "term2", ...], "antonyms": [...], ...}}`;

async function callLLM(
  provider: string,
  model: string,
  apiKey: string,
  prompt: string,
  baseUrl?: string
): Promise<string> {
  let url: string;
  let headers: Record<string, string>;
  let body: Record<string, unknown>;

  switch (provider) {
    case "openai":
    case "openai-compatible":
      url = provider === "openai"
        ? "https://api.openai.com/v1/chat/completions"
        : `${baseUrl}/v1/chat/completions`;
      headers = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
      body = {
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 4000,
      };
      break;

    case "anthropic":
      url = "https://api.anthropic.com/v1/messages";
      headers = {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      };
      body = {
        model,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4000,
      };
      break;

    case "google":
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      headers = { "Content-Type": "application/json" };
      body = {
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 4000 },
      };
      break;

    case "ollama":
      url = `${baseUrl || "http://localhost:11434"}/api/generate`;
      headers = { "Content-Type": "application/json" };
      body = {
        model,
        system: SYSTEM_PROMPT,
        prompt,
        stream: false,
        options: { temperature: 0.8 },
      };
      break;

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`LLM API error (${response.status}): ${err}`);
  }

  const data = await response.json();

  // Extract text from different provider response formats
  switch (provider) {
    case "openai":
    case "openai-compatible":
      return data.choices?.[0]?.message?.content || "";
    case "anthropic":
      return data.content?.[0]?.text || "";
    case "google":
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    case "ollama":
      return data.response || "";
    default:
      return "";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ExpandRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: `Invalid request: ${parsed.error.issues.map(i => i.message).join(", ")}` },
        { status: 400 }
      );
    }

    const { seed, count, provider, model, baseUrl } = parsed.data;
    const apiKey = request.headers.get("X-LLM-API-Key") || "";

    if (provider !== "ollama" && !apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const prompt = `Generate approximately ${count} terms related to the concept "${seed}". Distribute across all categories. Return JSON only.`;

    const rawResponse = await callLLM(provider, model, apiKey, prompt, baseUrl);

    // Parse JSON from the response (handle markdown code blocks)
    let jsonStr = rawResponse.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();

    const parsed2 = JSON.parse(jsonStr);
    const categories: Record<string, string[]> = parsed2.categories || parsed2;

    // Flatten and deduplicate
    const allTerms: string[] = [];
    const termSet = new Set<string>();

    for (const [, terms] of Object.entries(categories)) {
      if (Array.isArray(terms)) {
        for (const term of terms) {
          const t = String(term).trim().toLowerCase();
          if (t && !termSet.has(t) && t !== seed.toLowerCase()) {
            termSet.add(t);
            allTerms.push(String(term).trim());
          }
        }
      }
    }

    return NextResponse.json({
      seed,
      categories,
      allTerms,
      totalCount: allTerms.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[expand] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
