// server_less/api/book-cover.js
import { fetch } from "undici";

async function fetchGoogleBooks(q, key) {
  const url =
    `https://www.googleapis.com/books/v1/volumes` +
    `?q=${encodeURIComponent(q)}` +
    `&key=${key}` +
    `&maxResults=3`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GB res ${res.status}`);
  return res.json();
}

export default async function handler(req, res) {
  const { title, author } = req.query;
  if (!title) return res.status(400).json({ error: "title required" });
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (!key) return res.status(500).json({ error: "Server misconfig" });

  const queries = [
    `intitle:${title}+inauthor:${author || ""}`,
    `intitle:${title}`,
    `${author || ""}`,
  ];

  try {
    for (const q of queries) {
      const j = await fetchGoogleBooks(q, key);
      const items = j.items || [];
      for (const it of items) {
        const info = it.volumeInfo || {};
        const links = info.imageLinks || {};
        const thumb =
          (links.thumbnail || links.smallThumbnail || "")
            .replace(/^http:/, "https:");
        if (thumb) {
          return res.status(200).json({ thumbnail: thumb });
        }
      }
    }
    // 모두 실패
    return res.status(200).json({ thumbnail: null });
  } catch (e) {
    console.error("GoogleBooks multi-fetch error:", e);
    return res.status(500).json({ error: e.message });
  }
}
