# API Integration Documentation

## Backend Connection

The Vue.js frontend is configured to connect to the backend API running at `http://localhost:8000/api`.

## Configuration

### Development Mode

- Uses Vite proxy to forward `/api` requests to `http://localhost:8000`
- No CORS issues during development
- API calls use relative URLs (`/api/...`)

### Production Mode

- Direct connection to `http://localhost:8000/api`
- Requires proper CORS configuration on backend

## API Service

The `scheduleApi` service (`src/services/scheduleApi.js`) provides methods for all ScheduleGenerator endpoints:

### Schedule Management

- `initializeSchedule(owner)` - Create a new schedule
- `generateSchedule(schedule)` - Generate optimized schedule plan

### Event Management

- `addEvent(schedule, name, startTime, endTime, repeat)` - Add new event
- `editEvent(schedule, oldEvent, name, startTime, endTime, repeat)` - Edit existing event
- `deleteEvent(schedule, event)` - Delete event

### Task Management

- `addTask(schedule, name, deadline, expectedCompletionTime, completionLevel, priority)` - Add new task
- `editTask(schedule, oldTask, name, deadline, expectedCompletionTime, completionLevel, priority)` - Edit existing task
- `deleteTask(schedule, task)` - Delete task

## Usage Example

```javascript
import { scheduleApi } from "./services/scheduleApi.js";

// Initialize a schedule
const schedule = await scheduleApi.initializeSchedule("user123");

// Add an event
const event = await scheduleApi.addEvent(
  schedule,
  "Team Meeting",
  new Date("2024-01-15T10:00:00"),
  new Date("2024-01-15T11:00:00"),
  { type: "weekly", days: [1, 3, 5] }
);

// Add a task
const task = await scheduleApi.addTask(
  schedule,
  "Complete project proposal",
  new Date("2024-01-20T17:00:00"),
  120, // 2 hours in minutes
  0, // 0% complete
  80 // 80% priority
);

// Generate optimized schedule
const plan = await scheduleApi.generateSchedule(schedule);
```

## Testing

The `ApiTest.vue` component provides a simple interface to test the API connection. It attempts to initialize a schedule and displays the result or any errors.

## Error Handling

All API methods include proper error handling and will throw descriptive error messages if requests fail.
