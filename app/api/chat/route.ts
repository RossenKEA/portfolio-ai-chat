import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30;

function getTextFromMessage(message: any) {
    return (
        message.parts
            ?.filter((part: any) => part.type === "text")
            .map((part: any) => part.text)
            .join(" ") || ""
    );
}

function convertToModelMessages(messages: any[]) {
    return messages.map((message) => ({
        role: message.role,
        content: getTextFromMessage(message),
    }));
}

export async function POST(req: Request) {
    const { messages } = await req.json();

    const userMessageCount = messages.filter(
        (m: any) => m.role === "user"
    ).length;

    const useMock =
        process.env.NEXT_PUBLIC_USE_MOCK_AI === "true" ||
        !process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        userMessageCount > 3;

    if (useMock) {
        const lastUserMessage = [...messages]
            .reverse()
            .find((message) => message.role === "user");

        const userText = getTextFromMessage(lastUserMessage);

        const result = streamText({
            model: google("gemini-2.5-flash"),
            prompt: `Return this exact message only: Mock response: You said "${userText}". This is a transparent demo response, not a real AI answer.`,
        });

        return result.toUIMessageStreamResponse();
    }

    const result = streamText({
        model: google("gemini-2.5-flash"),
        system:
            "You are a helpful AI assistant inside a portfolio demo. Keep responses clear and concise.",
        messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
}