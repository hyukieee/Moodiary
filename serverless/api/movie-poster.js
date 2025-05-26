// server_less/api/movie-poster.js
// TMDB V4 인증(Bearer 토큰) + 글로벌 fetch 사용
export default async function handler(req, res) {
  const { title } = req.query;
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  const TMDB_BEARER = process.env.TMDB_API_KEY; // V4 Bearer Token
  if (!TMDB_BEARER) {
    console.error("TMDB_API_KEY (Bearer) is missing");
    return res.status(500).json({ error: "Server config error: TMDB_API_KEY not set" });
  }

  try {
    const q = encodeURIComponent(title);
    const url = `https://api.themoviedb.org/3/search/movie?query=${q}&language=ko-KR&region=KR`;

    const tmdbRes = await fetch(url, {
      headers: { Authorization: `Bearer ${TMDB_BEARER}` }
    });

    if (!tmdbRes.ok) {
      if (tmdbRes.status === 401) {
        console.error("TMDB unauthorized: invalid V4 token");
        return res.status(500).json({ error: "TMDB unauthorized: check your Bearer token" });
      }
      console.error(`TMDB API error ${tmdbRes.status}: ${tmdbRes.statusText}`);
      return res.status(500).json({ error: `TMDB API error ${tmdbRes.status}` });
    }

    const data = await tmdbRes.json();
    console.log("TMDB raw results:", data);
    const results = Array.isArray(data.results) ? data.results : [];

    if (results.length === 0) {
      return res.status(200).json({ poster: null, note: "No matching movie found" });
    }

    const film = results[0];
    if (!film.poster_path) {
      console.warn("No poster_path for film:", film);
      return res.status(200).json({ poster: null, note: "No poster available" });
    }

    const posterUrl = `https://image.tmdb.org/t/p/w500${film.poster_path}`;
    return res.status(200).json({ poster: posterUrl });
  } catch (e) {
    console.error("TMDB proxy error:", e);
    return res.status(500).json({ error: e.message });
  }
}