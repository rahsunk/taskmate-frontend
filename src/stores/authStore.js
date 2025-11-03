import { defineStore } from "pinia";
import { userAuthService } from "../services/userAuthService.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    username: null,
    session: null, // Add session to state
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    currentUser: (state) => state.user,
    currentUsername: (state) => state.username,
    currentSession: (state) => state.session, // Add session getter
    isLoggedIn: (state) => state.isAuthenticated,
    isLoading: (state) => state.loading,
    authError: (state) => state.error,
  },

  actions: {
    // Initialize auth state from localStorage
    async initializeAuth() {
      const savedUser = localStorage.getItem("user");
      const savedUsername = localStorage.getItem("username");
      const savedSession = localStorage.getItem("session");

      if (savedUser && savedSession) {
        try {
          const userData = JSON.parse(savedUser);
          const sessionData = JSON.parse(savedSession);

          // Validate that we have a user ID and session
          if (!userData || typeof userData !== "string" || userData.trim() === "") {
            console.warn("Invalid user data in localStorage, clearing session");
            this.logout();
            return;
          }

          if (!sessionData || typeof sessionData !== "string" || sessionData.trim() === "") {
            console.warn("Invalid session data in localStorage, clearing session");
            this.logout();
            return;
          }

          // Verify user still exists in the backend
          try {
            const checkResult = await userAuthService.checkUserExists(userData, sessionData);
            // API returns { exists: boolean }
            if (checkResult && checkResult.exists) {
              this.user = userData;
              this.username = savedUsername ? JSON.parse(savedUsername) : null;
              this.session = sessionData;
              this.isAuthenticated = true;
            } else {
              console.warn("User no longer exists in backend, clearing session");
              this.logout();
            }
          } catch (error) {
            // If we can't verify, clear the session to be safe
            console.warn("Could not verify user session:", error.message);
            this.logout();
          }
        } catch (error) {
          console.error("Error parsing saved user data:", error);
          this.logout();
        }
      }
    },

    // Login user
    async login(username, password) {
      this.loading = true;
      this.error = null;

      try {
        // Trim username to prevent whitespace issues
        const trimmedUsername = username.trim();

        if (!trimmedUsername) {
          throw new Error("Username cannot be empty");
        }
        if (!password) {
          throw new Error("Password cannot be empty");
        }

        const response = await userAuthService.authenticate(trimmedUsername, password);

        // Validate response - now expects both user and session
        if (!response || !response.user || !response.session) {
          throw new Error("Invalid authentication response from server");
        }

        this.user = response.user;
        this.username = trimmedUsername;
        this.session = response.session;
        this.isAuthenticated = true;

        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("username", JSON.stringify(trimmedUsername));
        localStorage.setItem("session", JSON.stringify(response.session));

        return response;
      } catch (error) {
        this.error = error.message;
        this.isAuthenticated = false;
        this.user = null;
        this.username = null;
        this.session = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Register new user
    async register(username, password) {
      this.loading = true;
      this.error = null;

      try {
        // Trim username to prevent whitespace issues
        const trimmedUsername = username.trim();

        if (!trimmedUsername) {
          throw new Error("Username cannot be empty");
        }
        if (!password) {
          throw new Error("Password cannot be empty");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }

        const response = await userAuthService.register(trimmedUsername, password);

        // Validate response - now expects both user and session
        if (!response || !response.user || !response.session) {
          throw new Error("Invalid registration response from server");
        }

        this.user = response.user;
        this.username = trimmedUsername;
        this.session = response.session;
        this.isAuthenticated = true;

        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("username", JSON.stringify(trimmedUsername));
        localStorage.setItem("session", JSON.stringify(response.session));

        return response;
      } catch (error) {
        this.error = error.message;
        this.isAuthenticated = false;
        this.user = null;
        this.username = null;
        this.session = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Change password
    async changePassword(oldPassword, newPassword) {
      if (!this.user || !this.session) {
        throw new Error("No user logged in");
      }

      this.loading = true;
      this.error = null;

      try {
        await userAuthService.changePassword(
          this.session,
          this.user,
          oldPassword,
          newPassword
        );
        return true;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Delete account
    async deleteAccount() {
      if (!this.user || !this.session) {
        throw new Error("No user logged in");
      }

      this.loading = true;
      this.error = null;

      try {
        await userAuthService.deleteAccount(this.session, this.user);
        this.logout();
        return true;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Logout user
    logout() {
      this.user = null;
      this.username = null;
      this.session = null;
      this.isAuthenticated = false;
      this.error = null;
      localStorage.removeItem("user");
      localStorage.removeItem("username");
      localStorage.removeItem("session");
    },

    // Clear error
    clearError() {
      this.error = null;
    },
  },
});
