import { defineStore } from "pinia";
import { scheduleGeneratorService } from "../services/scheduleGeneratorService.js";
import { useAuthStore } from "./authStore.js";

export const useScheduleStore = defineStore("schedule", {
  state: () => ({
    scheduleId: null, // Backend schedule ID
    events: [],
    tasks: [],
    loading: false,
    error: null,
    generatedSchedule: null,
  }),

  getters: {
    allEvents: (state) => state.events,
    allTasks: (state) => state.tasks,
    isLoading: (state) => state.loading,
    scheduleError: (state) => state.error,

    // Get events sorted by start time
    sortedEvents: (state) => {
      return [...state.events].sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      );
    },

    // Get tasks sorted by deadline and priority
    sortedTasks: (state) => {
      return [...state.tasks].sort((a, b) => {
        // First by deadline
        const deadlineA = new Date(a.deadline);
        const deadlineB = new Date(b.deadline);
        if (deadlineA !== deadlineB) {
          return deadlineA - deadlineB;
        }
        // Then by priority (higher priority first)
        return b.priority - a.priority;
      });
    },

    // Get tasks by completion level
    completedTasks: (state) =>
      state.tasks.filter((task) => task.completionLevel === 100),
    pendingTasks: (state) =>
      state.tasks.filter((task) => task.completionLevel < 100),

    // Generated schedule
    schedule: (state) => state.generatedSchedule,
  },

  actions: {
    // Initialize schedule for a user (gets or creates backend schedule)
    async initializeSchedule() {
      this.loading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        const session = authStore.currentSession;

        if (!session) {
          throw new Error("No active session");
        }

        // Get or create schedule for user (session determines owner)
        const response = await scheduleGeneratorService.initializeSchedule(
          session
        );
        this.scheduleId = response.schedule;

        // Load events and tasks for this schedule
        await this.loadScheduleData();
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Load events and tasks from backend
    async loadScheduleData() {
      if (!this.scheduleId) {
        throw new Error("No schedule ID set");
      }

      try {
        const authStore = useAuthStore();
        const session = authStore.currentSession;

        if (!session) {
          throw new Error("No active session");
        }

        // Load events - now returns { events: [EventDoc, EventDoc, ...] }
        const eventsResponse =
          await scheduleGeneratorService.getEventsForSchedule(
            session,
            this.scheduleId
          );

        console.log("Events response:", eventsResponse);

        // Process events array directly - each item is a full EventDoc
        if (Array.isArray(eventsResponse.events) && eventsResponse.events.length > 0) {
          this.events = eventsResponse.events.map((eventDoc) => ({
            id: eventDoc._id,
            ...eventDoc,
            // Ensure repeat property exists with default value
            repeat: eventDoc.repeat || { frequency: "NONE", daysOfWeek: [] },
          }));
        } else {
          this.events = [];
        }

        // Load tasks - now returns { tasks: [TaskDoc, TaskDoc, ...] }
        const tasksResponse =
          await scheduleGeneratorService.getTasksForSchedule(
            session,
            this.scheduleId
          );

        console.log("Tasks response:", tasksResponse);

        // Process tasks array directly - each item is a full TaskDoc
        if (Array.isArray(tasksResponse.tasks) && tasksResponse.tasks.length > 0) {
          this.tasks = tasksResponse.tasks.map((taskDoc) => ({
            id: taskDoc._id,
            ...taskDoc,
          }));
        } else {
          this.tasks = [];
        }

        console.log("Loaded events:", this.events);
        console.log("Loaded tasks:", this.tasks);
      } catch (error) {
        console.error("Error loading schedule data:", error);
        this.error = error.message;
        throw error;
      }
    },

    // Add a new event
    async addEvent(eventData) {
      if (!this.scheduleId) {
        throw new Error("No schedule initialized");
      }

      this.loading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        const session = authStore.currentSession;

        if (!session) {
          throw new Error("No active session");
        }

        console.log("Adding event with data:", eventData);
        const response = await scheduleGeneratorService.addEvent(
          session,
          this.scheduleId,
          eventData.name,
          eventData.startTime,
          eventData.endTime,
          eventData.repeat || { frequency: "NONE", daysOfWeek: [] }
        );
        console.log("Event added, response:", response);

        // Reload events from backend
        console.log("Reloading schedule data...");
        await this.loadScheduleData();
        console.log(
          "Schedule data reloaded, events count:",
          this.events.length
        );

        return response.event;
      } catch (error) {
        console.error("Error in addEvent:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Edit an existing event
    async editEvent(eventId, eventData) {
      if (!this.scheduleId) {
        throw new Error("No schedule initialized");
      }

      this.loading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        const session = authStore.currentSession;

        if (!session) {
          throw new Error("No active session");
        }

        await scheduleGeneratorService.editEvent(
          session,
          this.scheduleId,
          eventId,
          eventData.name,
          eventData.startTime,
          eventData.endTime,
          eventData.repeat || { frequency: "NONE", daysOfWeek: [] }
        );

        // Reload events from backend
        await this.loadScheduleData();
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Delete an event
    async deleteEvent(eventId) {
      if (!this.scheduleId) {
        throw new Error("No schedule initialized");
      }

      this.loading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        const session = authStore.currentSession;

        if (!session) {
          throw new Error("No active session");
        }

        await scheduleGeneratorService.deleteEvent(
          session,
          this.scheduleId,
          eventId
        );

        // Reload events from backend
        await this.loadScheduleData();
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Add a new task
    async addTask(taskData) {
      if (!this.scheduleId) {
        throw new Error("No schedule initialized");
      }

      this.loading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        const session = authStore.currentSession;

        if (!session) {
          throw new Error("No active session");
        }

        const response = await scheduleGeneratorService.addTask(
          session,
          this.scheduleId,
          taskData.name,
          taskData.deadline,
          taskData.expectedCompletionTime || 60,
          taskData.completionLevel || 0,
          taskData.priority || 50
        );

        // Reload tasks from backend
        await this.loadScheduleData();

        return response.task;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Edit an existing task
    async editTask(taskId, taskData) {
      if (!this.scheduleId) {
        throw new Error("No schedule initialized");
      }

      this.loading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        const session = authStore.currentSession;

        if (!session) {
          throw new Error("No active session");
        }

        await scheduleGeneratorService.editTask(
          session,
          this.scheduleId,
          taskId,
          taskData.name,
          taskData.deadline,
          taskData.expectedCompletionTime || 60,
          taskData.completionLevel || 0,
          taskData.priority || 50
        );

        // Reload tasks from backend
        await this.loadScheduleData();
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Delete a task
    async deleteTask(taskId) {
      if (!this.scheduleId) {
        throw new Error("No schedule initialized");
      }

      this.loading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        const session = authStore.currentSession;

        if (!session) {
          throw new Error("No active session");
        }

        await scheduleGeneratorService.deleteTask(
          session,
          this.scheduleId,
          taskId
        );

        // Reload tasks from backend
        await this.loadScheduleData();
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Update task completion level
    async updateTaskCompletion(taskId, completionLevel) {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) {
        throw new Error("Task not found");
      }

      await this.editTask(taskId, {
        ...task,
        completionLevel,
      });
    },

    // Generate schedule
    async generateSchedule() {
      if (!this.scheduleId) {
        throw new Error("No schedule initialized");
      }

      this.loading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        const session = authStore.currentSession;

        if (!session) {
          throw new Error("No active session");
        }

        const response = await scheduleGeneratorService.generateSchedule(
          session,
          this.scheduleId
        );
        this.generatedSchedule = response.generatedPlan || response;
        return this.generatedSchedule;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Helper method to generate event occurrences (for display purposes)
    generateEventOccurrences(event) {
      const occurrences = [];
      const today = new Date();
      const horizon = 14; // 14 days ahead

      for (let i = 0; i < horizon; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        let shouldInclude = false;

        if (event.repeat.frequency === "NONE") {
          const eventDate = new Date(event.startTime);
          if (
            date.getDate() === eventDate.getDate() &&
            date.getMonth() === eventDate.getMonth() &&
            date.getFullYear() === eventDate.getFullYear()
          ) {
            shouldInclude = true;
          }
        } else if (event.repeat.frequency === "DAILY") {
          shouldInclude = true;
        } else if (event.repeat.frequency === "WEEKLY") {
          if (event.repeat.daysOfWeek?.includes(date.getDay())) {
            shouldInclude = true;
          }
        }

        if (shouldInclude) {
          const occurrence = {
            ...event,
            date: date.toISOString(),
          };
          occurrences.push(occurrence);
        }
      }

      return occurrences;
    },

    // Set error message
    setError(message) {
      this.error = message;
    },

    // Clear error message
    clearError() {
      this.error = null;
    },
  },
});
