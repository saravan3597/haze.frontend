"use strict";
/*
 * AI PROVIDER: Pollinations.ai — free, no API key required
 * Model: Flux (best quality on Pollinations)
 * Docs: https://pollinations.ai
 *
 * To switch providers in future:
 *   1. Replace the fetch block below with the new provider's API call
 *   2. Deploy: firebase deploy --only functions
 *   3. Zero app-side changes required
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIWallpaper = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const DAILY_LIMIT = 3;
const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';
exports.generateAIWallpaper = functions
    .runWith({ timeoutSeconds: 120 })
    .https.onCall(async (data, context) => {
    functions.logger.info('generateAIWallpaper invoked', {
        uid: context.auth?.uid ?? 'unauthenticated',
        palette: data.palette,
    });
    // ── 1. Verify authentication ──────────────────────────────────────────
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be signed in to generate AI wallpapers.');
    }
    // ── 2. Block anonymous (guest) users ─────────────────────────────────
    if (context.auth.token.firebase.sign_in_provider === 'anonymous') {
        throw new functions.https.HttpsError('permission-denied', 'Sign in to use AI wallpaper generation.');
    }
    const uid = context.auth.uid;
    const palette = data.palette === 'light' ? 'light' : 'dark';
    // ── 3. Rate limit check ───────────────────────────────────────────────
    const db = admin.firestore();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const usageRef = db.doc(`users/${uid}/usage/ai`);
    let usageSnap;
    try {
        usageSnap = await usageRef.get();
    }
    catch (err) {
        functions.logger.error('Firestore read failed', {
            message: err instanceof Error ? err.message : String(err),
        });
        throw new functions.https.HttpsError('internal', 'Service unavailable. Try again.');
    }
    const usage = usageSnap.data() ?? { count: 0, date: '' };
    const currentCount = usage['date'] === today ? usage['count'] : 0;
    if (currentCount >= DAILY_LIMIT) {
        return { allowed: false, remaining: 0 };
    }
    // ── 4. Generate image via Pollinations.ai ─────────────────────────────
    let imageUrl;
    try {
        const darkPrompts = [
            'minimalist abstract dark wallpaper, deep navy and charcoal geometric forms, soft gradient bleed, ultra clean composition, matte finish, no text, phone wallpaper 9:16',
            'dark misty mountain range at blue hour, minimalist, vast negative space, desaturated indigo tones, cinematic, no text, phone wallpaper 9:16',
            'macro photograph of dark volcanic rock texture, subtle iridescence, extreme close-up, abstract minimal, moody, no text, phone wallpaper 9:16',
            'deep space nebula, muted purples and blacks, sparse stars, painterly, minimal, no text, phone wallpaper 9:16',
            'dark abstract fluid art, ink diffusing in water, slow motion freeze, black and deep teal, elegant, no text, phone wallpaper 9:16',
            'moonlit calm ocean horizon, long exposure, dark navy sky, single thin streak of light, minimal, no text, phone wallpaper 9:16',
            'dark architectural brutalist concrete surface, dramatic raking light, abstract, minimal, textural, no text, phone wallpaper 9:16',
        ];
        const lightPrompts = [
            'minimalist abstract light wallpaper, soft cream and warm white organic forms, subtle gradient, ultra clean composition, no text, phone wallpaper 9:16',
            'misty forest at dawn, pale morning light filtering through trees, soft focus, muted sage greens, minimal, airy, no text, phone wallpaper 9:16',
            'macro photograph of white marble texture, thin grey veining, clean, elegant, minimal, no text, phone wallpaper 9:16',
            'pale pink cherry blossom branches, soft blurred bokeh background, minimal, light, airy, no text, phone wallpaper 9:16',
            'aerial view of white sand dunes at golden hour, long shadows, minimal, abstract, warm tones, no text, phone wallpaper 9:16',
            'calm shallow ocean water, white sand beneath, abstract aerial, pale turquoise and white, minimal, no text, phone wallpaper 9:16',
            'white minimalist architecture, clean geometric forms, soft natural shadow play, warm light, no text, phone wallpaper 9:16',
        ];
        const pool = palette === 'dark' ? darkPrompts : lightPrompts;
        const prompt = pool[Math.floor(Math.random() * pool.length)];
        const seed = Math.floor(Math.random() * 999999) + 1;
        const url = `${POLLINATIONS_BASE}/${encodeURIComponent(prompt)}?width=640&height=1280&nologo=true&seed=${seed}&model=flux`;
        functions.logger.info('Calling Pollinations.ai', { palette, seed });
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 100000));
        const response = await Promise.race([fetch(url), timeout]);
        if (!response.ok) {
            const body = await response.text().catch(() => '');
            functions.logger.error('Pollinations error', { status: response.status, body });
            throw new Error(`http_${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const contentType = response.headers.get('content-type') ?? 'image/jpeg';
        imageUrl = `data:${contentType};base64,${base64}`;
        functions.logger.info('Pollinations image generated', { bytes: buffer.byteLength });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        functions.logger.error('Pollinations generation failed', { message: msg });
        if (msg === 'timeout') {
            throw new functions.https.HttpsError('deadline-exceeded', 'Generation timed out. Try again.');
        }
        if (msg.startsWith('http_')) {
            throw new functions.https.HttpsError('internal', `Generation failed (${msg}). Try again.`);
        }
        throw new functions.https.HttpsError('internal', 'Generation failed. Try again.');
    }
    // ── 5. Persist usage count ────────────────────────────────────────────
    const newCount = currentCount + 1;
    await usageRef.set({ count: newCount, date: today });
    return {
        allowed: true,
        imageUrl,
        remaining: DAILY_LIMIT - newCount,
    };
});
//# sourceMappingURL=generateAIWallpaper.js.map