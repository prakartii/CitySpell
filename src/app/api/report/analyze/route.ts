import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NextRequest } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const ECONOMIC_BASE: Record<string, number> = {
  pothole: 45000,
  road: 80000,
  streetlight: 15000,
  water: 35000,
  sewage: 60000,
  garbage: 12000,
  park: 8000,
  building: 100000,
  other: 20000,
};

const SEVERITY_MULT: Record<string, number> = {
  critical: 3.5,
  high: 2.2,
  medium: 1.3,
  low: 0.6,
};

const PROMPT = `You are a civic infrastructure AI for Indian cities. Analyze this image.
Return ONLY valid JSON — no markdown, no extra text.

{
  "category": "<pothole|streetlight|garbage|water|sewage|park|road|building|other>",
  "type": "<Human-readable name, e.g. Road Pothole>",
  "title": "<Concise 4-6 word title>",
  "confidence": <integer 0-100>,
  "severity": "<critical|high|medium|low>",
  "severityScore": <integer 0-100>,
  "riskScore": <integer 0-100>,
  "subcategory": "<Detailed subcategory label>",
  "description": "<2-3 sentences describing the visible issue>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"],
  "dept": "<Relevant Indian government department, e.g. Public Works Dept. (PWD)>",
  "action": "<Recommended authority action in 1-2 sentences>",
  "urgency": "<Immediate|Within 48h|Within 7 days|Non-urgent>",
  "affectedResidents": <integer, estimated daily affected users>,
  "estimatedDailyCostINR": <integer, realistic daily economic cost in INR>
}

Rules:
- If no clear civic issue is visible, set category "other" with confidence below 40
- estimatedDailyCostINR must be a realistic Indian city figure (typically 5000–300000)
- Tags should be 2-4 concise English phrases relevant to the issue`;

export async function POST(req: NextRequest) {
  try {
    const { base64, mimeType } = await req.json() as {
      base64: string;
      mimeType: string;
    };

    if (!base64) {
      return Response.json({ error: 'No image provided' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType: mimeType || 'image/jpeg' } },
      { text: PROMPT },
    ]);

    const raw = result.response.text().trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Strip any accidental markdown fences
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    // Validate and normalise required fields
    const category = String(parsed.category ?? 'other') as string;
    const severity = String(parsed.severity ?? 'medium') as string;
    const affectedResidents = Number(parsed.affectedResidents ?? 1000);

    // Compute economic impact as fallback / sanity check
    const base = ECONOMIC_BASE[category] ?? 20000;
    const mult = SEVERITY_MULT[severity] ?? 1;
    const computedCost = Math.round(base * mult);
    const estimatedDailyCostINR = Number(parsed.estimatedDailyCostINR ?? computedCost);

    return Response.json({
      category,
      type: String(parsed.type ?? 'Civic Issue'),
      title: String(parsed.title ?? 'Unclassified Issue'),
      confidence: Math.min(100, Math.max(0, Number(parsed.confidence ?? 70))),
      severity,
      severityScore: Math.min(100, Math.max(0, Number(parsed.severityScore ?? 50))),
      riskScore: Math.min(100, Math.max(0, Number(parsed.riskScore ?? 50))),
      subcategory: String(parsed.subcategory ?? 'Urban Infrastructure'),
      description: String(parsed.description ?? ''),
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
      dept: String(parsed.dept ?? 'Municipal Corporation'),
      action: String(parsed.action ?? 'Issue flagged for authority review.'),
      urgency: String(parsed.urgency ?? 'Within 7 days'),
      affectedResidents,
      estimatedDailyCostINR,
    });
  } catch (err) {
    console.error('[analyze]', err);
    return Response.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
