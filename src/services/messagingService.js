import apiClient from "../config/api.js";

const MESSAGING_BASE = "/Messaging";

export const messagingService = {
  // Create a new conversation between two users
  async createConversation(session, user2) {
    try {
      const response = await apiClient.post(
        `${MESSAGING_BASE}/createConversation`,
        { session, user2 }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to create conversation"
      );
    }
  },

  // Send a message in a conversation
  async sendMessage(session, conversationId, content) {
    try {
      const response = await apiClient.post(`${MESSAGING_BASE}/sendMessage`, {
        session,
        conversationId,
        content,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to send message");
    }
  },

  // Get a specific conversation by ID
  async getConversation(session, conversationId) {
    try {
      const response = await apiClient.post(
        `${MESSAGING_BASE}/_getConversation`,
        { session, conversationId }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch conversation"
      );
    }
  },

  // Get all messages in a conversation
  async getMessagesInConversation(session, conversationId) {
    try {
      const response = await apiClient.post(
        `${MESSAGING_BASE}/_getMessagesInConversation`,
        { session, conversationId }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch messages"
      );
    }
  },

  // Get all conversations for a user (logged-in user)
  async getConversationsForUser(session, user) {
    try {
      const response = await apiClient.post(
        `${MESSAGING_BASE}/_getConversationsForUser`,
        { session, user }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch conversations"
      );
    }
  },

  // Get all conversations (admin/debug endpoint)
  async getAllConversations(session) {
    try {
      const response = await apiClient.post(
        `${MESSAGING_BASE}/_getAllConversations`,
        { session }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch all conversations"
      );
    }
  },

  // Get message details by ID (admin/debug endpoint)
  async getMessageDetails(session, messageId) {
    try {
      const response = await apiClient.post(
        `${MESSAGING_BASE}/_getMessageDetails`,
        { session, messageId }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch message details"
      );
    }
  },

  // Get all messages (admin/debug endpoint)
  async getAllMessages(session) {
    try {
      const response = await apiClient.post(
        `${MESSAGING_BASE}/_getAllMessages`,
        { session }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch all messages"
      );
    }
  },
};
