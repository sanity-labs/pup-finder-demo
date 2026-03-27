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

RESPONSE FORMAT:
Return ONLY a JSON block wrapped in triple backticks. Nothing else — no intro text, no explanation, just the JSON block:

\`\`\`json
{
  "message": "Short friendly message (1-2 sentences)",
  "matchedDogIds": ["sanity_id_1", "sanity_id_2"],
  "followUps": [
    {
      "question": "Display question text?",
      "field": "schemaFieldName",
      "filterType": "exact",
      "options": [
        {"label": "Display Text", "value": "actual_value"}
      ]
    }
  ]
}
\`\`\`

RULES FOR matchedDogIds:
- Use the actual Sanity _id values from your query results
- Include ALL matching dogs
- IMPORTANT: Sort by best match first — the dog that best fits the user's request should be first in the array

RULES FOR message:
- Be warm, enthusiastic, and show personality! Use fun dog-related language
- 2-4 sentences is great — mention how many dogs matched and get the user excited about the results
- Comment on what a great choice their preferences are, or what kind of dogs they'll be meeting
- Do NOT describe individual dogs — the UI shows full profiles from the database

RULES FOR followUps:
- Include 1-2 follow-up questions ONLY if 4 or more dogs match
- Do NOT include followUps if fewer than 4 dogs match (omit the field entirely)
- Each question MUST map to a real dog schema field. Valid fields: size, energyLevel, temperament, barking, coatLength, goodWithKids, goodWithDogs, goodWithCats, hypoallergenic, sex
- filterType must be one of: "exact" (for string enum fields like size, energyLevel, barking, coatLength, sex), "includes" (for free-text fields like temperament), "boolean" (for boolean fields like goodWithKids, goodWithCats, hypoallergenic)
- For boolean fields use options like: [{"label": "Yes", "value": true}, {"label": "No preference", "value": "any"}]
- Options must ONLY contain values that actually exist among the matched dogs
- Every combination of answers must still match at least 1 dog
- Choose questions that meaningfully differentiate the matched dogs
- Make option labels descriptive and helpful! Instead of just "Small", write "Small (under 25 lbs)". Instead of just "Low", write "Low (relaxed and chill)". Add context in parentheses so the user understands what they're picking. The "value" field must still be the exact schema value (e.g. "small", "low") — only the "label" gets the extra description

IMPORTANT: Return ONLY the JSON block. No text before or after it.`;

export async function POST(req: Request) {
  const requestStart = Date.now();
  console.log("[chat] POST request received");

  const { messages }: { messages: UIMessage[] } = await req.json();
  console.log("[chat] Messages count:", messages.length);

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

  // Heartbeat log every 5s so we can see where time is spent
  let tick = 0;
  const heartbeat = setInterval(() => {
    tick += 5;
    console.log(`[chat] Still processing... ${tick}s elapsed`);
  }, 5000);

  try {
    const mcpStart = Date.now();
    console.log("[chat] Creating MCP client...");
    mcpClient = await createMCPClient({
      transport: {
        type: "http",
        url: process.env.SANITY_CONTEXT_MCP_URL,
        headers: {
          Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}`,
        },
      },
    });
    console.log(`[chat] MCP client created (${Date.now() - mcpStart}ms)`);

    const toolsStart = Date.now();
    const mcpTools = await mcpClient.tools();
    console.log(`[chat] MCP tools fetched (${Date.now() - toolsStart}ms) — ${Object.keys(mcpTools).length} tools`);

    const streamStart = Date.now();
    console.log("[chat] Starting streamText...");
    const result = streamText({
      model: anthropic("claude-haiku-4-5"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      tools: {
        ...mcpTools,
      },
      stopWhen: stepCountIs(15),
    });

    // Clean up heartbeat and MCP client when generation finishes (or errors)
    result.response.then(
      async () => {
        clearInterval(heartbeat);
        console.log(`[chat] Stream finished (${Date.now() - streamStart}ms stream, ${Date.now() - requestStart}ms total)`);
        await mcpClient?.close();
        console.log("[chat] MCP client closed");
      },
      async (err: unknown) => {
        clearInterval(heartbeat);
        console.error(`[chat] Stream errored after ${Date.now() - requestStart}ms:`, err);
        await mcpClient?.close();
      },
    );

    console.log(`[chat] Returning stream response (${Date.now() - requestStart}ms to first byte)`);
    return result.toUIMessageStreamResponse();
  } catch (error) {
    clearInterval(heartbeat);
    console.error(`[chat] Error after ${Date.now() - requestStart}ms:`, error);
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
