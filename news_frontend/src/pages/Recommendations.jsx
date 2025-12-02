import RecommendationCard from "../components/RecommendationCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useRecommendations } from "../hooks/useRecommendations";

export default function Recommendations() {
  const { data, loading, error, refresh } = useRecommendations();

  const recs = data?.recommendations || data?.articles || [];

  return (
    <section>
      <div className="page-header">
        <div>
          <div className="helper-text-strong">For you</div>
          <h2 className="page-title">Personalized recommendations</h2>
          <p className="page-subtitle">
            Blended from your interaction history, trending topics, and
            content-based similarity.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={refresh}
          disabled={loading}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recommended for you</h3>
          {data?.source && (
            <span className="card-badge">
              Source: {data.source === "cold_start" ? "Trending" : data.source}
            </span>
          )}
        </div>

        <div className="card-body">
          {loading && (
            <div className="mt-md">
              <LoadingSpinner label="Building your recommendations…" />
            </div>
          )}

          {error && !loading && (
            <p className="helper-text text-accent mt-sm">{error}</p>
          )}

          {!loading && !error && recs.length === 0 && (
            <p className="helper-text">
              We don&apos;t have enough signal yet. Browse a few topics on the{" "}
              <strong>Home</strong> page and we&apos;ll start tailoring this feed.
            </p>
          )}

          {!loading && !error && recs.length > 0 && (
            <div className="mt-sm">
              {recs.map((rec, index) => (
                <RecommendationCard
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  article={rec.article || rec}
                  score={rec.score}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
