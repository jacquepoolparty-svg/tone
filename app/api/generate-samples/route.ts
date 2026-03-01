import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  const { workspaceId: _workspaceId, brandDna } = await req.json();

  const dna = brandDna || {};
  const voice = dna.voice || {};
  const formalCasual = voice.formal_casual ?? 50;
  const reservedBold = voice.reserved_bold ?? 50;
  const corporateHuman = voice.corporate_human ?? 50;

  const voiceDesc = [
    formalCasual > 60 ? 'Casual, conversational' : 'Formal, precise',
    reservedBold > 60 ? 'Bold, strong opinions' : 'Measured, thoughtful',
    corporateHuman > 60 ? 'Human, personal, direct' : 'Professional polish',
  ].join('. ');

  const systemPrompt = `You are a social media content generator that has just been trained on a brand's DNA.

Voice: ${voiceDesc}
${dna.wordsToUse?.length ? `Use these words: ${dna.wordsToUse.join(', ')}` : ''}
${dna.wordsToAvoid?.length ? `NEVER use: ${dna.wordsToAvoid.join(', ')}` : ''}
${dna.examplePostLove ? `Match this energy: "${dna.examplePostLove}"` : ''}
${dna.examplePostHate ? `Nothing like this: "${dna.examplePostHate}"` : ''}

Generate 3 sample social media posts (Instagram, LinkedIn, TikTok) that show off this brand voice.
Each post should feel distinctly different in format but unmistakably the same brand.

Return ONLY a JSON object like: { "posts": ["post1...", "post2...", "post3..."] }`;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: systemPrompt }],
      response_format: { type: 'json_object' },
      max_tokens: 600,
      temperature: 0.9,
    });

    const content = response.choices[0].message.content || '{"posts":[]}';
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      posts: [
        'Here\'s your first sample post. Direct, specific, no fluff. Your Brand DNA is loaded — every post from here will sound like you.',
        'Second sample: LinkedIn register. Industry insight framing. The kind of post that builds credibility without trying to.',
        'Third sample: TikTok energy. Punchy. Hook first. Gives the audience something they can\'t scroll past.',
      ]
    });
  }
}
