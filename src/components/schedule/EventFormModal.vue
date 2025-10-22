<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditing ? "Edit Event" : "Add New Event" }}</h2>
        <button @click="closeModal" class="close-button">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="eventName">Event Name:</label>
          <input
            id="eventName"
            v-model="form.name"
            type="text"
            required
            :disabled="loading"
            placeholder="Enter event name"
          />
        </div>

        <div class="form-group">
          <label for="startTime">Start Time:</label>
          <input
            id="startTime"
            v-model="form.startTime"
            type="datetime-local"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="endTime">End Time:</label>
          <input
            id="endTime"
            v-model="form.endTime"
            type="datetime-local"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="repeatFrequency">Repeat:</label>
          <select
            id="repeatFrequency"
            v-model="form.repeat.frequency"
            :disabled="loading"
          >
            <option value="none">No Repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div v-if="form.repeat.frequency === 'weekly'" class="form-group">
          <label>Days of Week:</label>
          <div class="days-selection">
            <label
              v-for="(day, index) in daysOfWeek"
              :key="index"
              class="day-checkbox"
            >
              <input
                type="checkbox"
                :value="index"
                v-model="form.repeat.daysOfWeek"
                :disabled="loading"
              />
              {{ day }}
            </label>
          </div>
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
            {{
              loading ? "Saving..." : isEditing ? "Update Event" : "Add Event"
            }}
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
  eventToEdit: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "event-added", "event-updated"]);

const scheduleStore = useScheduleStore();

const form = ref({
  name: "",
  startTime: "",
  endTime: "",
  repeat: {
    frequency: "none",
    daysOfWeek: [],
  },
});

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const loading = computed(() => scheduleStore.isLoading);
const error = computed(() => scheduleStore.scheduleError);
const isEditing = computed(() => props.eventToEdit !== null);

const isFormValid = computed(() => {
  if (!form.value.name.trim()) return false;
  if (!form.value.startTime || !form.value.endTime) return false;

  const startTime = new Date(form.value.startTime);
  const endTime = new Date(form.value.endTime);

  if (endTime <= startTime) return false;

  return true;
});

const resetForm = () => {
  form.value = {
    name: "",
    startTime: "",
    endTime: "",
    repeat: {
      frequency: "none",
      daysOfWeek: [],
    },
  };
};

const populateForm = (event) => {
  form.value = {
    name: event.name,
    startTime: event.startTime,
    endTime: event.endTime,
    repeat: {
      frequency: event.repeat?.frequency || "none",
      daysOfWeek: event.repeat?.daysOfWeek || [],
    },
  };
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  try {
    scheduleStore.clearError();

    if (isEditing.value) {
      const updatedEvent = scheduleStore.editEvent(
        props.eventToEdit.id,
        form.value
      );
      emit("event-updated", updatedEvent);
    } else {
      const newEvent = scheduleStore.addEvent(form.value);
      emit("event-added", newEvent);
    }

    resetForm();
    closeModal();
  } catch (err) {
    scheduleStore.setError(err.message);
  }
};

const closeModal = () => {
  resetForm();
  scheduleStore.clearError();
  emit("close");
};

// Watch for changes in eventToEdit prop
watch(
  () => props.eventToEdit,
  (newEvent) => {
    if (newEvent) {
      populateForm(newEvent);
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
    if (isOpen && props.eventToEdit) {
      populateForm(props.eventToEdit);
    } else if (!isOpen) {
      resetForm();
    }
  }
);

onMounted(() => {
  // Set default time to current time + 1 hour
  const now = new Date();
  now.setHours(now.getHours() + 1);
  const defaultTime = now.toISOString().slice(0, 16);

  if (!props.eventToEdit) {
    form.value.startTime = defaultTime;
    form.value.endTime = defaultTime;
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

.days-selection {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.day-checkbox {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: normal;
  margin-bottom: 0;
}

.day-checkbox input {
  width: auto;
  margin-right: 0.5rem;
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
  background-color: #007bff;
  color: white;
  border: 1px solid #007bff;
}

.submit-button:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #0056b3;
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

  .days-selection {
    grid-template-columns: repeat(3, 1fr);
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
