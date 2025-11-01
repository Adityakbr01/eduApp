## RBAC (Role-Based Access Control) — Setup & Seed

This document describes the RBAC approach used in this project, recommended folder structure, example middleware, and how to seed default roles and permissions into MongoDB.

### Goals

- Provide a minimal, easy-to-extend RBAC design.
- Keep authorization logic reusable and centralized (middleware + service).
- Provide a seed script to create default roles and permissions.

### Concepts

- Role: a named grouping (e.g., `admin`, `manager`, `instructor`, `support`, `student`) that maps to a set of permissions.
- Permission: a granular capability (e.g., `user:create`, `user:read`, `courses:edit`).
- Policy: business-specific rules combining role membership and contextual checks.

The simplest model used here stores roles with an array of permission strings. This is flexible and easy to check at request time.

### Recommended folder structure

Place RBAC-related files where your code already groups related concerns. Example (relative to `src/`):

- `src/models/role.ts` — Mongoose schema/model for roles (name, permissions)
- `src/models/user.ts` — User model with a `roles: string[]` field
- `src/models/permission.ts` — Permission model (code, description)
- `src/models/rolePermission.ts` — RolePermission model (roleId, permissionId)
- `src/models/userPermission.ts` — UserPermission model (userId, permissionId)
- `src/scripts/seedRoles.js` — simple Node script to seed default roles/permissions


### Minimal Role model (Mongoose) — example

This is an example schema for `src/models/role.ts` (TypeScript):

```ts
import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.models.Role || mongoose.model('Role', roleSchema);
```


### Seeding default roles and permissions

We add a small Node script `server/src/scripts/seedRoles.js` that loads `MONGO_URI` from the environment and creates (or updates) a set of default roles with permissions.

The project includes a seed script you can run locally. It is intentionally small and runnable with Node (ESM) because the project uses `type: "module"`.

File: `server/src/scripts/seedRoles.js`

- Connects to `process.env.MONGO_URI` (falls back to `mongodb://localhost:27017/eduApp`).
- Upserts roles: `admin`, `manager`, `instructor`, `support`, `student` with a sample permissions list.

Run it locally:

```bash
# from server/ directory
node ./scripts/seedRoles.js

# or with a custom URI
MONGO_URI="mongodb://localhost:27017/eduApp" node ./scripts/seedRoles.js
```

If you use a `.env` file, make sure to set `MONGO_URI` or export it in the shell before running.

### Security notes

- For performance, resolve and attach user permissions to the auth token (or session) when the user logs in so request-time checks don't always hit the DB.
- Keep permission strings stable (e.g., `resource:action`) to avoid accidental mismatches.
- Consider caching role -> permission mappings in Redis if your app needs very high throughput.

### Next steps / optional improvements
 - Building RBAC (Role-Based Access Control) system ✅
 - Building api for authentication 
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

---