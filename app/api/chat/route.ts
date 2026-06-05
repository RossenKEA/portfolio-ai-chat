import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30;

function getLastUserMessage(messages: any[]) {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

    if (!lastUserMessage) return "No message found.";

    const textPart = lastUserMessage.parts?.find((part: any) => part.type === "text");

    return textPart?.text ?? "No text found.";
}

export async function POST(req: Request) {
    const { messages } = await req.json();

    const shouldUseMock =
        process.env.NEXT_PUBLIC_USE_MOCK_AI === "true" ||
        !process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (shouldUseMock) {
        const userMessage = getLastUserMessage(messages);

        const result = streamText({
            model: {
                async doGenerate() {
                    return {
                        text: `Mock AI response: You said "${userMessage}". This is a transparent simulated response for the portfolio demo.`,
                        finishReason: "stop",
                        usage: {
                            promptTokens: 0,
                            completionTokens: 0,
                        },
                        rawCall: {
                            rawPrompt: null,
                            rawSettings: {},
                        },
                    };
                },
                async doStream() {
                    throw new Error("Mock streaming is not implemented.");
                },
                specificationVersion: "v1",
                provider: "mock-provider",
                modelId: "mock-model",
                defaultObjectGenerationMode: "json",
            } as any,
            messages,
        });

        return result.toUIMessageStreamResponse();
    }

    const result = streamText({
        model: google("gemini-2.5-flash"),
        system:
            "You are a helpful AI assistant inside a portfolio demo. Keep responses clear and concise.",
        messages,
    });

    return result.toUIMessageStreamResponse();
}