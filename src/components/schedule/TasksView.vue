<template>
  <div class="tasks-view">
    <div class="view-header">
      <h3>Tasks</h3>
      <button @click="$emit('add-task')" class="add-button">
        <span class="add-icon">+</span>
        Add Task
      </button>
    </div>

    <div v-if="tasks.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <p>No tasks created yet</p>
      <p class="empty-subtitle">Add your first task to get started!</p>
    </div>

    <div v-else class="tasks-list">
      <div
        v-for="task in sortedTasks"
        :key="task.id"
        class="task-card"
        :class="{
          'completed-task': task.completionLevel === 100,
          'overdue-task': isOverdue(task),
          'urgent-task': task.priority >= 4,
        }"
      >
        <div class="task-header">
          <div class="task-title-section">
            <h4 class="task-name">{{ task.name }}</h4>
            <div class="priority-badge" :class="`priority-${task.priority}`">
              {{ getPriorityLabel(task.priority) }}
            </div>
          </div>
          <div class="task-actions">
            <button
              @click="editTask(task)"
              class="edit-button"
              title="Edit Task"
            >
              ✏️
            </button>
            <button
              @click="deleteTask(task)"
              class="delete-button"
              title="Delete Task"
            >
              🗑️
            </button>
          </div>
        </div>

        <div class="task-details">
          <div class="task-info">
            <div class="info-item">
              <span class="info-label">Deadline:</span>
              <span
                class="info-value"
                :class="{ 'overdue-text': isOverdue(task) }"
              >
                {{ formatDateTime(task.deadline) }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Duration:</span>
              <span class="info-value"
                >{{ task.expectedCompletionTime }} min</span
              >
            </div>
          </div>

          <div class="completion-section">
            <div class="completion-header">
              <span class="completion-label">Progress:</span>
              <span class="completion-percentage"
                >{{ task.completionLevel }}%</span
              >
            </div>
            <div class="completion-bar">
              <div
                class="completion-fill"
                :style="{ width: `${task.completionLevel}%` }"
                :class="{
                  completed: task.completionLevel === 100,
                  'in-progress':
                    task.completionLevel > 0 && task.completionLevel < 100,
                }"
              ></div>
            </div>
            <div class="completion-controls">
              <button
                @click="
                  updateCompletion(task, Math.max(0, task.completionLevel - 25))
                "
                :disabled="task.completionLevel === 0"
                class="completion-button decrease"
              >
                -25%
              </button>
              <button
                @click="
                  updateCompletion(
                    task,
                    Math.min(100, task.completionLevel + 25)
                  )
                "
                :disabled="task.completionLevel === 100"
                class="completion-button increase"
              >
                +25%
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useScheduleStore } from "../../stores/scheduleStore.js";

const emit = defineEmits(["add-task", "edit-task", "delete-task"]);

const scheduleStore = useScheduleStore();

const tasks = computed(() => scheduleStore.allTasks);
const sortedTasks = computed(() => scheduleStore.sortedTasks);

const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  const now = new Date();
  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

const getPriorityLabel = (priority) => {
  const labels = {
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Critical",
    5: "Urgent",
  };
  return labels[priority] || "Unknown";
};

const isOverdue = (task) => {
  const now = new Date();
  const deadline = new Date(task.deadline);
  return deadline < now && task.completionLevel < 100;
};

const updateCompletion = (task, newLevel) => {
  scheduleStore.updateTaskCompletion(task.id, newLevel);
};

const editTask = (task) => {
  emit("edit-task", task);
};

const deleteTask = (task) => {
  if (confirm(`Are you sure you want to delete "${task.name}"?`)) {
    emit("delete-task", task);
  }
};
</script>

<style scoped>
.tasks-view {
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
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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

.tasks-list {
  padding: 1rem;
}

.task-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.2s;
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.task-card.completed-task {
  background: #d4edda;
  border-color: #c3e6cb;
}

.task-card.overdue-task {
  background: #f8d7da;
  border-color: #f5c6cb;
}

.task-card.urgent-task {
  border-left: 4px solid #dc3545;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.task-title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.task-name {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
}

.priority-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.priority-1 {
  background: #e9ecef;
  color: #495057;
}
.priority-2 {
  background: #d1ecf1;
  color: #0c5460;
}
.priority-3 {
  background: #fff3cd;
  color: #856404;
}
.priority-4 {
  background: #f8d7da;
  color: #721c24;
}
.priority-5 {
  background: #f5c6cb;
  color: #721c24;
}

.task-actions {
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

.task-details {
  display: grid;
  gap: 1rem;
}

.task-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.overdue-text {
  color: #dc3545;
  font-weight: 600;
}

.completion-section {
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.completion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.completion-label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.completion-percentage {
  font-size: 0.9rem;
  color: #333;
  font-weight: 600;
}

.completion-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.completion-fill {
  height: 100%;
  background: #6c757d;
  transition: width 0.3s ease;
}

.completion-fill.in-progress {
  background: #007bff;
}

.completion-fill.completed {
  background: #28a745;
}

.completion-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.completion-button {
  padding: 0.25rem 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.completion-button:hover:not(:disabled) {
  background: #f8f9fa;
}

.completion-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.completion-button.decrease:hover:not(:disabled) {
  background: #f8d7da;
  border-color: #f5c6cb;
}

.completion-button.increase:hover:not(:disabled) {
  background: #d4edda;
  border-color: #c3e6cb;
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .task-info {
    grid-template-columns: 1fr;
  }

  .task-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .task-actions {
    align-self: flex-end;
  }

  .task-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
