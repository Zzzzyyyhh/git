export const SESSION_COOKIE = "lp_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

async function hmacHex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSessionToken(username: string, secret: string): Promise<string> {
  return hmacHex(secret, `lp_session:${username}`);
}

export async function verifySessionToken(token: string, username: string, secret: string): Promise<boolean> {
  const expected = await createSessionToken(username, secret);
  return token === expected;
}
