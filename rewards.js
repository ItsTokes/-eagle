// eaglenest v1.0.1 — Vercel serverless proxy for Signal's token API.
// Lets the site read live reward data without browser CORS limits.
const TOKEN = "0xe99509927aa0dc328e7ab5058cd24be1b2a5f280";
const UPSTREAM = [
  "https://legacy.signal.family/api/token/" + TOKEN,
  "https://signal.family/api/token/" + TOKEN,
];

export default async function handler(req, res) {
  for (const url of UPSTREAM) {
    try {
      const r = await fetch(url, { headers: { accept: "application/json" } });
      if (!r.ok) continue;
      const j = await r.json();
      // Only pass through what the site uses.
      const out = {
        paid_to_holders: j.paid_to_holders ?? null,
        custody: j.custody ?? null,
        supply: j.supply ?? null,
        fee_bps: j.fee_bps ?? null,
        creator_bps: j.creator_bps ?? null,
        mcap: j.mcap ?? null,
        price: j.price ?? null,
      };
      res.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=60");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(200).json(out);
    } catch (e) {}
  }
  res.status(502).json({ error: "Signal API unreachable" });
}
