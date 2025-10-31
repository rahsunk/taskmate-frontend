import apiClient from "../config/api.js";

const MESSAGING_BASE = "/Messaging";

export const messagingService = {
  // Create a new conversation between two users
  async createConversation(user1, user2) {
    try {
      const response = await apiClient.post(
        `${MESSAGING_BASE}/createConversation`,
        { user1, user2 }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to create conversation"
      );
    }
  },

  // Send a message in a conversation
  async sendMessage(conversationId, sender, content) {
    try {
      const response = await apiClient.post(`${MESSAGING_BASE}/sendMessage`, {
        conversationId,
        sender,
        content,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to send message");
    }
  },

  // Get a specific conversation by ID
  async getConversation(conversationId) {
    try {
      const response = await apiClient.post(
        `${MESSAGING_BASE}/_getConversation`,
        { conversationId }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch conversation"
      );
    }
  },

  // Get all messages in a conversation
  async getMessagesInConversation(conversationId) {
    try {
      const response = await apiClient.post(
        `${MESSAGING_BASE}/_getMessagesInConversation`,
        { conversationId }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch messages"
      );
    }
  },

  // Get all conversations for a user
  async getConversationsForUser(user) {
    try {
      const response = await apiClient.post(
        `${MESSAGING_BASE}/_getConversationsForUser`,
        { user }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch conversations"
      );
    }
  },

  // Get all conversations (admin/debug endpoint)
  async getAllConversations() {
    try {
      const response = await apiClient.post(
        `${MESSAGING_BASE}/_getAllConversations`,
        {}
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch all conversations"
      );
    }
  },

  // Get message details by ID (admin/debug endpoint)
  async getMessageDetails(messageId) {
    try {
      const response = await apiClient.post(
        `${MESSAGING_BASE}/_getMessageDetails`,
        { messageId }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch message details"
      );
    }
  },

  // Get all messages (admin/debug endpoint)
  async getAllMessages() {
    try {
      const response = await apiClient.post(
        `${MESSAGING_BASE}/_getAllMessages`,
        {}
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch all messages"
      );
    }
  },
};
