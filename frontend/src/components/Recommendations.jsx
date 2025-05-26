import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Recommendations.css"; // 스타일 분리

export default function Recommendations({ data }) {
  const { books = [], movies = [], music = [] } = data;
  const [bookCovers, setBookCovers] = useState([]);
  const [moviePosters, setMoviePosters] = useState([]);
  const [ytInfo, setYtInfo] = useState([]);

  // 책 표지
  useEffect(() => {
    Promise.all(
      books.map(({ title, author }) =>
        axios
          .get(
            `/api/book-cover?title=${encodeURIComponent(title)}` +
              (author ? `&author=${encodeURIComponent(author)}` : "")
          )
          .then((r) => r.data.thumbnail)
          .catch(() => null)
      )
    ).then(setBookCovers);
  }, [books]);

  // 영화 포스터
  useEffect(() => {
    Promise.all(
      movies.map(({ title }) =>
        axios
          .get(`/api/movie-poster?title=${encodeURIComponent(title)}`)
          .then((r) => r.data.poster)
          .catch(() => null)
      )
    ).then(setMoviePosters);
  }, [movies]);

  // 유튜브 검색
  useEffect(() => {
    Promise.all(
      music.map(({ title, artist }) =>
        axios
          .get(
            `/api/youtube-search?title=${encodeURIComponent(
              title
            )}&artist=${encodeURIComponent(artist)}`
          )
          .then((r) => r.data)
          .catch(() => ({ videoId: null, thumbnail: null }))
      )
    ).then(setYtInfo);
  }, [music]);

  return (
    <section className="recommendations">
      {/* 책 */}
      <h3>📚 책</h3>
      <ul className="recommendation-list">
        {books.map((b, i) => (
          <li key={i} className="recommendation-item">
            {bookCovers[i] && (
              <img
                src={bookCovers[i]}
                alt={b.title}
                className="recommend-image"
              />
            )}
            <div className="recommendation-text">
              <strong className="recommend-title">{b.title}</strong>
              <span className="recommend-meta">— {b.author}</span>
              {b.reason && <p className="recommend-reason">{b.reason}</p>}
            </div>
          </li>
        ))}
      </ul>

      {/* 영화 */}
      <h3>🎬 영화</h3>
      <ul className="recommendation-list">
        {movies.map((m, i) => (
          <li key={i} className="recommendation-item">
            {moviePosters[i] && (
              <img
                src={moviePosters[i]}
                alt={m.title}
                className="recommend-image"
              />
            )}
            <div className="recommendation-text">
              <strong className="recommend-title">{m.title}</strong>
              <span className="recommend-meta">— {m.director}</span>
              {m.reason && <p className="recommend-reason">{m.reason}</p>}
            </div>
          </li>
        ))}
      </ul>

      {/* 음악: 여기만 music-list 클래스 */}
      <h3>🎵 음악</h3>
      <ul className="recommendation-list music-list">
        {music.map((s, i) => (
          <li key={i} className="recommendation-item music-item">
            {ytInfo[i]?.thumbnail && (
              <a
                href={`https://youtube.com/watch?v=${ytInfo[i].videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="music-link"
              >
                <div className="music-image-wrapper">
                  <img
                    src={ytInfo[i].thumbnail}
                    alt={s.title}
                    className="recommend-image music-image"
                  />
                </div>
              </a>
            )}
            <div className="recommendation-text">
              <strong className="recommend-title">{s.title}</strong>
              <span className="recommend-meta">— {s.artist}</span>
              {s.reason && <p className="recommend-reason">{s.reason}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
