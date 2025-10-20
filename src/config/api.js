// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.DEV ? "/api" : "http://localhost:8000",
  ENDPOINTS: {
    SCHEDULE_GENERATOR: {
      INITIALIZE_SCHEDULE: "ScheduleGenerator/initializeSchedule",
      ADD_EVENT: "ScheduleGenerator/addEvent",
      EDIT_EVENT: "ScheduleGenerator/editEvent",
      DELETE_EVENT: "ScheduleGenerator/deleteEvent",
      ADD_TASK: "ScheduleGenerator/addTask",
      EDIT_TASK: "ScheduleGenerator/editTask",
      DELETE_TASK: "ScheduleGenerator/deleteTask",
      GENERATE_SCHEDULE: "ScheduleGenerator/generateSchedule",
    },
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.BASE_URL.endsWith("/")
    ? API_CONFIG.BASE_URL.slice(0, -1)
    : API_CONFIG.BASE_URL;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};
