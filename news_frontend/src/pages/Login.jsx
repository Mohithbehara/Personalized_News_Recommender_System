import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useUserStore } from "../state/userStore";

export default function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!userId || !password) {
      setError("Please enter both user ID and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await axiosClient.post("/users/login", {
        user_id: userId,
        password,
      });
      setUser(res.data);
      navigate("/home", { replace: true });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">
          Sign in to see your personalised news recommendations.
        </p>

        <form className="stack-v" onSubmit={handleLogin}>
          <div className="field-group">
            <span className="field-label">User ID</span>
            <input
              type="text"
              className="field-control"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your user ID"
            />
          </div>

          <div className="field-group">
            <span className="field-label">Password</span>
            <input
              type="password"
              className="field-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="helper-text text-accent">{error}</p>}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", marginTop: "8px" }}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don&apos;t have an account?</span>{" "}
          <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
