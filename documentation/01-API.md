# TaskMate Frontend API Integration

This frontend application is configured to integrate with the TaskMate backend API running on `http://localhost:8000`.

## API Concepts

The frontend integrates with four main API concepts:

### 1. User Authentication (`/api/UserAuthentication`)

- User registration and authentication
- Password management
- User existence checks
- Account deletion

### 2. Item Sharing (`/api/ItemSharing`)

- Making items shareable
- Managing collaboration participants
- Change request workflow
- Accepting/rejecting collaboration

### 3. Notifications (`/api/Notification`)

- Creating notification configurations
- Sending email notifications
- Managing notification settings
- Tracking sent notifications

### 4. Schedule Generator (`/api/ScheduleGenerator`)

- Creating and managing schedules
- Adding/editing events and tasks
- Generating optimized schedules
- Querying schedule data

## Project Structure

```
src/
├── config/
│   └── api.js                 # Axios configuration with proxy setup
├── services/
│   ├── userAuthService.js     # User authentication API calls
│   ├── itemSharingService.js  # Item sharing API calls
│   ├── notificationService.js # Notification API calls
│   └── scheduleGeneratorService.js # Schedule generator API calls
└── components/
    └── ApiTest.vue           # Interactive API testing component
```

## Configuration

### Vite Proxy Setup

The `vite.config.js` is configured with a proxy that forwards all `/api/*` requests to `http://localhost:8000`:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

### API Client Configuration

The `src/config/api.js` file sets up an axios instance with:

- Base URL: `/api` (proxied to backend)
- 10-second timeout
- JSON content type
- Request/response interceptors for logging

## Usage

### Starting the Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and will automatically proxy API calls to the backend at `http://localhost:8000`.

### Testing API Integration

The `ApiTest.vue` component provides an interactive interface to test all API endpoints. It includes:

- Form inputs for each API concept
- Buttons to trigger API calls
- Real-time response display
- Error handling and loading states

### Using API Services

```javascript
import { userAuthService } from "./services/userAuthService.js";

// Register a new user
const result = await userAuthService.register("username", "password");

// Authenticate user
const authResult = await userAuthService.authenticate("username", "password");
```

## API Endpoints

All API endpoints follow the pattern `/api/{Concept}/{Action}`:

- **UserAuthentication**: `/api/UserAuthentication/register`, `/api/UserAuthentication/authenticate`, etc.
- **ItemSharing**: `/api/ItemSharing/makeItemShareable`, `/api/ItemSharing/shareItemWith`, etc.
- **Notification**: `/api/Notification/createNotificationConfig`, `/api/Notification/sendNotification`, etc.
- **ScheduleGenerator**: `/api/ScheduleGenerator/initializeSchedule`, `/api/ScheduleGenerator/addEvent`, etc.

## Error Handling

All service methods include proper error handling:

- Network errors are caught and re-thrown with descriptive messages
- API error responses are parsed and displayed
- Loading states are managed during API calls

## Dependencies

- **Vue 3**: Frontend framework
- **Axios**: HTTP client for API calls
- **Vite**: Build tool with proxy configuration
