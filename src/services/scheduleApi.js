import axios from "axios";
import { API_CONFIG, getApiUrl } from "../config/api.js";

// Create axios instance with base configuration
const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to: ${config.url}`
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Schedule Generator API Service
export const scheduleApi = {
  // Initialize a new schedule for a user
  async initializeSchedule(owner) {
    try {
      const url = getApiUrl(
        API_CONFIG.ENDPOINTS.SCHEDULE_GENERATOR.INITIALIZE_SCHEDULE
      );
      console.log("Full URL:", url);
      const response = await apiClient.post(url, { owner });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to initialize schedule"
      );
    }
  },

  // Add a new event to a schedule
  async addEvent(schedule, name, startTime, endTime, repeat) {
    try {
      const response = await apiClient.post(
        getApiUrl(API_CONFIG.ENDPOINTS.SCHEDULE_GENERATOR.ADD_EVENT),
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

  // Edit an existing event
  async editEvent(schedule, oldEvent, name, startTime, endTime, repeat) {
    try {
      const response = await apiClient.post(
        getApiUrl(API_CONFIG.ENDPOINTS.SCHEDULE_GENERATOR.EDIT_EVENT),
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

  // Delete an event from a schedule
  async deleteEvent(schedule, event) {
    try {
      const response = await apiClient.post(
        getApiUrl(API_CONFIG.ENDPOINTS.SCHEDULE_GENERATOR.DELETE_EVENT),
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

  // Add a new task to a schedule
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
        getApiUrl(API_CONFIG.ENDPOINTS.SCHEDULE_GENERATOR.ADD_TASK),
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

  // Edit an existing task
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
        getApiUrl(API_CONFIG.ENDPOINTS.SCHEDULE_GENERATOR.EDIT_TASK),
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

  // Delete a task from a schedule
  async deleteTask(schedule, task) {
    try {
      const response = await apiClient.post(
        getApiUrl(API_CONFIG.ENDPOINTS.SCHEDULE_GENERATOR.DELETE_TASK),
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

  // Generate an optimized schedule plan
  async generateSchedule(schedule) {
    try {
      const response = await apiClient.post(
        getApiUrl(API_CONFIG.ENDPOINTS.SCHEDULE_GENERATOR.GENERATE_SCHEDULE),
        { schedule }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to generate schedule"
      );
    }
  },
};

export default scheduleApi;
