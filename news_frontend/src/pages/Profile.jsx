import { useUserStore } from "../state/userStore";

export default function Profile() {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="helper-text">
            You&apos;re not logged in. Please sign in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <div className="helper-text-strong">Account</div>
          <h2 className="page-title">Your profile</h2>
          <p className="page-subtitle">
            Basic identity information used to scope interactions and
            recommendations.
          </p>
        </div>
      </div>

      <div className="page-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Identity</h3>
            <span className="card-badge">Local user</span>
          </div>
          <div className="card-body stack-v">
            <div className="grid-two">
              <div className="field-group">
                <span className="field-label">User ID</span>
                <div className="field-control" style={{ borderStyle: "dashed" }}>
                  {user.user_id}
                </div>
              </div>

              <div className="field-group">
                <span className="field-label">Display name</span>
                <div className="field-control" style={{ borderStyle: "dashed" }}>
                  {user.name || "Not provided"}
                </div>
              </div>

              <div className="field-group">
                <span className="field-label">Email</span>
                <div className="field-control" style={{ borderStyle: "dashed" }}>
                  {user.email || "Not provided"}
                </div>
              </div>

              <div className="field-group">
                <span className="field-label">Token type</span>
                <div className="field-control" style={{ borderStyle: "dashed" }}>
                  {user.token_type || "bearer"}
                </div>
              </div>
            </div>

            <p className="helper-text mt-md">
              Your interaction profile (topics, keywords, and scores) is stored in
              MongoDB and used purely for improving recommendations.
            </p>
          </div>
        </div>

        <aside className="card">
          <div className="card-header">
            <h3 className="card-title">What we track</h3>
            <span className="card-badge">Privacy friendly</span>
          </div>
          <div className="card-body stack-v">
            <p className="helper-text">
              The backend keeps a lightweight profile that blends your topics,
              keyword frequencies, and interactions into a single score vector.
              That vector powers the hybrid recommendation model.
            </p>
            <p className="helper-text">
              You can clear your profile at any time by clearing the database, or
              tweak the logic in the FastAPI `interaction` and `preference`
              models.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}


