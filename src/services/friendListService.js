import apiClient from "../config/api.js";

const FRIEND_LIST_BASE = "/FriendList";

export const friendListService = {
  // Send a friend request
  async sendFriendRequest(sender, receiver) {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/sendFriendRequest`,
        { sender, receiver }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to send friend request"
      );
    }
  },

  // Accept a friend request
  async acceptFriendRequest(receiver, sender) {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/acceptFriendRequest`,
        { receiver, sender }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to accept friend request"
      );
    }
  },

  // Decline a friend request
  async declineFriendRequest(receiver, sender) {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/declineFriendRequest`,
        { receiver, sender }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to decline friend request"
      );
    }
  },

  // Cancel a sent friend request
  async cancelSentRequest(sender, receiver) {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/cancelSentRequest`,
        { sender, receiver }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to cancel friend request"
      );
    }
  },

  // Remove a friend
  async removeFriend(user1, user2) {
    try {
      const response = await apiClient.post(`${FRIEND_LIST_BASE}/removeFriend`, {
        user1,
        user2,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to remove friend");
    }
  },

  // Get friendships by user
  async getFriendshipsByUser(user) {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/_getFriendshipsByUser`,
        { user }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch friendships"
      );
    }
  },

  // Get sent friend requests
  async getSentFriendRequests(sender) {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/_getSentFriendRequests`,
        { sender }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch sent requests"
      );
    }
  },

  // Get received friend requests
  async getReceivedFriendRequests(receiver) {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/_getReceivedFriendRequests`,
        { receiver }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch received requests"
      );
    }
  },

  // Get all friendships (admin/debug endpoint)
  async getAllFriendships() {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/_getAllFriendships`,
        {}
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch all friendships"
      );
    }
  },

  // Get all friend requests (admin/debug endpoint)
  async getAllFriendRequests() {
    try {
      const response = await apiClient.post(
        `${FRIEND_LIST_BASE}/_getAllFriendRequests`,
        {}
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch all friend requests"
      );
    }
  },
};
