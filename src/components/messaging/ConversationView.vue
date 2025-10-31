<template>
  <div class="conversation-view">
    <!-- Conversation Header -->
    <div class="conversation-header">
      <button @click="$emit('back')" class="back-button">←</button>
      <div class="header-info">
        <div class="conversation-icon">👤</div>
        <div class="conversation-title">
          {{ otherParticipantName }}
        </div>
      </div>
    </div>

    <!-- Messages Area -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-messages">
        <div class="empty-icon">💬</div>
        <p>No messages yet</p>
        <p class="empty-subtitle">Start the conversation!</p>
      </div>

      <div v-else class="messages-list">
        <div
          v-for="message in messages"
          :key="message._id"
          :class="[
            'message',
            message.sender === currentUserId
              ? 'message-sent'
              : 'message-received',
          ]"
        >
          <div class="message-bubble">
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">
              {{ formatTime(message.sentAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="message-input-container">
      <form @submit.prevent="handleSubmit" class="message-form">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type a message..."
          class="message-input"
          maxlength="500"
        />
        <button
          type="submit"
          class="send-button"
          :disabled="!newMessage.trim()"
        >
          Send
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useMessagingStore } from "../../stores/messagingStore.js";

const props = defineProps({
  conversation: {
    type: Object,
    required: true,
  },
  messages: {
    type: Array,
    required: true,
  },
  currentUserId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["back", "send-message"]);

const messagingStore = useMessagingStore();
const newMessage = ref("");
const messagesContainer = ref(null);

// Get the other participant's name
const otherParticipantName = computed(() => {
  const otherParticipant = messagingStore.getOtherParticipant(
    props.conversation,
    props.currentUserId
  );
  return otherParticipant.username;
});

// Format timestamp
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    // Show time if within last 24 hours
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } else if (diffInHours < 168) {
    // Show day of week if within last week
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } else {
    // Show full date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
};

// Scroll to bottom of messages
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// Watch for new messages and scroll to bottom
watch(
  () => props.messages.length,
  () => {
    scrollToBottom();
  },
  { immediate: true }
);

// Handle sending a message
const handleSubmit = () => {
  if (!newMessage.value.trim()) return;

  emit("send-message", newMessage.value);
  newMessage.value = "";
};
</script>

<style scoped>
.conversation-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.conversation-header {
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #667eea;
  padding: 0.5rem;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.back-button:hover {
  background: #e9ecef;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.conversation-icon {
  font-size: 1.5rem;
  background: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e9ecef;
}

.conversation-title {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: linear-gradient(135deg, #764ba2 0%, #cc0d43 100%);
}

.empty-messages {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #666;
}

.empty-messages p {
  color: white;
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

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message {
  display: flex;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-sent {
  justify-content: flex-end;
}

.message-received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  word-wrap: break-word;
}

.message-sent .message-bubble {
  background: #667eea;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-received .message-bubble {
  background: white;
  color: #333;
  border: 1px solid #e9ecef;
  border-bottom-left-radius: 4px;
}

.message-content {
  font-size: 0.95rem;
  line-height: 1.4;
  margin-bottom: 0.25rem;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

.message-sent .message-time {
  text-align: right;
}

.message-received .message-time {
  text-align: left;
  color: #666;
}

.message-input-container {
  padding: 1rem;
  background: white;
  border-top: 1px solid #e9ecef;
}

.message-form {
  display: flex;
  gap: 0.75rem;
}

.message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: #667eea;
}

.send-button {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.send-button:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .conversation-header {
    padding: 0.75rem;
  }

  .conversation-title {
    font-size: 1rem;
  }

  .message-bubble {
    max-width: 85%;
    padding: 0.5rem 0.75rem;
  }

  .message-input-container {
    padding: 0.75rem;
  }

  .send-button {
    padding: 0.75rem 1rem;
  }
}
</style>
