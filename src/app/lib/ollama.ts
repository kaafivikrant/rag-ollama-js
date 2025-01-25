import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";

export const llm = new ChatOllama({
    model: "llama3.2",
    temperature: 0,
    maxRetries: 2,
    baseUrl: "http://localhost:11434",
});

export const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text", // Default value
    baseUrl: "http://localhost:11434", // Default value
});
