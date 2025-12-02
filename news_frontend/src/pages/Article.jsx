import { useLocation, useNavigate } from "react-router-dom";
import { truncateText } from "../utils/truncateText";
import { formatDate } from "../utils/formDate";
import { useInteractions } from "../hooks/useInteractions";

export default function Article() {
  const location = useLocation();
  const navigate = useNavigate();
  const { trackInteraction } = useInteractions();

  const article = location.state?.article;

  if (!article) {
    return (
      <div className="card">
        <div className="card-body stack-v">
          <p className="helper-text">
            No article details found. Try opening an article from the{" "}
            <strong>Home</strong> or <strong>Recommendations</strong> page.
          </p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const {
    title,
    url,
    source,
    summary,
    description,
    content,
    publishedAt,
    topic,
    keywords = [],
  } = article;

  // Prioritize the AI-generated summary (now 4-5 sentences) for comprehensive understanding
  const primaryText =
    summary || content || description || "No summary available for this article.";

  const handleOpen = async () => {
    await trackInteraction({
      article,
      topic,
      interactionType: "read",
      keywords,
    });

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <div className="helper-text-strong">Article</div>
          <h2 className="page-title">{title}</h2>
          <p className="page-subtitle">
            {source?.name || source || "Source unknown"} •{" "}
            {publishedAt && formatDate(publishedAt)}
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      <div className="page-grid">
        <article className="card">
          <div className="card-body stack-v">
            {primaryText ? (
              <p className="helper-text" style={{ fontSize: "0.92rem" }}>
                {primaryText}
              </p>
            ) : (
              <p className="helper-text">
                This article doesn&apos;t include a summary. Open it in a new
                tab to read the full content.
              </p>
            )}

            <div className="article-tags mt-sm">
              {topic && <span className="chip">Topic: {topic}</span>}
              {keywords.slice(0, 6).map((kw) => (
                <span key={kw} className="badge-soft">
                  {kw}
                </span>
              ))}
            </div>

            <div className="article-actions mt-md">
              <button
                type="button"
                className="btn-primary"
                onClick={handleOpen}
              >
                Open full article
              </button>
              <span className="text-xs text-muted">
                We&apos;ll record this as a read interaction to refine your
                profile.
              </span>
            </div>
          </div>
        </article>

        <aside className="card">
          <div className="card-header">
            <h3 className="card-title">Why you see this</h3>
            <span className="card-badge">Signal-based</span>
          </div>
          <div className="card-body stack-v">
            <p className="helper-text">
              This article likely matches your top topics and keywords. Interacting
              with it helps the hybrid recommender system adjust to your evolving
              interests.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}


