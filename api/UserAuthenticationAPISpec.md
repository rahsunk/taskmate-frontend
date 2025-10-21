# API Specification: UserAuthentication Concept

**Purpose:** limit access to known users and find users by name.

**Base URL:** `http://localhost:8000`

---

## API Endpoints

### POST /api/UserAuthentication/register

**Full URL:** `http://localhost:8000/api/UserAuthentication/register`

**Description:** Registers a new user with a unique username and password.

**Requirements:**

- no `User` with `username` exists.

**Effects:**

- Create and return a new `User` with the given `username` and `password`.

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**

```json
{
  "user": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/authenticate

**Full URL:** `http://localhost:8000/api/UserAuthentication/authenticate`

**Description:** Authenticates a user by checking if the provided username and password match an existing user.

**Requirements:**

- `User` with the same `username` and `password` exists.

**Effects:**

- Grants access to the `User` associated with that `username` and `password`.

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**

```json
{
  "user": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/changePassword

**Full URL:** `http://localhost:8000/api/UserAuthentication/changePassword`

**Description:** Allows an authenticated user to change their password.

**Requirements:**

- `user` exists and `user.password` is equal to `oldPassword`.

**Effects:**

- `password` for `user` is changed to `newPassword`.

**Request Body:**

```json
{
  "user": "string",
  "oldPassword": "string",
  "newPassword": "string"
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

### POST /api/UserAuthentication/deleteAccount

**Full URL:** `http://localhost:8000/api/UserAuthentication/deleteAccount`

**Description:** Deletes a user account from the system.

**Requirements:**

- `user` exists.

**Effects:**

- `user` is removed from the state.

**Request Body:**

```json
{
  "user": "string"
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

### POST /api/UserAuthentication/_getUserByUsername

**Full URL:** `http://localhost:8000/api/UserAuthentication/_getUserByUsername`

**Description:** Returns the user ID associated with a username if found.

**Requirements:**

- N/A

**Effects:**

- Returns the user ID associated with a username if found.

**Request Body:**

```json
{
  "username": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "user": "string"
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

### POST /api/UserAuthentication/_checkUserExists

**Full URL:** `http://localhost:8000/api/UserAuthentication/_checkUserExists`

**Description:** Returns true if the user with the given ID exists, false otherwise.

**Requirements:**

- N/A

**Effects:**

- Returns true if the user with the given ID exists, false otherwise.

**Request Body:**

```json
{
  "user": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "exists": "boolean"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```
