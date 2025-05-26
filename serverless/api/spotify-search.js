// serverless/api/spotify-search.js
export default async function handler(req, res) {
    const { title, artist } = req.query;
    if (!title || !artist) {
      return res
        .status(400)
        .json({ error: "title과 artist 쿼리 둘 다 필요합니다." });
    }
  
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return res
        .status(500)
        .json({ error: "환경변수 SPOTIFY_CLIENT_ID/SECRET 설정이 필요합니다." });
    }
  
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );
  
    try {
      // 1) get token
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
  
      // 2) search track
      const q = encodeURIComponent(`track:${title} artist:${artist}`);
      const searchRes = await fetch(
        `https://api.spotify.com/v1/search?type=track&limit=1&q=${q}`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      if (!searchRes.ok) throw new Error(`검색 실패 ${searchRes.status}`);
      const { tracks } = await searchRes.json();
      const item = tracks.items[0];
      if (!item) return res.json({ thumbnail: null, trackUrl: null });
  
      // 3) respond with thumbnail + trackUrl
      return res.json({
        thumbnail: item.album.images[0]?.url || null,
        trackUrl: item.external_urls.spotify || null,
      });
    } catch (e) {
      console.error("Spotify API error:", e);
      return res.status(500).json({ error: e.message });
    }
  }
  