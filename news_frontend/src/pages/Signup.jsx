import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function Signup() {
  const [form, setForm] = useState({
    user_id: "",
    email: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.user_id || !form.email || !form.password) {
      setError("User ID, email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await axiosClient.post("/users/register", form);
      navigate("/", { replace: true });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(err.response?.data?.detail || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Create an account</h2>
        <p className="auth-subtitle">
          Sign up once, then the system will start building your news profile.
        </p>

        <form className="stack-v" onSubmit={handleSubmit}>
          <div className="field-group">
            <span className="field-label">User ID</span>
            <input
              type="text"
              className="field-control"
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              placeholder="Pick a unique user ID"
            />
          </div>

          <div className="field-group">
            <span className="field-label">Email</span>
            <input
              type="email"
              className="field-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>

          <div className="field-group">
            <span className="field-label">Name</span>
            <input
              type="text"
              className="field-control"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="How should we call you?"
            />
          </div>

          <div className="field-group">
            <span className="field-label">Password</span>
            <input
              type="password"
              className="field-control"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Choose a secure password"
            />
          </div>

          {error && <p className="helper-text text-accent">{error}</p>}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", marginTop: "8px" }}
            disabled={loading}
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>{" "}
          <Link to="/">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
