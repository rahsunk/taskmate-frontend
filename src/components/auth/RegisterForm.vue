<template>
  <div class="register-form">
    <h2>Register</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          required
          :disabled="loading"
          placeholder="Choose a username"
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
          placeholder="Choose a password"
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password:</label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          required
          :disabled="loading"
          placeholder="Confirm your password"
        />
      </div>

      <div v-if="passwordMismatch" class="error-message">
        Passwords do not match
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button type="submit" :disabled="loading || !isFormValid">
        {{ loading ? "Creating account..." : "Register" }}
      </button>
    </form>

    <div class="form-footer">
      <p>
        Already have an account?
        <a href="#" @click="$emit('switch-to-login')">Login here</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "../../stores/authStore.js";

const emit = defineEmits(["switch-to-login", "register-success"]);

const authStore = useAuthStore();

const form = ref({
  username: "",
  password: "",
  confirmPassword: "",
});

const loading = computed(() => authStore.isLoading);
const error = computed(() => authStore.authError);

const passwordMismatch = computed(() => {
  return (
    form.value.password !== "" &&
    form.value.confirmPassword !== "" &&
    form.value.password !== form.value.confirmPassword
  );
});

const isFormValid = computed(() => {
  return (
    form.value.username.trim() !== "" &&
    form.value.password.trim() !== "" &&
    form.value.confirmPassword.trim() !== "" &&
    !passwordMismatch.value
  );
});

const handleRegister = async () => {
  if (passwordMismatch.value) {
    return;
  }

  try {
    await authStore.register(form.value.username, form.value.password);
    emit("register-success");
  } catch (err) {
    // Error is handled by the store and displayed via computed property
    console.error("Registration failed:", err);
  }
};

// Clear error when component mounts
authStore.clearError();
</script>

<style scoped>
.register-form {
  max-width: 400px;
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
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #218838;
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
