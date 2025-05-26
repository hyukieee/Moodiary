// server_less/api/spotify-search.js
import fetch from "node-fetch";

let _token = null;
let _tokenExpires = 0;

// 1) Client Credentials로 토큰 발급
async function getSpotifyToken() {
  const now = Date.now();
  if (_token && now < _tokenExpires) {
    return _token;
  }
  const resp = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64"),
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  if (!resp.ok) {
    throw new Error(`Spotify token error ${resp.status}`);
  }
  const { access_token, expires_in } = await resp.json();
  _token = access_token;
  _tokenExpires = now + (expires_in - 60) * 1000; // 여유 1분 빼고
  return _token;
}

export default async function handler(req, res) {
  const { title, artist } = req.query;
  if (!title || !artist) {
    return res
      .status(400)
      .json({ error: "title, artist 쿼리 모두 필요합니다." });
  }

  try {
    const token = await getSpotifyToken();
    const q = encodeURIComponent(`${title} ${artist}`);
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?type=track&limit=1&q=${q}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!searchRes.ok) {
      throw new Error(`Spotify search error ${searchRes.status}`);
    }
    const data = await searchRes.json();
    const item = data.tracks.items[0];
    if (!item) {
      return res.json({ trackUrl: null, thumbnail: null });
    }
    // 가장 큰 커버 이미지를 골라서
    const thumb =
      item.album.images.length > 0
        ? item.album.images[0].url
        : null;

    return res.json({
      trackUrl: item.external_urls.spotify,
      thumbnail: thumb,
      name: item.name,
      artist: item.artists.map((a) => a.name).join(", "),
    });
  } catch (err) {
    console.error("Spotify API ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
