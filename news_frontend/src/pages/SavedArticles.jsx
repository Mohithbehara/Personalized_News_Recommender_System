import { useEffect, useState } from "react";
import { useUserStore } from "../state/userStore";
import { getSavedArticles } from "../api/interactionApi";
import ArticleCard from "../components/ArticleCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function SavedArticles() {
  const user = useUserStore((state) => state.user);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = user?.user_id || localStorage.getItem("user_id");

  useEffect(() => {
    if (userId) {
      fetchSavedArticles();
    }
  }, [userId]);

  const fetchSavedArticles = async () => {
    if (!userId) {
      setError("Please log in to view saved articles");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await getSavedArticles(userId);
      setArticles(res.data.articles || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Unable to load saved articles. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="card">
        <div className="card-body stack-v">
          <p className="helper-text">
            Please <strong>log in</strong> to view your saved articles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <div className="helper-text-strong">Saved</div>
          <h2 className="page-title">Your saved articles</h2>
          <p className="page-subtitle">
            Articles you&apos;ve saved for later reading. Click any card to view
            details.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={fetchSavedArticles}
          disabled={loading}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Saved articles</h3>
          <span className="card-badge">
            {articles.length} {articles.length === 1 ? "article" : "articles"}
          </span>
        </div>

        <div className="card-body">
          {loading && (
            <div className="mt-md">
              <LoadingSpinner label="Loading your saved articles…" />
            </div>
          )}

          {error && !loading && (
            <p className="helper-text text-accent mt-sm">{error}</p>
          )}

          {!loading && !error && articles.length === 0 && (
            <p className="helper-text">
              You haven&apos;t saved any articles yet. Browse articles on the{" "}
              <strong>Home</strong> page and click the <strong>📌 Save</strong>{" "}
              button to save articles for later.
            </p>
          )}

          {!loading && !error && articles.length > 0 && (
            <div className="articles-list mt-sm">
              {articles.map((article) => (
                <ArticleCard key={article.article_id || article.url} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

