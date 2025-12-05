# Quiz and Admin Panel Apps

A full-featured web application suite including a quiz app for taking quizzes and an admin panel for managing quiz questions, with a Go backend and TypeScript frontend.

## 🚀 Quick Start

### Running with Docker

**1. Install Docker Desktop**

    Download and install Docker Desktop from the official Docker website

    Make sure Docker is running on your system

**2. Build and Run the Backend with Docker**

Navigate to the project backend directory and build the Docker image:
```bash

cd backend
docker build -t quiz-backend .
```
Run the container:
```bash

docker run -p 5000:5000 quiz-backend
```

**3. Start the Frontends**

From the root directory, install dependencies for all workspaces:
```bash
npm install
```

### Commands to Run Frontends

From the root directory, run the frontends:
```bash
npm run dev:quiz    # Start quiz frontend
npm run dev:admin   # Start admin panel frontend
```

**4. Verify the Application**

    Backend API: http://localhost:5000

    Swagger UI: http://localhost:5000/swagger/

    Quiz Frontend: http://localhost:5173

    Admin Panel Frontend: http://localhost:5174

### Frontend Development

#### Quiz Frontend

Navigate to the quiz directory:
```bash
cd quiz
```

Install dependencies (if not done from root):
```bash
npm install
```

Start development server:
```bash
npm run dev
```

Linting and formatting:
```bash
npm run lint       # Check linting
npm run lint:fix   # Auto-fix linting issues
npm run format     # Format code
```

#### Admin Panel Frontend

Navigate to the admin-panel directory:
```bash
cd admin-panel
```

Install dependencies (if not done from root):
```bash
npm install
```

Start development server:
```bash
npm run dev
```

Linting and formatting:
```bash
npm run lint       # Check linting
npm run lint:fix   # Auto-fix linting issues
npm run format     # Format code
```

## 📋 Overview

This project suite includes two applications for quiz management:

- **Quiz App**: A full-featured web application for taking quizzes
- **Admin Panel**: A web interface for managing quiz questions and content

The project consists of:

- **Backend**: REST API built with Go and SQLite database
- **Frontend**: Modular TypeScript applications with component architecture
- **Features**: Timer, statistics, validation, notifications, admin panel for content management

## 📁 Project Structure

