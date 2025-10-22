# TaskMate Frontend - User Authentication System

This Vue.js frontend implements a complete user authentication system for TaskMate, following the UserAuthentication API specification.

## Features Implemented

### Authentication Components

- **LoginForm.vue**: User login with username and password
- **RegisterForm.vue**: User registration with password confirmation
- **UserProfile.vue**: Account management including password change and account deletion
- **AuthManager.vue**: Main authentication orchestrator that manages the authentication flow

### State Management

- **authStore.js**: Pinia store for managing authentication state
- **userAuthService.js**: Service layer for API communication

### Key Features

- ✅ User registration with validation
- ✅ User login/authentication
- ✅ Password change functionality
- ✅ Account deletion with confirmation
- ✅ Persistent authentication state (localStorage)
- ✅ Form validation and error handling
- ✅ Responsive design
- ✅ Clean separation of concerns

## API Integration

The frontend integrates with the following UserAuthentication API endpoints:

- `POST /api/UserAuthentication/register`
- `POST /api/UserAuthentication/authenticate`
- `POST /api/UserAuthentication/changePassword`
- `POST /api/UserAuthentication/deleteAccount`
- `POST /api/UserAuthentication/_getUserByUsername`
- `POST /api/UserAuthentication/_checkUserExists`

## Architecture

### Component Structure

```
AuthManager (Main orchestrator)
├── LoginForm (Login functionality)
├── RegisterForm (Registration functionality)
└── UserProfile (Account management)
```

### State Management

- Uses Pinia for reactive state management
- Persistent authentication state via localStorage
- Centralized error handling and loading states

### Design Principles

- **Reactive Components**: All components are fully reactive with no page refreshes required
- **Clean Separation**: Each component manages its own state and behavior
- **Error Handling**: Comprehensive client-side validation and error messages
- **User Experience**: Intuitive flow with clear visual feedback

## Running the Application

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. The application will be available at `http://localhost:5173`

## Usage Flow

1. **Unauthenticated State**: Users see login/register forms
2. **Authentication**: Users can login or register new accounts
3. **Authenticated State**: Users see dashboard with profile management options
4. **Account Management**: Users can change passwords or delete accounts
5. **Logout**: Users can logout and return to authentication state

## Technical Implementation

- **Vue 3** with Composition API
- **Pinia** for state management
- **Axios** for HTTP requests
- **Responsive CSS** with modern design patterns
- **Form validation** with real-time feedback
- **Error handling** with user-friendly messages

The implementation follows the assignment rubric requirements for functionality, robustness, and usability while providing a clean foundation for future schedule and task management features.
