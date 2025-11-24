# Quiz App

A full-featured web application for taking quizzes with a Go backend and vanilla JavaScript frontend.

## 🚀 Quick Start

### Running with Docker (Recommended)

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
**3. Start the Frontend**

Navigate to the project quiz directory install dependencies and start server:
```bash

cd quiz
npm i
npm run dev
```
Then open in your browser: http://localhost:5173

**4. Verify the Application**

    Backend API: http://localhost:5000

    Swagger UI: http://localhost:5000/swagger/

    Frontend: http://localhost:5173

### Alternative: Manual Setup

**1.Start the Backend Server**
Go to the backend directory and run one of the pre-built server executables:
```bash

cd backend
cp dist-temp/server-{your-os} ./server
./server
```

Note: Copy the server executable one directory up for proper path resolution. Choose the appropriate executable for your operating system (server-linux, server-windows.exe, server-macos).

**2. Start the Frontend**

Navigate to the project quiz directory install dependencies and start server:
```bash

cd quiz
npm i
npm run dev
```
Then open in your browser: http://localhost:5173

## 📋 Overview

Quiz App is a full-featured web application for creating and taking quizzes. The project consists of:

- **Backend**: REST API built with Go and SQLite database
- **Frontend**: Modular vanilla JavaScript application with component architecture
- **Features**: Timer, statistics, validation, notifications

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
│   ├──  normalize.css
│   └──  style.css
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

### Frontend
- **Modular architecture** with components, services, and directives
- **Timer** with countdown functionality
- **Statistics** for quiz results
- **Answer validation**
- **Notifications** (toast)
- **Highlighting** of correct/incorrect answers

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
