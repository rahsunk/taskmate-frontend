import apiClient from "../config/api.js";

const USER_AUTH_BASE = "/UserAuthentication";

export const userAuthService = {
  // Register a new user
  async register(username, password) {
    try {
      const response = await apiClient.post(`${USER_AUTH_BASE}/register`, {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Registration failed");
    }
  },

  // Authenticate a user
  async authenticate(username, password) {
    try {
      const response = await apiClient.post(`${USER_AUTH_BASE}/authenticate`, {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Authentication failed");
    }
  },

  // Change user password
  async changePassword(user, oldPassword, newPassword) {
    try {
      const response = await apiClient.post(
        `${USER_AUTH_BASE}/changePassword`,
        {
          user,
          oldPassword,
          newPassword,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Password change failed");
    }
  },

  // Delete user account
  async deleteAccount(user) {
    try {
      const response = await apiClient.post(`${USER_AUTH_BASE}/deleteAccount`, {
        user,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Account deletion failed");
    }
  },

  // Get user by username
  async getUserByUsername(username) {
    try {
      const response = await apiClient.post(
        `${USER_AUTH_BASE}/_getUserByUsername`,
        {
          username,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "User lookup failed");
    }
  },

  // Check if user exists
  async checkUserExists(user) {
    try {
      const response = await apiClient.post(
        `${USER_AUTH_BASE}/_checkUserExists`,
        {
          user,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "User existence check failed"
      );
    }
  },
};
