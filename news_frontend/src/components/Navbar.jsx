import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../state/userStore";

export default function Navbar() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const logout = useUserStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      className="navbar"
    >
      <div className="navbar-left">
        <Link to={isAuthenticated ? "/home" : "/"} className="navbar-logo">
          News Recommender
        </Link>
        {isAuthenticated && (
          <div className="navbar-links">
            <Link to="/home">Browse</Link>
            <Link to="/headlines">Headlines</Link>
            <Link to="/recommendations">Recommendations</Link>
            <Link to="/saved">Saved</Link>
            <Link to="/profile">Profile</Link>
          </div>
        )}
      </div>

      <div className="navbar-right">
        {isAuthenticated && user ? (
          <>
            <span className="navbar-user">Hi, {user.name || user.user_id}</span>
            <button type="button" className="btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <div className="navbar-auth-links">
            <Link to="/">Login</Link>
            <Link to="/signup">Sign up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
