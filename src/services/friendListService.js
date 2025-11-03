import apiClient from "../config/api.js";

const FRIEND_LIST_BASE = "/api/FriendList";

export const friendListService = {
  // Send a friend request
  async sendFriendRequest(session, receiver) {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/sendFriendRequest`,
        { session, receiver }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to send friend request"
      );
    }
  },

  // Accept a friend request
  async acceptFriendRequest(session, sender) {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/acceptFriendRequest`,
        { session, sender }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to accept friend request"
      );
    }
  },

  // Decline a friend request
  async declineFriendRequest(session, sender) {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/declineFriendRequest`,
        { session, sender }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to decline friend request"
      );
    }
  },

  // Cancel a sent friend request
  async cancelSentRequest(session, receiver) {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/cancelSentRequest`,
        { session, receiver }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to cancel friend request"
      );
    }
  },

  // Remove a friend
  async removeFriend(session, user2) {
    try {
      const response = await apiClient.post(`${FRIEND_LIST_BASE}/removeFriend`, {
        session,
        user2,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to remove friend");
    }
  },

  // Get friendships by user (logged-in user)
  async getFriendshipsByUser(session) {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/_getFriendshipsByUser`,
        { session }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch friendships"
      );
    }
  },

  // Get sent friend requests (logged-in user)
  async getSentFriendRequests(session) {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/_getSentFriendRequests`,
        { session }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch sent requests"
      );
    }
  },

  // Get received friend requests (logged-in user)
  async getReceivedFriendRequests(session) {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/_getReceivedFriendRequests`,
        { session }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch received requests"
      );
    }
  },

  // Get all friendships (admin/debug endpoint)
  async getAllFriendships(session) {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/_getAllFriendships`,
        { session }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch all friendships"
      );
    }
  },

  // Get all friend requests (admin/debug endpoint)
  async getAllFriendRequests(session) {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/_getAllFriendRequests`,
        { session }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch all friend requests"
      );
    }
  },
};
