# API Specification: ScheduleGenerator Concept

**Purpose:** manages events and tasks for users to automatically generate a schedule that meets their needs.

**Base URL:** `http://localhost:8000`

---

## API Endpoints

### POST /api/ScheduleGenerator/initializeSchedule

**Full URL:** `http://localhost:8000/api/ScheduleGenerator/initializeSchedule`

**Description:** Creates an empty schedule document, associating it with the owner, and assigning an incrementing scheduleID.

**Requirements:**

- `owner` exists (this concept treats `User` as a generic ID and cannot verify its existence; a higher-level synchronization is expected to provide a valid `User` ID).

**Effects:**

- Creates an empty `schedule` with `owner` as `schedule.owner`, with static attribute `scheduleID` incrementing by 1.

**Request Body:**

```json
{
  "owner": "string"
}
```

**Success Response Body (Action):**

```json
{
  "schedule": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/ScheduleGenerator/addEvent

**Full URL:** `http://localhost:8000/api/ScheduleGenerator/addEvent`

**Description:** Creates and returns a new event document, linked to the specified schedule, with the given attributes.

**Requirements:**

- The `schedule` identified by `schedule` ID must exist.

**Effects:**

- Creates and returns an event with `name` to add to the set of events in `schedule` with the given attributes, and `eventID` incrementing by 1, and `event.scheduleID` being `schedule.scheduleID`.

**Request Body:**

```json
{
  "schedule": "string",
  "name": "string",
  "startTime": "string",
  "endTime": "string",
  "repeat": {
    "frequency": "string",
    "daysOfWeek"?: "number[]"
  }
}
```

**Success Response Body (Action):**

```json
{
  "event": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/ScheduleGenerator/editEvent

**Full URL:** `http://localhost:8000/api/ScheduleGenerator/editEvent`

**Description:** Modifies the attributes of the specified event document.

**Requirements:**

- The `oldEvent` identified by `oldEvent` ID must exist and be associated with the `schedule` identified by `schedule` ID.

**Effects:**

- Modifies `oldEvent` in the set of `Events` in `schedule` with the given attributes.

**Request Body:**

```json
{
  "schedule": "string",
  "oldEvent": "string",
  "name": "string",
  "startTime": "string",
  "endTime": "string",
  "repeat": {
    "frequency": "string",
    "daysOfWeek"?: "number[]"
  }
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/ScheduleGenerator/deleteEvent

**Full URL:** `http://localhost:8000/api/ScheduleGenerator/deleteEvent`

**Description:** Deletes the specified event document.

**Requirements:**

- The `event` identified by `event` ID must exist and be associated with the `schedule` identified by `schedule` ID.

**Effects:**

- Deletes the `event` in the set of `Events` in `schedule`.

**Request Body:**

```json
{
  "schedule": "string",
  "event": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/ScheduleGenerator/addTask

**Full URL:** `http://localhost:8000/api/ScheduleGenerator/addTask`

**Description:** Creates and returns a new task document, linked to the specified schedule, with the given attributes.

**Requirements:**

- The `schedule` identified by `schedule` ID must exist.
- `completionLevel` is between 0 and 100 (inclusive).

**Effects:**

- Returns and adds `task` with `name` to the set of `tasks` in `schedule` with the given attributes, with the given `completionLevel`, and `taskID` incrementing by 1, and `task.scheduleID` being `schedule.scheduleID`.

**Request Body:**

```json
{
  "schedule": "string",
  "name": "string",
  "deadline": "string",
  "expectedCompletionTime": "number",
  "completionLevel": "number",
  "priority": "number"
}
```

**Success Response Body (Action):**

```json
{
  "task": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/ScheduleGenerator/editTask

**Full URL:** `http://localhost:8000/api/ScheduleGenerator/editTask`

**Description:** Modifies the attributes of the specified task document.

**Requirements:**

- The `oldTask` identified by `oldTask` ID must exist and be associated with the `schedule` identified by `schedule` ID.

**Effects:**

- Modifies `oldTask` in the set of `Tasks` in `schedule` with the given attributes.

**Request Body:**

