import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Web Push implementation using Web Crypto API
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  contactEmail: string
) {
  const encoder = new TextEncoder();

  // Import VAPID private key
  const privateKeyBytes = base64UrlDecode(vapidPrivateKey);
  const publicKeyBytes = base64UrlDecode(vapidPublicKey);

  // Create VAPID JWT
  const vapidJwt = await createVapidJwt(
    subscription.endpoint,
    contactEmail,
    privateKeyBytes,
    publicKeyBytes
  );

  // Encrypt the payload
  const encrypted = await encryptPayload(
    payload,
    subscription.p256dh,
    subscription.auth
  );

  // Send the push message
  const url = new URL(subscription.endpoint);
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `vapid t=${vapidJwt}, k=${vapidPublicKey}`,
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      'TTL': '86400',
    },
    body: encrypted,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Push failed: ${response.status} ${text}`);
  }
  // Consume response body
  await response.text();
}

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

async function createVapidJwt(
  endpoint: string,
  contact: string,
  privateKeyBytes: Uint8Array,
  publicKeyBytes: Uint8Array
): Promise<string> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: `mailto:${contact}`,
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    'jwk',
    {
      kty: 'EC',
      crv: 'P-256',
      x: base64UrlEncode(publicKeyBytes.slice(1, 33)),
      y: base64UrlEncode(publicKeyBytes.slice(33, 65)),
      d: base64UrlEncode(privateKeyBytes),
    },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert DER signature to raw r||s format
  const sigBytes = new Uint8Array(signature);
  let r: Uint8Array, s: Uint8Array;
  if (sigBytes[0] === 0x30) {
    // DER encoded
    const rLen = sigBytes[3];
    const rStart = 4;
    r = sigBytes.slice(rStart, rStart + rLen);
    const sLen = sigBytes[rStart + rLen + 1];
    const sStart = rStart + rLen + 2;
    s = sigBytes.slice(sStart, sStart + sLen);
    // Pad/trim to 32 bytes
    r = padTo32(r);
    s = padTo32(s);
  } else {
    // Already raw
    r = sigBytes.slice(0, 32);
    s = sigBytes.slice(32, 64);
  }

  const rawSig = new Uint8Array(64);
  rawSig.set(r, 0);
  rawSig.set(s, 32);

  return `${unsignedToken}.${base64UrlEncode(rawSig)}`;
}

function padTo32(bytes: Uint8Array): Uint8Array {
  if (bytes.length === 32) return bytes;
  if (bytes.length > 32) return bytes.slice(bytes.length - 32);
  const padded = new Uint8Array(32);
  padded.set(bytes, 32 - bytes.length);
  return padded;
}

async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<Uint8Array> {
  const encoder = new TextEncoder();

  // Generate local key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  const localPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey('raw', localKeyPair.publicKey)
  );

  // Import subscriber's public key
  const subscriberKey = await crypto.subtle.importKey(
    'raw',
    base64UrlDecode(p256dhKey),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // Derive shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: subscriberKey },
      localKeyPair.privateKey,
      256
    )
  );

  const authBytes = base64UrlDecode(authSecret);

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF for IKM
  const authInfo = encoder.encode('WebPush: info\0');
  const subscriberKeyRaw = base64UrlDecode(p256dhKey);
  const ikm_info = new Uint8Array(authInfo.length + subscriberKeyRaw.length + localPublicKeyRaw.length);
  ikm_info.set(authInfo);
  ikm_info.set(subscriberKeyRaw, authInfo.length);
  ikm_info.set(localPublicKeyRaw, authInfo.length + subscriberKeyRaw.length);

  const authHkdfKey = await crypto.subtle.importKey('raw', authBytes, { name: 'HKDF' }, false, ['deriveBits']);
  const prk_key = await crypto.subtle.importKey(
    'raw',
    sharedSecret,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const prk = new Uint8Array(await crypto.subtle.sign('HMAC', prk_key, authBytes));

  // Simple approach: use HKDF from auth
  const ikmKey = await crypto.subtle.importKey('raw', sharedSecret, { name: 'HKDF' }, false, ['deriveBits']);
  
  // Derive content encryption key and nonce using HKDF
  const cekInfo = encoder.encode('Content-Encoding: aes128gcm\0');
  const nonceInfo = encoder.encode('Content-Encoding: nonce\0');

  const prkImport = await crypto.subtle.importKey('raw', prk, { name: 'HKDF' }, false, ['deriveBits']);

  const cek = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt, info: cekInfo },
      prkImport,
      128
    )
  );

  const nonce = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt, info: nonceInfo },
      prkImport,
      96
    )
  );

  // Add padding delimiter
  const paddedPayload = new Uint8Array(encoder.encode(payload).length + 1);
  paddedPayload.set(encoder.encode(payload));
  paddedPayload[paddedPayload.length - 1] = 2; // delimiter

  // Encrypt with AES-128-GCM
  const aesKey = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt']);
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce },
      aesKey,
      paddedPayload
    )
  );

  // Build aes128gcm header: salt(16) + rs(4) + idlen(1) + keyid(65) + encrypted
  const recordSize = new Uint8Array(4);
  new DataView(recordSize.buffer).setUint32(0, paddedPayload.length + 16 + 1); // +16 for tag, +1 for padding

  const header = new Uint8Array(16 + 4 + 1 + localPublicKeyRaw.length);
  header.set(salt, 0);
  header.set(recordSize, 16);
  header[20] = localPublicKeyRaw.length;
  header.set(localPublicKeyRaw, 21);

  const result = new Uint8Array(header.length + encrypted.length);
  result.set(header);
  result.set(encrypted, header.length);

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch a random verse for the notification
    const { data: shloks, error: shlokError } = await supabaseAdmin
      .from('shloks')
      .select('id, verse_number, sanskrit_text, english_meaning, life_application, problem_context, chapter_id, chapters!inner(chapter_number)')
      .eq('status', 'published')
      .limit(100);

    if (shlokError || !shloks?.length) {
      throw new Error('No shloks found');
    }

    // Randomly pick verse or problem-based wisdom
    const isVerse = Math.random() > 0.5;
    const shlok = shloks[Math.floor(Math.random() * shloks.length)];
    const chapter = (shlok as any).chapters;

    let title: string;
    let body: string;
    let url: string;

    if (isVerse || !shlok.problem_context) {
      title = `🙏 Verse ${chapter.chapter_number}.${shlok.verse_number}`;
      body = shlok.english_meaning.length > 120
        ? shlok.english_meaning.substring(0, 117) + '...'
        : shlok.english_meaning;
      url = `/chapters/${chapter.chapter_number}/verse/${shlok.verse_number}`;
    } else {
      title = '💡 Wisdom for Today';
      body = shlok.problem_context!.length > 120
        ? shlok.problem_context!.substring(0, 117) + '...'
        : shlok.problem_context!;
      url = `/chapters/${chapter.chapter_number}/verse/${shlok.verse_number}`;
    }

    const payload = JSON.stringify({ title, body, url, icon: '/logo.png' });

    // Fetch all subscriptions
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*');

    if (subError) throw subError;

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

    let sent = 0;
    let failed = 0;
    const failedEndpoints: string[] = [];

    for (const sub of subscriptions || []) {
      try {
        await sendWebPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload,
          vapidPublicKey,
          vapidPrivateKey,
          'noreply@gitagyan.app'
        );
        sent++;
      } catch (err) {
        failed++;
        // If 404 or 410, subscription is dead - remove it
        if (err.message.includes('404') || err.message.includes('410')) {
          failedEndpoints.push(sub.endpoint);
        }
        console.error(`Push failed for ${sub.user_id}:`, err.message);
      }
    }

    // Clean up dead subscriptions
    if (failedEndpoints.length > 0) {
      await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .in('endpoint', failedEndpoints);
    }

    return new Response(JSON.stringify({
      sent,
      failed,
      cleaned: failedEndpoints.length,
      verse: `${chapter.chapter_number}.${shlok.verse_number}`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Send daily wisdom error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
