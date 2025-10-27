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
          placeholder="Choose a password (min. 6 characters)"
        />
        <div
          v-if="passwordStrength && form.password.length > 0"
          class="password-hint"
        >
          <small
            :class="{
              'text-danger': passwordStrength.isWeak,
              'text-warning': passwordStrength.isModerate,
              'text-success': passwordStrength.isStrong,
            }"
          >
            Password strength:
            {{
              passwordStrength.isStrong
                ? "Strong"
                : passwordStrength.isModerate
                  ? "Moderate"
                  : "Weak"
            }}
          </small>
          <small v-if="passwordStrength.suggestions.length > 0" class="text-muted">
            (Add: {{ passwordStrength.suggestions.join(", ") }})
          </small>
        </div>
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
import { ref, computed, watch } from "vue";
import { useAuthStore } from "../../stores/authStore.js";

const emit = defineEmits(["switch-to-login", "register-success"]);

const authStore = useAuthStore();

const form = ref({
  username: "",
  password: "",
  confirmPassword: "",
});

const localError = ref("");
const validationErrors = ref([]);

const loading = computed(() => authStore.isLoading);
const error = computed(() => authStore.authError || localError.value);

const passwordMismatch = computed(() => {
  return (
    form.value.password !== "" &&
    form.value.confirmPassword !== "" &&
    form.value.password !== form.value.confirmPassword
  );
});

const passwordStrength = computed(() => {
  const password = form.value.password;
  if (password.length === 0) return null;

  const errors = [];
  if (password.length < 6) errors.push("At least 6 characters");
  if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("One number");

  return {
    isWeak: errors.length > 2,
    isModerate: errors.length === 1 || errors.length === 2,
    isStrong: errors.length === 0,
    suggestions: errors,
  };
});

const isFormValid = computed(() => {
  return (
    form.value.username.trim() !== "" &&
    form.value.password.trim() !== "" &&
    form.value.password.length >= 6 &&
    form.value.confirmPassword.trim() !== "" &&
    !passwordMismatch.value
  );
});

// Clear errors when user types
watch(
  () => [form.value.username, form.value.password, form.value.confirmPassword],
  () => {
    localError.value = "";
    validationErrors.value = [];
    authStore.clearError();
  }
);

const handleRegister = async () => {
  // Clear previous errors
  localError.value = "";
  validationErrors.value = [];
  authStore.clearError();

  // Frontend validation
  if (!form.value.username.trim()) {
    localError.value = "Please enter a username";
    return;
  }

  if (form.value.username.trim().length < 3) {
    localError.value = "Username must be at least 3 characters long";
    return;
  }

  if (!form.value.password) {
    localError.value = "Please enter a password";
    return;
  }

  if (form.value.password.length < 6) {
    localError.value = "Password must be at least 6 characters long";
    return;
  }

  if (!form.value.confirmPassword) {
    localError.value = "Please confirm your password";
    return;
  }

  if (passwordMismatch.value) {
    localError.value = "Passwords do not match";
    return;
  }

  try {
    await authStore.register(form.value.username, form.value.password);
    // Clear form on success
    form.value.username = "";
    form.value.password = "";
    form.value.confirmPassword = "";
    emit("register-success");
  } catch (err) {
    // Error is handled by the store and displayed via computed property
    console.error("Registration failed:", err);
  }
};

// Clear error when component mounts
authStore.clearError();
localError.value = "";
validationErrors.value = [];
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

.password-hint {
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

.text-danger {
  color: #dc3545;
}

.text-warning {
  color: #ffc107;
}

.text-success {
  color: #28a745;
}

.text-muted {
  color: #6c757d;
  display: block;
  margin-top: 0.25rem;
}
</style>
