<template>
  <div class="friends-manager">
    <div class="friends-header">
      <h2>Friends</h2>
      <p class="friends-description">
        Manage your friends and friend requests
      </p>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        :class="['tab', { active: activeTab === 'friends' }]"
        @click="activeTab = 'friends'"
      >
        Friends ({{ friends.length }})
      </button>
      <button
        :class="['tab', { active: activeTab === 'received' }]"
        @click="activeTab = 'received'"
      >
        Received Requests ({{ receivedRequests.length }})
      </button>
      <button
        :class="['tab', { active: activeTab === 'sent' }]"
        @click="activeTab = 'sent'"
      >
        Sent Requests ({{ sentRequests.length }})
      </button>
      <button
        :class="['tab', { active: activeTab === 'add' }]"
        @click="activeTab = 'add'"
      >
        Add Friend
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="clearError" class="close-error">×</button>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Friends List Tab -->
      <div v-if="activeTab === 'friends'" class="friends-list">
        <div v-if="friends.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <p>No friends yet</p>
          <p class="empty-subtitle">Add friends to connect with other users!</p>
        </div>

        <div v-else class="list">
          <div
            v-for="friend in friends"
            :key="friend._id"
            class="list-item friend-item"
          >
            <div class="item-info">
              <div class="user-icon">👤</div>
              <div class="user-details">
                <div class="user-id">{{ getFriendUsername(friend) }}</div>
                <div class="user-label">Friend</div>
              </div>
            </div>
            <button
              @click="handleRemoveFriend(friend)"
              class="button remove-button"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <!-- Received Requests Tab -->
      <div v-if="activeTab === 'received'" class="received-requests">
        <div v-if="receivedRequests.length === 0" class="empty-state">
          <div class="empty-icon">📬</div>
          <p>No pending requests</p>
          <p class="empty-subtitle">
            You'll see friend requests here when someone sends you one
          </p>
        </div>

        <div v-else class="list">
          <div
            v-for="request in receivedRequests"
            :key="request._id"
            class="list-item request-item"
          >
            <div class="item-info">
              <div class="user-icon">👤</div>
              <div class="user-details">
                <div class="user-id">{{ request.senderUsername }}</div>
                <div class="user-label">Wants to be friends</div>
              </div>
            </div>
            <div class="button-group">
              <button
                @click="handleAcceptRequest(request)"
                class="button accept-button"
              >
                Accept
              </button>
              <button
                @click="handleDeclineRequest(request)"
                class="button decline-button"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sent Requests Tab -->
      <div v-if="activeTab === 'sent'" class="sent-requests">
        <div v-if="sentRequests.length === 0" class="empty-state">
          <div class="empty-icon">📤</div>
          <p>No sent requests</p>
          <p class="empty-subtitle">
            Friend requests you send will appear here
          </p>
        </div>

        <div v-else class="list">
          <div
            v-for="request in sentRequests"
            :key="request._id"
            class="list-item request-item"
          >
            <div class="item-info">
              <div class="user-icon">👤</div>
              <div class="user-details">
                <div class="user-id">{{ request.receiverUsername }}</div>
                <div class="user-label">Pending request</div>
              </div>
            </div>
            <button
              @click="handleCancelRequest(request)"
              class="button cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Add Friend Tab -->
      <div v-if="activeTab === 'add'" class="add-friend">
        <div class="add-friend-form">
          <h3>Send Friend Request</h3>
          <p class="form-description">
            Enter the username of the person you want to add as a friend
          </p>

          <form @submit.prevent="handleSendRequest">
            <div class="form-group">
              <label for="username">Username:</label>
              <input
                id="username"
                v-model="newFriendUsername"
                type="text"
                placeholder="Enter username"
                required
              />
            </div>

            <button
              type="submit"
              class="button send-button"
              :disabled="!newFriendUsername.trim()"
            >
              Send Request
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useFriendStore } from "../../stores/friendStore.js";
import { useAuthStore } from "../../stores/authStore.js";

const friendStore = useFriendStore();
const authStore = useAuthStore();

const activeTab = ref("friends");
const newFriendUsername = ref("");
const successMessage = ref("");
const isProcessing = ref(false);

const currentUser = computed(() => authStore.currentUser);
const currentUsername = computed(() => authStore.currentUsername);
const error = computed(() => friendStore.friendError);
const friends = computed(() => friendStore.friendsList);
const sentRequests = computed(() => friendStore.sentRequestsList);
const receivedRequests = computed(() => friendStore.receivedRequestsList);
const isLoading = computed(() => friendStore.isLoading || isProcessing.value);

