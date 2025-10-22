import { ref, computed } from "vue";

// Create a singleton store instance
let storeInstance = null;

export function useSimpleScheduleStore() {
  if (!storeInstance) {
    console.log("Creating new store instance");
    storeInstance = createStore();
  } else {
    console.log("Returning existing store instance");
  }
  return storeInstance;
}

function createStore() {
  // Simple local storage for events and tasks
  const events = ref([]);
  const tasks = ref([]);
  const generatedSchedule = ref([]);
  const loading = ref(false);
  // Events management
  const addEvent = (eventData) => {
    console.log("addEvent called with data:", eventData);
    const newEvent = {
      id: Date.now() + Math.random(), // Simple unique ID
      name: eventData.name,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      description: eventData.description || "",
      date: eventData.date || new Date().toISOString().split("T")[0],
    };
    events.value.push(newEvent);
    console.log("Event added:", newEvent);
    console.log("Events array now has", events.value.length, "events");
    console.log("Events array:", events.value);
    return newEvent;
  };

  const editEvent = (eventId, eventData) => {
    const index = events.value.findIndex((e) => e.id === eventId);
    if (index !== -1) {
      events.value[index] = { ...events.value[index], ...eventData };
      console.log("Event updated:", events.value[index]);
    }
  };

  const deleteEvent = (eventId) => {
    const index = events.value.findIndex((e) => e.id === eventId);
    if (index !== -1) {
      events.value.splice(index, 1);
      console.log("Event deleted:", eventId);
    }
  };

  // Tasks management
  const addTask = (taskData) => {
    const newTask = {
      id: Date.now() + Math.random(), // Simple unique ID
      name: taskData.name,
      estimatedDuration: taskData.estimatedDuration,
      priority: taskData.priority || "medium",
      description: taskData.description || "",
      dueDate: taskData.dueDate || null,
    };
    tasks.value.push(newTask);
    console.log("Task added:", newTask);
    return newTask;
  };

  const editTask = (taskId, taskData) => {
    const index = tasks.value.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...taskData };
      console.log("Task updated:", tasks.value[index]);
    }
  };

  const deleteTask = (taskId) => {
    const index = tasks.value.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      tasks.value.splice(index, 1);
      console.log("Task deleted:", taskId);
    }
  };

  // Simple schedule generation
  const generateSchedule = () => {
    loading.value = true;

    // Simulate processing time
    setTimeout(() => {
      const schedule = [];

      // Sort events by start time
      const sortedEvents = [...events.value].sort(
        (a, b) =>
          new Date(`${a.date} ${a.startTime}`) -
          new Date(`${b.date} ${b.startTime}`)
      );

      // Sort tasks by priority (high, medium, low) and due date
      const sortedTasks = [...tasks.value].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return 0;
      });

      // Add events to schedule
      sortedEvents.forEach((event) => {
        schedule.push({
          type: "event",
          id: event.id,
          name: event.name,
          startTime: event.startTime,
          endTime: event.endTime,
          date: event.date,
          description: event.description,
        });
      });

      // Add tasks to schedule (place them in available time slots)
      const activeHours = { start: "09:00", end: "17:00" }; // 9 AM to 5 PM
      let currentTime = activeHours.start;

      sortedTasks.forEach((task) => {
        const duration = parseInt(task.estimatedDuration) || 60; // Default 1 hour
        const startTime = currentTime;
        const endTime = addMinutesToTime(currentTime, duration);

        // Check if task fits in active hours
        if (isTimeInRange(startTime, activeHours.start, activeHours.end)) {
          schedule.push({
            type: "task",
            id: task.id,
            name: task.name,
            startTime: startTime,
            endTime: endTime,
            duration: duration,
            priority: task.priority,
            description: task.description,
          });

          // Move to next available slot
          currentTime = endTime;
        }
      });

      // Sort final schedule by time
      generatedSchedule.value = schedule.sort((a, b) => {
        const timeA = a.startTime || "00:00";
        const timeB = b.startTime || "00:00";
        return timeA.localeCompare(timeB);
      });

      loading.value = false;
      console.log("Schedule generated:", generatedSchedule.value);
    }, 1000); // 1 second delay to simulate processing
  };

  // Helper functions
  const addMinutesToTime = (time, minutes) => {
    const [hours, mins] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, "0")}:${newMins
      .toString()
      .padStart(2, "0")}`;
  };

  const isTimeInRange = (time, start, end) => {
    return time >= start && time <= end;
  };

  // Computed properties
  const hasEvents = computed(() => events.value.length > 0);
  const hasTasks = computed(() => tasks.value.length > 0);
  const canGenerateSchedule = computed(() => hasEvents.value || hasTasks.value);

  return {
    // State
    events,
    tasks,
    generatedSchedule,
    loading,

    // Computed
    hasEvents,
    hasTasks,
    canGenerateSchedule,

    // Actions
    addEvent,
    editEvent,
    deleteEvent,
    addTask,
    editTask,
    deleteTask,
    generateSchedule,
  };
}
