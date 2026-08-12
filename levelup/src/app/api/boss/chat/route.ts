import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: NextRequest) {
  try {
    const { topic, chatHistory = [], userMessage } = await req.json();

    if (!topic || !userMessage) {
      return NextResponse.json({ success: false, error: 'Topic and userMessage are required' }, { status: 400 });
    }

    const apiKey =
      process.env.GROQ_API_KEY ||
      process.env.NEXT_PUBLIC_GROQ_API_KEY ||
      process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const groq = new Groq({ apiKey });

        const systemPrompt = `You are a ruthless Dungeon Boss defending the knowledge of "${topic}".
You are engaged in a live chat debate against a Hunter (the user).
Your goal is to test them on NICHE, OUT-OF-CONTEXT, and ADVANCED facts related to "${topic}" that are not typically found in basic tutorials.
Evaluate the user's latest message:
- If they are correct, insightful, or provide a good argument, they deal damage to you (bossDamageTaken > 0).
- If they are wrong, hesitate, or give a weak answer, you deal damage to them (playerDamageTaken > 0).
- If your Boss HP reaches 0, set isDefeated to true. (Assume you start with 100 HP, but you don't need to track it perfectly, just return damage numbers).

Format your response STRICTLY as a JSON object with the following schema:
{
  "bossResponse": "Your dialogue here, speaking like a dark, arrogant Dungeon Boss.",
  "playerDamageTaken": 0 to 40,
  "bossDamageTaken": 0 to 40,
  "isDefeated": boolean
}
DO NOT output any extra text, only the raw JSON.`;

        const messages = [
          { role: 'system', content: systemPrompt },
          ...chatHistory.map((msg: any) => ({
            role: msg.role === 'hunter' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: 'user', content: userMessage }
        ];

        const completion = await groq.chat.completions.create({
          messages,
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' },
        });

        const text = completion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(text);

        return NextResponse.json({
          success: true,
          data: {
            bossResponse: parsed.bossResponse || "Silence, weakling. Your mana is fading.",
            playerDamageTaken: parsed.playerDamageTaken || 0,
            bossDamageTaken: parsed.bossDamageTaken || 0,
            isDefeated: parsed.isDefeated || false
          }
        }, { status: 200 });

      } catch (err) {
        console.warn("LLM API failed in Boss Fight:", err);
      }
    }

    // Fallback logic if API fails or no key
    return NextResponse.json({
      success: true,
      data: {
        bossResponse: `*The Boss unleashes a dark aura* You think you understand ${topic}? You are nothing but an E-Rank weakling! Your attacks have no effect.`,
        playerDamageTaken: 15,
        bossDamageTaken: 5,
        isDefeated: false
      }
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
