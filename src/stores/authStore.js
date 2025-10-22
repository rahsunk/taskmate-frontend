import { defineStore } from "pinia";
import { userAuthService } from "../services/userAuthService.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    isLoading: (state) => state.loading,
    authError: (state) => state.error,
  },

  actions: {
    // Initialize auth state from localStorage
    initializeAuth() {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        this.user = JSON.parse(savedUser);
        this.isAuthenticated = true;
      }
    },

    // Login user
    async login(username, password) {
      this.loading = true;
      this.error = null;

      try {
        const response = await userAuthService.authenticate(username, password);
        this.user = response.user;
        this.isAuthenticated = true;

        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(response.user));

        return response;
      } catch (error) {
        this.error = error.message;
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
        const response = await userAuthService.register(username, password);
        this.user = response.user;
        this.isAuthenticated = true;

        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(response.user));

        return response;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Change password
    async changePassword(oldPassword, newPassword) {
      if (!this.user) {
        throw new Error("No user logged in");
      }

      this.loading = true;
      this.error = null;

      try {
        await userAuthService.changePassword(
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
      if (!this.user) {
        throw new Error("No user logged in");
      }

      this.loading = true;
      this.error = null;

      try {
        await userAuthService.deleteAccount(this.user);
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
      this.isAuthenticated = false;
      this.error = null;
      localStorage.removeItem("user");
    },

    // Clear error
    clearError() {
      this.error = null;
    },
  },
});
