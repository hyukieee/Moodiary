// server_less/api/analyze.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method === "GET") {
    // 헬스체크용
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

  // GPT 프롬프트: 순수 JSON만 반환하도록 코드펜스 제거
  const prompt = `
  다음 일기를 분석해 순수 JSON만 반환해주세요.
  
  날짜: ${date}
  제목: ${title}
  내용: """${diaryText}"""
  
  1) 이 일기의 핵심 키워드 3개를 뽑고 (예: 자연, 설렘, 도전)
  2) 문장 단위로 분할한 뒤, 각 문장마다 해당되는 감정(label: 기쁨, 슬픔, 분노, 불안, 놀람, 평온)과
     “그 이유가 되는 핵심 키워드”를 [{ sentence, emotion, reason }, …] 형태로 알려주세요.
  3) 총 문장 수 대비 각 감정이 등장한 횟수로 점수(score)를 계산하세요.
     - score = (등장횟수 ÷ 총 문장 수), 0~1 사이, 소수 둘째 자리 반올림
     - 6가지 감정 모두 포함하여 내림차순 정렬 후 "emotions" 배열로 출력
  4) **감정 흐름을 나타내는 이모지+설명 5개**  
     - 산책하면 🚶, 공연/연주하면 🎻(또는 🎹), 식사하면 🍽️, 휴식하면 🛋️ 등  
     - 그 순간에 했던 **행동 또는 느낌**을 한두 단어로 텍스트로 달기  
  5) 하이라이트(3~5문장)  
  6) 리캡(한 문장 요약)  
  7) **일기에서 뽑은 핵심 키워드를 바탕으로**, **실제 존재하는** 다음 베스트셀러·대표작 콘텐츠를 추천해 주세요.  
     • 책 2권 — 반드시 일기 키워드와 연관된 주제/장르, 그리고 실제로 출판된 책만  
     • 영화 2편 — 반드시 일기 키워드와 연관된 주제/장르, 그리고 실제로 개봉된 영화만  
     • 음악 2곡 — 반드시 일기 키워드와 연관된 분위기/테마, 그리고 실제로 발매된 곡만  
     - 추천할 때 절대 “존재하지 않는” 가짜 제목을 만들어내지 말 것.
   - 반드시 **실제 메타데이터 API**(Google Books, TMDB, Spotify) 상위 3개 결과 중 하나를 골라서 제목·저자·감독·아티스트 정보를 내려줄 것.
  8) 이 일기의 전체적인 **대표 감정**을 “Joy, Sadness, Anger, Fear, Surprise, Calm” 중 하나만 골라서 dominantEmotion 필드로 내려주세요.
  
  반드시 아래 스키마만 순수 JSON으로 출력(허구의 제목은 절대 포함 금지):
  {
    "keywords": ["자연", "여유", "웃음"],
    "emotions": [
      { "label": "슬픔 😢", "score": 0.50 },
      { "label": "실망 😔", "score": 0.40 },
      …
    ],
    "emojiFlow": [
      { "emoji": "🤯", "text": "과제가 많아 머리가 복잡" },
      { "emoji": "😊", "text": "친구들 만나서 행복" },
      …
    ],
    "highlights": ["첫 번째 핵심 문장...", "두 번째 핵심 문장...", …],
    "recap": "오늘은 …",
    "recommendations": {
      "books": [
        { "title":"실제 도서명", "author":"실제 저자명", "reason":"…" },
        …
      ],
      "movies": [
        { "title":"실제 영화명", "director":"실제 감독명", "reason":"…" },
        …
      ],
      "music": [
        { "title":"실제 곡명", "artist":"실제 아티스트명", "reason":"…" },
        …
      ]
    },
    "dominantEmotion": "Sadness"
  }
  `.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });
    // GPT가 반환한 텍스트를 그대로 JSON.parse
    const result = JSON.parse(completion.choices[0].message.content);
    // diaryText와 title도 함께 반환
    return res.status(200).json({ date, title, diaryText, ...result });
  } catch (err) {
    console.error("GPT ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
