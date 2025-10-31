<!-- [@concept.97c9fea3](../../../context/design/concepts/ScheduleGenerator/ScheduleGenerator.md/steps/concept.97c9fea3.md)

[@concept-rubric](../../background/detailed/concept-rubric.md)

[@concept-state](../../background/detailed/concept-state.md)

[@concept-design-brief](../../background/concept-design-brief.md)

[@concept-design-overview](../../background/concept-design-overview.md)

[@concept-refactoring](../../background/concept-refactoring.md)

[@concept-specifications](../../background/concept-specifications.md) -->

# concept: ScheduleGenerator (Updated Specification)

- **concept** ScheduleGenerator\[User, Date, Percent]
- **purpose** manages events and tasks for users to automatically generate a schedule that meets their needs
- **principle** Each user has exactly one schedule. Given a set of events and tasks, an optimal schedule for the user is created. When events and tasks are updated and removed, the schedule is regenerated. Events are allowed to overlap.
- **state**
  - a set of `Schedules` with
    - an `owner` of type `User` (unique - one schedule per user)
    - a `scheduleID` of type `Number` (static attribute, initially -1)
  - a set of `Events` with
    - a `name` of type `String`
    - an `eventID` of type `Number` (static attribute, initially -1)
    - a `scheduleID` of type `Number`
    - a `startTime` of type `Date`
    - an `endTime` of type `Date`
    - a `repeat` of type `RepeatConfig` (frequency can be NONE, DAILY, or WEEKLY with optional daysOfWeek)
  - a set of `Tasks` with
    - a `name` of type `String`
    - a `taskID` of type `Number` (static attribute, initially -1)
    - a `scheduleID` of type `Number`
    - a `deadline` of type `Date`
    - an `expectedCompletionTime` of type `Number` (in minutes)
    - a `completionLevel` of type `Percent`
    - a `priority` of type `Percent`
- **actions**
  - `initializeSchedule(owner: User): (schedule: Schedule)`
    - **requires**: `owner` exists
    - **effects**: if `owner` does not have a schedule, creates an empty `schedule` with `owner` as `schedule.owner`, with static attribute `scheduleID` incrementing by 1. If `owner` already has a schedule, returns the existing schedule.
  - `addEvent(schedule: Schedule, name: String, startTime: Date, endTime: Date, repeat: RepeatConfig): (event: Event)`
    - **requires**: `schedule` exists
    - **effects**: creates and returns an event with `name` to add to the set of events in `schedule` with the given attributes, and `eventID` incrementing by 1, and `event.scheduleID` being `schedule.scheduleID`
  - `editEvent(schedule: Schedule, oldEvent: Event, name: String, startTime: Date, endTime: Date, repeat: RepeatConfig)`
    - **requires**: `oldEvent` is in the set of `Events` of `schedule`
    - **effects**: modifies `oldEvent` in the set of `Events` in `schedule` with the given attributes
  - `deleteEvent(schedule: Schedule, event: Event)`
    - **requires**: `event` is in the set of `Events` of `schedule`
    - **effects**: deletes the `event` in the set of `Events` in `schedule`
  - `addTask(schedule: Schedule, name: String, deadline: Date, expectedCompletionTime: Number, completionLevel: Percent, priority: Percent): (task: Task)`
    - **requires**: `schedule` exists, `completionLevel` is between 0 and 100 (inclusive)
    - **effects**: returns and adds `task` with `name` to the set of `tasks` in `schedule` with the given attributes, with the given `completionLevel`, and `taskID` incrementing by 1, and `task.scheduleID` being `schedule.scheduleID`
  - `editTask(schedule: Schedule, oldTask: Task, name: String, deadline: Date, expectedCompletionTime: Number, completionLevel: Percent, priority: Percent)`
    - **requires**: `oldTask` is in the set of `Tasks` of `schedule`
    - **effects**: modifies `oldTask` in the set of `Tasks` in `schedule` with the given attributes
  - `deleteTask(schedule: Schedule, task: Task)`
    - **requires**: `task` is in the set of `Tasks` of `schedule`
    - **effects**: deletes `task` in the set of `Tasks` in `schedule`
  - `generateSchedule(schedule: Schedule): (scheduleId: Schedule, generatedPlan: GeneratedSchedulePlan | error: Error)`
    - **requires**: `schedule` exists
    - **effects**: Creates `generatedPlan` for `schedule.owner` such that all given events start, end, and repeat as specified (events are allowed to overlap), and task scheduling is optimized by its attributes. Generally, tasks with a sooner deadline, higher priority level, higher expectedCompletionTime, and higher completionLevel are scheduled first. The generated plan details concrete time slots for events and tasks. If task scheduling is not possible due to insufficient time, then return an `error`.
