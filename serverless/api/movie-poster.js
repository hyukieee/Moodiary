// serverless/api/movie-poster.js
export default async function handler(req, res) {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Only GET allowed" });
    }
  
    const { title } = req.query;
    if (!title) {
      return res.status(400).json({ error: "title 쿼리가 필요합니다." });
    }
  
    try {
      const TMDB_KEY = process.env.TMDB_API_KEY;
      const query = encodeURIComponent(title);
      // 한글 우선, 실패 시 영어 원제도 찾아볼 수 있게 language=ko,en
      const url =
        `https://api.themoviedb.org/3/search/movie?` +
        `query=${query}` +
        `&include_adult=false` +
        `&language=ko` +
        `&page=1`;
  
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${TMDB_KEY}` },
      });
      if (!resp.ok) throw new Error(`TMDB 응답 오류 ${resp.status}`);
      const { results } = await resp.json();
      if (!results.length) {
        return res.status(200).json({ poster: null });
      }
  
      // **1)** 제목(title) 혹은 원제(original_title)가 완전히 일치하는 영화 찾기
      const lc = title.trim().toLowerCase();
      let movie = results.find(
        (m) =>
          (m.title && m.title.toLowerCase() === lc) ||
          (m.original_title && m.original_title.toLowerCase() === lc)
      );
  
      // **2)** 그래도 없으면 결과 중 첫 번째
      if (!movie) {
        movie = results[0];
      }
  
      // **3)** 포스터 경로 조합
      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null;
  
      return res.status(200).json({ poster });
    } catch (err) {
      console.error("TMDB proxy error:", err);
      return res.status(500).json({ error: err.message });
    }
  }
  