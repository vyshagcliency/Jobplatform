import { NextRequest, NextResponse } from "next/server";
import { candidateSections, employerSections } from "@/lib/onboarding-questions";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { role, currentSection, previousAnswers } = body as {
    role: "candidate" | "employer";
    currentSection: number;
    previousAnswers: Record<string, string | string[]>;
  };

  const sections =
    role === "candidate" ? candidateSections : employerSections;

  const section = sections[currentSection];

  if (!section) {
    return NextResponse.json(
      { error: "Invalid section" },
      { status: 400 }
    );
  }

  // For now, use the predefined messages. When an LLM API key is configured,
  // this can be replaced with a call to Claude/OpenAI for dynamic messages.
  const apiKey =
    process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;

  let message = section.message;

  if (apiKey && process.env.ANTHROPIC_API_KEY) {
    try {
      const systemPrompt = `You are a warm, casual, dating-app-style onboarding assistant for a job platform called Underdog Jobs.
Your job is to ask the user ONE question at a time in a conversational, friendly tone.
The current question topic is: "${section.field}" (section ${section.id}).
Previous answers: ${JSON.stringify(previousAnswers)}.
Keep it short (1-2 sentences), warm, and casual. Use gen-z friendly language. No corporate speak.
Only return the question text, nothing else.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 150,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: `Ask the ${role} the next onboarding question about "${section.field}".`,
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.content?.[0];
        if (content?.type === "text" && content.text) {
          message = content.text;
        }
      }
    } catch {
      // Fall back to predefined message
    }
  }

  return NextResponse.json({
    message,
    options: section.options,
    selectMode: section.selectMode,
    maxSelections: section.maxSelections,
  });
}
