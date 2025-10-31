<template>
  <div class="schedule-manager">
    <div class="schedule-header">
      <h1>My Schedule</h1>
      <p class="schedule-subtitle">
        Manage your events and tasks to build your perfect schedule
      </p>

      <div class="view-controls">
        <button
          @click="currentView = 'manage'"
          :class="{ active: currentView === 'manage' }"
          class="view-button"
        >
          Manage Events & Tasks
        </button>
        <button
          @click="currentView = 'schedule'"
          :class="{ active: currentView === 'schedule' }"
          class="view-button"
        >
          View Generated Schedule
        </button>
        <button
          @click="generateSchedule"
          :disabled="!canGenerateSchedule"
          class="generate-button"
        >
          🎯 Generate Schedule
        </button>
      </div>
    </div>

    <div class="schedule-content">
      <div v-if="currentView === 'manage'" class="schedule-grid">
        <div class="schedule-column">
          <EventsView
            @add-event="openEventModal"
            @edit-event="editEvent"
            @delete-event="deleteEvent"
          />
        </div>

        <div class="schedule-column">
          <TasksView
            @add-task="openTaskModal"
            @edit-task="editTask"
            @delete-task="deleteTask"
          />
        </div>
      </div>

      <div v-else-if="currentView === 'schedule'" class="schedule-view">
        <GeneratedScheduleView />
      </div>

      <div class="schedule-summary">
        <div class="summary-card">
          <div class="summary-icon">📅</div>
          <div class="summary-content">
            <h4>{{ events.length }}</h4>
            <p>{{ events.length === 1 ? "Event" : "Events" }}</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon">📝</div>
          <div class="summary-content">
            <h4>{{ tasks.length }}</h4>
            <p>{{ tasks.length === 1 ? "Task" : "Tasks" }}</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon">✅</div>
          <div class="summary-content">
            <h4>{{ completedTasks.length }}</h4>
            <p>Completed</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon">⏰</div>
          <div class="summary-content">
            <h4>{{ pendingTasks.length }}</h4>
            <p>Pending</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Modal -->
    <EventFormModal
      :is-open="eventModalOpen"
      :event-to-edit="eventToEdit"
      @close="closeEventModal"
      @event-added="handleEventAdded"
      @event-updated="handleEventUpdated"
    />

    <!-- Task Modal -->
    <TaskFormModal
      :is-open="taskModalOpen"
      :task-to-edit="taskToEdit"
      @close="closeTaskModal"
      @task-added="handleTaskAdded"
      @task-updated="handleTaskUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useScheduleStore } from "../../stores/scheduleStore.js";
import { useAuthStore } from "../../stores/authStore.js";
import EventsView from "./EventsView.vue";
import TasksView from "./TasksView.vue";
import EventFormModal from "./EventFormModal.vue";
import TaskFormModal from "./TaskFormModal.vue";
import GeneratedScheduleView from "./GeneratedScheduleView.vue";

const scheduleStore = useScheduleStore();
const authStore = useAuthStore();

// Modal state
const eventModalOpen = ref(false);
const taskModalOpen = ref(false);
const eventToEdit = ref(null);
const taskToEdit = ref(null);

// View state
const currentView = ref("manage"); // "manage" or "schedule"

// Computed properties
const events = computed(() => scheduleStore.allEvents);
const tasks = computed(() => scheduleStore.allTasks);
const completedTasks = computed(() => scheduleStore.completedTasks);
const pendingTasks = computed(() => scheduleStore.pendingTasks);

const canGenerateSchedule = computed(() => {
  return events.value.length > 0 || tasks.value.length > 0;
});

// Event modal methods
const openEventModal = () => {
  eventToEdit.value = null;
  eventModalOpen.value = true;
};

const closeEventModal = () => {
  eventModalOpen.value = false;
  eventToEdit.value = null;
};

const editEvent = (event) => {
  eventToEdit.value = event;
  eventModalOpen.value = true;
};

const handleEventAdded = (event) => {
  console.log("Event added:", event);
};

const handleEventUpdated = (event) => {
  console.log("Event updated:", event);
};

const deleteEvent = (event) => {
  try {
    scheduleStore.deleteEvent(event.id);
    console.log("Event deleted:", event.name);
  } catch (error) {
    console.error("Error deleting event:", error);
  }
};

// Task modal methods
const openTaskModal = () => {
  taskToEdit.value = null;
  taskModalOpen.value = true;
};

const closeTaskModal = () => {
  taskModalOpen.value = false;
  taskToEdit.value = null;
};

const editTask = (task) => {
  taskToEdit.value = task;
  taskModalOpen.value = true;
};

const handleTaskAdded = (task) => {
  console.log("Task added:", task);
};

const handleTaskUpdated = (task) => {
  console.log("Task updated:", task);
};

const deleteTask = (task) => {
  try {
    scheduleStore.deleteTask(task.id);
    console.log("Task deleted:", task.name);
  } catch (error) {
    console.error("Error deleting task:", error);
  }
};

// Generate schedule
const generateSchedule = async () => {
  try {
    await scheduleStore.generateSchedule();
    currentView.value = "schedule";
    console.log("Schedule generated successfully");
  } catch (error) {
    console.error("Error generating schedule:", error);
  }
};

onMounted(async () => {
  // Initialize schedule every time component is rendered
  console.log("ScheduleManager mounted");
  const currentUser = authStore.currentUser;
  console.log("Current user:", currentUser);

  if (!currentUser) {
    console.error("No user logged in when ScheduleManager mounted");
    return;
  }

  try {
    console.log("Initializing schedule for user:", currentUser);
    await scheduleStore.initializeSchedule(currentUser);
    console.log("Schedule initialized, scheduleId:", scheduleStore.scheduleId);
  } catch (error) {
    console.error("Error initializing schedule in ScheduleManager:", error);
  }
});
</script>

<style scoped>
.schedule-manager {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.schedule-header {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.schedule-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.schedule-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.view-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.view-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.view-button:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  filter: brightness(1.5);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
}

.view-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.generate-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.generate-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #218838, #1ea085);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.6);
}

.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: gray;
  border-color: rgba(255, 255, 255, 0.2);
}

.schedule-view {
  margin-bottom: 2rem;
}

.schedule-content {
  max-width: 1800px;
  margin: 0 auto;
}

.schedule-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.schedule-column {
  min-height: 400px;
}

.schedule-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-4px);
}

.summary-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.summary-content h4 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.summary-content p {
  margin: 0.25rem 0 0 0;
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 1200px) {
  .schedule-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .schedule-manager {
    padding: 1rem;
  }

  .schedule-header h1 {
    font-size: 2rem;
  }

  .schedule-subtitle {
    font-size: 1rem;
  }

  .schedule-grid {
    gap: 1rem;
  }

  .schedule-summary {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .summary-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .summary-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .summary-content h4 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .schedule-summary {
    grid-template-columns: 1fr;
  }
}
</style>
