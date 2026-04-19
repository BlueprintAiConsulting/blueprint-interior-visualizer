/**
 * BlueprintEnvision Interior — API Proxy Server
 */
import express from 'express';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';
import cors from 'cors';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.set('trust proxy', 1);

const allowedOrigins = ['http://localhost:5174','http://localhost:3000','http://localhost:3001','https://blueprint-interior-visualizer.onrender.com','https://blueprintaiconsulting.github.io'];
app.use(cors({ origin: (origin, cb) => { if (!origin || allowedOrigins.includes(origin)) cb(null, true); else cb(new Error('Not allowed by CORS')); } }));
app.use(express.json({ limit: '50mb' }));

const PORT = Number(process.env.PORT || process.env.SERVER_PORT) || 4011;
if (!process.env.GEMINI_API_KEY) { console.error('❌  GEMINI_API_KEY is not set.'); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generationLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests. Please wait.' } });
const standardLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests.' } });

const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
  Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms))]);

function validateImagePayload(base64: string, mime: string = '') {
  if (!base64) throw new Error('Missing imageBase64 payload');
  const rawBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
  if (rawBase64.length < 100) throw new Error('imageBase64 payload is too small');
  let activeMime = mime;
  if (!activeMime && base64.startsWith('data:image/')) activeMime = base64.substring(5, base64.indexOf(';'));
  const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  if (activeMime && !validMimes.includes(activeMime.toLowerCase())) throw new Error(`Invalid MIME type: ${activeMime}`);
  if (rawBase64.length * 0.75 > 20 * 1024 * 1024) throw new Error('Image exceeds 20MB safety limit');
}

// --- POST /api/detect-room ---
app.post('/api/detect-room', generationLimiter, async (req, res) => {
  const { imageBase64, mimeType, roomType = 'kitchen' } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'Missing imageBase64.' });
  const ROOM_PROMPTS: Record<string, string> = {
    kitchen: `Identify ALL remodel-able surfaces in this KITCHEN: WALLS, UPPER CABINETS, LOWER CABINETS, ISLAND, COUNTERTOPS, BACKSPLASH, FLOORING, TRIM. NEVER include: appliances, sink, faucet, hardware, window glass, food, decorations.`,
    bathroom: `Identify ALL remodel-able surfaces in this BATHROOM: WALLS, VANITY CABINET, VANITY TOP, SHOWER/TUB SURROUND, FLOORING, TRIM. NEVER include: toilet, faucet, mirror glass, shower glass, towels, toiletries.`,
    'living-room': `Identify ALL remodel-able surfaces in this LIVING ROOM: WALLS, ACCENT WALL, FLOORING, TRIM. NEVER include: furniture, TV, art, curtains, rugs.`,
    bedroom: `Identify ALL remodel-able surfaces in this BEDROOM: WALLS, ACCENT WALL, FLOORING, TRIM. NEVER include: bed, furniture, lamps, curtains, bedding, art.`,
  };
  try {
    validateImagePayload(imageBase64, mimeType);
    const response = await withTimeout(ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [
        { inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } },
        { text: `Analyze this room photo. ${ROOM_PROMPTS[roomType] || ROOM_PROMPTS['kitchen']}
Return ONLY valid JSON: { "isInteriorRoom": boolean, "detectedRoomType": string, "zones": [{"name":string,"category":string,"maskTarget":string}], "optionalZones": [...] }` }
      ] },
    }), 30_000, 'detect-room');
    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const firstBrace = cleaned.indexOf('{'); const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace === -1) return res.status(500).json({ error: 'AI returned invalid format.' });
    const parsed = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    if (parsed.isInteriorRoom === false) return res.status(400).json({ error: 'PREFLIGHT_FAILURE: Not an interior room.' });
    res.json({ isInteriorRoom: true, detectedRoomType: parsed.detectedRoomType || roomType, zones: parsed.zones || [], optionalZones: parsed.optionalZones || [] });
  } catch (err: any) { console.error('[detect-room]', err?.message); res.status(500).json({ error: err?.message || 'Room detection failed.' }); }
});

