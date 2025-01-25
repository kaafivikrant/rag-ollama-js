import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { env } from "../utils/env";

const { ollama } = env;

export const llm = new ChatOllama({
    model: ollama.llm.model,
    temperature: 0,
    maxRetries: 2,
    baseUrl: ollama.llm.baseUrl,
});

export const embeddings = new OllamaEmbeddings({
    model: ollama.embeddings.model, 
    baseUrl: ollama.embeddings.baseUrl,
});
