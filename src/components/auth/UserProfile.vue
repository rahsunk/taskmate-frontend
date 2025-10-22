<template>
  <div class="user-profile">
    <h2>User Profile</h2>

    <div class="profile-info">
      <p><strong>Username:</strong> {{ user }}</p>
    </div>

    <div class="profile-actions">
      <h3>Account Actions</h3>

      <!-- Change Password Section -->
      <div class="action-section">
        <h4>Change Password</h4>
        <form @submit.prevent="handleChangePassword">
          <div class="form-group">
            <label for="oldPassword">Current Password:</label>
            <input
              id="oldPassword"
              v-model="passwordForm.oldPassword"
              type="password"
              required
              :disabled="loading"
              placeholder="Enter current password"
            />
          </div>

          <div class="form-group">
            <label for="newPassword">New Password:</label>
            <input
              id="newPassword"
              v-model="passwordForm.newPassword"
              type="password"
              required
              :disabled="loading"
              placeholder="Enter new password"
            />
          </div>

          <div class="form-group">
            <label for="confirmNewPassword">Confirm New Password:</label>
            <input
              id="confirmNewPassword"
              v-model="passwordForm.confirmNewPassword"
              type="password"
              required
              :disabled="loading"
              placeholder="Confirm new password"
            />
          </div>

          <div v-if="passwordMismatch" class="error-message">
            New passwords do not match
          </div>

          <button type="submit" :disabled="loading || !isPasswordFormValid">
            {{ loading ? "Changing password..." : "Change Password" }}
          </button>
        </form>
      </div>

      <!-- Delete Account Section -->
      <div class="action-section">
        <h4>Delete Account</h4>
        <p class="warning-text">
          <strong>Warning:</strong> This action cannot be undone. All your data
          will be permanently deleted.
        </p>

        <div v-if="showDeleteConfirmation" class="delete-confirmation">
          <p>Are you sure you want to delete your account?</p>
          <div class="confirmation-buttons">
            <button
              @click="handleDeleteAccount"
              :disabled="loading"
              class="delete-button"
            >
              {{ loading ? "Deleting..." : "Yes, Delete Account" }}
            </button>
            <button
              @click="showDeleteConfirmation = false"
              :disabled="loading"
              class="cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>

        <button
          v-else
          @click="showDeleteConfirmation = true"
          class="delete-button"
        >
          Delete Account
        </button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </div>

    <div class="profile-footer">
      <button @click="handleLogout" class="logout-button">Logout</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/authStore.js";

const emit = defineEmits(["logout"]);

const authStore = useAuthStore();

const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmNewPassword: "",
});

const showDeleteConfirmation = ref(false);
const successMessage = ref("");

const user = computed(() => authStore.currentUser);
const loading = computed(() => authStore.isLoading);
const error = computed(() => authStore.authError);

const passwordMismatch = computed(() => {
  return (
    passwordForm.value.newPassword !== "" &&
    passwordForm.value.confirmNewPassword !== "" &&
    passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword
  );
});

const isPasswordFormValid = computed(() => {
  return (
    passwordForm.value.oldPassword.trim() !== "" &&
    passwordForm.value.newPassword.trim() !== "" &&
    passwordForm.value.confirmNewPassword.trim() !== "" &&
    !passwordMismatch.value
  );
});

const handleChangePassword = async () => {
  if (passwordMismatch.value) {
    return;
  }

  try {
    await authStore.changePassword(
      passwordForm.value.oldPassword,
      passwordForm.value.newPassword
    );
    passwordForm.value = {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    };
    successMessage.value = "Password changed successfully!";
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    console.error("Password change failed:", err);
  }
};

const handleDeleteAccount = async () => {
  try {
    await authStore.deleteAccount();
    emit("logout");
  } catch (err) {
    console.error("Account deletion failed:", err);
  }
};

const handleLogout = () => {
  authStore.logout();
  emit("logout");
};

onMounted(() => {
  authStore.clearError();
});
</script>

<style scoped>
.user-profile {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

h3 {
  color: #555;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

h4 {
  color: #666;
  margin-bottom: 1rem;
}

.profile-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
}

.profile-actions {
  margin-bottom: 2rem;
}

.action-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: #fafafa;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #007bff;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-right: 0.5rem;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover:not(:disabled) {
  background-color: #c82333;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
}

.cancel-button:hover:not(:disabled) {
  background-color: #5a6268;
}

.logout-button {
  background-color: #007bff;
  color: white;
  width: 100%;
}

.logout-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.warning-text {
  color: #856404;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.delete-confirmation {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
}

.confirmation-buttons {
  margin-top: 1rem;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.success-message {
  color: #155724;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.profile-footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}
</style>