// --- POST /api/interior-render ---
interface InteriorZonePayload { name: string; category: string; brand: string; lineName: string; colorName: string; colorHex: string; hue: string; materialType: string; }
const PASS_CONFIGS: Record<string, { categories: string[]; exclusions: string[]; preserveNote: string; textureInstructions: string; }> = {
  paint: { categories: ['walls','accent-wall','trim','ceiling'], exclusions: ['cabinets','countertops','backsplash','flooring','appliances','plumbing fixtures'], preserveNote: 'Preserve ALL non-paint surfaces.', textureInstructions: '- Paint: eggshell/satin sheen, roller micro-texture\n- Trim: semi-gloss finish' },
  cabinets: { categories: ['cabinets','vanity'], exclusions: ['walls','countertops','backsplash','flooring','appliances'], preserveNote: 'Preserve walls, countertops, backsplash, flooring.', textureInstructions: '- Painted cabinets: smooth finish, visible panel structure\n- Stained: visible wood grain\n- Door STYLE must be clearly rendered' },
  countertops: { categories: ['countertops','backsplash','shower-surround'], exclusions: ['walls','cabinets','flooring','appliances'], preserveNote: 'Preserve walls, cabinets, flooring.', textureInstructions: '- Quartz/granite: polished with reflections, realistic veining\n- Backsplash: individual tiles with grout lines\n- Marble-look: natural variation' },
  flooring: { categories: ['flooring'], exclusions: ['walls','cabinets','countertops','backsplash','furniture'], preserveNote: 'Preserve ALL surfaces above the floor.', textureInstructions: '- Hardwood: individual plank variation\n- LVP: realistic wood texture\n- All flooring follows perspective vanishing points' },
};

app.post('/api/interior-render', generationLimiter, async (req, res) => {
  const { imageBase64, mimeType, roomType, renderPass, zones } = req.body;
  if (!imageBase64 || !zones?.length || !renderPass) return res.status(400).json({ error: 'Missing fields.' });
  const passConfig = PASS_CONFIGS[renderPass];
  if (!passConfig) return res.status(400).json({ error: `Invalid renderPass: ${renderPass}` });
  const activeZones = (zones as InteriorZonePayload[]).filter(z => passConfig.categories.includes(z.category));
  if (activeZones.length === 0) return res.json({ resultImage: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` });
  try {
    validateImagePayload(imageBase64, mimeType);
    let prompt = `You are a strict interior material-replacement engine for a ${roomType} remodel.\n\nApply ONLY these ${renderPass.toUpperCase()} changes:\n`;
    activeZones.forEach(z => { prompt += `• ${z.name}: ${z.brand} ${z.lineName} "${z.colorName}" — ${z.hue} (hex: ${z.colorHex}) [${z.materialType}]\n`; });
    prompt += `\nRULES:\n1. PRESERVE room geometry, perspective, dimensions.\n2. DO NOT modify ${passConfig.exclusions.join(', ')}.\n3. ${passConfig.preserveNote}\n4. TEXTURE:\n${passConfig.textureInstructions}\n5. Maintain EXACT same lighting.\n6. Realistic reflections.\n7. Follow room vanishing points.\n8. PHOTOREALISM required — no AI artifacts.\n9. Material textures correctly scaled.`;
    const response = await withTimeout(ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: { parts: [{ inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } }, { text: prompt }] },
    }), 90_000, `interior-render-${renderPass}`);
    let resultImage: string | null = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) { if (part.inlineData) { resultImage = `data:image/png;base64,${part.inlineData.data}`; break; } }
    if (!resultImage) return res.status(500).json({ error: `AI did not return an image for ${renderPass} pass.` });
    res.json({ resultImage });
  } catch (err: any) { console.error(`[interior-render-${renderPass}]`, err?.message); res.status(500).json({ error: err?.message || `${renderPass} render failed.` }); }
});

// --- POST /api/interior-quick-render ---
app.post('/api/interior-quick-render', generationLimiter, async (req, res) => {
  const { imageBase64, mimeType, roomType, zones } = req.body;
  if (!imageBase64 || !zones?.length) return res.status(400).json({ error: 'Missing imageBase64 or zones.' });
  try {
    validateImagePayload(imageBase64, mimeType);
    let prompt = `You are a strict interior material-replacement engine. Apply ALL changes to this ${roomType}:\n\n`;
    (zones as InteriorZonePayload[]).forEach(z => { prompt += `• ${z.name}: ${z.brand} ${z.lineName} "${z.colorName}" — ${z.hue} (hex: ${z.colorHex}) [${z.materialType}]\n`; });
    prompt += `\nCRITICAL: Preserve geometry, do NOT modify appliances/fixtures/furniture. Photorealistic result required.`;
    const response = await withTimeout(ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: { parts: [{ inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } }, { text: prompt }] },
    }), 90_000, 'interior-quick-render');
    let resultImage: string | null = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) { if (part.inlineData) { resultImage = `data:image/png;base64,${part.inlineData.data}`; break; } }
    if (!resultImage) return res.status(500).json({ error: 'AI did not return an image.' });
    res.json({ resultImage });
  } catch (err: any) { console.error('[interior-quick-render]', err?.message); res.status(500).json({ error: err?.message || 'Quick render failed.' }); }
});

// --- POST /api/enhance-image ---
app.post('/api/enhance-image', generationLimiter, async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg' } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });
  try {
    validateImagePayload(imageBase64, mimeType);
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: [{ role: 'user', parts: [
        { inlineData: { mimeType, data: imageBase64 } },
        { text: `Optimize this interior room photo for AI material replacement. Remove clutter, preserve all surfaces (cabinets, countertops, tile, flooring, trim), maintain room geometry. Output a clean, well-lit room photo.` }
      ] }],
      config: { responseModalities: ['IMAGE', 'TEXT'], temperature: 0.2 },
    });
    let enhancedBase64: string | null = null; let outMime = 'image/png';
    for (const part of (response.candidates?.[0]?.content?.parts ?? [])) { if ((part as any).inlineData?.data) { enhancedBase64 = (part as any).inlineData.data; outMime = (part as any).inlineData.mimeType ?? 'image/png'; break; } }
    if (!enhancedBase64) return res.status(500).json({ error: 'No enhanced image returned.' });
    res.json({ enhancedImageBase64: enhancedBase64, mimeType: outMime });
  } catch (err: unknown) { res.status(500).json({ error: err instanceof Error ? err.message : String(err) }); }
});

// --- POST /api/auto-mask ---
app.post('/api/auto-mask', generationLimiter, async (req, res) => {
  const { imageBase64, mimeType, maskTarget } = req.body;
  if (!imageBase64 || !maskTarget) return res.status(400).json({ error: 'Missing fields.' });
  try {
    validateImagePayload(imageBase64, mimeType);
    const response = await withTimeout(ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: { parts: [
        { inlineData: { data: imageBase64, mimeType: mimeType || 'image/png' } },
        { text: `Create a binary mask for "${maskTarget}". Target = PURE WHITE. Everything else = PURE BLACK. Sharp edges, no blur.` }
      ] },
    }), 90_000, 'auto-mask');
    let maskBase64 = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) { if (part.inlineData) { maskBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`; break; } }
    if (!maskBase64) return res.status(500).json({ error: 'No mask generated.' });
    res.json({ maskBase64 });
  } catch (err: any) { res.status(500).json({ error: err?.message || 'Auto-mask failed.' }); }
});

