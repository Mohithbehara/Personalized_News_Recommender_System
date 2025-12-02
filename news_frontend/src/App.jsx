import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import Headlines from "./pages/Headlines.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import Profile from "./pages/Profile.jsx";
import SavedArticles from "./pages/SavedArticles.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Article from "./pages/Article.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { useUserStore } from "./state/userStore";

function ProtectedRoute({ children }) {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <div className="app-shell">
      <div className="app-shell-inner">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/home"
              element={(
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              )}
            />

            <Route
              path="/headlines"
              element={(
                <ProtectedRoute>
                  <Headlines />
                </ProtectedRoute>
              )}
            />

            <Route
              path="/recommendations"
              element={(
                <ProtectedRoute>
                  <Recommendations />
                </ProtectedRoute>
              )}
            />

            <Route
              path="/profile"
              element={(
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              )}
            />

            <Route
              path="/saved"
              element={(
                <ProtectedRoute>
                  <SavedArticles />
                </ProtectedRoute>
              )}
            />

            <Route
              path="/article"
              element={(
                <ProtectedRoute>
                  <Article />
                </ProtectedRoute>
              )}
            />

            <Route
              path="/admin"
              element={(
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              )}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}