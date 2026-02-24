import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const record = req.body.record;

    if (!record || !record.id || !record.title_en) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    const { id, title_en, description_en } = record;

    const prompt = `
Translate this product to French and Arabic.

Title: ${title_en}
Description: ${description_en || ''}

Return ONLY valid JSON:
{
  "title_fr": "...",
  "title_ar": "...",
  "description_fr": "...",
  "description_ar": "..."
}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const content = completion.choices[0].message.content;
    const translations = JSON.parse(content!);

    await supabase
      .from('products')
      .update(translations)
      .eq('id', id);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Translation failed' });
  }
}