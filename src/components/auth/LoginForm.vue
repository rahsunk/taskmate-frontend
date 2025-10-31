<template>
  <div class="login-form">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          required
          :disabled="loading"
          placeholder="Enter your username"
        />
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          :disabled="loading"
          placeholder="Enter your password"
        />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button type="submit" :disabled="loading || !isFormValid">
        {{ loading ? "Logging in..." : "Login" }}
      </button>
    </form>

    <div class="form-footer">
      <p>
        Don't have an account?
        <a href="#" @click="$emit('switch-to-register')">Register here</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useAuthStore } from "../../stores/authStore.js";

const emit = defineEmits(["switch-to-register", "login-success"]);

const authStore = useAuthStore();

const form = ref({
  username: "",
  password: "",
});

const localError = ref("");

const loading = computed(() => authStore.isLoading);
const error = computed(() => authStore.authError || localError.value);

const isFormValid = computed(() => {
  return form.value.username.trim() !== "" && form.value.password.trim() !== "";
});

// Clear local error when user types
watch(
  () => [form.value.username, form.value.password],
  () => {
    localError.value = "";
    authStore.clearError();
  }
);

const handleLogin = async () => {
  // Clear previous errors
  localError.value = "";
  authStore.clearError();

  // Frontend validation
  if (!form.value.username.trim()) {
    localError.value = "Please enter your username";
    return;
  }

  if (!form.value.password) {
    localError.value = "Please enter your password";
    return;
  }

  try {
    await authStore.login(form.value.username, form.value.password);
    // Clear form on success
    form.value.username = "";
    form.value.password = "";
    emit("login-success");
  } catch (err) {
    // Error is handled by the store and displayed via computed property
    console.error("Login failed:", err);
  }
};

// Clear error when component mounts
authStore.clearError();
localError.value = "";
</script>

<style scoped>
.login-form {
  width: 30vw;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
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
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
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

.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.form-footer a {
  color: #007bff;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style>
