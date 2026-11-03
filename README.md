
# FinanceFlow

A full-stack personal finance management application built with React, TypeScript, Java Spring Boot, and PostgreSQL.

FinanceFlow helps users manage income and expenses, organize transactions into categories, set monthly budgets, and monitor their financial activity through interactive analytics.

**Project Status:** Core application completed | Local deployment available with Docker | Public demo not yet deployed

## Features

### Authentication & Security
- User registration and login
- Session-based authentication with Spring Security
- CSRF protection for state-changing requests
- Protected application routes
- User-specific financial data
- Secure logout

### Transaction Management
- Create, view, edit, and delete transactions
- Track income and expenses
- Assign transactions to categories
- Filter and sort transaction records
- View recent transactions on the dashboard

### Categories
- Default transaction categories
- Custom categories
- Category management for financial records

### Financial Analytics
- Income and expense summaries
- Net balance calculation
- Monthly financial trends
- Analytics for 3, 6, or 12 months
- Spending breakdown by category

### Monthly Budgets
- Create monthly spending budgets
- Assign budgets to expense categories
- Compare actual spending against budgets
- Track remaining budget amounts
- View budget status and progress indicators

### User Experience
- Responsive interface
- Shared navigation layout
- User settings
- Persistent analytics period preference
- Loading, error, and empty states

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Java 21, Spring Boot, Spring Security |
| Persistence | Spring Data JPA, Hibernate |
| Database | PostgreSQL |
| Migrations | Flyway |
| Web Server | Caddy |
| Infrastructure | Docker, Docker Compose |
| Version Control | Git, GitHub |
| Testing | Maven, JUnit, Spring Boot Test, ESLint, TypeScript |

## Architecture

FinanceFlow follows a client-server architecture.

```text
React + TypeScript
        |
        | HTTP / REST API
        v
Caddy Reverse Proxy
        |
        v
Spring Boot Backend
        |
        +-- Spring Security
        +-- Business Services
        +-- Spring Data JPA
        |
        v
PostgreSQL
```

The frontend communicates with the backend using REST endpoints under `/api/v1`.

Spring Boot handles authentication, validation, business logic, and database operations.

PostgreSQL stores application data, while Flyway manages database schema migrations.

The application uses session-based authentication and CSRF protection.

## Project Structure

```text
financeFlow/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   │       └── db/migration/
│   │   └── test/
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   ├── Dockerfile
│   ├── Caddyfile
│   └── package.json
│
├── compose.yaml
├── compose.prod.yaml
├── compose.deploy.yaml
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

For the Docker-based setup:

- Git
- Docker Engine or Docker Desktop
- Docker Compose

For running frontend and backend separately:

- Java 21 or newer
- Node.js and npm compatible with the frontend dependencies
- Docker for PostgreSQL

### Option 1: Run the Full Application with Docker

Clone the repository:

```bash
git clone https://github.com/OlegovichB/financeFlow.git
cd financeFlow
```

Create the environment file:

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder `DB_PASSWORD` with a strong local development password.

Start the application:

```bash
docker compose -f compose.prod.yaml up --build -d
```

Open:

http://localhost:8081

View container status:

```bash
docker compose -f compose.prod.yaml ps
```

View backend logs:

```bash
docker compose -f compose.prod.yaml logs -f backend
```

Stop the application:

```bash
docker compose -f compose.prod.yaml down
```

Do not use `down -v` unless you intentionally want to remove database volumes and their stored data.

**Note:** `compose.prod.yaml` is configured for local HTTP testing. It is not intended to be exposed directly to the public internet.

### Option 2: Run in Development Mode

First, create `.env` as described above.

Start PostgreSQL:

```bash
docker compose up -d
```

Start the backend in a separate terminal:

```bash
cd backend

export DB_PASSWORD="$(sed -n 's/^DB_PASSWORD=//p' ../.env)"

./mvnw spring-boot:run
```

The backend runs at:

http://localhost:8080

Start the frontend in another terminal:

```bash
cd frontend

npm ci
npm run dev
```

The frontend runs at:

http://localhost:5173

Vite proxies `/api` requests to the Spring Boot backend during development.

## Testing

### Backend

From the `backend` directory:

```bash
./mvnw clean verify
```

### Frontend

From the `frontend` directory:

```bash
npm run lint
npm run build
```

These commands validate the frontend code and generate a production build.

## Security

FinanceFlow includes:

- Session-based authentication
- Spring Security authorization
- CSRF protection
- Password hashing through Spring Security
- Protected REST endpoints
- HTTP-only session cookies
- User-scoped data access

The production configuration is designed for HTTPS deployment behind a reverse proxy.

Never commit real passwords or secrets to the repository.

## Development Highlights

This project was developed to gain practical experience building a complete full-stack application.

Key areas of focus:

- Designing REST API endpoints
- Connecting a React frontend to a Java backend
- Implementing authentication and authorization
- Working with relational databases
- Designing database migrations
- Separating controllers, services, and repositories
- Managing application state and API requests
- Creating responsive user interfaces
- Containerizing services with Docker
- Testing and debugging full-stack functionality

## Deployment

FinanceFlow currently supports local deployment through Docker Compose.

The repository also contains deployment configuration for a future HTTPS-enabled server.

**Live Demo:** Not available yet.

## Future Improvements

- Automated CI pipelines
- Expanded integration and security testing
- Additional analytics features
- Account-level preference synchronization
- Public cloud deployment
- Automated database backups

## Author

**Daniil Berezovik**

Full-Stack Developer | React, TypeScript, Java, Spring Boot

## License

No open-source license has been selected.