// --- GET /api/ping ---
app.get('/api/ping', (_req, res) => { res.json({ status: 'ok', uptime: Math.round(process.uptime()), ts: new Date().toISOString() }); });

// --- Gmail transport ---
const gmailTransport = (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) ? nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } }) : null;

// --- POST /api/quote-request ---
app.post('/api/quote-request', standardLimiter, async (req, res) => {
  const { name, email, phone, address, zipCode } = req.body;
  if (!name || !email || !phone || !address || !zipCode) return res.status(422).json({ error: 'Fill all required fields.' });
  console.log(`[quote-request] New lead: ${name} <${email}> ${phone}`);
  res.json({ success: true });
});

// --- Static files in production ---
if (process.env.NODE_ENV === 'production') { app.use(express.static(path.join(__dirname, 'dist'))); app.get('*', (_, res) => { res.sendFile(path.join(__dirname, 'dist', 'index.html')); }); }

function startServer(port: number, retries = 3) {
  const server = app.listen(port, () => {
    console.log(`✅  BlueprintEnvision Interior API → http://localhost:${port}`);
    const selfUrl = process.env.RENDER_EXTERNAL_URL;
    if (selfUrl) { setInterval(() => { fetch(`${selfUrl}/api/ping`).then(() => console.log('🏓 keep-alive')).catch(e => console.warn('keep-alive failed:', e.message)); }, 14 * 60 * 1000); }
  });
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE' && retries > 0) { console.warn(`⚠️  Port ${port} in use, trying ${port + 1}...`); startServer(port + 1, retries - 1); }
    else { console.error(`❌  Failed to start:`, err.message); process.exit(1); }
  });
}
startServer(PORT);
