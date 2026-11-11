import { useRef, useState } from "react";
import "./App.css";

const EMPTY_MESSAGE = "No user yet. Try searching for 'octocat'.";
const VALIDATION_MESSAGE = "Please enter a GitHub username.";

function App() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0); // ignores stale responses when searches overlap

  const handleSearch = async () => {
    const u = username.trim();

    if (!u) {
      setUser(null);
      setError(VALIDATION_MESSAGE);
      return; // no API call for empty input
    }

    // Clear previous data and error before fetching
    setUser(null);
    setError("");
    setLoading(true);
    const id = ++requestId.current;

    try {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(u)}`
      );
      if (id !== requestId.current) return;

      if (res.status === 404) {
        setError("User not found. Check the username and try again.");
      } else if (!res.ok) {
        setError("Something went wrong. Please try again.");
      } else {
        const data = await res.json();
        if (id !== requestId.current) return;
        setUser(data);
      }
    } catch {
      if (id === requestId.current) {
        setError("Network error. Please try again.");
      }
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const blogUrl =
    user?.blog && (user.blog.startsWith("http") ? user.blog : `https://${user.blog}`);

  return (
    <main className="page">
      <section className="card">
        <h1 className="title">GitHub User Finder</h1>
        <p className="subtitle">Search a GitHub username to see profile details.</p>

        <div className="search">
          <input
            type="text"
            name="username"
            placeholder="e.g. octocat"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="GitHub username"
            autoComplete="off"
          />
          <button type="button" onClick={handleSearch}>
            Search
          </button>
        </div>

        <div className="result" aria-live="polite">
          {loading && <p className="muted">Loading…</p>}

          {!loading && error && <p className="error">{error}</p>}

          {!loading && !error && !user && <p className="muted">{EMPTY_MESSAGE}</p>}

          {!loading && user && (
            <div className="profile">
              <img className="avatar" src={user.avatar_url} alt={`${user.login} avatar`} />
              <h2 className="name">{user.name || user.login}</h2>
              <p className="login">@{user.login}</p>
              {user.bio && <p className="bio">{user.bio}</p>}

              <div className="stats">
                <div><strong>{user.followers}</strong><span>Followers</span></div>
                <div><strong>{user.following}</strong><span>Following</span></div>
                <div><strong>{user.public_repos}</strong><span>Repos</span></div>
              </div>

              <ul className="details">
                {user.location && <li><span>Location</span>{user.location}</li>}
                {user.company && <li><span>Company</span>{user.company}</li>}
                {blogUrl && (
                  <li>
                    <span>Website</span>
                    <a href={blogUrl} target="_blank" rel="noreferrer">{user.blog}</a>
                  </li>
                )}
              </ul>

              <a className="gh-link" href={user.html_url} target="_blank" rel="noreferrer">
                View on GitHub
              </a>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;