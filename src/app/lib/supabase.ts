import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient,  } from "@supabase/supabase-js";

import { embeddings } from "./ollama";
import { env } from "../utils/env";

const { supabase: { url, apiKey } } = env;

export const supabaseClient = createClient(
    url,
    apiKey,
);

export const vectorStore = (filter?: any) => new SupabaseVectorStore(embeddings, {
    client: supabaseClient,
    tableName: "documents",
    queryName: "match_documents",
    filter: filter || {}
});

supabaseClient.auth.signUp

export const retriever = (filter: any) => vectorStore(filter).asRetriever();