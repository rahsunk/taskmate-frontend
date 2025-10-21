<template>
  <div class="api-test">
    <h1>TaskMate API Integration Test</h1>
    <p>Backend running on: http://localhost:8000</p>

    <!-- User Authentication Section -->
    <section class="api-section">
      <h2>User Authentication</h2>
      <div class="form-group">
        <input v-model="authForm.username" placeholder="Username" />
        <input
          v-model="authForm.password"
          type="password"
          placeholder="Password"
        />
        <button @click="registerUser" :disabled="loading">Register</button>
        <button @click="authenticateUser" :disabled="loading">Login</button>
        <button @click="checkUserExists" :disabled="loading">Check User</button>
      </div>
      <div v-if="authResult" class="result">
        <pre>{{ JSON.stringify(authResult, null, 2) }}</pre>
      </div>
    </section>

    <!-- Item Sharing Section -->
    <section class="api-section">
      <h2>Item Sharing</h2>
      <div class="form-group">
        <input v-model="sharingForm.owner" placeholder="Owner ID" />
        <input
          v-model="sharingForm.externalItemID"
          placeholder="External Item ID"
        />
        <button @click="makeItemShareable" :disabled="loading">
          Make Shareable
        </button>
        <button @click="shareWithUser" :disabled="loading">
          Share With User
        </button>
      </div>
      <div class="form-group">
        <input v-model="sharingForm.sharedItem" placeholder="Shared Item ID" />
        <input v-model="sharingForm.targetUser" placeholder="Target User ID" />
        <button @click="unshareWithUser" :disabled="loading">Unshare</button>
        <button @click="acceptCollaboration" :disabled="loading">
          Accept Collaboration
        </button>
      </div>
      <div v-if="sharingResult" class="result">
        <pre>{{ JSON.stringify(sharingResult, null, 2) }}</pre>
      </div>
    </section>

    <!-- Notification Section -->
    <section class="api-section">
      <h2>Notifications</h2>
      <div class="form-group">
        <input v-model="notificationForm.owner" placeholder="Owner ID" />
        <input v-model="notificationForm.email" placeholder="Email" />
        <input
          v-model="notificationForm.targetItem"
          placeholder="Target Item"
        />
        <input
          v-model="notificationForm.notificationType"
          placeholder="Notification Type"
        />
        <button @click="createNotificationConfig" :disabled="loading">
          Create Config
        </button>
        <button @click="getNotificationSettings" :disabled="loading">
          Get Settings
        </button>
      </div>
      <div v-if="notificationResult" class="result">
        <pre>{{ JSON.stringify(notificationResult, null, 2) }}</pre>
      </div>
    </section>

    <!-- Schedule Generator Section -->
    <section class="api-section">
      <h2>Schedule Generator</h2>
      <div class="form-group">
        <input v-model="scheduleForm.owner" placeholder="Owner ID" />
        <button @click="initializeSchedule" :disabled="loading">
          Initialize Schedule
        </button>
        <button @click="getSchedule" :disabled="loading">Get Schedule</button>
      </div>
      <div class="form-group">
        <input v-model="scheduleForm.schedule" placeholder="Schedule ID" />
        <input v-model="scheduleForm.eventName" placeholder="Event Name" />
        <input v-model="scheduleForm.startTime" placeholder="Start Time" />
        <input v-model="scheduleForm.endTime" placeholder="End Time" />
        <button @click="addEvent" :disabled="loading">Add Event</button>
        <button @click="getEvents" :disabled="loading">Get Events</button>
      </div>
      <div class="form-group">
        <input v-model="scheduleForm.taskName" placeholder="Task Name" />
        <input v-model="scheduleForm.deadline" placeholder="Deadline" />
        <input
          v-model="scheduleForm.expectedTime"
          type="number"
          placeholder="Expected Time (minutes)"
        />
        <input
          v-model="scheduleForm.completionLevel"
          type="number"
          placeholder="Completion Level (0-100)"
        />
        <input
          v-model="scheduleForm.priority"
          type="number"
          placeholder="Priority"
        />
        <button @click="addTask" :disabled="loading">Add Task</button>
        <button @click="getTasks" :disabled="loading">Get Tasks</button>
        <button @click="generateSchedule" :disabled="loading">
          Generate Schedule
        </button>
      </div>
      <div v-if="scheduleResult" class="result">
        <pre>{{ JSON.stringify(scheduleResult, null, 2) }}</pre>
      </div>
    </section>

    <!-- Error Display -->
    <div v-if="error" class="error">
      <h3>Error:</h3>
      <p>{{ error }}</p>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="loading">
      <p>Loading...</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { userAuthService } from "../services/userAuthService.js";
import { itemSharingService } from "../services/itemSharingService.js";
import { notificationService } from "../services/notificationService.js";
import { scheduleGeneratorService } from "../services/scheduleGeneratorService.js";

// Reactive data
const loading = ref(false);
const error = ref("");
const authResult = ref(null);
const sharingResult = ref(null);
const notificationResult = ref(null);
const scheduleResult = ref(null);

