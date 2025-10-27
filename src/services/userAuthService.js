import apiClient from "../config/api.js";

const USER_AUTH_BASE = "/UserAuthentication";

export const userAuthService = {
  // Register a new user
  async register(username, password) {
    try {
      // Validate input before sending
      if (!username || !username.trim()) {
        throw new Error("Username is required");
      }
      if (!password || !password.trim()) {
        throw new Error("Password is required");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const response = await apiClient.post(`${USER_AUTH_BASE}/register`, {
        username: username.trim(),
        password,
      });

      // Validate response data
      if (!response.data || !response.data.user) {
        throw new Error("Invalid response from server");
      }

      return response.data;
    } catch (error) {
      // Handle network errors
      if (!error.response) {
        throw new Error(
          "Unable to connect to server. Please check your connection."
        );
      }
      // Handle API errors
      throw new Error(
        error.response?.data?.error || error.message || "Registration failed"
      );
    }
  },

  // Authenticate a user
  async authenticate(username, password) {
    try {
      // Validate input before sending
      if (!username || !username.trim()) {
        throw new Error("Username is required");
      }
      if (!password || !password.trim()) {
        throw new Error("Password is required");
      }

      const response = await apiClient.post(`${USER_AUTH_BASE}/authenticate`, {
        username: username.trim(),
        password,
      });

      // Validate response data
      if (!response.data || !response.data.user) {
        throw new Error("Invalid response from server");
      }

      return response.data;
    } catch (error) {
      // Handle network errors
      if (!error.response) {
        throw new Error(
          "Unable to connect to server. Please check your connection."
        );
      }
      // Handle API errors
      throw new Error(
        error.response?.data?.error || error.message || "Authentication failed"
      );
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
      const response = await apiClient.get(
        `${USER_AUTH_BASE}/_getUserByUsername`,
        {
          params: {
            username,
          },
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
      const response = await apiClient.get(
        `${USER_AUTH_BASE}/_checkUserExists`,
        {
          params: {
            user,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "User existence check failed"
      );
    }
  },

  // Get all users
  async getUsers() {
    try {
      const response = await apiClient.get(`${USER_AUTH_BASE}/users`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to fetch users");
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await apiClient.get(`${USER_AUTH_BASE}/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to fetch user");
    }
  },
};
