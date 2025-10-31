<template>
  <div class="generated-schedule-view">
    <div class="schedule-header">
      <h2>Generated Schedule</h2>
      <p class="schedule-description">
        Your optimized schedule with events and tasks arranged to avoid
        conflicts
      </p>
    </div>

    <div v-if="!hasSchedule" class="no-schedule">
      <div class="no-schedule-icon">📅</div>
      <p>No schedule generated yet</p>
      <p class="no-schedule-subtitle">
        Add some events and tasks, then click "Generate Schedule"
      </p>
    </div>

    <div v-else class="schedule-container">
      <div class="schedule-grid">
        <!-- Time column header -->
        <div class="time-column">
          <div class="time-header">Time</div>
          <div
            v-for="hour in activeHours"
            :key="hour"
            class="time-slot"
            :class="{ 'current-hour': isCurrentHour(hour) }"
          >
            {{ formatHour(hour) }}
          </div>
        </div>

        <!-- Day columns -->
        <div
          v-for="day in scheduleDays"
          :key="day.date"
          class="day-column"
          :class="{ today: isToday(day.date) }"
        >
          <div class="day-header">
            <div class="day-name">{{ day.name }}</div>
            <div class="day-date">{{ formatDate(day.date) }}</div>
          </div>

          <div class="day-slots">
            <div
              v-for="hour in activeHours"
              :key="`${day.date}-${hour}`"
              class="time-slot"
              :class="{ 'current-hour': isCurrentHour(hour) }"
            >
              <div
                v-for="item in getItemsForSlot(day.date, hour)"
                :key="item.id"
                class="schedule-item"
                :class="[
                  `item-type-${item.type}`,
                  { overdue: item.type === 'task' && isOverdue(item) },
                ]"
                :style="getItemStyle(item)"
                :title="getItemTooltip(item)"
              >
                <div class="item-name">{{ item.name }}</div>
                <div class="item-time">
                  {{
                    formatTimeRange(
                      item.scheduledStartTime,
                      item.scheduledEndTime
                    )
                  }}
                </div>
                <div v-if="item.type === 'task'" class="item-priority">
                  Priority: {{ item.priority }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="schedule-legend">
        <div class="legend-item">
          <div class="legend-color event-color"></div>
          <span>Events</span>
        </div>
        <div class="legend-item">
          <div class="legend-color task-color"></div>
          <span>Tasks</span>
        </div>
        <div class="legend-item">
          <div class="legend-color overdue-color"></div>
          <span>Overdue Tasks</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useScheduleStore } from "../../stores/scheduleStore.js";

const scheduleStore = useScheduleStore();

const activeHours = computed(() => {
  // All 24 hours (0 to 23 in 24-hour format)
  return Array.from({ length: 24 }, (_, i) => i);
});

const hasSchedule = computed(() => {
  return (
    scheduleStore.generatedSchedule &&
    scheduleStore.generatedSchedule.length > 0
  );
});

const scheduleDays = computed(() => {
  if (!hasSchedule.value) return [];

  const days = new Map();
  const today = new Date();

  // Get all unique dates from the schedule
  scheduleStore.generatedSchedule.forEach((item) => {
    const date = new Date(item.scheduledStartTime);
    const dateKey = date.toDateString();

    if (!days.has(dateKey)) {
      days.set(dateKey, {
        date: dateKey,
        name: date.toLocaleDateString("en-US", { weekday: "short" }),
        fullDate: new Date(date),
      });
    }
  });

  // Convert to array and sort by date
  return Array.from(days.values()).sort((a, b) => a.fullDate - b.fullDate);
});

const formatHour = (hour) => {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:00 ${period}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const formatTimeRange = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return `${formatTime(start)} - ${formatTime(end)}`;
};

const isCurrentHour = (hour) => {
  const now = new Date();
  return now.getHours() === hour;
};

const isToday = (dateString) => {
  const today = new Date();
  const date = new Date(dateString);
  return date.toDateString() === today.toDateString();
};

const isOverdue = (task) => {
  const now = new Date();
  const deadline = new Date(task.deadline);
  return deadline < now && task.completionLevel < 100;
};

