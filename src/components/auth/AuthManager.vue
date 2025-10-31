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
          <span>Welcome, {{ username }}!</span>
          <button @click="currentView = 'profile'" class="profile-button">
            Profile
          </button>
          <button @click="handleLogout" class="logout-button">Logout</button>
        </div>
      </div>

      <div class="main-content">
        <UserProfile v-if="currentView === 'profile'" @logout="handleLogout" />

        <ScheduleManager v-else />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/authStore.js";
import LoginForm from "./LoginForm.vue";
import RegisterForm from "./RegisterForm.vue";
import UserProfile from "./UserProfile.vue";
import ScheduleManager from "../schedule/ScheduleManager.vue";

const authStore = useAuthStore();

const currentView = ref("login");

const isAuthenticated = computed(() => authStore.isLoggedIn);
const username = computed(() => authStore.currentUsername);

const handleAuthSuccess = () => {
  currentView.value = "schedule";
};

const handleLogout = () => {
  authStore.logout();
  currentView.value = "login";
};

onMounted(() => {
  // Initialize auth state from localStorage
  authStore.initializeAuth();

  // If user is already authenticated, show schedule
  if (isAuthenticated.value) {
    currentView.value = "schedule";
  }
});
</script>

<style scoped>
.auth-manager {
  min-height: 100vh;
  width: 90vw;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-container {
  width: 100%;
  max-width: 50vw;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rem;
  border-radius: 12px;
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

@media (max-width: 768px) {
  /* .auth-manager {
    padding: 1rem;
  } */

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
