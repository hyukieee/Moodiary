// server_less/api/analyze.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { date, title, diaryText } = req.body ?? {};
  if (!date || !diaryText) {
    return res
      .status(400)
      .json({ error: "Both `date` and `diaryText` are required." });
  }

  // GPT에 보낼 메시지 구성: system + user
  const messages = [
    {
      role: "system",
      content: "당신은 JSON 생성기입니다. 절대 코드펜스나 마크다운을 사용하지 말고, 설명 문구 없이 오직 하나의 JSON 객체만 반환하세요."
    },
    {
      role: "system",
      content: "반드시 출력된 텍스트는 순수 JSON이어야 하며, 백틱(`)이나 여백, 주석 없이 정확한 JSON 형식을 유지해야 합니다."
    },
    {
      role: "user",
      content:
        `다음 일기를 분석해 순수 JSON만 반환해주세요.

날짜: ${date}
제목: ${title || ""}
내용: """${diaryText}"""

1) 핵심 키워드 3개
2) 문장 단위 분석 → [{ sentence, emotion, reason }, …]
3) 감정별 score 계산 5개 → emotions 배열 (소수 둘째 자리 반올림, 내림차순), 한글로 작성 , 각각 1점 만점
4) 감정 흐름 emojiFlow (5개) , 각 emoji와 해당 문장, 문장은 한글로 작성
5) highlights (3~5문장)
6) recap (한 문장)
7) 실제 존재하는 다음 추천 (API 메타데이터 포함)
    - 주제와 관련된 것들 중 책은 베스트 셀러, 영화는 관객수가 많은, 음악은 유명한 곡을 추천할 것
    - 실제로 존재하는 콘텐츠만 추천하고, 지어내지 말 것
    - 꼭 한국어로 반환하지 않아도 됨
   • books (2) → { title, author, isbn, reason }
   • movies (2) → { title, director, tmdb_id, reason }
   • music (2) → { title, artist, spotify_id, reason }
8) dominantEmotion [ Joy, Sadness, Anger, Fear, Surprise, Calm ]중 하나를 선택하여 영어 그대로 반환

예시 출력 스키마:
{
  "keywords": ["", "", ""],
  "emotions": [{ "label": "", "score": 0.00 }, …],
  "emojiFlow": [{ "emoji": "", "text": "" }, … ],
  "highlights": ["", …],
  "recap": "",
  "recommendations": {
    "books": [{ "title":"", "author":"", "isbn":"", "reason":"" }, …],
    "movies": [{ "title":"", "director":"", "tmdb_id":0, "reason":"" }, …],
    "music": [{ "title":"", "artist":"", "spotify_id":"", "reason":"" }, …]
  },
  "dominantEmotion": "Sadness"
}`
    }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0,
      max_tokens: 1500,
    });

    // 순수 JSON이므로 trim() 후 바로 파싱
    const text = completion.choices[0].message.content.trim();
    const result = JSON.parse(text);

    // 원본 일기 데이터와 합쳐서 반환
    return res.status(200).json({ date, title, diaryText, ...result });
  } catch (err) {
    console.error("GPT ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
