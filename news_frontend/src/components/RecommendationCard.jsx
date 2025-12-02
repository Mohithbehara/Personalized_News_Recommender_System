import { useState } from "react";
import { formatDate } from "../utils/formDate";
import { useInteractions } from "../hooks/useInteractions";

export default function RecommendationCard({ article, score }) {
  const { trackInteraction, loading, error, success } = useInteractions();
  const [localFeedback, setLocalFeedback] = useState(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  if (!article) return null;

  const {
    title,
    url,
    description,
    summary,
    publishedAt,
    topic,
    keywords = [],
    source,
  } = article;

  // Full summary text
  const fullSummary = summary || description || "";
  const SUMMARY_TRUNCATE_LENGTH = 250;
  const shouldTruncate = fullSummary.length > SUMMARY_TRUNCATE_LENGTH;
  const displaySummary = isSummaryExpanded || !shouldTruncate
    ? fullSummary
    : `${fullSummary.slice(0, SUMMARY_TRUNCATE_LENGTH).trimEnd()}...`;

  const handleOpen = async () => {
    try {
      await trackInteraction({
        article,
        topic,
        interactionType: "read",
        keywords,
      });
    } catch (err) {
      // Error handled in hook
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleFeedback = async (interactionType) => {
    try {
      await trackInteraction({
        article,
        topic,
        interactionType,
        keywords,
      });
      // Show local feedback for this specific button
      setLocalFeedback(interactionType);
      setTimeout(() => setLocalFeedback(null), 2000);
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <div className="recommendation-card">
      <div className="stack-h-between">
        <h3 className="recommendation-title">{title}</h3>
        {typeof score !== "undefined" && (
          <span className="pill text-xs">
            <span className="pill-dot" />
            <span className="pill-label">
              Score {score && score.toFixed ? score.toFixed(2) : score}
            </span>
          </span>
        )}
      </div>

      <div className="article-meta">
        <span>{source?.name || source || "Unknown source"}</span>
        {publishedAt && (
          <span className="text-xs text-muted">{formatDate(publishedAt)}</span>
        )}
      </div>

      {fullSummary && (
        <div className="article-summary-wrapper">
          <p className="recommendation-summary">
            <span className="text-xs text-accent">Summary • </span>
            {displaySummary}
          </p>
          {shouldTruncate && (
            <button
              type="button"
              className="summary-toggle-btn"
              onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
            >
              {isSummaryExpanded ? "Show less" : "Read full summary"}
            </button>
          )}
        </div>
      )}

      <div className="article-actions">
        <div className="stack-h">
          {topic && <span className="chip">Topic {topic}</span>}
          {keywords.slice(0, 3).map((kw) => (
            <span key={kw} className="badge-soft">
              {kw}
            </span>
          ))}
        </div>

        <div className="stack-h">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleOpen}
            disabled={loading}
          >
            Open
          </button>
          <button
            type="button"
            className={`btn-ghost text-xs ${localFeedback === "like" ? "btn-active" : ""}`}
            onClick={() => handleFeedback("like")}
            disabled={loading}
            style={{ 
              pointerEvents: "auto",
              zIndex: 10,
              position: "relative"
            }}
          >
            {localFeedback === "like" ? "✓ Liked" : "👍 Like"}
          </button>
          <button
            type="button"
            className={`btn-ghost text-xs ${localFeedback === "save" ? "btn-active" : ""}`}
            onClick={() => handleFeedback("save")}
            disabled={loading}
            style={{ 
              pointerEvents: "auto",
              zIndex: 10,
              position: "relative"
            }}
          >
            {localFeedback === "save" ? "✓ Saved" : "📌 Save"}
          </button>
          <button
            type="button"
            className={`btn-ghost text-xs ${localFeedback === "dislike" ? "btn-active" : ""}`}
            onClick={() => handleFeedback("dislike")}
            disabled={loading}
            style={{ 
              pointerEvents: "auto",
              zIndex: 10,
              position: "relative"
            }}
          >
            {localFeedback === "dislike" ? "✓ Disliked" : "👎 Dislike"}
          </button>
        </div>
        
        {(error || success) && (
          <div 
            className={`text-xs ${error ? "text-error" : "text-success"}`}
            style={{ marginTop: "8px" }}
          >
            {error || success}
          </div>
        )}
      </div>
    </div>
  );
}