```json
{
  "schedule": "string",
  "oldTask": "string",
  "name": "string",
  "deadline": "string",
  "expectedCompletionTime": "number",
  "completionLevel": "number",
  "priority": "number"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/ScheduleGenerator/deleteTask

**Full URL:** `http://localhost:8000/api/ScheduleGenerator/deleteTask`

**Description:** Deletes the specified task document.

**Requirements:**

- The `task` identified by `task` ID must exist and be associated with the `schedule` identified by `schedule` ID.

**Effects:**

- Deletes `task` in the set of `Tasks` in `schedule`.

**Request Body:**

```json
{
  "schedule": "string",
  "task": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/ScheduleGenerator/generateSchedule

**Full URL:** `http://localhost:8000/api/ScheduleGenerator/generateSchedule`

**Description:** Retrieves all events and tasks associated with the given schedule, instantiates repeating events for a planning horizon, and prioritizes and schedules tasks into available time slots. Returns a `GeneratedSchedulePlan` containing concrete scheduled items. If the generation process encounters an unresolvable conflict, an error is returned.

**Requirements:**

- `schedule` exists.

**Effects:**

- Creates `generatedPlan` for `schedule.owner` such that if possible, all given events start, end, and repeat as specified, and task scheduling is optimized by its attributes. Generally, tasks with a sooner deadline, higher priority level, higher expectedCompletionTime, and higher completionLevel are scheduled first. The generated plan details concrete time slots for events and tasks. If doing this is not possible (e.g., due to conflicts), then return an `error`.

**Request Body:**

```json
{
  "schedule": "string"
}
```

**Success Response Body (Action):**

```json
{
  "scheduleId": "string",
  "generatedPlan": [
    {
      "type": "string",
      "originalId": "string",
      "name": "string",
      "scheduledStartTime": "string",
      "scheduledEndTime": "string"
    }
  ]
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/ScheduleGenerator/_getScheduleByOwner

**Full URL:** `http://localhost:8000/api/ScheduleGenerator/_getScheduleByOwner`

**Description:** Retrieves the ID of the schedule document associated with a given user owner.

**Requirements:**

- N/A

**Effects:**

- Retrieves the ID of the schedule document associated with a given user owner.

**Request Body:**

```json
{
  "owner": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "schedule": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/ScheduleGenerator/_getEventsForSchedule

**Full URL:** `http://localhost:8000/api/ScheduleGenerator/_getEventsForSchedule`

**Description:** Retrieves an array of Event IDs that are linked to the specified schedule.

**Requirements:**

- N/A

**Effects:**

- Retrieves an array of Event IDs that are linked to the specified schedule.

**Request Body:**

```json
{
  "schedule": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "event": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/ScheduleGenerator/_getTasksForSchedule

**Full URL:** `http://localhost:8000/api/ScheduleGenerator/_getTasksForSchedule`

**Description:** Retrieves an array of Task IDs that are linked to the specified schedule.

**Requirements:**

- N/A

**Effects:**

- Retrieves an array of Task IDs that are linked to the specified schedule.

**Request Body:**

```json
{
  "schedule": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "task": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/ScheduleGenerator/_getEventDetails

**Full URL:** `http://localhost:8000/api/ScheduleGenerator/_getEventDetails`

**Description:** Retrieves the full document details for a specific event.

**Requirements:**

- N/A

**Effects:**

- Retrieves the full document details for a specific event.

**Request Body:**

```json
{
  "event": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "eventDetails": {
      "_id": "string",
      "name": "string",
      "eventID": "number",
      "scheduleID": "number",
      "startTime": "string",
      "endTime": "string",
      "repeat": {
        "frequency": "string",
        "daysOfWeek"?: "number[]"
      }
    }
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/ScheduleGenerator/_getTaskDetails

**Full URL:** `http://localhost:8000/api/ScheduleGenerator/_getTaskDetails`

**Description:** Retrieves the full document details for a specific task.

**Requirements:**

- N/A

**Effects:**

- Retrieves the full document details for a specific task.

**Request Body:**

```json
{
  "task": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "taskDetails": {
      "_id": "string",
      "name": "string",
      "taskID": "number",
      "scheduleID": "number",
      "deadline": "string",
      "expectedCompletionTime": "number",
      "completionLevel": "number",
      "priority": "number"
    }
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```
