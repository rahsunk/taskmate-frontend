<template>
  <div class="events-view">
    <div class="view-header">
      <h3>Events</h3>
      <button @click="$emit('add-event')" class="add-button">
        <span class="add-icon">+</span>
        Add Event
      </button>
    </div>

    <div v-if="events.length === 0" class="empty-state">
      <div class="empty-icon">📅</div>
      <p>No events scheduled yet</p>
      <p class="empty-subtitle">Add your first event to get started!</p>
    </div>

    <div v-else class="events-list">
      <div
        v-for="event in sortedEvents"
        :key="event.id"
        class="event-card"
        :class="{ 'past-event': isPastEvent(event) }"
      >
        <div class="event-header">
          <h4 class="event-name">{{ event.name }}</h4>
          <div class="event-actions">
            <button
              @click="editEvent(event)"
              class="edit-button"
              title="Edit Event"
            >
              ✏️
            </button>
            <button
              @click="deleteEvent(event)"
              class="delete-button"
              title="Delete Event"
            >
              🗑️
            </button>
          </div>
        </div>

        <div class="event-details">
          <div class="time-info">
            <div class="time-item">
              <span class="time-label">Start:</span>
              <span class="time-value">{{
                formatDateTime(event.startTime)
              }}</span>
            </div>
            <div class="time-item">
              <span class="time-label">End:</span>
              <span class="time-value">{{
                formatDateTime(event.endTime)
              }}</span>
            </div>
          </div>

          <div v-if="event.repeat.frequency !== 'none'" class="repeat-info">
            <span class="repeat-label">Repeats:</span>
            <span class="repeat-value">{{ formatRepeat(event.repeat) }}</span>
          </div>

          <div class="duration-info">
            <span class="duration-label">Duration:</span>
            <span class="duration-value">{{
              getDuration(event.startTime, event.endTime)
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useScheduleStore } from "../../stores/scheduleStore.js";

const emit = defineEmits(["add-event", "edit-event", "delete-event"]);

const scheduleStore = useScheduleStore();

const events = computed(() => scheduleStore.allEvents);
const sortedEvents = computed(() => scheduleStore.sortedEvents);

const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatRepeat = (repeat) => {
  if (repeat.frequency === "none") return "No repeat";

  if (repeat.frequency === "daily") return "Daily";
  if (repeat.frequency === "weekly") {
    if (repeat.daysOfWeek && repeat.daysOfWeek.length > 0) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const selectedDays = repeat.daysOfWeek.map((day) => days[day]).join(", ");
      return `Weekly (${selectedDays})`;
    }
    return "Weekly";
  }
  if (repeat.frequency === "monthly") return "Monthly";

  return repeat.frequency;
};

const getDuration = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  }
  return `${diffMinutes}m`;
};

const isPastEvent = (event) => {
  const now = new Date();
  const eventEnd = new Date(event.endTime);
  return eventEnd < now;
};

const editEvent = (event) => {
  emit("edit-event", event);
};

const deleteEvent = (event) => {
  if (confirm(`Are you sure you want to delete "${event.name}"?`)) {
    emit("delete-event", event);
  }
};
</script>

<style scoped>
.events-view {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.view-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.add-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.add-button:hover {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
}

.add-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0.5rem 0;
}

.empty-subtitle {
  font-size: 0.9rem;
  color: #999;
}

.events-list {
  padding: 1rem;
}

.event-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.2s;
}

.event-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.event-card.past-event {
  opacity: 0.6;
  background: #f1f3f4;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.event-name {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-button,
.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  font-size: 1rem;
}

.edit-button:hover {
  background: rgba(0, 123, 255, 0.1);
}

.delete-button:hover {
  background: rgba(220, 53, 69, 0.1);
}

.event-details {
  display: grid;
  gap: 0.5rem;
}

.time-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.time-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time-label,
.repeat-label,
.duration-label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.time-value,
.repeat-value,
.duration-value {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.repeat-info,
.duration-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .time-info {
    grid-template-columns: 1fr;
  }

  .event-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .event-actions {
    align-self: flex-end;
  }
}
</style>
