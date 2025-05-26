// frontend/src/components/Recommendations.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Recommendations.css";

export default function Recommendations({ data }) {
  const { books = [], movies = [], music = [] } = data;
  const [bookCovers, setBookCovers] = useState([]);
  const [moviePosters, setMoviePosters] = useState([]);
  const [spotifyInfo, setSpotifyInfo] = useState([]);

  // 1) 책 표지
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

  // 2) 영화 포스터
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

  // 3) 음악 (Spotify)
  useEffect(() => {
    Promise.all(
      music.map(({ title, artist }) =>
        axios
          .get(
            `/api/spotify-search?title=${encodeURIComponent(title)}` +
              `&artist=${encodeURIComponent(artist)}`
          )
          .then((r) => r.data)
          .catch(() => ({ thumbnail: null, trackUrl: null }))
      )
    ).then(setSpotifyInfo);
  }, [music]);

  return (
    <section className="recommendations">
      {/* 📚 책 */}
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

      {/* 🎬 영화 */}
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

      {/* 🎵 음악 */}
      <h3>🎵 음악</h3>
      <ul className="recommendation-list">
        {music.map((s, i) => {
          const info = spotifyInfo[i] || {};
          return (
            <li key={i} className="recommendation-item">
              {info.thumbnail && info.trackUrl && (
                <a
                  href={info.trackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={info.thumbnail}
                    alt={s.title}
                    className="recommend-image music-image"
                  />
                </a>
              )}
              <div className="recommendation-text">
                <strong className="recommend-title">{s.title}</strong>
                <span className="recommend-meta">— {s.artist}</span>
                {s.reason && <p className="recommend-reason">{s.reason}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
