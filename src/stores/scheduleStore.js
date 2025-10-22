import { defineStore } from "pinia";

export const useScheduleStore = defineStore("schedule", {
  state: () => ({
    events: [],
    tasks: [],
    nextEventId: 1,
    nextTaskId: 1,
    loading: false,
    error: null,
    generatedSchedule: [],
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
    // Initialize schedule for a new user
    initializeSchedule() {
      this.events = [];
      this.tasks = [];
      this.nextEventId = 1;
      this.nextTaskId = 1;
      this.error = null;
    },

    // Add a new event
    addEvent(eventData) {
      const newEvent = {
        id: this.nextEventId++,
        name: eventData.name,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        repeat: eventData.repeat || { frequency: "none", daysOfWeek: [] },
        createdAt: new Date().toISOString(),
      };

      this.events.push(newEvent);
      return newEvent;
    },

    // Edit an existing event
    editEvent(eventId, eventData) {
      const eventIndex = this.events.findIndex((event) => event.id === eventId);
      if (eventIndex !== -1) {
        this.events[eventIndex] = {
          ...this.events[eventIndex],
          name: eventData.name,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          repeat: eventData.repeat || { frequency: "none", daysOfWeek: [] },
          updatedAt: new Date().toISOString(),
        };
        return this.events[eventIndex];
      }
      throw new Error("Event not found");
    },

    // Delete an event
    deleteEvent(eventId) {
      const eventIndex = this.events.findIndex((event) => event.id === eventId);
      if (eventIndex !== -1) {
        this.events.splice(eventIndex, 1);
        return true;
      }
      throw new Error("Event not found");
    },

    // Add a new task
    addTask(taskData) {
      const newTask = {
        id: this.nextTaskId++,
        name: taskData.name,
        deadline: taskData.deadline,
        expectedCompletionTime: taskData.expectedCompletionTime,
        completionLevel: taskData.completionLevel || 0,
        priority: taskData.priority,
        createdAt: new Date().toISOString(),
      };

      this.tasks.push(newTask);
      return newTask;
    },

    // Edit an existing task
    editTask(taskId, taskData) {
      const taskIndex = this.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = {
          ...this.tasks[taskIndex],
          name: taskData.name,
          deadline: taskData.deadline,
          expectedCompletionTime: taskData.expectedCompletionTime,
          completionLevel: taskData.completionLevel,
          priority: taskData.priority,
          updatedAt: new Date().toISOString(),
        };
        return this.tasks[taskIndex];
      }
      throw new Error("Task not found");
    },

    // Delete a task
    deleteTask(taskId) {
      const taskIndex = this.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        this.tasks.splice(taskIndex, 1);
        return true;
      }
      throw new Error("Task not found");
    },

    // Update task completion level
    updateTaskCompletion(taskId, completionLevel) {
      const taskIndex = this.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        this.tasks[taskIndex].completionLevel = Math.max(
          0,
          Math.min(100, completionLevel)
        );
        this.tasks[taskIndex].updatedAt = new Date().toISOString();
        return this.tasks[taskIndex];
      }
      throw new Error("Task not found");
    },

    // Clear error
    clearError() {
      this.error = null;
    },

    // Set error
    setError(errorMessage) {
      this.error = errorMessage;
    },

    // Generate schedule using greedy algorithm
    generateSchedule() {
      try {
        this.clearError();

        const schedule = [];
        const activeHours = { start: 9, end: 18 }; // 9 AM to 6 PM

        // Helper function to check if two time slots overlap
        const hasOverlap = (start1, end1, start2, end2) => {
          return start1 < end2 && start2 < end1;
        };

        // Helper function to check if a time slot conflicts with existing items
        const hasConflict = (startTime, endTime, existingItems) => {
          return existingItems.some((item) =>
            hasOverlap(
              new Date(item.scheduledStartTime).getTime(),
              new Date(item.scheduledEndTime).getTime(),
              startTime,
              endTime
            )
          );
        };

        // Helper function to find next available slot
        const findAvailableSlot = (durationMinutes, date, existingItems) => {
          const startOfDay = new Date(date);
          startOfDay.setHours(activeHours.start, 0, 0, 0);

          const endOfDay = new Date(date);
          endOfDay.setHours(activeHours.end, 0, 0, 0);

          // Try every 15-minute interval
          for (
            let time = startOfDay.getTime();
            time < endOfDay.getTime();
            time += 15 * 60 * 1000
          ) {
            const slotStart = time;
            const slotEnd = time + durationMinutes * 60 * 1000;

            // Check if this slot fits within active hours
            if (slotEnd <= endOfDay.getTime()) {
              // Check if this slot conflicts with existing items
              if (!hasConflict(slotStart, slotEnd, existingItems)) {
                return {
                  start: slotStart,
                  end: slotEnd,
                };
              }
            }
          }

          return null; // No available slot found
        };

        // Process events first (they have fixed times)
        this.events.forEach((event) => {
          const startTime = new Date(event.startTime);
          const endTime = new Date(event.endTime);

          // Handle repeating events
          if (event.repeat.frequency !== "none") {
            const occurrences = this.generateEventOccurrences(event);
            occurrences.forEach((occurrence) => {
              schedule.push({
                id: `${event.id}-${occurrence.date}`,
                originalId: event.id,
                type: "event",
                name: event.name,
                scheduledStartTime: occurrence.startTime,
                scheduledEndTime: occurrence.endTime,
                ...event,
              });
            });
          } else {
            // Single event
            schedule.push({
              id: `${event.id}`,
              originalId: event.id,
              type: "event",
              name: event.name,
              scheduledStartTime: event.startTime,
              scheduledEndTime: event.endTime,
              ...event,
            });
          }
        });

        // Process tasks (schedule them around events)
        const tasksToSchedule = this.tasks
          .filter((task) => task.completionLevel < 100) // Only schedule incomplete tasks
          .sort((a, b) => {
            // Sort by deadline first, then by priority
            const deadlineA = new Date(a.deadline);
            const deadlineB = new Date(b.deadline);

            if (deadlineA.getTime() !== deadlineB.getTime()) {
              return deadlineA - deadlineB;
            }

            return b.priority - a.priority;
          });

        tasksToSchedule.forEach((task) => {
          const deadline = new Date(task.deadline);
          const durationMinutes = task.expectedCompletionTime;

          // Try to schedule the task before its deadline
          const startDate = new Date();
          startDate.setHours(0, 0, 0, 0);

          const endDate = new Date(deadline);
          endDate.setHours(23, 59, 59, 999);

          // Try each day from today until deadline
          for (
            let date = new Date(startDate);
            date <= endDate;
            date.setDate(date.getDate() + 1)
          ) {
            const dateString = date.toDateString();
            const existingItems = schedule.filter(
              (item) =>
                new Date(item.scheduledStartTime).toDateString() === dateString
            );

            const slot = findAvailableSlot(
              durationMinutes,
              date,
              existingItems
            );

            if (slot) {
              schedule.push({
                id: `task-${task.id}`,
                originalId: task.id,
                type: "task",
                name: task.name,
                scheduledStartTime: new Date(slot.start).toISOString(),
                scheduledEndTime: new Date(slot.end).toISOString(),
                ...task,
              });
              break; // Task scheduled successfully
            }
          }
        });

        // Sort schedule by start time
        schedule.sort(
          (a, b) =>
            new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime)
        );

        this.generatedSchedule = schedule;
        return schedule;
      } catch (error) {
        this.setError(error.message);
        throw error;
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
