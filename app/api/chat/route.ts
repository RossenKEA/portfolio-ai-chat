import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return Response.json({
            mock: true,
            message:
                "Mock AI response: No API key is configured. This portfolio demo is showing simulated responses transparently.",
        });
    }

    const result = streamText({
        model: google("gemini-2.5-flash"),
        system:
            "You are a helpful AI assistant inside a portfolio demo. Keep responses clear and concise.",
        messages,
    });

    return result.toUIMessageStreamResponse();
}