```
 backend
├──  cmd
│   └──  main.go
├──  dist-temp
│   ├──  quiz.db
│   ├── 󰡯 server
│   ├── 󰡯 server-linux
│   └── 󰡯 server-macos-intel
├──  docs
│   ├──  docs.go
│   ├──  docs.json
│   ├──  swagger.json
│   └──  swagger.yaml
├──  internal
│   ├──  quiz
│   │   ├──  handler.go
│   │   ├──  repository.go
│   │   └──  service.go
│   └──  session
│       └──  service.go
├──  models
│   └──  questions.go
├──  pkg
│   ├──  db
│   │   ├──  db.go
│   │   └──  questions.json
│   ├──  middleware
│   │   ├──  chain.go
│   │   └──  cors.go
│   └──  response
│       ├──  converter.go
│       └──  response.go
├──  Dockerfile
├──  go.mod
├──  go.sum
└──  quiz.db
```
```
 quiz
├── 󰣞 src
│   ├──  app
│   │   ├──  quiz-component.ts
│   │   ├──  quiz-service.ts
│   │   └──  quiz-template.html
│   ├──  components
│   │   ├──  header
│   │   │   ├──  header-component.ts
│   │   │   └──  header-template.html
│   │   ├──  question
│   │   │   ├──  question-component.ts
│   │   │   ├──  question-service.ts
│   │   │   └──  question-template.html
│   │   ├──  start
│   │   │   ├──  start-component.ts
│   │   │   └──  start-template.html
│   │   ├──  statistic
│   │   │   ├──  statistic-component.ts
│   │   │   ├──  statistic-service.ts
│   │   │   └──  statistic-template.html
│   │   ├──  timer
│   │   │   ├──  timer-component.ts
│   │   │   ├──  timer-service.ts
│   │   │   └──  timer-template.html
│   │   └──  toast
│   │       ├──  toast-component.ts
│   │       ├──  toast-service.ts
│   │       └──  toast-template.html
│   ├──  pipes
│   │   └──  timer-pipe.ts
│   ├──  services
│   │   ├──  api-service.ts
│   │   ├──  http-service.ts
│   │   └──  validator-service.ts
│   ├──  shared
│   │   ├──  constants.ts
│   │   └──  types.ts
│   ├──  main.ts
│   ├──  app-module.ts
│   └──  style.css
├──  normalize.css
├──  favicon.png
├──  index.html
├──  package-lock.json
├──  package.json
├──  tsconfig.json
└──  vite.config.js
```
```
 admin-panel
├── 󰣞 src
│   ├──  app
│   │   ├──  admin-component.ts
│   │   ├──  admin-service.ts
│   │   └──  admin-template.html
│   ├──  components
│   │   ├──  header
│   │   │   ├──  header-component.ts
│   │   │   └──  header-template.html
│   │   ├──  modal
│   │   │   ├──  modal-component.ts
│   │   │   ├──  modal-service.ts
│   │   │   └──  modal-template.html
│   │   ├──  pagination
│   │   │   ├──  pagination-component.ts
│   │   │   └──  pagination-template.html
│   │   └──  questions-list
│   │       ├──  questions-list-component.ts
│   │       └──  questions-list-template.html
│   ├──  services
│   │   ├──  api-service.ts
│   │   ├──  http-service.ts
│   │   └──  validator-service.ts
│   ├──  shared
│   │   ├──  constants.ts
│   │   └──  types.ts
│   ├──  main.ts
│   ├──  app-module.ts
│   └──  style.css
├──  normalize.css
├──  favicon.png
├──  index.html
├──  package-lock.json
├──  package.json
├──  tsconfig.json
└──  vite.config.js
```

## 🔧 Building the Project

### Building the Backend

To build binary files for different platforms, run these commands from the `backend` directory:

```bash
# Create directory for binary files
mkdir -p dist

# Build for Linux
GOOS=linux GOARCH=amd64 go build -o dist/server-linux cmd/main.go

# Build for Windows
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o dist/server-windows.exe cmd/main.go

# Build for macOS Intel
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -o dist/server-macos-intel cmd/main.go

# Build for current platform
go build -o dist/server cmd/main.go
```

**File locations after building:**
```
../backend/
  dist/
    ├── server-linux        (Linux binary)
    ├── server-windows.exe  (Windows binary)
    ├── server-macos-intel  (macOS Intel binary)
    └── server              (Current platform binary)
```

### Running the Server on Different Platforms

**Linux:**
```bash
chmod +x dist/server-linux
./dist/server-linux
```

**Windows:**
```cmd
dist\server-windows.exe
```
Or via PowerShell:
```powershell
.\dist\server-windows.exe
```

**macOS Intel:**
```bash
chmod +x dist/server-macos-intel
./dist/server-macos-intel
```

**Current platform:**
```bash
chmod +x dist/server
./dist/server
```

## 🎯 Features

### Quiz Frontend
- **Modular architecture** with components, services, and directives
- **Timer** with countdown functionality
- **Statistics** for quiz results
- **Answer validation**
- **Notifications** (toast)
- **Highlighting** of correct/incorrect answers

### Admin Panel Frontend
- **Question Management Interface**: Add, edit, and delete quiz questions
- **Pagination**: Efficient navigation through question lists
- **Modal Dialogs**: Clean UI for content management
- **Real-time Updates**: Immediate reflection of changes

### Backend
- **REST API** for quiz management
- **SQLite** database
- **Swagger** documentation
- **CORS** middleware
- **Data serialization**

## 📚 API Documentation

After starting the server, API documentation is available at:
- Swagger UI: `http://localhost:5000/swagger/`
- OpenAPI specification: `http://localhost:5000/swagger/doc.json`he frontend will communicate with the backend API to fetch quiz data and submit results.
