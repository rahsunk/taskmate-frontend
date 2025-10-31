import { defineStore } from "pinia";
import { scheduleGeneratorService } from "../services/scheduleGeneratorService.js";

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
    async initializeSchedule(owner) {
      this.loading = true;
      this.error = null;

      try {
        // Get or create schedule for user
        const response = await scheduleGeneratorService.initializeSchedule(
          owner
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
        // Load events - returns array of {event: "id"}
        const eventsResponse =
          await scheduleGeneratorService.getEventsForSchedule(this.scheduleId);

        console.log("Events response:", eventsResponse);

        // Fetch full details for each event

        if (
          Array.isArray(eventsResponse.event) &&
          eventsResponse.event.length > 0
        ) {
          const eventPromises = eventsResponse.event.map((event) =>
            scheduleGeneratorService.getEventDetails(event)
          );
          const eventDetailsArray = await Promise.all(eventPromises);

          // Map event details to include id field for frontend
          this.events = eventDetailsArray.map((detail) => ({
            id: detail.eventDetails[0]._id || detail.eventDetails[0].event,
            ...detail.eventDetails[0],
          }));
        } else {
          this.events = [];
        }

        // Load tasks - returns array of {task: "id"}
        const tasksResponse =
          await scheduleGeneratorService.getTasksForSchedule(this.scheduleId);

        console.log("Tasks response:", tasksResponse);
        // console.log("BRUH");
        // console.log(tasksResponse);

        // Fetch full details for each task
        if (
          Array.isArray(tasksResponse.task) &&
          tasksResponse.task.length > 0
        ) {
          const taskPromises = tasksResponse.task.map((task) =>
            scheduleGeneratorService.getTaskDetails(task)
          );

          const taskDetailsArray = await Promise.all(taskPromises);
          console.log("HERE");
          console.log(taskDetailsArray);

          // Map task details to include id field for frontend
          this.tasks = taskDetailsArray.map((detail) => ({
            id: detail.taskDetails[0]._id || detail.taskDetails[0].task,
            ...detail.taskDetails[0],
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
        console.log("Adding event with data:", eventData);
        const response = await scheduleGeneratorService.addEvent(
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
        await scheduleGeneratorService.editEvent(
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
        await scheduleGeneratorService.deleteEvent(this.scheduleId, eventId);

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
        const response = await scheduleGeneratorService.addTask(
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
        await scheduleGeneratorService.editTask(
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
        await scheduleGeneratorService.deleteTask(this.scheduleId, taskId);

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
        const response = await scheduleGeneratorService.generateSchedule(
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
