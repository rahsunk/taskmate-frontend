import apiClient from "../config/api.js";

const SCHEDULE_GENERATOR_BASE = "/ScheduleGenerator";

export const scheduleGeneratorService = {
  // Initialize or get existing schedule for a user
  async initializeSchedule(session) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/initializeSchedule`,
        { session }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to initialize schedule"
      );
    }
  },

  // Get schedule by owner (uses session to get current user's schedule)
  async getScheduleByOwner(session) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/_getScheduleByOwner`,
        { session }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to get schedule by owner"
      );
    }
  },

  // Add an event to schedule
  async addEvent(session, schedule, name, startTime, endTime, repeat) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/addEvent`,
        {
          session,
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
  async editEvent(session, schedule, oldEvent, name, startTime, endTime, repeat) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/editEvent`,
        {
          session,
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
  async deleteEvent(session, schedule, event) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/deleteEvent`,
        {
          session,
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
    session,
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
          session,
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
    session,
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
          session,
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
  async deleteTask(session, schedule, task) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/deleteTask`,
        {
          session,
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
  async generateSchedule(session, schedule) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/generateSchedule`,
        { session, schedule }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to generate schedule"
      );
    }
  },

  // Query: Get events for schedule
  async getEventsForSchedule(session, schedule) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/_getEventsForSchedule`,
        { session, schedule }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to get events for schedule"
      );
    }
  },

  // Query: Get tasks for schedule
  async getTasksForSchedule(session, schedule) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/_getTasksForSchedule`,
        { session, schedule }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to get tasks for schedule"
      );
    }
  },

  // Query: Get event details
  async getEventDetails(session, event) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/_getEventDetails`,
        { session, event }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to get event details"
      );
    }
  },

  // Query: Get task details
  async getTaskDetails(session, task) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/_getTaskDetails`,
        { session, task }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to get task details"
      );
    }
  },

  // Query: Get schedule details
  async getScheduleDetails(session, schedule) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/_getScheduleDetails`,
        { session, schedule }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to get schedule details"
      );
    }
  },

  // Query: Get all schedules
  async getAllSchedules(session) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/_getAllSchedules`,
        { session }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to get all schedules"
      );
    }
  },

  // Query: Get all events
  async getAllEvents(session) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/_getAllEvents`,
        { session }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to get all events"
      );
    }
  },

  // Query: Get all tasks
  async getAllTasks(session) {
    try {
      const response = await apiClient.post(
        `${SCHEDULE_GENERATOR_BASE}/_getAllTasks`,
        { session }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to get all tasks"
      );
    }
  },
};
