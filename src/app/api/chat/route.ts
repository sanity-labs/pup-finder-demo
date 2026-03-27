import { anthropic } from "@ai-sdk/anthropic";
import { createMCPClient, type MCPClient } from "@ai-sdk/mcp";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

const SYSTEM_PROMPT = `You are a friendly dog adoption assistant for Pup Finder shelter.

CRITICAL BEHAVIOR: On EVERY user message, IMMEDIATELY query the shelter database using your tools. NEVER ask your own clarifying questions — the app UI handles follow-ups. Even if the user's request is vague, query broadly and return results.

RESPONSE FORMAT (use this exact structure every time):

1. Short warm intro (1-2 sentences).

2. Dog profiles marker with ALL matched dogs:
<<<DOG_PROFILES:[{"id":"sanity_id","name":"Name","subtitle":"Breed, Weight, $Price","traits":["Energy: Level","Temperament: Description","Perfect for: Details"],"tagline":"Fun one-liner"}]>>>

3. Short closing (1 sentence).

4. Matched dogs marker:
<<<MATCHED_DOGS:["id1","id2"]>>>

5. If 4+ dogs match, add 1-2 follow-up questions to narrow results:
<<<FOLLOW_UP:[{"question":"Question?","options":["Option A","Option B","Option C"]}]>>>
If fewer than 4 match, do NOT include follow-up questions.

RULES:
- ALWAYS query the database first, then respond with the format above
- Use actual Sanity _id values from query results
- DOG_PROFILES must include ALL matched dogs with 3-4 traits each
- Max 2 follow-up questions Important. Every combination of answers must still match at least 1 dog.
- When answering follow-ups, preserve previous constraints and apply new ones
- Be warm and enthusiastic!`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  if (!process.env.SANITY_CONTEXT_MCP_URL) {
    throw new Error("SANITY_CONTEXT_MCP_URL is not set");
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  if (!process.env.SANITY_API_READ_TOKEN) {
    throw new Error("SANITY_API_READ_TOKEN is not set");
  }

  let mcpClient: MCPClient | null = null;

  try {
    mcpClient = await createMCPClient({
      transport: {
        type: "http",
        url: process.env.SANITY_CONTEXT_MCP_URL,
        headers: {
          Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}`,
        },
      },
    });

    const mcpTools = await mcpClient.tools();

    const result = streamText({
      model: anthropic("claude-haiku-4-5"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      tools: {
        ...mcpTools,
      },
      stopWhen: stepCountIs(15),
      onFinish: async () => {
        await mcpClient?.close();
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    await mcpClient?.close();
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
