// serverless/api/spotify-search.js
import { fetch } from "undici";   // 또는 글로벌 fetch

export default async function handler(req, res) {
  const { title, artist } = req.query;
  if (!title) return res.status(400).json({ error: "title 쿼리가 필요합니다." });

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: "SPOTIFY_CLIENT_ID/SECRET 설정이 필요합니다." });
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    // 1) 토큰 요청
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    });
    if (!tokenRes.ok) throw new Error(`토큰 요청 실패 ${tokenRes.status}`);
    const { access_token } = await tokenRes.json();

    // 2) 트랙 검색 함수
    async function search(query) {
      const url = `https://api.spotify.com/v1/search?type=track&limit=1&q=${encodeURIComponent(query)}`;
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (!r.ok) throw new Error(`검색 실패 ${r.status}`);
      const { tracks } = await r.json();
      return tracks.items[0] || null;
    }

    // 3) 우선 track+artist, 없으면 title만
    let item = null;
    if (artist) {
      item = await search(`track:${title}%20artist:${artist}`);
    }
    if (!item) {
      item = await search(`track:${title}`);
    }
    if (!item) {
      return res.json({ thumbnail: null, trackUrl: null });
    }

    // 4) 응답
    return res.json({
      thumbnail: item.album.images[0]?.url || null,
      trackUrl: item.external_urls.spotify || null,
    });
  } catch (e) {
    console.error("Spotify API error:", e);
    return res.status(500).json({ error: e.message });
  }
}
