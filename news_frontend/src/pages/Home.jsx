import { useEffect, useState } from "react";
import { fetchNewsByTopic } from "../api/newsApi";
import ArticleCard from "../components/ArticleCard";
import LoadingSpinner from "../components/LoadingSpinner";

const SUGGESTED_TOPICS = [
  "technology",
  "sports",
  "politics",
  "finance",
  "health",
  "startups",
  "ai",
];

export default function Home() {
  const [topic, setTopic] = useState("technology");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const PAGE_SIZE = 5;

  const fetchNews = async (query = topic, pageToLoad = 1) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Please enter a topic to search");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const res = await fetchNewsByTopic(trimmed, pageToLoad, PAGE_SIZE);

      // Handle different response structures
      const payload = res.data?.data || res.data;
      
      if (!payload) {
        throw new Error("Invalid response from server");
      }

      setArticles(payload.articles || []);
      setPage(payload.page || pageToLoad);
      setTotalPages(payload.total_pages || 1);
      setTotal(payload.total || 0);
      
    } catch (err) {
      console.error("Error fetching news:", err);
      
      // Handle specific error cases
      if (err.response?.status === 404) {
        setError("No articles found for this topic. Try a different search term.");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(err.response?.data?.detail || "Unable to load news right now. Please try again.");
      }
      
      // Reset articles on error
      setArticles([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews("technology", 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Reset to first page when searching a new topic
    setPage(1);
    fetchNews(topic, 1);
  };

  const handleTopicClick = (selectedTopic) => {
    setTopic(selectedTopic);
    setPage(1);
    fetchNews(selectedTopic, 1);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage === page || nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    fetchNews(topic, nextPage);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="helper-text-strong">Browse</div>
          <h2 className="page-title">Search news by topic or keyword</h2>
          <p className="page-subtitle">
            Type any topic you care about—like &quot;AI regulation&quot; or
            &quot;cricket&quot;—and we&apos;ll fetch summarised headlines and learn
            from your interactions.
          </p>
        </div>
      </div>

      <div className="page-grid">
        <section className="card">
          <div className="card-header">
            <h3 className="card-title">Topic feed</h3>
            <span className="badge-soft">Real-time from GNews API</span>
          </div>

          <div className="card-body stack-v">
            <form onSubmit={handleSubmit} className="stack-v">
              <div className="field-row">
                <div className="field-group" style={{ flex: 1 }}>
                  <span className="field-label">Topic or keyword</span>
                  <input
                    className="field-control"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder='e.g. "technology", "world cup", "startups"'
                  />
                </div>

                <div className="field-group" style={{ width: 150 }}>
                  <span className="field-label">Search</span>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || !topic.trim()}
                  >
                    {loading ? "Searching…" : "Search"}
                  </button>
                </div>
              </div>

              <div className="stack-h">
                <span className="helper-text text-xs">Quick picks:</span>
                <div className="article-tags">
                  {SUGGESTED_TOPICS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className="badge-soft"
                      onClick={() => handleTopicClick(t)}
                      disabled={loading}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            <p className="helper-text">
              Each card shows a short AI-generated summary using the TextRank
              algorithm on the backend. Opening, liking, or saving articles will
              update your interaction profile and improve future recommendations.
            </p>

            {error && <p className="helper-text text-accent">{error}</p>}

            {loading ? (
              <div className="mt-md">
                <LoadingSpinner label="Fetching latest headlines…" />
              </div>
            ) : (
              <>
                <div className="articles-list mt-sm">
                  {articles.length === 0 && !error && (
                    <p className="helper-text">
                      No articles yet. Try another topic or refine your search.
                    </p>
                  )}
                  {articles.map((article) => (
                    <ArticleCard key={article.url} article={article} />
                  ))}
                </div>

                {totalPages > 1 && articles.length > 0 && (
                  <div className="pagination mt-md">
                    <span className="helper-text text-xs">
                      Page {page} of {totalPages} ({total} total articles)
                    </span>

                    <button
                      type="button"
                      className="btn-ghost text-xs"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1 || loading}
                    >
                      Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, idx) => {
                      const pageNumber = idx + 1;
                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          className={`btn-ghost text-xs ${
                            pageNumber === page ? "btn-active" : ""
                          }`}
                          onClick={() => handlePageChange(pageNumber)}
                          disabled={loading}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      className="btn-ghost text-xs"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages || loading}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <aside className="card">
          <div className="card-header">
            <h3 className="card-title">How this works</h3>
            <span className="card-badge">Hybrid recommender</span>
          </div>

          <div className="card-body stack-v">
            <div className="stack-v">
              <p className="helper-text">
                Every interaction you make—views, reads, likes, saves—feeds into
                your profile of topics and keywords. The backend then blends
                content-based, collaborative, and trending signals to suggest
                what to read next.
              </p>

              <div className="stack-h">
                <span className="pill">
                  <span className="pill-dot" />
                  <span className="pill-label">Live profile</span>
                </span>
                <span className="pill">
                  <span className="pill-dot-soft" />
                  <span className="pill-label">Cold start safe</span>
                </span>
              </div>

              <p className="helper-text">
                Head to <strong>Recommendations</strong> once you&apos;ve browsed
                a few topics to see your personalized feed.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}