const getItemsForSlot = (date, hour) => {
  if (!hasSchedule.value) return [];

  return scheduleStore.generatedSchedule.filter((item) => {
    const itemDate = new Date(item.scheduledStartTime);
    const itemHour = itemDate.getHours();
    const itemDateString = itemDate.toDateString();

    return itemDateString === date && itemHour === hour;
  });
};

const getItemStyle = (item) => {
  const startTime = new Date(item.scheduledStartTime);
  const endTime = new Date(item.scheduledEndTime);

  const startMinutes = startTime.getMinutes();
  const durationMinutes = (endTime - startTime) / (1000 * 60);

  const topPercent = (startMinutes / 60) * 100;
  const heightPercent = (durationMinutes / 60) * 100;

  return {
    top: `${topPercent}%`,
    height: `${heightPercent}%`,
  };
};

const getItemTooltip = (item) => {
  const details = [
    `Name: ${item.name}`,
    `Time: ${formatTimeRange(item.scheduledStartTime, item.scheduledEndTime)}`,
  ];

  if (item.type === "task") {
    details.push(`Priority: ${item.priority}`);
    details.push(`Completion: ${item.completionLevel}%`);
    if (isOverdue(item)) {
      details.push("⚠️ OVERDUE");
    }
  } else {
    details.push(`Type: Event`);
    if (item.repeat && item.repeat.frequency !== "none") {
      details.push(`Repeats: ${item.repeat.frequency}`);
    }
  }

  return details.join("\n");
};
</script>

<style scoped>
.generated-schedule-view {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.schedule-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%);
  color: white;
  text-align: center;
}

.schedule-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
}

.schedule-description {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
}

.no-schedule {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #666;
}

.no-schedule-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-schedule-subtitle {
  font-size: 0.9rem;
  color: #999;
  margin-top: 0.5rem;
}

.schedule-container {
  padding: 1rem;
}

.schedule-grid {
  display: grid;
  grid-template-columns: 80px repeat(auto-fit, minmax(50px, 1fr));
  gap: 1px;
  background: #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.time-column {
  background: #f8f9fa;
}

.time-header {
  background: #6f42c1;
  color: white;
  padding: 1rem;
  font-weight: 600;
  text-align: center;
}

.time-slot {
  height: 60px;
  padding: 0.5rem;
  background: white;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 500;
  color: #333;
}

.time-slot.current-hour {
  background: #fff3cd;
  border-left: 3px solid #ffc107;
  color: #856404;
}

.day-column {
  background: white;
}

.day-column.today {
  background: #f8f9fa;
  border-left: 3px solid #007bff;
}

.day-header {
  background: #6f42c1;
  color: white;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
}

.day-name {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.day-date {
  font-size: 0.8rem;
  opacity: 0.9;
}

.day-slots {
  position: relative;
}

.day-slots .time-slot {
  position: relative;
  border-right: 1px solid #e9ecef;
}

.schedule-item {
  position: absolute;
  left: 2px;
  right: 2px;
  padding: 0.25rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: white;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.schedule-item:hover {
  transform: scale(1.02);
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.item-type-event {
  background: linear-gradient(135deg, #007bff, #0056b3);
}

.item-type-task {
  background: linear-gradient(135deg, #28a745, #1e7e34);
}

.schedule-item.overdue {
  background: linear-gradient(135deg, #dc3545, #c82333);
}

.item-name {
  font-weight: 600;
  margin-bottom: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
}

.item-time {
  font-size: 0.7rem;
  opacity: 0.95;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
}

.item-priority {
  font-size: 0.65rem;
  opacity: 0.9;
  margin-top: 0.125rem;
  color: white;
}

.schedule-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.event-color {
  background: linear-gradient(135deg, #007bff, #0056b3);
}

.task-color {
  background: linear-gradient(135deg, #28a745, #1e7e34);
}

.overdue-color {
  background: linear-gradient(135deg, #dc3545, #c82333);
}

@media (max-width: 768px) {
  .schedule-grid {
    grid-template-columns: 60px repeat(auto-fit, minmax(150px, 1fr));
  }

  .time-slot {
    height: 50px;
    font-size: 0.7rem;
  }

  .schedule-item {
    font-size: 0.7rem;
  }

  .schedule-legend {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
