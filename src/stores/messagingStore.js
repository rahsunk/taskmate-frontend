import { defineStore } from "pinia";
import { messagingService } from "../services/messagingService.js";
import { userAuthService } from "../services/userAuthService.js";
import { useAuthStore } from "./authStore.js";

export const useMessagingStore = defineStore("messaging", {
  state: () => ({
    conversations: [], // Array of enriched conversation objects with usernames
    messages: {}, // Object mapping conversationId to array of messages
    activeConversationId: null,
    loading: false,
    error: null,
    usernameCache: {}, // Cache for user ID to username mappings
  }),

  getters: {
    isLoading: (state) => state.loading,
    messagingError: (state) => state.error,
    conversationsList: (state) => state.conversations,
    activeConversation: (state) => {
      if (!state.activeConversationId) return null;
      return state.conversations.find(
        (c) => c._id === state.activeConversationId
      );
    },
    activeMessages: (state) => {
      if (!state.activeConversationId) return [];
      return state.messages[state.activeConversationId] || [];
    },
  },

  actions: {
    // Helper to get username from user ID
    async getUsernameById(userId) {
      // Check cache first
      if (this.usernameCache[userId]) {
        return this.usernameCache[userId];
      }

      try {
        const authStore = useAuthStore();
        const session = authStore.currentSession;

        if (!session) {
          console.warn("No session available for getUsernameById");
          return userId; // Fallback if no session
        }

        const response = await userAuthService.getUsernameById(userId, session);
        console.log(`getUsernameById response for ${userId}:`, response);
        // API returns { username: string } or empty object
        let username;
        if (response && response.username) {
          username = response.username;
          console.log(`Successfully got username: ${username} for userId: ${userId}`);
        } else {
          console.warn(`Falling back to userId for ${userId}. Response:`, response);
          username = userId; // Fallback if not found
        }
        this.usernameCache[userId] = username;
        return username;
      } catch (error) {
        console.error(`Failed to fetch username for ${userId}:`, error);
        return userId; // Fallback to user ID
      }
    },

    // Get the other participant in a conversation
    getOtherParticipant(conversation, currentUserId) {
      if (conversation.participant1 === currentUserId) {
        return {
          userId: conversation.participant2,
          username: conversation.participant2Username,
        };
      } else {
        return {
          userId: conversation.participant1,
          username: conversation.participant1Username,
        };
      }
    },

    // Load all conversations for a user
    async loadConversations(userId) {
      this.loading = true;
      this.error = null;

      try {
        const conversationsData =
          await messagingService.getConversationsForUser(userId);

        // Enrich conversations with usernames
        this.conversations = await Promise.all(
          conversationsData.map(async (conversation) => {
            const participant1Username = await this.getUsernameById(
              conversation.participant1
            );
            const participant2Username = await this.getUsernameById(
              conversation.participant2
            );
            return {
              ...conversation,
              participant1Username,
              participant2Username,
            };
          })
        );

        this.loading = false;
      } catch (error) {
        this.error = error.message;
        this.loading = false;
        throw error;
      }
    },

    // Create or get existing conversation with a friend
    async createOrGetConversation(currentUserId, friendUserId) {
      this.loading = true;
      this.error = null;

      try {
        // Check if conversation already exists locally
        const existingConversation = this.conversations.find(
          (c) =>
            (c.participant1 === currentUserId &&
              c.participant2 === friendUserId) ||
            (c.participant1 === friendUserId &&
              c.participant2 === currentUserId)
        );

        if (existingConversation) {
          this.activeConversationId = existingConversation._id;
          await this.loadMessages(existingConversation._id);
          this.loading = false;
          return existingConversation;
        }

        // Create new conversation
        const response = await messagingService.createConversation(
          currentUserId,
          friendUserId
        );

        const friendUsername = await this.getUsernameById(friendUserId);
        const currentUsername = await this.getUsernameById(currentUserId);

        const newConversation = {
          _id: response.conversationId,
          participant1:
            currentUserId < friendUserId ? currentUserId : friendUserId,
          participant2:
            currentUserId < friendUserId ? friendUserId : currentUserId,
          participant1Username:
            currentUserId < friendUserId ? currentUsername : friendUsername,
          participant2Username:
            currentUserId < friendUserId ? friendUsername : currentUsername,
        };

        this.conversations.push(newConversation);
        this.activeConversationId = response.conversationId;
        this.messages[response.conversationId] = [];

        this.loading = false;
        return newConversation;
      } catch (error) {
        this.error = error.message;
        this.loading = false;
        throw error;
      }
    },

    // Load messages for a conversation
    async loadMessages(conversationId) {
      this.loading = true;
      this.error = null;

      try {
        const messagesData = await messagingService.getMessagesInConversation(
          conversationId
        );

        this.messages[conversationId] = messagesData;
        this.loading = false;
      } catch (error) {
        this.error = error.message;
        this.loading = false;
        throw error;
      }
    },

    // Send a message
    async sendMessage(conversationId, sender, content) {
      this.loading = true;
      this.error = null;

      try {
        const response = await messagingService.sendMessage(
          conversationId,
          sender,
          content
        );

        // Add message to local state
        if (!this.messages[conversationId]) {
          this.messages[conversationId] = [];
        }
        this.messages[conversationId].push(response.message);

        this.loading = false;
        return response.message;
      } catch (error) {
        this.error = error.message;
        this.loading = false;
        throw error;
      }
    },

    // Set active conversation
    async setActiveConversation(conversationId) {
      this.activeConversationId = conversationId;
      if (!this.messages[conversationId]) {
        await this.loadMessages(conversationId);
      }
    },

    // Clear active conversation
    clearActiveConversation() {
      this.activeConversationId = null;
    },

    // Clear error
    clearError() {
      this.error = null;
    },

    // Clear all messaging data
    clearMessagingData() {
      this.conversations = [];
      this.messages = {};
      this.activeConversationId = null;
      this.error = null;
      this.usernameCache = {};
    },
  },
});
