import { google } from "@ai-sdk/google";
import {
    createUIMessageStream,
    createUIMessageStreamResponse,
    generateId,
    generateText,
} from "ai";

export const maxDuration = 30;

function getTextFromMessage(message: any) {
    return (
        message?.parts
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

function createMockResponse(text: string) {
    const stream = createUIMessageStream({
        execute({ writer }) {
            const messageId = generateId();
            const textId = generateId();

            writer.write({
                type: "start",
                messageId,
            });

            writer.write({
                type: "text-start",
                id: textId,
            });

            writer.write({
                type: "text-delta",
                id: textId,
                delta: text,
            });

            writer.write({
                type: "text-end",
                id: textId,
            });

            writer.write({
                type: "finish",
            });
        },
    });

    return createUIMessageStreamResponse({ stream });
}

export async function POST(req: Request) {
    const { messages } = await req.json();

    const userMessageCount = messages.filter(
        (message: any) => message.role === "user"
    ).length;

    const lastUserMessage = [...messages]
        .reverse()
        .find((message) => message.role === "user");

    const userText = getTextFromMessage(lastUserMessage);

    const shouldUseMock =
        process.env.NEXT_PUBLIC_USE_MOCK_AI === "true" ||
        !process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        userMessageCount > 3;

    if (shouldUseMock) {
        return createMockResponse(
            `Demo response: You said "${userText}". This is a transparent simulated response used to protect API quota.`
        );
    }

    try {
        const result = await generateText({
            model: google("gemini-2.5-flash"),
            system:
                "You are a helpful AI assistant inside a portfolio demo. Keep responses clear and concise.",
            messages: convertToModelMessages(messages),
        });

        return createMockResponse(result.text);
    } catch (error) {
        console.error("Gemini failed, switching to demo mode:", error);

        return createMockResponse(
            `Demo response: Gemini is currently unavailable or quota-limited. You said "${userText}".`
        );
    }
}