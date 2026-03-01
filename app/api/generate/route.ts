import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function POST(req: NextRequest) {
  const { brief, platform, workspaceId } = await req.json();

  const supabase = getSupabase();
  const openai = getOpenAI();

  // Fetch workspace Brand DNA
  const { data: workspace } = await supabase
    .from('tone_workspaces')
    .select('name, industry, brand_dna')
    .eq('id', workspaceId)
    .single();

  const { data: pillars } = await supabase
    .from('tone_pillars')
    .select('name, description')
    .eq('workspace_id', workspaceId)
    .limit(5);

  const dna = workspace?.brand_dna || {};
  const voice = dna.voice || {};

  const formalCasual = voice.formal_casual ?? 50;
  const seriousPlayful = voice.serious_playful ?? 50;
  const corporateHuman = voice.corporate_human ?? 50;
  const reservedBold = voice.reserved_bold ?? 50;

  const voiceDesc = [
    formalCasual < 40 ? 'Formal register' : formalCasual > 60 ? 'Casual, conversational tone' : 'Balanced formal/casual',
    seriousPlayful < 40 ? 'Serious, focused' : seriousPlayful > 60 ? 'Playful, light' : 'Professional but approachable',
    corporateHuman < 40 ? 'Corporate polish' : corporateHuman > 60 ? 'Human, personal, direct' : 'Professional but personable',
    reservedBold < 40 ? 'Understated, subtle' : reservedBold > 60 ? 'Bold, confident, strong POV' : 'Confident but measured',
  ].join('. ');

  const systemPrompt = `You are writing social media content for ${workspace?.name || 'this brand'}, ${workspace?.industry ? `a ${workspace.industry}` : 'a brand'}.

Voice: ${voiceDesc}
${dna.wordsToUse?.length ? `Words to use: ${dna.wordsToUse.join(', ')}` : ''}
${dna.wordsToAvoid?.length ? `Never use: ${dna.wordsToAvoid.join(', ')}` : ''}
${dna.targetAudience ? `Audience: ${dna.targetAudience}` : ''}
${dna.examplePostLove ? `Great example post to match: "${dna.examplePostLove}"` : ''}
${dna.examplePostHate ? `Post style to AVOID: "${dna.examplePostHate}"` : ''}
${pillars?.length ? `Content pillars: ${pillars.map(p => p.name).join(', ')}` : ''}

Platform: ${platform || 'Instagram'}

Rules:
- Start with a strong, specific opening line — not a generic question
- Short paragraphs, direct language
- Point of view, not just information
- No generic motivational language
- No hollow buzzwords
- ${platform === 'linkedin' ? 'Professional insight framing, industry angle' : platform === 'tiktok' ? 'Punchy, hook-first, energetic' : 'Visual, visceral, culturally aware'}
- Write ONLY the caption. No hashtag blocks unless they are genuinely part of the voice.
- 1–4 hashtags max, only if they add value.`;

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Write a ${platform || 'Instagram'} post about: ${brief}` },
    ],
    stream: true,
    max_tokens: 400,
    temperature: 0.85,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}
