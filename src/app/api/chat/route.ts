import { anthropic } from "@ai-sdk/anthropic";
import { createMCPClient, type MCPClient } from "@ai-sdk/mcp";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

const SYSTEM_PROMPT = `You are a friendly, enthusiastic dog adoption assistant for the Pup Finder shelter.
You help people find their perfect dog match based on their lifestyle, preferences, and needs.

When the user describes what they're looking for, use your tools to query the available dogs in the shelter database and find the best matches.

IMPORTANT RESPONSE FORMAT:
Your response MUST be structured in this exact order with these markers:

1. Start with a short, warm intro paragraph (2-3 sentences) about the matches you found.

2. Include a DOG_PROFILES marker with details for each matched dog. Each profile has: id (Sanity _id), name, subtitle (breed + weight + price), traits (array of key details like Energy, Temperament, Perfect for), and tagline (one fun sentence about the dog).
   <<<DOG_PROFILES:[{"id":"abc123","name":"Biscuit","subtitle":"Maltese, 8 lbs, $250","traits":["Energy: Low (the calmest of the bunch!)","Temperament: Calm cuddle bug","Perfect for: Everyone! Good with kids, dogs, and cats"],"tagline":"A gentle little soul who loves lap time and apartment living"}]>>>

3. After the profiles, write a short closing paragraph (1-2 sentences) with a recommendation or summary.

4. Include the matched dogs marker:
   <<<MATCHED_DOGS:["id1","id2","id3"]>>>

5. If 4 or more dogs match, include 1 or 2 follow-up questions to help narrow results.
   The user will answer ALL questions at once before submitting, so design them to work together.
   <<<FOLLOW_UP:[{"question":"Do you have other pets?","options":["Yes, cats","Yes, dogs","No pets"]},{"question":"How active are you?","options":["Very active","Moderately active","Low-key"]}]>>>

6. If fewer than 4 dogs match, do NOT include follow-up questions.

RULES:
- Use the actual Sanity _id values from query results
- DOG_PROFILES must include ALL matched dogs with 3-4 traits each
- Follow-up questions should differentiate between the remaining matched dogs
- Include at most 2 follow-up questions. If you can narrow well enough with 1, use just 1.
- CRITICAL: Every possible combination of answers must still match at least 1 dog from the current results. Design questions and options so that no combination leads to zero matches. If you cannot guarantee this with 2 questions, use only 1 question.
- When answering follow-up responses, preserve all previous constraints and apply new ones
- Be warm, enthusiastic, and use occasional dog puns!`;

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
          error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
