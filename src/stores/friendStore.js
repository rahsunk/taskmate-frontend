import { defineStore } from "pinia";
import { friendListService } from "../services/friendListService.js";
import { userAuthService } from "../services/userAuthService.js";

export const useFriendStore = defineStore("friend", {
  state: () => ({
    friends: [], // Array of {_id, user1, user2, username1, username2}
    sentRequests: [], // Array of {_id, sender, receiver, receiverUsername}
    receivedRequests: [], // Array of {_id, sender, receiver, senderUsername}
    loading: false,
    error: null,
    usernameCache: {}, // Cache for user ID to username mappings
  }),

  getters: {
    isLoading: (state) => state.loading,
    friendError: (state) => state.error,
    friendsList: (state) => state.friends,
    sentRequestsList: (state) => state.sentRequests,
    receivedRequestsList: (state) => state.receivedRequests,
  },

  actions: {
    // Helper to get username from user ID
    async getUsernameById(userId) {
      // Check cache first
      if (this.usernameCache[userId]) {
        return this.usernameCache[userId];
      }

      try {
        const response = await userAuthService.getUsernameById(userId);
        // Extract username from the user object
        let username;
        if (typeof response === "string") {
          username = response;
        } else if (response.username) {
          username = response.username;
        } else if (response.user && response.user.username) {
          username = response.user.username;
        } else {
          username = userId;
        }
        this.usernameCache[userId] = username;
        return username;
      } catch (error) {
        console.error(`Failed to fetch username for ${userId}:`, error);
        return userId; // Fallback to user ID
      }
    },

    // Helper to get user ID from username
    async getUserIdByUsername(username) {
      try {
        const response = await userAuthService.getUserByUsername(username);
        return response._id || response.user;
      } catch (error) {
        throw new Error(`User "${username}" not found`);
      }
    },

    // Load all friend data for a user
    async loadFriendData(userId) {
      this.loading = true;
      this.error = null;

      try {
        // Fetch friendships
        const friendshipsData = await friendListService.getFriendshipsByUser(
          userId
        );

        // Enrich friendships with usernames
        this.friends = await Promise.all(
          friendshipsData.map(async (friendship) => {
            const username1 = await this.getUsernameById(friendship.user1);
            const username2 = await this.getUsernameById(friendship.user2);
            return {
              ...friendship,
              username1,
              username2,
            };
          })
        );

        // Fetch sent requests
        const sentRequestsData = await friendListService.getSentFriendRequests(
          userId
        );

        // Enrich sent requests with usernames
        this.sentRequests = await Promise.all(
          sentRequestsData.map(async (request) => {
            const receiverUsername = await this.getUsernameById(
              request.receiver
            );
            return {
              ...request,
              receiverUsername,
            };
          })
        );

        // Fetch received requests
        const receivedRequestsData =
          await friendListService.getReceivedFriendRequests(userId);

        // Enrich received requests with usernames
        this.receivedRequests = await Promise.all(
          receivedRequestsData.map(async (request) => {
            const senderUsername = await this.getUsernameById(request.sender);
            return {
              ...request,
              senderUsername,
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

    // Send a friend request
    async sendFriendRequest(sender, receiverUsername) {
      this.loading = true;
      this.error = null;

      try {
        // Get receiver user ID from username
        const receiver = await this.getUserIdByUsername(receiverUsername);

        // Send request to backend
        const response = await friendListService.sendFriendRequest(
          sender,
          receiver
        );

        // Add to local state
        this.sentRequests.push({
          _id: response.request,
          sender,
          receiver,
          receiverUsername,
        });

        this.loading = false;
        return response;
      } catch (error) {
        this.error = error.message;
        this.loading = false;
        throw error;
      }
    },

    // Accept a friend request
    async acceptFriendRequest(receiver, sender) {
      this.loading = true;
      this.error = null;

      try {
        // Accept request on backend
        await friendListService.acceptFriendRequest(receiver, sender);

        // Find and remove the request from local state
        const requestIndex = this.receivedRequests.findIndex(
          (req) => req.sender === sender && req.receiver === receiver
        );

        if (requestIndex !== -1) {
          const request = this.receivedRequests[requestIndex];
          this.receivedRequests.splice(requestIndex, 1);

          // Add to friends list
          const senderUsername =
            request.senderUsername || (await this.getUsernameById(sender));
          const receiverUsername = await this.getUsernameById(receiver);

          this.friends.push({
            _id: `${sender}_${receiver}`, // Temporary ID
            user1: sender < receiver ? sender : receiver,
            user2: sender < receiver ? receiver : sender,
            username1: sender < receiver ? senderUsername : receiverUsername,
            username2: sender < receiver ? receiverUsername : senderUsername,
          });
        }

        this.loading = false;
      } catch (error) {
        this.error = error.message;
        this.loading = false;
        throw error;
      }
    },

    // Decline a friend request
    async declineFriendRequest(receiver, sender) {
      this.loading = true;
      this.error = null;

      try {
        // Decline request on backend
        await friendListService.declineFriendRequest(receiver, sender);

        // Remove from local state
        const requestIndex = this.receivedRequests.findIndex(
          (req) => req.sender === sender && req.receiver === receiver
        );

        if (requestIndex !== -1) {
          this.receivedRequests.splice(requestIndex, 1);
        }

        this.loading = false;
      } catch (error) {
        this.error = error.message;
        this.loading = false;
        throw error;
      }
    },

    // Cancel a sent friend request
    async cancelSentRequest(sender, receiver) {
      this.loading = true;
      this.error = null;

      try {
        // Cancel request on backend
        await friendListService.cancelSentRequest(sender, receiver);

        // Remove from local state
        const requestIndex = this.sentRequests.findIndex(
          (req) => req.sender === sender && req.receiver === receiver
        );

        if (requestIndex !== -1) {
          this.sentRequests.splice(requestIndex, 1);
        }

        this.loading = false;
      } catch (error) {
        this.error = error.message;
        this.loading = false;
        throw error;
      }
    },

    // Remove a friend
    async removeFriend(user1, user2) {
      this.loading = true;
      this.error = null;

      try {
        // Remove friend on backend
        await friendListService.removeFriend(user1, user2);

        // Remove from local state
        const friendIndex = this.friends.findIndex(
          (f) =>
            (f.user1 === user1 && f.user2 === user2) ||
            (f.user1 === user2 && f.user2 === user1)
        );

        if (friendIndex !== -1) {
          this.friends.splice(friendIndex, 1);
        }

        this.loading = false;
      } catch (error) {
        this.error = error.message;
        this.loading = false;
        throw error;
      }
    },

    // Clear error
    clearError() {
      this.error = null;
    },

    // Clear all data
    clearFriendData() {
      this.friends = [];
      this.sentRequests = [];
      this.receivedRequests = [];
      this.error = null;
      this.usernameCache = {};
    },
  },
});
