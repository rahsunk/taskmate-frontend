# API Specification: ItemSharing Concept

**Purpose:** Allows collaborative modification of an item's mutable properties by managing invited participants, their acceptance to collaborate, and the lifecycle of proposed and confirmed changes to those properties.

**Base URL:** `http://localhost:8000`

---

## API Endpoints

### POST /api/ItemSharing/makeItemShareable

**Full URL:** `http://localhost:8000/api/ItemSharing/makeItemShareable`

**Description:** Creates and returns a new `sharedItem` with `sharedItemID` incremented by 1. `sharedItem` is initialized with the given `externalItemID` and `owner` while `participants`, `acceptedParticipants`, and `changeRequests` are initialized as empty sets.

**Requirements:**

- `externalItemID` exists from an external concept, `owner` exists, and `externalItemID` is not already registered for sharing.

**Effects:**

- Creates and returns a new `sharedItem` with `sharedItemID` increments by 1. `sharedItem` is initialized with the given `externalItemID` and `owner` while `participants`, `acceptedParticipants`, and `changeRequests` are initialized as empty sets.

**Request Body:**

```json
{
  "owner": "string",
  "externalItemID": "string"
}
```

**Success Response Body (Action):**

```json
{
  "sharedItem": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/ItemSharing/shareItemWith

**Full URL:** `http://localhost:8000/api/ItemSharing/shareItemWith`

**Description:** Adds `targetUser` to `sharedItem.participants`.

**Requirements:**

- `sharedItem` exists, `targetUser` exists, `targetUser` is not already in `sharedItem.participants`.

**Effects:**

- Adds `targetUser` to `sharedItem.participants`.

**Request Body:**

```json
{
  "sharedItem": "string",
  "targetUser": "string"
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

### POST /api/ItemSharing/unshareItemWith

**Full URL:** `http://localhost:8000/api/ItemSharing/unshareItemWith`

**Description:** Removes `targetUser` from `sharedItem.participants` and from `sharedItem.acceptedParticipants` if they are in that set. Deletes any `ChangeRequests` made by `targetUser` for `sharedItem`.

**Requirements:**

- `sharedItem` exists, `targetUser` is in `sharedItem.participants`.

**Effects:**

- Removes `targetUser` from `sharedItem.participants` and from `sharedItem.acceptedParticipants` if they are in that set. Deletes any `ChangeRequests` made by `targetUser` for `sharedItem`.

**Request Body:**

```json
{
  "sharedItem": "string",
  "targetUser": "string"
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

### POST /api/ItemSharing/acceptToCollaborate

**Full URL:** `http://localhost:8000/api/ItemSharing/acceptToCollaborate`

**Description:** Adds `user` to `sharedItem.acceptedParticipants`.

**Requirements:**

- `sharedItem` exists, `user` is in `sharedItem.participants`, `user` is not already in `sharedItem.acceptedParticipants`.

**Effects:**

- Adds `user` to `sharedItem.acceptedParticipants`.

**Request Body:**

```json
{
  "sharedItem": "string",
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

### POST /api/ItemSharing/rejectCollaboration

**Full URL:** `http://localhost:8000/api/ItemSharing/rejectCollaboration`

**Description:** Removes `user` from `sharedItem.participants` and, if present, from `sharedItem.acceptedParticipants`. Deletes any `ChangeRequests` made by `user` for this `sharedItem`.

**Requirements:**

- `sharedItem` exists, `user` is in `sharedItem.participants`.

**Effects:**

- Removes `user` from `sharedItem.participants` and, if present, from `sharedItem.acceptedParticipants`. Deletes any `ChangeRequests` made by `user` for this `sharedItem`.

**Request Body:**

```json
{
  "sharedItem": "string",
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

### POST /api/ItemSharing/requestChange

**Full URL:** `http://localhost:8000/api/ItemSharing/requestChange`

**Description:** Creates and returns a new `changeRequest` for `sharedItem` with the `requester` and the proposed `requestedProperties`, with `requestID` incrementing by 1. Adds `changeRequest` to `sharedItem.changeRequests`.

**Requirements:**

- `sharedItem` exists, `requester` exists, `requester` is in `sharedItem.acceptedParticipants`.

**Effects:**

- Creates and returns a new `changeRequest` for `sharedItem` with the `requester` and the proposed `requestedProperties`, with `requestID` incrementing by 1. Adds `changeRequest` to `sharedItem.changeRequests`.

**Request Body:**

```json
{
  "sharedItem": "string",
  "requester": "string",
  "requestedProperties": {
    "propertyName": "any",
    "anotherProperty": "any"
  }
}
```

**Success Response Body (Action):**

```json
{
  "changeRequest": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/ItemSharing/confirmChange

**Full URL:** `http://localhost:8000/api/ItemSharing/confirmChange`

**Description:** Deletes `request` from `sharedItem.changeRequests`. (Note: The actual application of properties to the external item is done by a concept sync).

**Requirements:**

- `sharedItem` exists, `owner` is `sharedItem.owner`, `request` is in `sharedItem.changeRequests`.

**Effects:**

- Deletes `request` from `sharedItem.changeRequests`.

**Request Body:**

```json
{
  "owner": "string",
  "sharedItem": "string",
  "request": "string"
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

### POST /api/ItemSharing/rejectChange

**Full URL:** `http://localhost:8000/api/ItemSharing/rejectChange`

**Description:** Deletes `request` from `sharedItem.changeRequests`.

**Requirements:**

- `sharedItem` exists, `owner` is `sharedItem.owner`, `request` is in `sharedItem.changeRequests`.

**Effects:**

- Deletes `request` from `sharedItem.changeRequests`.

**Request Body:**

```json
{
  "owner": "string",
  "sharedItem": "string",
  "request": "string"
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

### POST /api/ItemSharing/_getSharedItemByExternalID

**Full URL:** `http://localhost:8000/api/ItemSharing/_getSharedItemByExternalID`

**Description:** Retrieves the shared item associated with a given external item ID.

**Requirements:**

- N/A

**Effects:**

- Returns the `sharedItem` if found, or null otherwise.

**Request Body:**

```json
{
  "externalItemID": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "sharedItem": {
      "_id": "string",
      "owner": "string",
      "externalItemID": "string",
      "participants": ["string"],
      "acceptedParticipants": ["string"],
      "changeRequests": ["string"]
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

### POST /api/ItemSharing/_getChangeRequestDetails

**Full URL:** `http://localhost:8000/api/ItemSharing/_getChangeRequestDetails`

**Description:** Retrieves the details of a specific change request.

**Requirements:**

- N/A

**Effects:**

- Returns the change request details.

**Request Body:**

```json
{
  "requestID": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "changeRequest": {
      "_id": "string",
      "sharedItemID": "string",
      "requester": "string",
      "requestedProperties": {
        "propertyName": "any"
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
