<template>
  <div class="auth-manager">
    <div v-if="!isAuthenticated" class="auth-container">
      <div class="auth-header">
        <h1>TaskMate</h1>
        <p>Welcome to TaskMate - Your Personal Task Management System</p>
      </div>

      <div class="auth-forms">
        <LoginForm
          v-if="currentView === 'login'"
          @switch-to-register="currentView = 'register'"
          @login-success="handleAuthSuccess"
        />

        <RegisterForm
          v-if="currentView === 'register'"
          @switch-to-login="currentView = 'login'"
          @register-success="handleAuthSuccess"
        />
      </div>
    </div>

    <div v-else class="authenticated-container">
      <div class="app-header">
        <h1>TaskMate</h1>
        <div class="user-info">
          <span>Welcome, {{ currentUser }}!</span>
          <button
            v-if="currentView === 'schedule'"
            @click="currentView = 'schedule-selection'"
            class="schedules-button"
          >
            My Schedules
          </button>
          <button @click="currentView = 'profile'" class="profile-button">
            Profile
          </button>
          <button @click="handleLogout" class="logout-button">Logout</button>
        </div>
      </div>

      <div class="main-content">
        <!-- Loading state while initializing schedule -->
        <div v-if="currentView === 'loading'" class="loading-container">
          <div class="spinner"></div>
          <p>Setting up your schedule...</p>
        </div>

        <UserProfile v-else-if="currentView === 'profile'" @logout="handleLogout" />

        <ScheduleSelection
          v-else-if="currentView === 'schedule-selection'"
          @schedule-selected="handleScheduleSelected"
        />

        <ScheduleManager v-else-if="currentView === 'schedule'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useAuthStore } from "../../stores/authStore.js";
import { useScheduleStore } from "../../stores/scheduleStore.js";
import { scheduleGeneratorService } from "../../services/scheduleGeneratorService.js";
import LoginForm from "./LoginForm.vue";
import RegisterForm from "./RegisterForm.vue";
import UserProfile from "./UserProfile.vue";
import ScheduleSelection from "../schedule/ScheduleSelection.vue";
import ScheduleManager from "../schedule/ScheduleManager.vue";

const authStore = useAuthStore();
const scheduleStore = useScheduleStore();

const currentView = ref("login");

const isAuthenticated = computed(() => authStore.isLoggedIn);
const currentUser = computed(() => authStore.currentUser);

// Initialize user schedule after login/register
const initializeUserSchedule = async () => {
  // Show loading state
  currentView.value = "loading";

  try {
    // Check if user has any schedules
    const scheduleResponse = await scheduleGeneratorService.getScheduleByOwner(
      currentUser.value
    );

    if (scheduleResponse && scheduleResponse.schedule) {
      // User has a schedule - load it and go to schedule manager
      await scheduleStore.selectSchedule(scheduleResponse.schedule);
      currentView.value = "schedule";
    } else {
      // No schedule found - show schedule selection to handle creation
      currentView.value = "schedule-selection";
    }
  } catch (err) {
    console.error("Error checking for schedules:", err);

    // If error is "No schedule found", auto-create one
    if (err.message && err.message.includes("No schedule found")) {
      console.log("No schedules found, creating default schedule...");
      try {
        const createResponse = await scheduleGeneratorService.initializeSchedule(
          currentUser.value
        );

        if (createResponse.schedule) {
          console.log("Schedule created successfully:", createResponse.schedule);
          // Auto-select the newly created schedule
          await scheduleStore.selectSchedule(createResponse.schedule);
          currentView.value = "schedule";
        } else {
          // Fall back to schedule selection screen
          currentView.value = "schedule-selection";
        }
      } catch (createErr) {
        console.error("Error creating schedule:", createErr);
        currentView.value = "schedule-selection";
      }
    } else {
      // Other error - show schedule selection
      currentView.value = "schedule-selection";
    }
  }
};

const handleAuthSuccess = async () => {
  // After successful login/register, check for schedules and auto-create if needed
  await initializeUserSchedule();
};

const handleScheduleSelected = () => {
  // After schedule is selected, show schedule manager
  currentView.value = "schedule";
};

const handleLogout = () => {
  authStore.logout();
  // Ensure we reset to login view
  currentView.value = "login";

  // Force a small delay to ensure state is fully updated
  setTimeout(() => {
    currentView.value = "login";
  }, 100);
};

// Watch for authentication state changes
// When user logs out or deletes account, immediately show login form
watch(isAuthenticated, (newValue) => {
  if (!newValue) {
    // User is no longer authenticated, show login form
    currentView.value = "login";
  }
});

onMounted(async () => {
  // Initialize auth state from localStorage (now async for validation)
  await authStore.initializeAuth();

  // If user is already authenticated, check for schedules and auto-create if needed
  if (isAuthenticated.value) {
    await initializeUserSchedule();
  }
});
</script>

<style scoped>
.auth-manager {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 500px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.auth-header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.auth-header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.auth-forms {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.authenticated-container {
  width: 100%;
  max-width: 1200px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h1 {
  margin: 0;
  font-size: 2rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info span {
  font-size: 1.1rem;
}

.schedules-button,
.profile-button,
.logout-button {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.schedules-button:hover,
.profile-button:hover,
.logout-button:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
}

.main-content {
  padding: 0;
  min-height: 100vh;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 3rem;
  color: #666;
}

.loading-container p {
  margin-top: 1.5rem;
  font-size: 1.1rem;
  color: #555;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .auth-manager {
    padding: 1rem;
  }

  .app-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .user-info {
    flex-direction: column;
    gap: 0.5rem;
  }

  .main-content {
    padding: 0;
  }
}
</style>
