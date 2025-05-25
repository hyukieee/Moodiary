// server_less/api/youtube-search.js
import { fetch } from "undici";

export default async function handler(req, res) {
  // 1) GET / POST 체크
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET allowed" });
  }

  const { title, artist } = req.query;
  console.log("🧐 /api/youtube-search query:", { title, artist });

  if (!title) {
    return res.status(400).json({ error: "title 쿼리가 필요합니다." });
  }
  // artist는 폴백 허용

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    console.error("⚠️ YOUTUBE_API_KEY가 설정되어 있지 않습니다.");
    return res.status(500).json({ error: "Server misconfig" });
  }

  // Helper: 실제 API 호출
  async function doSearch(q) {
    const url =
      `https://www.googleapis.com/youtube/v3/search?part=snippet,id` +
      `&type=video&order=relevance&videoEmbeddable=true&maxResults=1` +
      `&q=${encodeURIComponent(q)}` +
      `&key=${key}`;
    console.log("🔗 YouTube API URL:", url);
    const r = await fetch(url);
    if (!r.ok) {
      throw new Error(`YouTube API responded ${r.status}`);
    }
    const j = await r.json();
    console.log("📦 YouTube API response items:", j.items?.length);
    return j.items?.[0] || null;
  }

  try {
    // 2) 우선 `title by artist` 형태로 시도
    const primaryQuery = artist ? `${title} by ${artist}` : title;
    let item = await doSearch(primaryQuery);

    // 3) 결과 없으면 `title`만으로 재시도
    if (!item && primaryQuery !== title) {
      console.log("↪️ primary failed, retry with title only");
      item = await doSearch(title);
    }

    // 4) 최종 결과 처리
    if (!item) {
      console.log("❌ No YouTube result for both queries");
      return res.status(200).json({ videoId: null, thumbnail: null });
    }

    const videoId   = item.id.videoId || null;
    const snippet   = item.snippet || {};
    const thumbnail =
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      null;

    console.log("✅ Found videoId, thumbnail:", { videoId, thumbnail });
    return res.status(200).json({ videoId, thumbnail });
  } catch (e) {
    console.error("🔥 YouTube-search error:", e.message);
    return res.status(500).json({ error: e.message });
  }
}
