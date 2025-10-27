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
    // Select an existing schedule by ID
    async selectSchedule(scheduleId) {
      this.loading = true;
      this.error = null;

      try {
        this.scheduleId = scheduleId;

        // Load events and tasks for this schedule
        await this.loadScheduleData();
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Initialize schedule for a user (creates backend schedule if doesn't exist)
    async initializeSchedule(owner) {
      this.loading = true;
      this.error = null;

      try {
        // Check if user already has a schedule
        const scheduleResponse = await scheduleGeneratorService.getScheduleByOwner(owner);

        if (scheduleResponse && scheduleResponse.length > 0 && scheduleResponse[0].schedule) {
          // User has existing schedule
          this.scheduleId = scheduleResponse[0].schedule;
        } else {
          // Create new schedule for user
          const createResponse = await scheduleGeneratorService.initializeSchedule(owner);
          this.scheduleId = createResponse.schedule;
        }

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
        throw new Error("No schedule initialized");
      }

      this.loading = true;
      try {
        // Get event IDs
        const eventsResponse = await scheduleGeneratorService.getEventsForSchedule(this.scheduleId);
        const eventIds = eventsResponse[0]?.event || [];

        // Get task IDs
        const tasksResponse = await scheduleGeneratorService.getTasksForSchedule(this.scheduleId);
        const taskIds = tasksResponse[0]?.task || [];

        // Fetch details for each event
        const eventPromises = eventIds.map(id => scheduleGeneratorService.getEventDetails(id));
        const eventDetails = await Promise.all(eventPromises);
        this.events = eventDetails.map(resp => ({
          id: resp[0]?.eventDetails?._id,
          ...resp[0]?.eventDetails
        }));

        // Fetch details for each task
        const taskPromises = taskIds.map(id => scheduleGeneratorService.getTaskDetails(id));
        const taskDetails = await Promise.all(taskPromises);
        this.tasks = taskDetails.map(resp => ({
          id: resp[0]?.taskDetails?._id,
          ...resp[0]?.taskDetails
        }));
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
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
        const response = await scheduleGeneratorService.addEvent(
          this.scheduleId,
          eventData.name,
          eventData.startTime,
          eventData.endTime,
          eventData.repeat || { frequency: "NONE", daysOfWeek: [] }
        );

        // Reload schedule data to get the new event
        await this.loadScheduleData();
        return response;
      } catch (error) {
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

        // Reload schedule data to get updated event
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

        // Reload schedule data
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
          taskData.expectedCompletionTime,
          taskData.completionLevel || 0,
          taskData.priority
        );

        // Reload schedule data to get the new task
        await this.loadScheduleData();
        return response;
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
          taskData.expectedCompletionTime,
          taskData.completionLevel,
          taskData.priority
        );

        // Reload schedule data to get updated task
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

        // Reload schedule data
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
      if (!this.scheduleId) {
        throw new Error("No schedule initialized");
      }

      const task = this.tasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error("Task not found");
      }

      this.loading = true;
      this.error = null;

      try {
        await scheduleGeneratorService.editTask(
          this.scheduleId,
          taskId,
          task.name,
          task.deadline,
          task.expectedCompletionTime,
          Math.max(0, Math.min(100, completionLevel)),
          task.priority
        );

        // Reload schedule data
        await this.loadScheduleData();
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Clear error
    clearError() {
      this.error = null;
    },

    // Set error
    setError(errorMessage) {
      this.error = errorMessage;
    },

    // Generate schedule using backend API
    async generateSchedule() {
      if (!this.scheduleId) {
        throw new Error("No schedule initialized");
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await scheduleGeneratorService.generateSchedule(this.scheduleId);
        this.generatedSchedule = response;
        return response;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Generate occurrences for repeating events
    generateEventOccurrences(event) {
      const occurrences = [];
      const startDate = new Date(event.startTime);
      const endDate = new Date(event.endTime);
      const duration = endDate.getTime() - startDate.getTime();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + 7); // Generate for next 7 days

      if (event.repeat.frequency === "daily") {
        for (
          let date = new Date(today);
          date <= endOfWeek;
          date.setDate(date.getDate() + 1)
        ) {
          const occurrenceStart = new Date(date);
          occurrenceStart.setHours(
            startDate.getHours(),
            startDate.getMinutes(),
            0,
            0
          );

          const occurrenceEnd = new Date(occurrenceStart.getTime() + duration);

          occurrences.push({
            date: date.toDateString(),
            startTime: occurrenceStart.toISOString(),
            endTime: occurrenceEnd.toISOString(),
          });
        }
      } else if (event.repeat.frequency === "weekly") {
        const daysOfWeek = event.repeat.daysOfWeek || [];

        for (
          let date = new Date(today);
          date <= endOfWeek;
          date.setDate(date.getDate() + 1)
        ) {
          if (daysOfWeek.includes(date.getDay())) {
            const occurrenceStart = new Date(date);
            occurrenceStart.setHours(
              startDate.getHours(),
              startDate.getMinutes(),
              0,
              0
            );

            const occurrenceEnd = new Date(
              occurrenceStart.getTime() + duration
            );

            occurrences.push({
              date: date.toDateString(),
              startTime: occurrenceStart.toISOString(),
              endTime: occurrenceEnd.toISOString(),
            });
          }
        }
      } else if (event.repeat.frequency === "monthly") {
        // For monthly, just show the original event for now
        occurrences.push({
          date: startDate.toDateString(),
          startTime: event.startTime,
          endTime: event.endTime,
        });
      }

      return occurrences;
    },
  },
});
