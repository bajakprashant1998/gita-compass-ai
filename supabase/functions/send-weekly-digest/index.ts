import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Minimal web push helpers (same as send-daily-wisdom)
function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64 + padding);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function padTo32(bytes: Uint8Array): Uint8Array {
  if (bytes.length === 32) return bytes;
  if (bytes.length > 32) return bytes.slice(bytes.length - 32);
  const padded = new Uint8Array(32);
  padded.set(bytes, 32 - bytes.length);
  return padded;
}

async function createVapidJwt(endpoint: string, contact: string, privateKeyBytes: Uint8Array, publicKeyBytes: Uint8Array): Promise<string> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = { aud: audience, exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, sub: `mailto:${contact}` };
  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey('jwk', {
    kty: 'EC', crv: 'P-256',
    x: base64UrlEncode(publicKeyBytes.slice(1, 33)),
    y: base64UrlEncode(publicKeyBytes.slice(33, 65)),
    d: base64UrlEncode(privateKeyBytes),
  }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(unsignedToken));
  const sigBytes = new Uint8Array(signature);
  let r: Uint8Array, s: Uint8Array;
  if (sigBytes[0] === 0x30) {
    const rLen = sigBytes[3]; const rStart = 4;
    r = padTo32(sigBytes.slice(rStart, rStart + rLen));
    const sLen = sigBytes[rStart + rLen + 1]; const sStart = rStart + rLen + 2;
    s = padTo32(sigBytes.slice(sStart, sStart + sLen));
  } else { r = sigBytes.slice(0, 32); s = sigBytes.slice(32, 64); }
  const rawSig = new Uint8Array(64); rawSig.set(r, 0); rawSig.set(s, 32);
  return `${unsignedToken}.${base64UrlEncode(rawSig)}`;
}

async function encryptPayload(payload: string, p256dhKey: string, authSecret: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const localKeyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const localPublicKeyRaw = new Uint8Array(await crypto.subtle.exportKey('raw', localKeyPair.publicKey));
  const subscriberKey = await crypto.subtle.importKey('raw', base64UrlDecode(p256dhKey), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: subscriberKey }, localKeyPair.privateKey, 256));
  const authBytes = base64UrlDecode(authSecret);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const subscriberKeyRaw = base64UrlDecode(p256dhKey);
  const prk_key = await crypto.subtle.importKey('raw', sharedSecret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const prk = new Uint8Array(await crypto.subtle.sign('HMAC', prk_key, authBytes));
  const cekInfo = encoder.encode('Content-Encoding: aes128gcm\0');
  const nonceInfo = encoder.encode('Content-Encoding: nonce\0');
  const prkImport = await crypto.subtle.importKey('raw', prk, { name: 'HKDF' }, false, ['deriveBits']);
  const cek = new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: cekInfo }, prkImport, 128));
  const nonce = new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: nonceInfo }, prkImport, 96));
  const paddedPayload = new Uint8Array(encoder.encode(payload).length + 1);
  paddedPayload.set(encoder.encode(payload)); paddedPayload[paddedPayload.length - 1] = 2;
  const aesKey = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt']);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, paddedPayload));
  const recordSize = new Uint8Array(4);
  new DataView(recordSize.buffer).setUint32(0, paddedPayload.length + 16 + 1);
  const header = new Uint8Array(16 + 4 + 1 + localPublicKeyRaw.length);
  header.set(salt, 0); header.set(recordSize, 16); header[20] = localPublicKeyRaw.length; header.set(localPublicKeyRaw, 21);
  const result = new Uint8Array(header.length + encrypted.length);
  result.set(header); result.set(encrypted, header.length);
  return result;
}

async function sendWebPush(sub: { endpoint: string; p256dh: string; auth: string }, payload: string, vapidPublicKey: string, vapidPrivateKey: string, contact: string) {
  const privateKeyBytes = base64UrlDecode(vapidPrivateKey);
  const publicKeyBytes = base64UrlDecode(vapidPublicKey);
  const vapidJwt = await createVapidJwt(sub.endpoint, contact, privateKeyBytes, publicKeyBytes);
  const encrypted = await encryptPayload(payload, sub.p256dh, sub.auth);
  const response = await fetch(sub.endpoint, {
    method: 'POST',
    headers: { 'Authorization': `vapid t=${vapidJwt}, k=${vapidPublicKey}`, 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', 'TTL': '86400' },
    body: encrypted,
  });
  if (!response.ok) { const t = await response.text(); throw new Error(`Push failed: ${response.status} ${t}`); }
  await response.text();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Get users with weekly digest enabled who have push subscriptions
    const { data: prefs } = await supabaseAdmin
      .from('user_preferences')
      .select('user_id')
      .eq('weekly_digest_enabled', true);

    if (!prefs?.length) {
      return new Response(JSON.stringify({ sent: 0, message: 'No users opted in' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userIds = prefs.map(p => p.user_id);
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

    let sent = 0;
    let failed = 0;
    const deadEndpoints: string[] = [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const userId of userIds) {
      try {
        // Fetch user's weekly activity
        const [activityRes, progressRes, subsRes] = await Promise.all([
          supabaseAdmin.from('reading_activity').select('verses_read_count').eq('user_id', userId).gte('activity_date', sevenDaysAgo.toISOString().split('T')[0]),
          supabaseAdmin.from('user_progress').select('current_streak, shloks_read').eq('user_id', userId).maybeSingle(),
          supabaseAdmin.from('push_subscriptions').select('*').eq('user_id', userId),
        ]);

        const subs = subsRes.data || [];
        if (subs.length === 0) continue;

        const weeklyVerses = (activityRes.data || []).reduce((sum: number, a: any) => sum + a.verses_read_count, 0);
        const streak = progressRes.data?.current_streak || 0;
        const totalRead = progressRes.data?.shloks_read?.length || 0;

        const title = streak > 0
          ? `📊 Weekly: ${weeklyVerses} verses · 🔥 ${streak}-day streak!`
          : `📊 Your Weekly Gita Summary`;

        const body = `This week you read ${weeklyVerses} verse${weeklyVerses !== 1 ? 's' : ''}. Total: ${totalRead} verses explored. ${streak > 0 ? `Keep your ${streak}-day streak going!` : 'Start a new streak today!'}`;

        const payload = JSON.stringify({ title, body, url: '/dashboard', icon: '/logo.png' });

        for (const sub of subs) {
          try {
            await sendWebPush(sub, payload, vapidPublicKey, vapidPrivateKey, 'noreply@gitagyan.app');
            sent++;
          } catch (err) {
            failed++;
            if (err.message.includes('404') || err.message.includes('410')) {
              deadEndpoints.push(sub.endpoint);
            }
          }
        }
      } catch (err) {
        console.error(`Digest failed for ${userId}:`, err.message);
        failed++;
      }
    }

    if (deadEndpoints.length > 0) {
      await supabaseAdmin.from('push_subscriptions').delete().in('endpoint', deadEndpoints);
    }

    return new Response(JSON.stringify({ sent, failed, cleaned: deadEndpoints.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Weekly digest error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
