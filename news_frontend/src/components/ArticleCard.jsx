import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInteractions } from "../hooks/useInteractions";
import { formatDate } from "../utils/formDate";

export default function ArticleCard({ article }) {
  const navigate = useNavigate();
  const { trackInteraction, loading, error, success } = useInteractions();
  const [localFeedback, setLocalFeedback] = useState(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  const {
    title,
    url,
    source,
    summary,
    description,
    publishedAt,
    topic,
    keywords = [],
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

  const handleQuickInteraction = async (interactionType) => {
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

  const handleViewDetails = () => {
    navigate("/article", { state: { article } });
  };

  return (
    <article
      className="article-card"
      onClick={handleViewDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleViewDetails();
      }}
    >
      <h3 className="article-title">{title}</h3>

      <div className="article-meta">
        <span>{source?.name || source || "Unknown source"}</span>
        {publishedAt && (
          <span className="text-xs text-muted">{formatDate(publishedAt)}</span>
        )}
      </div>

      {fullSummary && (
        <div className="article-summary-wrapper">
          <p className="article-summary">
            <span className="text-xs text-accent">Summary • </span>
            {displaySummary}
          </p>
          {shouldTruncate && (
            <button
              type="button"
              className="summary-toggle-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsSummaryExpanded(!isSummaryExpanded);
              }}
            >
              {isSummaryExpanded ? "Show less" : "Read full summary"}
            </button>
          )}
        </div>
      )}

      <div className="article-actions">
        <div className="stack-h">
          <span className="chip">
            Topic
            <span className="text-accent">
              {topic || "general"}
            </span>
          </span>
        </div>

        <div className="stack-h">
          <button
            type="button"
            className="btn-secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            disabled={loading}
          >
            Open
          </button>
          <button
            type="button"
            className={`btn-ghost text-xs ${localFeedback === "like" ? "btn-active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handleQuickInteraction("like");
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              handleQuickInteraction("save");
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              handleQuickInteraction("dislike");
            }}
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

      {keywords.length > 0 && (
        <div className="article-tags">
          {keywords.slice(0, 4).map((kw) => (
            <span key={kw} className="badge-soft">
              {kw}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
