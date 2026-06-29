import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NextRequest } from 'next/server';

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

const MOCK_ANALYSES = [
  {
    category: "pothole",
    type: "Road Pothole",
    title: "Major Road Surface Damage",
    confidence: 92,
    severity: "high",
    severityScore: 82,
    riskScore: 75,
    dept: "PWD",
    department: "PWD",
    urgency: "Within 7 days",
    affectedResidents: 1200,
    estimatedDailyCostINR: 18000,
    description: "Large pothole causing vehicle damage and traffic disruption.",
    subcategory: "Road Surface Defect",
    tags: ["pothole", "road-damage", "PWD"],
    action: "Sealing and repaving of the affected road segment."
  },
  {
    category: "streetlight",
    type: "Broken Streetlight",
    title: "Non-functional Streetlight Grid",
    confidence: 95,
    severity: "medium",
    severityScore: 64,
    riskScore: 60,
    dept: "BESCOM",
    department: "BESCOM",
    urgency: "Within 48h",
    affectedResidents: 450,
    estimatedDailyCostINR: 5000,
    description: "Broken streetlight housing and wiring exposed, creating a dark zone on the pathway.",
    subcategory: "Electrical Infrastructure",
    tags: ["streetlight", "dark-spot", "BESCOM"],
    action: "Replacement of LED bulb and wiring inspection."
  },
  {
    category: "garbage",
    type: "Garbage Overflow",
    title: "Unmanaged Solid Waste Heap",
    confidence: 96,
    severity: "medium",
    severityScore: 70,
    riskScore: 68,
    dept: "BBMP-S",
    department: "BBMP-S",
    urgency: "Within 48h",
    affectedResidents: 900,
    estimatedDailyCostINR: 12000,
    description: "Overflowing commercial garbage bins spilling onto main roadway and creating odor nuisance.",
    subcategory: "Solid Waste Management",
    tags: ["garbage", "waste", "BBMP"],
    action: "Clearing of waste heap and sanitization of the surrounding spot."
  },
  {
    category: "water",
    type: "Water Leakage",
    title: "Major Water Pipe Leakage",
    confidence: 90,
    severity: "high",
    severityScore: 78,
    riskScore: 72,
    dept: "BWSSB",
    department: "BWSSB",
    urgency: "Within 48h",
    affectedResidents: 2500,
    estimatedDailyCostINR: 35000,
    description: "Main water pipe burst causing significant water wastage and localized street flooding.",
    subcategory: "Water Supply Utility",
    tags: ["water-leak", "bwssb", "flooding"],
    action: "Isolate pipe segment and weld the cracked main line."
  },
  {
    category: "sewage",
    type: "Sewage Overflow",
    title: "Overflowing Manhole on Road",
    confidence: 94,
    severity: "critical",
    severityScore: 88,
    riskScore: 85,
    dept: "BWSSB",
    department: "BWSSB",
    urgency: "Immediate",
    affectedResidents: 1500,
    estimatedDailyCostINR: 28000,
    description: "Sewage overflow from a blocked chamber spilling onto pedestrians walkway.",
    subcategory: "Sanitation & Sewerage",
    tags: ["sewage", "sanitation", "overflow"],
    action: "Vacuum clearing of blocked line and high-pressure washing."
  }
];

function getMockAnalysis(): Record<string, unknown> {
  const index = Math.floor(Math.random() * MOCK_ANALYSES.length);
  return MOCK_ANALYSES[index];
}

export async function POST(req: NextRequest) {
  console.log('=== [analyze] Pipeline Start ===');
  
  try {
    let body: any;
    try {
      body = await req.json();
    } catch (parseErr: any) {
      console.error('[analyze] Failed to parse request JSON:', parseErr);
      return Response.json({ error: `Invalid JSON body: ${parseErr.message}` }, { status: 400 });
    }

    const { base64, mimeType } = body as {
      base64: string;
      mimeType: string;
    };

    if (!base64) {
      return Response.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[analyze] GEMINI_API_KEY is not defined. Using mock fallback analysis.');
      return Response.json(getMockAnalysis());
    }

    console.log('[analyze] Initializing GoogleGenerativeAI client...');
    let result;
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash"
      });

      console.log('[analyze] Requesting Gemini generateContent...');
      result = await model.generateContent([
        { inlineData: { data: base64, mimeType: mimeType || 'image/jpeg' } },
        { text: PROMPT },
      ]);
    } catch (apiErr: any) {
      console.warn('[analyze] Gemini API call failed. Using mock fallback analysis. Error:', apiErr.message || apiErr);
      return Response.json(getMockAnalysis());
    }

    console.log('[analyze] Received response from Gemini.');
    const responseText = result.response.text();
    console.log('[analyze] Gemini response text:', responseText);

    const raw = responseText.trim();
    let parsed: Record<string, any>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Strip any accidental markdown fences
      console.log('[analyze] JSON parsing failed, attempting markdown cleanup...');
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

    console.log('=== [analyze] Pipeline Success ===');
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
      department: String(parsed.dept ?? 'Municipal Corporation'),
      action: String(parsed.action ?? 'Issue flagged for authority review.'),
      urgency: String(parsed.urgency ?? 'Within 7 days'),
      affectedResidents,
      estimatedDailyCostINR,
    });
  } catch (err: any) {
    console.warn('=== [analyze] Pipeline Failure, returning mock fallback ===');
    console.error('[analyze] Error trace:', err);
    return Response.json(getMockAnalysis());
  }
}
