import { useEffect, useState } from "react";
import { fetchHeadlinesByCategory } from "../api/headlinesApi";
import ArticleCard from "../components/ArticleCard";
import LoadingSpinner from "../components/LoadingSpinner";

const CATEGORIES = [
  { id: "general", label: "General", icon: "📰" },
  { id: "technology", label: "Technology", icon: "💻" },
  { id: "business", label: "Business", icon: "💼" },
  { id: "sports", label: "Sports", icon: "⚽" },
  { id: "health", label: "Health", icon: "🏥" },
  { id: "science", label: "Science", icon: "🔬" },
  { id: "entertainment", label: "Entertainment", icon: "🎬" },
  { id: "world", label: "World", icon: "🌍" },
  { id: "nation", label: "Nation", icon: "🏛️" },
];

export default function Headlines() {
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const PAGE_SIZE = 5;

  const fetchHeadlines = async (category = selectedCategory, pageToLoad = 1) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetchHeadlinesByCategory(category, pageToLoad, PAGE_SIZE);

      const payload = res.data?.data || res.data;

      if (!payload) {
        throw new Error("Invalid response from server");
      }

      setArticles(payload.articles || []);
      setPage(payload.page || pageToLoad);
      setTotalPages(payload.total_pages || 1);
      setTotal(payload.total || 0);
    } catch (err) {
      console.error("Error fetching headlines:", err);

      if (err.response?.status === 404) {
        setError(`No headlines found for ${category}. Try another category.`);
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          err.response?.data?.detail ||
            "Unable to load headlines right now. Please try again."
        );
      }

      setArticles([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeadlines("general", 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
    fetchHeadlines(category, 1);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage === page || nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    fetchHeadlines(selectedCategory, nextPage);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="helper-text-strong">Top Headlines</div>
          <h2 className="page-title">Breaking news from trusted sources</h2>
          <p className="page-subtitle">
            Get the latest headlines across different categories—curated from top
            news sources with AI-generated summaries for quick reading.
          </p>
        </div>
      </div>

      <div className="page-grid">
        <section className="card">
          <div className="card-header">
            <h3 className="card-title">Headlines Feed</h3>
            <span className="badge-soft">Live from GNews API</span>
          </div>

          <div className="card-body stack-v">
            {/* Category Tabs */}
            <div className="stack-v">
              <span className="helper-text text-xs">Select category:</span>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`badge-soft ${
                      selectedCategory === cat.id ? "btn-active" : ""
                    }`}
                    onClick={() => handleCategoryChange(cat.id)}
                    disabled={loading}
                    style={{
                      padding: "0.5rem 1rem",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1,
                      fontWeight: selectedCategory === cat.id ? "600" : "400",
                    }}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="helper-text">
              Headlines are automatically summarized using TextRank algorithm.
              Click any article to read the full story or save it to your reading
              list.
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
                      No headlines available. Try another category.
                    </p>
                  )}
                  {articles.map((article) => (
                    <ArticleCard key={article.url} article={article} />
                  ))}
                </div>

                {totalPages > 1 && articles.length > 0 && (
                  <div className="pagination mt-md">
                    <span className="helper-text text-xs">
                      Page {page} of {totalPages} ({total} total headlines)
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
            <h3 className="card-title">About Headlines</h3>
            <span className="card-badge">Curated news</span>
          </div>

          <div className="card-body stack-v">
            <div className="stack-v">
              <p className="helper-text">
                Top headlines are fetched from GNews API&apos;s curated sources
                and automatically processed with keyword extraction and
                summarization.
              </p>

              <div className="stack-v" style={{ gap: "0.5rem" }}>
                <div className="stack-h">
                  <span className="pill">
                    <span className="pill-dot" />
                    <span className="pill-label">Auto-summarized</span>
                  </span>
                  <span className="pill">
                    <span className="pill-dot-soft" />
                    <span className="pill-label">9 categories</span>
                  </span>
                </div>
                <div className="stack-h">
                  <span className="pill">
                    <span className="pill-dot" />
                    <span className="pill-label">Real-time updates</span>
                  </span>
                  <span className="pill">
                    <span className="pill-dot-soft" />
                    <span className="pill-label">Trusted sources</span>
                  </span>
                </div>
              </div>

              <p className="helper-text">
                Your interactions with headlines (reading, liking, saving) will
                help improve your personalized recommendations.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}