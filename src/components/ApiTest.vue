<template>
  <div class="api-test">
    <h2>API Connection Test</h2>
    <div class="test-section">
      <button @click="testConnection" :disabled="loading">
        {{ loading ? "Testing..." : "Test API Connection" }}
      </button>
      <div v-if="result" class="result">
        <h3>Result:</h3>
        <pre>{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
      <div v-if="error" class="error">
        <h3>Error:</h3>
        <p>{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { scheduleApi } from "../services/scheduleApi.js";

export default {
  name: "ApiTest",
  data() {
    return {
      loading: false,
      result: null,
      error: null,
    };
  },
  methods: {
    async testConnection() {
      this.loading = true;
      this.error = null;
      this.result = null;

      try {
        // Test by trying to initialize a schedule
        const response = await scheduleApi.initializeSchedule("test-user");
        this.result = response;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.api-test {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.test-section {
  margin-top: 20px;
}

button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #369870;
}

.result,
.error {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
}

.result {
  background-color: #f0f9ff;
  border: 1px solid #0ea5e9;
}

.error {
  background-color: #fef2f2;
  border: 1px solid #ef4444;
}

pre {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 14px;
}
</style>
