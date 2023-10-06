if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY not set, from embedding.ts");
}

interface EmbeddingResponse {
  data: {
    embedding: number[];
    index: number;
    object: string;
  }[];
  model: string;
  object: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/** Batch gets OpenAI embedding vectors for each of a list of strings. */
export async function getTextEmbeddings(
  texts: string[]
): Promise<EmbeddingResponse> {
  console.log(`Embedding ${texts.length} texts...`);
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.OPENAI_API_KEY,
    },
    body: JSON.stringify({
      input: texts,
      model: "text-embedding-ada-002",
    }),
  });
  if (!resp.ok) {
    console.error("Error fetching embedding", resp.status, resp.statusText);
    console.error("Error response body", await resp.text());
  }
  return (await resp.json()) as EmbeddingResponse;
}
