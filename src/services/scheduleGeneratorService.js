import apiClient from "../config/api.js";

const SCHEDULE_GENERATOR_BASE = "/ScheduleGenerator";

export const scheduleGeneratorService = {
  // Initialize a new schedule
  async initializeSchedule(owner) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/initializeSchedule`,
        {
          owner,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to initialize schedule"
      );
    }
  },

  // Add an event to schedule
  async addEvent(schedule, name, startTime, endTime, repeat) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/addEvent`,
        {
          schedule,
          name,
          startTime,
          endTime,
          repeat,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to add event");
    }
  },

  // Edit an event
  async editEvent(schedule, oldEvent, name, startTime, endTime, repeat) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/editEvent`,
        {
          schedule,
          oldEvent,
          name,
          startTime,
          endTime,
          repeat,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to edit event");
    }
  },

  // Delete an event
  async deleteEvent(schedule, event) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/deleteEvent`,
        {
          schedule,
          event,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to delete event");
    }
  },

  // Add a task to schedule
  async addTask(
    schedule,
    name,
    deadline,
    expectedCompletionTime,
    completionLevel,
    priority
  ) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/addTask`,
        {
          schedule,
          name,
          deadline,
          expectedCompletionTime,
          completionLevel,
          priority,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to add task");
    }
  },

  // Edit a task
  async editTask(
    schedule,
    oldTask,
    name,
    deadline,
    expectedCompletionTime,
    completionLevel,
    priority
  ) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/editTask`,
        {
          schedule,
          oldTask,
          name,
          deadline,
          expectedCompletionTime,
          completionLevel,
          priority,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to edit task");
    }
  },

  // Delete a task
  async deleteTask(schedule, task) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/deleteTask`,
        {
          schedule,
          task,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to delete task");
    }
  },

  // Generate schedule
  async generateSchedule(schedule) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/generateSchedule`,
        {
          schedule,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to generate schedule"
      );
    }
  },

  // Get schedule by owner
  async getScheduleByOwner(owner) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/_getScheduleByOwner`,
        {
          owner,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to get schedule");
    }
  },

  // Get events for schedule
  async getEventsForSchedule(schedule) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/_getEventsForSchedule`,
        {
          schedule,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to get events");
    }
  },

  // Get tasks for schedule
  async getTasksForSchedule(schedule) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/_getTasksForSchedule`,
        {
          schedule,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to get tasks");
    }
  },

  // Get event details
  async getEventDetails(event) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/_getEventDetails`,
        {
          event,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to get event details"
      );
    }
  },

  // Get task details
  async getTaskDetails(task) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/_getTaskDetails`,
        {
          task,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to get task details"
      );
    }
  },
};
