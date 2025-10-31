<template>
  <div class="messaging-panel">
    <div class="messaging-header">
      <h2>Messages</h2>
      <button @click="$emit('close')" class="close-button">×</button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="clearError" class="close-error">×</button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>

    <div class="messaging-content">
      <!-- Conversations List -->
      <div class="conversations-list" v-if="!activeConversation">
        <div v-if="conversations.length === 0" class="empty-state">
          <div class="empty-icon">💬</div>
          <p>No conversations yet</p>
          <p class="empty-subtitle">
            Click the "Message" button on a friend to start chatting!
          </p>
        </div>

        <div v-else class="conversation-items">
          <div
            v-for="conversation in conversations"
            :key="conversation._id"
            class="conversation-item"
            @click="selectConversation(conversation._id)"
          >
            <div class="conversation-icon">👤</div>
            <div class="conversation-details">
              <div class="conversation-name">
                {{ getOtherParticipantName(conversation) }}
              </div>
              <div class="conversation-preview">Click to open chat</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Conversation View -->
      <div v-else class="active-conversation">
        <ConversationView
          :conversation="activeConversation"
          :messages="activeMessages"
          :current-user-id="currentUser"
          @back="clearActiveConversation"
          @send-message="handleSendMessage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useMessagingStore } from "../../stores/messagingStore.js";
import { useAuthStore } from "../../stores/authStore.js";
import ConversationView from "./ConversationView.vue";

defineEmits(["close"]);

const messagingStore = useMessagingStore();
const authStore = useAuthStore();

const currentUser = computed(() => authStore.currentUser);
const error = computed(() => messagingStore.messagingError);
const conversations = computed(() => messagingStore.conversationsList);
const activeConversation = computed(() => messagingStore.activeConversation);
const activeMessages = computed(() => messagingStore.activeMessages);
const isLoading = computed(() => messagingStore.isLoading);

// Load conversations when component mounts
onMounted(async () => {
  if (currentUser.value) {
    try {
      await messagingStore.loadConversations(currentUser.value);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }
});

// Get the other participant's name
const getOtherParticipantName = (conversation) => {
  const otherParticipant = messagingStore.getOtherParticipant(
    conversation,
    currentUser.value
  );
  return otherParticipant.username;
};

// Select a conversation
const selectConversation = async (conversationId) => {
  try {
    await messagingStore.setActiveConversation(conversationId);
  } catch (error) {
    console.error("Failed to load conversation:", error);
  }
};

// Clear active conversation
const clearActiveConversation = () => {
  messagingStore.clearActiveConversation();
};

// Handle sending a message
const handleSendMessage = async (content) => {
  if (!content.trim() || !activeConversation.value) return;

  try {
    await messagingStore.sendMessage(
      activeConversation.value._id,
      currentUser.value,
      content.trim()
    );
  } catch (error) {
    console.error("Failed to send message:", error);
  }
};

// Clear error message
const clearError = () => {
  messagingStore.clearError();
};
</script>

<style scoped>
.messaging-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 900px;
  margin: 0 auto;
  height: 600px;
  display: flex;
  flex-direction: column;
}

.messaging-header {
  padding: 1.5rem;
  /* background: linear-gradient(135deg, #cc0d43 0%, #764ba2 100%); */
  background: linear-gradient(135deg, #764ba2 0%, #cc0d43 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.messaging-header h2 {
  margin: 0;
  font-size: 1.8rem;
}

.close-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
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

.messaging-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.conversations-list {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
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

.conversation-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.2s;
}

.conversation-item:hover {
  background: #e9ecef;
  border-color: #dee2e6;
  transform: translateX(4px);
}

.conversation-icon {
  font-size: 2rem;
  background: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e9ecef;
  margin-right: 1rem;
}

.conversation-details {
  flex: 1;
}

.conversation-name {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.conversation-preview {
  font-size: 0.85rem;
  color: #666;
}

.active-conversation {
  height: 100%;
}

@media (max-width: 768px) {
  .messaging-panel {
    height: 500px;
  }

  .messaging-header h2 {
    font-size: 1.5rem;
  }

  .conversation-item {
    padding: 0.75rem;
  }

  .conversation-icon {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
}
</style>
