import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let topic = body.topic;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Invalid or missing topic" }, { status: 400 });
    }

    topic = topic.trim();
    if (topic.length > 50) {
      return NextResponse.json({ error: "Topic must be 50 characters or less" }, { status: 400 });
    }

    const apiKey =
      process.env.GROQ_API_KEY ||
      process.env.NEXT_PUBLIC_GROQ_API_KEY ||
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API key is missing" }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    const systemPrompt = `You are an expert educational game designer. The user wants to learn about the following topic: "${topic}". 
Generate a learning module with a 5-question multiple-choice quiz and a final "Boss Fight" challenge.
You MUST return your response ONLY as a valid, stringified JSON object. Do not include markdown formatting or conversational text. Use this exact schema:
{
  "topic": "${topic}",
  "lessonContent": "A 2-3 paragraph detailed summary/context about the topic for the user to read before the quiz.",
  "quiz": [
    {
      "question": "Clear, engaging question",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "Exact string matching the correct option",
      "explanation": "Brief explanation"
    } // Exactly 5 items
  ],
  "bossFight": {
    "bossName": "Creative, thematic boss name",
    "scenario": "A 2-sentence scenario to defeat this boss",
    "challenge": {
      "question": "A difficult, scenario-based question",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "Exact string matching the correct option",
      "explanation": "Explanation of the winning move"
    }
  }
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("Empty response from AI");
    }

    let parsedData;
    try {
      parsedData = JSON.parse(content);
    } catch (e) {
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate Schema
    if (!parsedData.quiz || !Array.isArray(parsedData.quiz) || parsedData.quiz.length !== 5) {
      throw new Error("Invalid quiz format returned by AI");
    }

    if (!parsedData.bossFight || !parsedData.bossFight.bossName || !parsedData.bossFight.challenge) {
      throw new Error("Invalid boss fight format returned by AI");
    }

    return NextResponse.json(parsedData, { status: 200 });
  } catch (error: any) {
    console.error("Generate Module Error:", error);
    return NextResponse.json(
      { error: "The magic fizzled! Please try generating again." },
      { status: 500 }
    );
  }
}
