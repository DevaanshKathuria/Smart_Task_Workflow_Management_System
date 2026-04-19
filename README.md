# Smart Task & Workflow Management System (STWMS)

> **Live Demo:** 

## Project Description
Smart Task & Workflow Management System (STWMS) is a full-stack web application designed to help teams manage projects, tasks, and workflows efficiently. The system supports **role-based access control** (Admin, Manager, Employee), task lifecycle management (To Do → In Progress → Review → Completed), and automated notifications.

This project is developed as part of the **SESD course** and follows proper **software engineering and system design principles**, with a strong focus on backend development.

---

## Tech Stack

### Backend (Primary Focus — 75%)
| Technology | Purpose |
|---|---|
| Node.js + TypeScript | Runtime & type safety |
| Express.js | REST API framework |
| Prisma ORM | Database access layer |
| SQLite | Embedded database |
| JWT + bcryptjs | Auth & password hashing |
| ts-node-dev | Development server |

### Frontend (25%)
| Technology | Purpose |
|---|---|
| React 18 | UI library |
| Vite | Build tool |
| Axios | HTTP client |
| Vanilla CSS | Styling with custom design system |

---

## Key Features
- ✅ Secure JWT authentication (register/login)
- ✅ Role-based access control (Admin, Manager, Employee)
- ✅ First registered user auto-assigned as Admin
- ✅ Project management (create, update, delete)
- ✅ Task assignment with priority and due dates
- ✅ Task status lifecycle (TODO → IN_PROGRESS → REVIEW → COMPLETED)
- ✅ Auto-notifications on task assignment and status changes
- ✅ Notification management (mark as read, delete)
- ✅ Admin: user role management
- ✅ Clean layered backend architecture

---

## Software Engineering Practices

### OOP Principles
- **Encapsulation**: Each class encapsulates its own data and behavior (Services, Repositories)
- **Abstraction**: Controllers are thin — business logic hidden behind Services
- **Inheritance**: Admin, Manager, Employee extend User (class diagram)
- **Polymorphism**: Role-based middleware accepts different role combinations

### Design Patterns
| Pattern | Where Used |
|---|---|
| **Repository Pattern** | `UserRepository`, `ProjectRepository`, `TaskRepository`, `NotificationRepository` |
| **Service Layer** | `AuthService`, `ProjectService`, `TaskService`, `NotificationService` |
| **Middleware Chain** | `authenticate` → `authorize(roles)` → Controller |
| **Observer (simplified)** | TaskService auto-creates notifications on events |

### Architecture
```
Controller → Service → Repository → Prisma → SQLite
```

---

## Project Structure
```
STWMS/
├── idea.md
├── useCaseDiagram.md
├── sequenceDiagram.md
├── classDiagram.md
├── ErDiagram.md
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma         # DB schema (User, Project, Task, Notification)
│   └── src/
│       ├── app.ts                # Express app setup
│       ├── server.ts             # Entry point
│       ├── config/
│       │   └── prisma.ts         # Prisma client singleton
│       ├── controllers/          # Request handlers (thin layer)
│       │   ├── auth.controller.ts
│       │   ├── user.controller.ts
│       │   ├── project.controller.ts
│       │   ├── task.controller.ts
│       │   └── notification.controller.ts
│       ├── services/             # Business logic layer
│       │   ├── auth.service.ts
│       │   ├── project.service.ts
│       │   ├── task.service.ts
│       │   └── notification.service.ts
│       ├── repositories/         # Data access layer
│       │   ├── user.repository.ts
│       │   ├── project.repository.ts
│       │   ├── task.repository.ts
│       │   └── notification.repository.ts
│       ├── routes/               # Route definitions
│       │   ├── auth.routes.ts
│       │   ├── user.routes.ts
│       │   ├── project.routes.ts
│       │   ├── task.routes.ts
│       │   └── notification.routes.ts
│       └── middlewares/
│           ├── auth.middleware.ts   # JWT verification
│           └── role.middleware.ts   # Role-based authorization
│
└── frontend/
    └── src/
        ├── api/              # Axios API client + endpoints
        ├── context/          # AuthContext
        ├── components/       # Layout, shared components
        └── pages/            # Dashboard, Projects, Tasks, Notifications, Users
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users/me` | Any | Get own profile |
| GET | `/api/users` | Admin | List all users |
| PATCH | `/api/users/:id/role` | Admin | Update user role |

### Projects
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/projects` | Any | List all projects |
| GET | `/api/projects/:id` | Any | Get project with tasks |
| POST | `/api/projects` | Admin/Manager | Create project |
| PUT | `/api/projects/:id` | Admin/Manager | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project |

### Tasks
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/tasks` | Any | List all tasks |
| GET | `/api/tasks/my` | Any | My assigned tasks |
| GET | `/api/tasks/project/:id` | Any | Tasks by project |
| POST | `/api/tasks` | Admin/Manager | Create task |
| PUT | `/api/tasks/:id` | Any | Update task |
| DELETE | `/api/tasks/:id` | Admin/Manager | Delete task |

### Notifications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/notifications` | Any | My notifications |
| PATCH | `/api/notifications/:id/read` | Any | Mark as read |
| PATCH | `/api/notifications/read-all` | Any | Mark all as read |
| DELETE | `/api/notifications/:id` | Any | Delete notification |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm

### Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
# Runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Environment Variables (backend/.env)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secret_here"
PORT=3001
```

> 💡 The first user to register automatically receives the **ADMIN** role.

---

## Author
- **Devaansh Kathuria**
- Roll No: 2024-B-02032007
- Course: SESD (Software Engineering and System Design)
