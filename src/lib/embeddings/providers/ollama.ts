/**
 * Ollama local embeddings provider.
 * https://github.com/ollama/ollama/blob/main/docs/api.md#generate-embeddings
 */

export async function embedOllama(
  texts: string[],
  model: string,
  baseUrl: string = "http://localhost:11434"
): Promise<number[][]> {
  // Ollama's embed endpoint supports batch via input array
  const response = await fetch(`${baseUrl}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      input: texts,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Ollama API error (${response.status}): ${error || response.statusText}`
    );
  }

  const data = await response.json();
  return data.embeddings;
}
