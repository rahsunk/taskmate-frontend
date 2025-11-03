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
        const authStore = useAuthStore();
        const session = authStore.currentSession;

        if (!session) {
          throw new Error("No active session");
        }

        const response = await messagingService.getConversationsForUser(
          session,
          userId
        );

        // Handle response format: { conversations: ConversationDoc[] }
        let conversationsData = [];
        if (Array.isArray(response.conversations)) {
          conversationsData = response.conversations;
        } else if (response.error) {
          throw new Error(response.error);
        } else if (Array.isArray(response)) {
          // Fallback: direct array
          conversationsData = response;
        }

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
        const authStore = useAuthStore();
        const session = authStore.currentSession;

        if (!session) {
          throw new Error("No active session");
        }

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

        // Try to create new conversation
        const response = await messagingService.createConversation(
          session,
          friendUserId
        );

        // Handle response
        if (response.conversationId) {
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

          // Initialize with empty messages array first
          this.messages[response.conversationId] = [];

          // Try to load messages, but don't fail if it doesn't work immediately
          try {
            await this.loadMessages(response.conversationId);
          } catch (error) {
            console.warn("Could not load messages for new conversation:", error);
            // Continue anyway - messages array is already initialized as empty
          }

          this.loading = false;
          return newConversation;
        } else if (response.error && response.error.includes("already exists")) {
          // Conversation exists on backend but not in local state
          // Reload all conversations to get it
          await this.loadConversations(currentUserId);

          // Find the conversation again after reload
          const conversation = this.conversations.find(
            (c) =>
              (c.participant1 === currentUserId &&
                c.participant2 === friendUserId) ||
              (c.participant1 === friendUserId &&
                c.participant2 === currentUserId)
          );

          if (conversation) {
            this.activeConversationId = conversation._id;
            await this.loadMessages(conversation._id);
            this.loading = false;
            return conversation;
          } else {
            throw new Error("Failed to find existing conversation after reload");
          }
        } else if (response.error) {
          throw new Error(response.error);
        }
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
        const authStore = useAuthStore();
        const session = authStore.currentSession;

        if (!session) {
          throw new Error("No active session");
        }

        const response = await messagingService.getMessagesInConversation(
          session,
          conversationId
        );

        // Handle response format: { messages: MessageDoc[] } or direct array
        let messagesData = [];
        if (response && typeof response === 'object') {
          if (Array.isArray(response.messages)) {
            messagesData = response.messages;
          } else if (response.error) {
            throw new Error(response.error);
          } else if (Array.isArray(response)) {
            // Fallback: direct array
            messagesData = response;
          }
        } else if (Array.isArray(response)) {
          messagesData = response;
        }

        // Even if empty, set it (conversation might just have no messages yet)
        this.messages[conversationId] = messagesData;
        this.loading = false;
      } catch (error) {
        console.error(`Error loading messages for conversation ${conversationId}:`, error);
        this.error = error.message;
        this.loading = false;
        // Don't throw - just set messages to empty array so UI can continue
        this.messages[conversationId] = [];
      }
    },

    // Send a message
    async sendMessage(conversationId, content) {
      this.loading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        const session = authStore.currentSession;

        if (!session) {
          throw new Error("No active session");
        }

        const response = await messagingService.sendMessage(
          session,
          conversationId,
          content
        );

        // Handle response
        if (response.message) {
          // Add message to local state
          if (!this.messages[conversationId]) {
            this.messages[conversationId] = [];
          }
          this.messages[conversationId].push(response.message);

          this.loading = false;
          return response.message;
        } else if (response.error) {
          throw new Error(response.error);
        }
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
