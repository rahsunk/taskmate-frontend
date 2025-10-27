<template>
  <div class="schedule-selection">
    <div class="selection-header">
      <h2>My Schedules</h2>
      <p>Select a schedule to work with or create a new one</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your schedules...</p>
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
      <button @click="loadUserSchedules" class="retry-button">Retry</button>
    </div>

    <div v-else class="selection-content">
      <!-- Create New Schedule Section -->
      <div class="create-schedule-section">
        <h3>Create New Schedule</h3>
        <div class="create-form">
          <input
            v-model="newScheduleName"
            type="text"
            placeholder="Enter schedule name (optional)"
            @keyup.enter="handleCreateSchedule"
            :disabled="creating"
          />
          <button
            @click="handleCreateSchedule"
            :disabled="creating"
            class="create-button"
          >
            {{ creating ? "Creating..." : "Create New Schedule" }}
          </button>
        </div>
      </div>

      <!-- Existing Schedules List -->
      <div class="schedules-list">
        <h3>Your Schedules</h3>

        <div v-if="userSchedules.length === 0" class="empty-state">
          <p>You don't have any schedules yet.</p>
          <p>Create your first schedule above to get started!</p>
        </div>

        <div v-else class="schedules-grid">
          <div
            v-for="schedule in userSchedules"
            :key="schedule.id"
            class="schedule-card"
            @click="handleSelectSchedule(schedule.id)"
          >
            <div class="schedule-card-header">
              <h4>{{ schedule.name || `Schedule ${schedule.id}` }}</h4>
              <span class="schedule-id">ID: {{ schedule.id }}</span>
            </div>
            <div class="schedule-card-info">
              <p>
                <strong>Events:</strong> {{ schedule.eventCount || 0 }}
              </p>
              <p>
                <strong>Tasks:</strong> {{ schedule.taskCount || 0 }}
              </p>
            </div>
            <button class="select-button">Select Schedule</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/authStore.js";
import { useScheduleStore } from "../../stores/scheduleStore.js";
import { scheduleGeneratorService } from "../../services/scheduleGeneratorService.js";

const emit = defineEmits(["schedule-selected"]);

const authStore = useAuthStore();
const scheduleStore = useScheduleStore();

const userSchedules = ref([]);
const newScheduleName = ref("");
const loading = ref(false);
const creating = ref(false);
const error = ref(null);

const currentUser = computed(() => authStore.currentUser);

// Load all schedules for the current user
const loadUserSchedules = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Get schedule ID for this user
    const scheduleResponse = await scheduleGeneratorService.getScheduleByOwner(
      currentUser.value
    );

    if (scheduleResponse && scheduleResponse.length > 0) {
      // For now, we'll get all schedules and filter by owner
      // The API returns schedules for the user
      const allSchedules = scheduleResponse;

      // Get details for each schedule including event and task counts
      const scheduleDetails = await Promise.all(
        allSchedules.map(async (sched) => {
          try {
            const eventsResp = await scheduleGeneratorService.getEventsForSchedule(
              sched.schedule
            );
            const tasksResp = await scheduleGeneratorService.getTasksForSchedule(
              sched.schedule
            );

            return {
              id: sched.schedule,
              name: sched.scheduleName,
              eventCount: eventsResp[0]?.event?.length || 0,
              taskCount: tasksResp[0]?.task?.length || 0,
            };
          } catch (err) {
            console.error("Error loading schedule details:", err);
            return {
              id: sched.schedule,
              name: sched.scheduleName,
              eventCount: 0,
              taskCount: 0,
            };
          }
        })
      );

      userSchedules.value = scheduleDetails;
    } else {
      // User has no schedules - automatically create one
      console.log("No schedules found for user, creating default schedule...");
      await autoCreateAndSelectSchedule();
    }
  } catch (err) {
    console.error("Error loading schedules:", err);

    // If the error is "No schedule found", auto-create one
    if (err.message && err.message.includes("No schedule found")) {
      console.log("No schedules exist for user, creating default schedule...");
      await autoCreateAndSelectSchedule();
    } else {
      error.value = err.message || "Failed to load schedules";
      loading.value = false;
    }
  }
};

// Automatically create a schedule for new users and select it
const autoCreateAndSelectSchedule = async () => {
  // loading is already true from loadUserSchedules
  try {
    console.log("Auto-creating schedule for user:", currentUser.value);
    const response = await scheduleGeneratorService.initializeSchedule(
      currentUser.value
    );

    if (response.schedule) {
      console.log("Schedule created successfully:", response.schedule);
      // Automatically select the newly created schedule
      await handleSelectSchedule(response.schedule);
      // Note: handleSelectSchedule will set loading to false
    } else {
      throw new Error("Failed to create schedule - no schedule ID returned");
    }
  } catch (err) {
    console.error("Error auto-creating schedule:", err);
    error.value = err.message || "Failed to create initial schedule";
    loading.value = false;
  }
};

// Create a new schedule
const handleCreateSchedule = async () => {
  creating.value = true;
  error.value = null;

  try {
    const response = await scheduleGeneratorService.initializeSchedule(
      currentUser.value
    );

    // Reload schedules list
    await loadUserSchedules();

    // Clear the input
    newScheduleName.value = "";

    // Optionally auto-select the new schedule
    if (response.schedule) {
      await handleSelectSchedule(response.schedule);
    }
  } catch (err) {
    console.error("Error creating schedule:", err);
    error.value = err.message || "Failed to create schedule";
  } finally {
    creating.value = false;
  }
};

// Select a schedule and navigate to schedule manager
const handleSelectSchedule = async (scheduleId) => {
  loading.value = true;
  error.value = null;

  try {
    // Load the selected schedule into the store
    await scheduleStore.selectSchedule(scheduleId);

    // Emit event to notify parent component
    emit("schedule-selected");
  } catch (err) {
    console.error("Error selecting schedule:", err);
    error.value = err.message || "Failed to select schedule";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadUserSchedules();
});
</script>

<style scoped>
.schedule-selection {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.selection-header {
  text-align: center;
  margin-bottom: 3rem;
}

.selection-header h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.selection-header p {
  color: #666;
  font-size: 1.1rem;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
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

.error-message {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-button:hover {
  background-color: #c82333;
}

.selection-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.create-schedule-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.create-schedule-section h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.create-form {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.create-form input {
  flex: 1;
  min-width: 250px;
  padding: 0.75rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
}

.create-form input:focus {
  outline: none;
  border-color: white;
  background: white;
}

.create-button {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.create-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.schedules-list h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
}

.empty-state p {
  margin: 0.5rem 0;
}

.schedules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.schedule-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.schedule-card:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.schedule-card-header {
  margin-bottom: 1rem;
}

.schedule-card-header h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
}

.schedule-id {
  font-size: 0.85rem;
  color: #666;
  font-family: monospace;
}

.schedule-card-info {
  margin-bottom: 1.5rem;
  color: #555;
}

.schedule-card-info p {
  margin: 0.5rem 0;
  font-size: 0.95rem;
}

.select-button {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.select-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
  .schedule-selection {
    padding: 1rem;
  }

  .selection-header h2 {
    font-size: 1.5rem;
  }

  .create-form {
    flex-direction: column;
  }

  .create-form input {
    min-width: 100%;
  }

  .schedules-grid {
    grid-template-columns: 1fr;
  }
}
</style>
