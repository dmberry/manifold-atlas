/**
 * Google Gemini Embeddings API provider.
 * https://ai.google.dev/gemini-api/docs/embeddings
 */

export async function embedGoogle(
  texts: string[],
  model: string,
  apiKey: string
): Promise<number[][]> {
  const requests = texts.map(text => ({
    model: `models/${model}`,
    content: { parts: [{ text }] },
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requests }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Google API error (${response.status}): ${error?.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.embeddings.map(
    (item: { values: number[] }) => item.values
  );
}
