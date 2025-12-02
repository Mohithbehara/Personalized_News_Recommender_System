import { create } from "zustand";

// Lightweight auth store for managing the logged-in user and JWT
export const useUserStore = create((set) => {
  const storedUser = localStorage.getItem("user");
  const initialUser = storedUser ? JSON.parse(storedUser) : null;

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,

    setUser: (user) => {
      if (user) {
        // Persist minimal auth info
        localStorage.setItem("user", JSON.stringify(user));

        if (user.access_token) {
          localStorage.setItem("access_token", user.access_token);
        }

        if (user.user_id) {
          localStorage.setItem("user_id", user.user_id);
        }

        set({ user, isAuthenticated: true });
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_id");
        set({ user: null, isAuthenticated: false });
      }
    },

    logout: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      set({ user: null, isAuthenticated: false });
    },
  };
});
