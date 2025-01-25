import { PromptTemplate } from "@langchain/core/prompts";

export const standaloneTemplate = PromptTemplate.fromTemplate(
    `Given some conversation history and a question, convert the question to a standalone question. 
    conversation history: {history}
    question: {question} 
    standalone question:`
);

export const answerTemplate = PromptTemplate.fromTemplate(`You are a helpful and enthusiastic support bot who answers questions based on the provided context. 
The context is an array of chunks, each containing line numbers and a page number in the metadata, and page content. 
Your goal is to find the most relevant information from the context to answer the question.

- If you don't know the answer or cannot find it in the context, say, "I don't know," and do not fabricate an answer.
- Never mention the chunk number.
- Always respond in a friendly and conversational tone.

Context:
{context}

Question:
{question}

Answer:`);