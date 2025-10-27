# Automatic Schedule Creation for New Users

## Overview

The application **automatically creates a schedule** for users who don't have any schedules when they log in or register. This ensures users can immediately start adding events and tasks without manual setup.

## Implementation

### Location
[src/components/schedule/ScheduleSelection.vue](src/components/schedule/ScheduleSelection.vue)

### How It Works

#### 1. User Authentication Flow
```
User Registers/Logs In
  ↓
AuthManager shows Schedule Selection view
  ↓
ScheduleSelection component mounts
  ↓
loadUserSchedules() is called
```

#### 2. Auto-Creation Logic

```javascript
async loadUserSchedules() {
  try {
    // Try to get existing schedules
    const scheduleResponse = await getScheduleByOwner(currentUser);
    
    if (scheduleResponse && scheduleResponse.length > 0) {
      // User has schedules - display them
      displaySchedules(scheduleResponse);
    } else {
      // User has no schedules - auto-create one
      await autoCreateAndSelectSchedule();
    }
  } catch (err) {
    // Backend returns error "No schedule found" for new users
    if (err.message.includes("No schedule found")) {
      // Treat as "no schedules" and auto-create
      await autoCreateAndSelectSchedule();
    }
  }
}
```

#### 3. Schedule Creation Process

```javascript
async autoCreateAndSelectSchedule() {
  // 1. Call backend to create schedule
  const response = await initializeSchedule(currentUser);
  // Backend creates schedule in database and returns ID
  
  // 2. Automatically select the new schedule
  await handleSelectSchedule(response.schedule);
  // Loads schedule data and navigates to Schedule Manager
}
```

## Database Verification

### Test Results:

```bash
# 1. Create new user
curl -X POST http://localhost:8000/api/UserAuthentication/register \
  -d '{"username": "test_new_user", "password": "password123"}'
# Result: {"user":"019a2793-1d87-7e9c-8d84-fbdc93300a2b"} ✅

# 2. Check if user has schedules (before auto-create)
curl -X POST http://localhost:8000/api/ScheduleGenerator/_getScheduleByOwner \
  -d '{"owner": "019a2793-1d87-7e9c-8d84-fbdc93300a2b"}'
# Result: {"error":"No schedule found..."} ✅

# 3. Auto-create triggers, creates schedule
curl -X POST http://localhost:8000/api/ScheduleGenerator/initializeSchedule \
  -d '{"owner": "019a2793-1d87-7e9c-8d84-fbdc93300a2b"}'
# Result: {"schedule":"019a2793-5382-79f6-8cc6-bb0696a6857d"} ✅

# 4. Verify schedule is now in database
curl -X POST http://localhost:8000/api/ScheduleGenerator/_getScheduleByOwner \
  -d '{"owner": "019a2793-1d87-7e9c-8d84-fbdc93300a2b"}'
# Result: {"schedule":"019a2793-5382-79f6-8cc6-bb0696a6857d"} ✅
```

## Complete User Journey

### For New Users:
1. **Register Account**
   - Backend creates user in database
   - Returns user ID

2. **Login Screen → Schedule Selection**
   - Component checks for existing schedules
   - Backend: "No schedule found"

3. **Auto-Create Schedule**
   - Frontend calls `initializeSchedule(userId)`
   - Backend creates empty schedule in database
   - Returns schedule ID

4. **Auto-Select & Navigate**
   - Frontend loads the new schedule
   - Navigates to Schedule Manager
   - User can immediately add events/tasks

### For Returning Users:
1. **Login**
   - Component checks for existing schedules

2. **Display Schedules**
   - Shows all user's schedules with event/task counts
   - User selects which schedule to work with

3. **Load & Work**
   - Selected schedule loads from database
   - User can manage events and tasks

## Key Features

✅ **Zero Manual Setup** - New users don't need to create a schedule manually  
✅ **Database Persistence** - All schedules saved to backend database  
✅ **Seamless UX** - Auto-creation is transparent to users  
✅ **Error Handling** - Handles both empty responses and error messages  
✅ **Multi-Schedule Support** - Users can create additional schedules anytime  

## Error Handling

The implementation handles two cases:

1. **Empty Response** - Backend returns empty array or null
2. **Error Response** - Backend returns `{"error": "No schedule found..."}`

Both cases trigger auto-creation, ensuring robust behavior.

## Code Locations

| Component | Purpose | File |
|-----------|---------|------|
| Schedule Selection | Main logic | [ScheduleSelection.vue:96-158](src/components/schedule/ScheduleSelection.vue#L96-L158) |
| Schedule Store | Data management | [scheduleStore.js:52-96](src/stores/scheduleStore.js#L52-L96) |
| API Service | Backend calls | [scheduleGeneratorService.js:7-21](src/services/scheduleGeneratorService.js#L7-L21) |

## Testing

To test auto-creation:

1. Register a brand new user
2. Log in with that user
3. Observe:
   - Loading spinner appears
   - Console logs: "Auto-creating schedule for user..."
   - Schedule created in database
   - Automatic navigation to Schedule Manager
   - User can immediately add events/tasks

No manual intervention required!
