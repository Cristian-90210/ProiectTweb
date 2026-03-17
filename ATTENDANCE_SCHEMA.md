# Attendance Schema (Simplified)

## Core Tables

### `students`
- `id` (PK)
- `full_name`
- `level` (`beginner`, `advanced`)
- `is_active`

### `student_health_flags`
- `id` (PK)
- `student_id` (FK -> `students.id`)
- `type` (`asthma`, `chlorine_allergy`, `other`)
- `severity` (`low`, `medium`, `high`)
- `protocol_text`
- `is_active`
- `updated_at`

### `sessions`
- `id` (PK)
- `coach_id`
- `group_type` (`group`, `individual`)
- `start_at`
- `end_at`

### `session_enrollments`
- `id` (PK)
- `session_id` (FK -> `sessions.id`)
- `student_id` (FK -> `students.id`)

### `attendance_records`
- `id` (PK)
- `session_id` (FK -> `sessions.id`)
- `student_id` (FK -> `students.id`)
- `status` (`present`, `absent`, `absent_medical`, `recovery`, `late`)
- `marked_by`
- `marked_at`
- `confirmed`
- `confirmed_by`
- `confirmed_at`
- `note`

### `recovery_credits`
- `id` (PK)
- `student_id` (FK -> `students.id`)
- `source_attendance_id` (FK -> `attendance_records.id`)
- `status` (`active`, `reserved`, `consumed`, `expired`)
- `expires_at`
- `consumed_session_id` (nullable FK -> `sessions.id`)

### `progress_snapshots`
- `id` (PK)
- `student_id` (FK -> `students.id`)
- `metric_key`
- `metric_value` (0..100)
- `recorded_at`

## Rules
- `absent_medical` creates one `recovery_credits` row with status `active`.
- A single attendance record is confirmed once per student/session.
- Health flags are shown in attendance UI while `is_active = true`.