// Load friend data when component mounts
onMounted(async () => {
  if (currentUser.value) {
    try {
      await friendStore.loadFriendData(currentUser.value);
    } catch (error) {
      console.error("Failed to load friend data:", error);
    }
  }
});

// Get the friend's username from a friendship object
const getFriendUsername = (friendship) => {
  if (friendship.user1 === currentUser.value) {
    return friendship.username2;
  } else {
    return friendship.username1;
  }
};

// Handle sending a friend request
const handleSendRequest = async () => {
  if (!newFriendUsername.value.trim() || isProcessing.value) return;

  const username = newFriendUsername.value.trim();
  isProcessing.value = true;

  try {
    await friendStore.sendFriendRequest(currentUser.value, username);
    showSuccess("Friend request sent successfully!");
    newFriendUsername.value = "";
    activeTab.value = "sent";
  } catch (error) {
    // Error is already set in the store
    console.error("Failed to send friend request:", error);
  } finally {
    isProcessing.value = false;
  }
};

// Handle accepting a friend request
const handleAcceptRequest = async (request) => {
  if (isProcessing.value) return;
  isProcessing.value = true;

  try {
    await friendStore.acceptFriendRequest(currentUser.value, request.sender);
    showSuccess("Friend request accepted!");
  } catch (error) {
    console.error("Failed to accept friend request:", error);
  } finally {
    isProcessing.value = false;
  }
};

// Handle declining a friend request
const handleDeclineRequest = async (request) => {
  if (isProcessing.value) return;
  isProcessing.value = true;

  try {
    await friendStore.declineFriendRequest(currentUser.value, request.sender);
    showSuccess("Friend request declined");
  } catch (error) {
    console.error("Failed to decline friend request:", error);
  } finally {
    isProcessing.value = false;
  }
};

// Handle canceling a sent request
const handleCancelRequest = async (request) => {
  if (isProcessing.value) return;
  isProcessing.value = true;

  try {
    await friendStore.cancelSentRequest(currentUser.value, request.receiver);
    showSuccess("Friend request canceled");
  } catch (error) {
    console.error("Failed to cancel friend request:", error);
  } finally {
    isProcessing.value = false;
  }
};

// Handle removing a friend
const handleRemoveFriend = async (friendship) => {
  if (isProcessing.value) return;
  if (!confirm("Are you sure you want to remove this friend?")) return;

  isProcessing.value = true;

  try {
    await friendStore.removeFriend(friendship.user1, friendship.user2);
    showSuccess("Friend removed");
  } catch (error) {
    console.error("Failed to remove friend:", error);
  } finally {
    isProcessing.value = false;
  }
};

// Show success message temporarily
const showSuccess = (message) => {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = "";
  }, 3000);
};

// Clear error message
const clearError = () => {
  friendStore.clearError();
};
</script>

<style scoped>
.friends-manager {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 900px;
  margin: 0 auto;
}

.friends-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #764ba2 0%, #d01c64 100%);
  color: white;
  text-align: center;
}

.friends-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
}

.friends-description {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #e9ecef;
  background: #f8f9fa;
}

.tab {
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
}

.tab:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: white;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  margin: 1rem;
  border-radius: 6px;
  border: 1px solid #f5c6cb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-error {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #721c24;
  padding: 0 0.5rem;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  margin: 1rem;
  border-radius: 6px;
  border: 1px solid #c3e6cb;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 12px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.tab-content {
  padding: 1.5rem;
  min-height: 400px;
  position: relative;
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-subtitle {
  font-size: 0.9rem;
  color: #999;
  margin-top: 0.5rem;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.list-item:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-icon {
  font-size: 2rem;
  background: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e9ecef;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-id {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.user-label {
  font-size: 0.85rem;
  color: #666;
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.accept-button {
  background: #28a745;
  color: white;
}

.accept-button:hover:not(:disabled) {
  background: #218838;
}

.decline-button,
.cancel-button {
  background: #6c757d;
  color: white;
}

.decline-button:hover:not(:disabled),
.cancel-button:hover:not(:disabled) {
  background: #5a6268;
}

.remove-button {
  background: #dc3545;
  color: white;
}

.remove-button:hover:not(:disabled) {
  background: #c82333;
}

.send-button {
  background: #667eea;
  color: white;
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
}

.send-button:hover:not(:disabled) {
  background: #5568d3;
}

.add-friend-form {
  max-width: 500px;
  margin: 0 auto;
}

.add-friend-form h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

.form-description {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

@media (max-width: 768px) {
  .tabs {
    overflow-x: auto;
  }

  .tab {
    flex: none;
    min-width: 120px;
    font-size: 0.85rem;
    padding: 0.75rem;
  }

  .list-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .button-group {
    width: 100%;
  }

  .button {
    flex: 1;
  }
}
</style>
