(#) Register User — Authentication

This document describes the `POST /auth/register` endpoint used to create a new user account and trigger email OTP verification.

## Purpose

Create a new user with a selected role and role-specific profile (if provided). The endpoint sends a verification OTP to the user's email and returns the created user's id, email and role.

## Endpoint

- Method: POST
- URL: /auth/register
- Auth: public

## Request payload

Content-Type: application/json

Body fields (validated with Zod `registerSchema`):

- name: string — required, min 2 characters
- email: string — required, valid email
- password: string — required, min 6 characters, must include upper, lower and number
- role: string — required, one of: `admin`, `manager`, `instructor`, `support_team`, `student`
- phone: string — optional, 10 digits
- address: string — optional

Role-specific optional objects (only include when role requires):

- instructorProfile: {
	- bio?: string
	- expertise?: string[]
	- experience?: number
	}

- managerProfile: {
	- department?: string
	- teamSize?: number
	}

- supportTeamProfile: {
	- shiftTimings?: string
	- expertiseAreas?: string[]
	}

- example payload:

```json

{
  "name": "user1",
  "email": "user1@gmail.com",
  "password": "Adityakbr01@",
  "role": "student"
}

{
  "name": "manager1",
  "email": "manager1@gmail.com",
  "password": "Adityakbr01@",
  "role": "manager",
  "managerProfile": {
    "department": "Operations",
    "teamSize": 5
  }
}
,

{
  "name": "instructor1",
  "email": "instructor1@gmail.com",
  "password": "Adityakbr01@",
  "role": "instructor",
  "instructorProfile": {
    "bio": "Experienced Web Developer and Educator.",
    "expertise": ["JavaScript", "React", "Node.js"],
    "experience": 3
  }
}

{
  "name": "support1",
  "email": "support1@gmail.com",
  "password": "Adityakbr01@",
  "role": "support_team",
  "supportTeamProfile": {
    "shiftTimings": "9AM - 6PM",
    "expertiseAreas": ["Student Queries", "Technical Support"]
  }
}
,

{
  "name": "admin1",
  "email": "admin1@gmail.com",
  "password": "Adityakbr01@",
  "role": "admin"
}

```

Note: `studentProfile` is not expected in registration payload — students are registered with basic fields only.

## Validation

The API uses `src/validators/user.Schema.ts` (`registerSchema`) to ensure payload correctness. If validation fails, the endpoint returns a 400 with a detailed error object describing the field problems.

## Behavior / Implementation details

- If an account with the provided email already exists and is verified and not banned, the request fails with 400 (`Account already exists. Please login.`).
- if an account exists with the provided email but is not verified, the service updates the OTP/expiry and resends the verification email. (`Account already exists. Please verify OTP sent to your email`)
- If the account exists but is banned, the request fails with 403 (`Your account is banned`).
- If the account exists but is not yet verified, the service updates the OTP/expiry and resends the verification email.
- If the account doesn't exist, the service:
	1. Generates an OTP and expiry using `src/utils/generateOtp.ts`.
	2. Prepares optional role-specific profile data and sets appropriate approval flags:
		 - For `instructor`: sets `instructorProfile` and `isInstructorApproved = false` (requires approval later).
		 - For `manager`: sets `managerProfile` and `isManagerApproved = false`.
		 - For `support_team`: sets `supportTeamProfile` and `isSupportTeamApproved = false`.
		 - For `student` and `admin` roles, those role-specific profile fields and approval flags are omitted.
	3. Creates the user in the DB (`src/models/user.model.ts`). Password is hashed in the model pre-save hook.
	4. Sends a verification email via `src/services/otp.service.ts` (EmailType.VERIFY_OTP) with the OTP.

## Successful response

- Status: 200 (or 201 depending on your route implementation)
- Body:

```
{
	"message": "OTP sent to your email",
	"userId": "<user id>",
	"email": "user@example.com",
	"role": "student"
}
```

Notes about stored fields:
- Role-specific profile fields and approval flags are omitted from the document when not relevant (e.g. student users will not have `instructorProfile` or approval boolean fields present). This avoids `null` values in the DB.

## Errors

- 400 Bad Request — validation errors or account already exists (verified)
- 403 Forbidden — account banned
- 500 Internal Server Error — unexpected server/database error

## Security and rate limiting

- Registration endpoint is subject to rate limiting (see `src/middlewares/security/rateLimiter.ts`).
- Passwords are hashed via bcrypt before being saved (see `src/models/user.model.ts` pre-save hook).


### Next steps / optional improvements
 - Building RBAC (Role-Based Access Control) system ✅
 - Building api for authentication 
   - Register User ✅
   - Verify OTP ❌
   - send OTP ❌
   - login user ❌
   - reset password ❌
   - change password ❌
   - logout user ❌
   - refresh token ❌
   - get current user ❌
 - Building api for user management
 - Building api for user roles and permissions
 - Building api for course management
 - Building api for course content management
 - Building api for progress tracking
 - Building api for assessments and quizzes
 - Integrating third-party services (e.g., payment gateways, email services)
 - Implementing frontend to interact with these apis
 - Add a REST endpoint to manage roles and permissions (admin-only).
 - Add a UI or admin dashboard for role management.
 - Add integration tests for middleware and seeds.