import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snapshot, setSnapshot] = useState({
    users: [],
    interactions: [],
    profiles: [],
    cacheKeys: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const adminKey = import.meta.env.VITE_ADMIN_KEY || "dev-admin-secret";

      const [usersRes, interactionsRes, profilesRes, cacheRes] =
        await Promise.all([
          axiosClient.get("/admin/users", { headers: { admin_key: adminKey } }),
          axiosClient.get("/admin/interactions", {
            headers: { admin_key: adminKey },
          }),
          axiosClient.get("/admin/profiles", {
            headers: { admin_key: adminKey },
          }),
          axiosClient.get("/admin/cache/keys", {
            headers: { admin_key: adminKey },
          }),
        ]);

      setSnapshot({
        users: usersRes.data || [],
        interactions: interactionsRes.data || [],
        profiles: profilesRes.data || [],
        cacheKeys: cacheRes.data?.cached_keys || [],
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Unable to load admin data. Check your admin key and backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { users, interactions, profiles, cacheKeys } = snapshot;

  return (
    <section>
      <div className="page-header">
        <div>
          <div className="helper-text-strong">Admin</div>
          <h2 className="page-title">System snapshot</h2>
          <p className="page-subtitle">
            Inspect users, interactions, profiles, and Redis cache keys exposed
            by the FastAPI admin routes.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="page-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Collections overview</h3>
            <span className="card-badge">MongoDB</span>
          </div>
          <div className="card-body stack-v">
            {loading && <LoadingSpinner label="Loading admin data…" />}

            {error && !loading && (
              <p className="helper-text text-accent">{error}</p>
            )}

            {!loading && !error && (
              <div className="grid-two">
                <div className="card">
                  <div className="card-header">
                    <h4 className="card-title">Users</h4>
                    <span className="pill text-xs">
                      <span className="pill-dot" />
                      <span className="pill-label">
                        {users.length} record{users.length === 1 ? "" : "s"}
                      </span>
                    </span>
                  </div>
                  <div className="card-body">
                    <p className="helper-text">
                      Latest user IDs:{' '}
                      {users
                        .slice(-3)
                        .map((u) => u.user_id)
                        .join(", ") || "—"}
                    </p>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h4 className="card-title">Interactions</h4>
                    <span className="pill text-xs">
                      <span className="pill-dot-soft" />
                      <span className="pill-label">
                        {interactions.length} event
                        {interactions.length === 1 ? "" : "s"}
                      </span>
                    </span>
                  </div>
                  <div className="card-body">
                    <p className="helper-text">
                      Captures view/read/like/save signals per article to feed
                      the hybrid model.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="card">
          <div className="card-header">
            <h3 className="card-title">Redis cache</h3>
            <span className="card-badge">Keys</span>
          </div>
          <div className="card-body stack-v">
            {cacheKeys.length === 0 ? (
              <p className="helper-text">
                No cache keys reported. Hit the News and Recommendations flows
                to warm up the cache.
              </p>
            ) : (
              <>
                <p className="helper-text">
                  Showing up to the first 10 keys from Redis:
                </p>
                <ul className="helper-text text-xs">
                  {cacheKeys.slice(0, 10).map((key) => (
                    <li key={key}>{key}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}


