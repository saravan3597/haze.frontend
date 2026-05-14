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
        const prompt = palette === 'dark'
            ? 'stunning phone wallpaper dark moody atmosphere, deep space nebula OR volcanic night landscape OR dark misty forest OR moonlit ocean OR neon rain city OR dramatic storm clouds, ultra high quality cinematic lighting rich dark tones, portrait 9:16, no text no people no watermark'
            : 'stunning phone wallpaper bright airy atmosphere, golden hour landscape OR soft misty mountains OR sunlit coastal cliffs OR spring cherry blossoms OR white minimalist architecture OR calm lake reflection, ultra high quality natural soft lighting clean bright tones, portrait 9:16, no text no people no watermark';
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