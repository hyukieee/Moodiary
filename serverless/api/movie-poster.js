// server_less/api/movie-poster.js
import { fetch } from "undici";

export default async function handler(req, res) {
  const { title } = req.query;
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  if (!process.env.TMDB_API_KEY) {
    console.error("TMDB_API_KEY is missing");
    return res.status(500).json({ error: "Server config error" });
  }

  try {
    const q = encodeURIComponent(title);
    const url = `https://api.themoviedb.org/3/search/movie` +
                `?api_key=${process.env.TMDB_API_KEY}` +
                `&query=${q}`;

    const r = await fetch(url);
    const j = await r.json();
    const results = j.results || [];

    // 첫 번째 결과
    const film = results[0];
    if (!film || !film.poster_path) {
      return res.status(200).json({ poster: null });
    }

    const poster = `https://image.tmdb.org/t/p/w300${film.poster_path}`;
    return res.status(200).json({ poster });
  } catch (e) {
    console.error("TMDB Error:", e);
    return res.status(500).json({ error: e.message });
  }
}
