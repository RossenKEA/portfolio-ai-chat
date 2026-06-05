import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30;

function getLastUserMessage(messages: any[]) {
    const lastMessage = [...messages].reverse().find((m) => m.role === "user");

    return (
        lastMessage?.parts
            ?.filter((part: any) => part.type === "text")
            .map((part: any) => part.text)
            .join(" ") || "your message"
    );
}

export async function POST(req: Request) {
    const { messages } = await req.json();

    const useMock =
        process.env.NEXT_PUBLIC_USE_MOCK_AI === "true" ||
        !process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (useMock) {
        const userMessage = getLastUserMessage(messages);

        return Response.json({
            id: crypto.randomUUID(),
            role: "assistant",
            parts: [
                {
                    type: "text",
                    text: `Mock response: You said "${userMessage}". This is a transparent demo response, not a real AI answer.`,
                },
            ],
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