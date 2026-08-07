// Vercel serverless function: shared family store, backed by Upstash Redis
// (Vercel Marketplace KV). Protected by a family passcode.
// Env vars needed: FAMILY_KEY (your passcode), plus KV_REST_API_URL and
// KV_REST_API_TOKEN (injected automatically when you connect an Upstash
// database to the project).

const STORE_KEY = "wildstar-store";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const familyKey = process.env.FAMILY_KEY;
  if (!familyKey) return res.status(503).json({ error: "Sync not configured: set the FAMILY_KEY environment variable." });
  if (req.headers["x-family-key"] !== familyKey) return res.status(401).json({ error: "Wrong family passcode." });

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return res.status(503).json({ error: "Sync not configured: connect an Upstash KV database to this project." });

  const auth = { Authorization: `Bearer ${token}` };

  if (req.method === "GET") {
    const r = await fetch(`${url}/get/${STORE_KEY}`, { headers: auth });
    const j = await r.json();
    return res.status(200).json(j.result ? JSON.parse(j.result) : null);
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
    if (body.length > 900_000) return res.status(413).json({ error: "Store too large." });
    const r = await fetch(`${url}/set/${STORE_KEY}`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body,
    });
    if (!r.ok) return res.status(502).json({ error: "Storage write failed." });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Use GET or POST." });
}