// Form data
const authForm = ref({
  username: "",
  password: "",
});

const sharingForm = ref({
  owner: "",
  externalItemID: "",
  sharedItem: "",
  targetUser: "",
});

const notificationForm = ref({
  owner: "",
  email: "",
  targetItem: "",
  notificationType: "",
});

const scheduleForm = ref({
  owner: "",
  schedule: "",
  eventName: "",
  startTime: "",
  endTime: "",
  taskName: "",
  deadline: "",
  expectedTime: 60,
  completionLevel: 0,
  priority: 1,
});

// Helper function to handle API calls
const handleApiCall = async (apiCall) => {
  loading.value = true;
  error.value = "";
  try {
    const result = await apiCall();
    return result;
  } catch (err) {
    error.value = err.message;
    throw err;
  } finally {
    loading.value = false;
  }
};

// User Authentication methods
const registerUser = async () => {
  authResult.value = await handleApiCall(() =>
    userAuthService.register(authForm.value.username, authForm.value.password)
  );
};

const authenticateUser = async () => {
  authResult.value = await handleApiCall(() =>
    userAuthService.authenticate(
      authForm.value.username,
      authForm.value.password
    )
  );
};

const checkUserExists = async () => {
  authResult.value = await handleApiCall(() =>
    userAuthService.checkUserExists(authForm.value.username)
  );
};

// Item Sharing methods
const makeItemShareable = async () => {
  sharingResult.value = await handleApiCall(() =>
    itemSharingService.makeItemShareable(
      sharingForm.value.owner,
      sharingForm.value.externalItemID
    )
  );
};

const shareWithUser = async () => {
  sharingResult.value = await handleApiCall(() =>
    itemSharingService.shareItemWith(
      sharingForm.value.sharedItem,
      sharingForm.value.targetUser
    )
  );
};

const unshareWithUser = async () => {
  sharingResult.value = await handleApiCall(() =>
    itemSharingService.unshareItemWith(
      sharingForm.value.sharedItem,
      sharingForm.value.targetUser
    )
  );
};

const acceptCollaboration = async () => {
  sharingResult.value = await handleApiCall(() =>
    itemSharingService.acceptToCollaborate(
      sharingForm.value.sharedItem,
      sharingForm.value.targetUser
    )
  );
};

// Notification methods
const createNotificationConfig = async () => {
  const config = {
    owner: notificationForm.value.owner,
    email: notificationForm.value.email,
    targetItem: notificationForm.value.targetItem,
    notificationType: notificationForm.value.notificationType,
    dailyTime: "09:00",
    emailSubjectTemplate: "TaskMate Notification",
    emailBodyTemplate: "You have a notification about {{targetItem}}",
    isEnabled: true,
  };
  notificationResult.value = await handleApiCall(() =>
    notificationService.createNotificationConfig(config)
  );
};

const getNotificationSettings = async () => {
  notificationResult.value = await handleApiCall(() =>
    notificationService.getNotificationSettingsForUser(
      notificationForm.value.owner
    )
  );
};

// Schedule Generator methods
const initializeSchedule = async () => {
  scheduleResult.value = await handleApiCall(() =>
    scheduleGeneratorService.initializeSchedule(scheduleForm.value.owner)
  );
};

const getSchedule = async () => {
  scheduleResult.value = await handleApiCall(() =>
    scheduleGeneratorService.getScheduleByOwner(scheduleForm.value.owner)
  );
};

const addEvent = async () => {
  scheduleResult.value = await handleApiCall(() =>
    scheduleGeneratorService.addEvent(
      scheduleForm.value.schedule,
      scheduleForm.value.eventName,
      scheduleForm.value.startTime,
      scheduleForm.value.endTime,
      { frequency: "none" }
    )
  );
};

const getEvents = async () => {
  scheduleResult.value = await handleApiCall(() =>
    scheduleGeneratorService.getEventsForSchedule(scheduleForm.value.schedule)
  );
};

const addTask = async () => {
  scheduleResult.value = await handleApiCall(() =>
    scheduleGeneratorService.addTask(
      scheduleForm.value.schedule,
      scheduleForm.value.taskName,
      scheduleForm.value.deadline,
      scheduleForm.value.expectedTime,
      scheduleForm.value.completionLevel,
      scheduleForm.value.priority
    )
  );
};

const getTasks = async () => {
  scheduleResult.value = await handleApiCall(() =>
    scheduleGeneratorService.getTasksForSchedule(scheduleForm.value.schedule)
  );
};

const generateSchedule = async () => {
  scheduleResult.value = await handleApiCall(() =>
    scheduleGeneratorService.generateSchedule(scheduleForm.value.schedule)
  );
};
</script>

<style scoped>
.api-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.api-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.api-section h2 {
  margin-top: 0;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.form-group input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
}

.form-group button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.form-group button:hover:not(:disabled) {
  background-color: #0056b3;
}

.form-group button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.result {
  margin-top: 15px;
  padding: 15px;
  background-color: #e9ecef;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.result pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
}

.error {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
}

.loading {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #666;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
}

p {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}
</style>
