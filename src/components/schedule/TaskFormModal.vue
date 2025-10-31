<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditing ? "Edit Task" : "Add New Task" }}</h2>
        <button @click="closeModal" class="close-button">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="taskName">Task Name:</label>
          <input
            id="taskName"
            v-model="form.name"
            type="text"
            required
            :disabled="loading"
            placeholder="Enter task name"
          />
        </div>

        <div class="form-group">
          <label for="deadline">Deadline:</label>
          <input
            id="deadline"
            v-model="form.deadline"
            type="datetime-local"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="expectedCompletionTime"
            >Expected Completion Time (minutes):</label
          >
          <input
            id="expectedCompletionTime"
            v-model.number="form.expectedCompletionTime"
            type="number"
            min="1"
            required
            :disabled="loading"
            placeholder="e.g., 60"
          />
        </div>

        <div class="form-group">
          <label for="completionLevel">Completion Level (%):</label>
          <input
            id="completionLevel"
            v-model.number="form.completionLevel"
            type="number"
            min="0"
            max="100"
            required
            :disabled="loading"
            placeholder="0-100"
          />
          <div class="completion-slider">
            <input
              type="range"
              min="0"
              max="100"
              v-model.number="form.completionLevel"
              :disabled="loading"
              class="slider"
            />
            <div class="slider-labels">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="priority">Priority Level:</label>
          <select
            id="priority"
            v-model.number="form.priority"
            required
            :disabled="loading"
          >
            <option value="1">Low (1)</option>
            <option value="2">Medium (2)</option>
            <option value="3">High (3)</option>
            <option value="4">Critical (4)</option>
            <option value="5">Urgent (5)</option>
          </select>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-actions">
          <button
            type="button"
            @click="closeModal"
            :disabled="loading"
            class="cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="submit-button"
          >
            {{ loading ? "Saving..." : isEditing ? "Update Task" : "Add Task" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useScheduleStore } from "../../stores/scheduleStore.js";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  taskToEdit: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "task-added", "task-updated"]);

const scheduleStore = useScheduleStore();

const form = ref({
  name: "",
  deadline: "",
  expectedCompletionTime: 60,
  completionLevel: 0,
  priority: 3,
});

const loading = computed(() => scheduleStore.isLoading);
const error = computed(() => scheduleStore.scheduleError);
const isEditing = computed(() => props.taskToEdit !== null);

const isFormValid = computed(() => {
  if (!form.value.name.trim()) return false;
  if (!form.value.deadline) return false;
  if (
    !form.value.expectedCompletionTime ||
    form.value.expectedCompletionTime < 1
  )
    return false;
  if (form.value.completionLevel < 0 || form.value.completionLevel > 100)
    return false;
  if (form.value.priority < 1 || form.value.priority > 5) return false;

  return true;
});

const resetForm = () => {
  form.value = {
    name: "",
    deadline: "",
    expectedCompletionTime: 60,
    completionLevel: 0,
    priority: 3,
  };
};

const populateForm = (task) => {
  form.value = {
    name: task.name,
    deadline: task.deadline,
    expectedCompletionTime: task.expectedCompletionTime,
    completionLevel: task.completionLevel,
    priority: task.priority,
  };
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  try {
    scheduleStore.clearError();

    console.log("TaskFormModal: Submitting task");
    console.log("Schedule ID:", scheduleStore.scheduleId);
    console.log("Form data:", form.value);

    if (isEditing.value) {
      await scheduleStore.editTask(
        props.taskToEdit.id,
        form.value
      );
      emit("task-updated");
    } else {
      const newTask = await scheduleStore.addTask(form.value);
      emit("task-added", newTask);
    }

    resetForm();
    closeModal();
  } catch (err) {
    console.error("Error submitting task:", err);
    scheduleStore.setError(err.message);
  }
};

const closeModal = () => {
  resetForm();
  scheduleStore.clearError();
  emit("close");
};

// Watch for changes in taskToEdit prop
watch(
  () => props.taskToEdit,
  (newTask) => {
    if (newTask) {
      populateForm(newTask);
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

// Watch for modal open/close
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && props.taskToEdit) {
      populateForm(props.taskToEdit);
    } else if (!isOpen) {
      resetForm();
    }
  }
);

onMounted(() => {
  // Set default deadline to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(17, 0, 0, 0); // 5 PM tomorrow
  const defaultDeadline = tomorrow.toISOString().slice(0, 16);

  if (!props.taskToEdit) {
    form.value.deadline = defaultDeadline;
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #000;
}

form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

input,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus,
select:focus {
  outline: none;
  border-color: #007bff;
}

input:disabled,
select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.completion-slider {
  margin-top: 0.5rem;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: none;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #666;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.cancel-button,
.submit-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
  border: 1px solid #6c757d;
}

.cancel-button:hover:not(:disabled) {
  background-color: #5a6268;
  border-color: #5a6268;
}

.submit-button {
  background-color: #28a745;
  color: white;
  border: 1px solid #28a745;
}

.submit-button:hover:not(:disabled) {
  background-color: #218838;
  border-color: #218838;
}

.cancel-button:disabled,
.submit-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
  }
}
</style>
