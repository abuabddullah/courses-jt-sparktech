# Course Learning API - Step-by-Step Guide

Welcome to the Course Learning App tutorial! This guide will walk you through setting up and running a Node.js backend API for a course learning platform using Express, MongoDB, TypeScript, and Mongoose. This guide is designed to be beginner-friendly and will explain every step in detail.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Database Setup](#database-setup)
4. [Understanding the Code Structure](#understanding-the-code-structure)
5. [Running the Application](#running-the-application)
6. [Testing the API](#testing-the-api)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have the following installed on your computer:

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Postman** (or any API testing tool)

To check if Node.js and npm are installed, run these commands in your terminal:

```bash
node --version
npm --version
```

## Project Setup

### Step 1: Create a new project directory

```bash
mkdir course-learning-app
cd course-learning-app
```

### Step 2: Initialize the project and install dependencies

```bash
npm init -y
npm install express mongoose dotenv cors bcrypt jsonwebtoken express-validator morgan
npm install --save-dev typescript ts-node-dev @types/express @types/node @types/cors @types/bcrypt @types/jsonwebtoken @types/morgan eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Step 3: Create TypeScript configuration

Create a `tsconfig.json` file in your project root with the following content:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 4: Create environment variables

Create a `.env` file in your project root:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/course-learning-app

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Admin User (created on first run)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### Step 5: Set up the project structure

Create the following directory structure:

```
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── types/
├── utils/
├── app.ts
└── server.ts
```

You can create this structure with these commands:

```bash
mkdir -p src/config src/controllers src/middleware src/models src/routes src/services src/types src/utils
touch src/app.ts src/server.ts
```

## Database Setup

### Step 1: Install and start MongoDB (if using a local installation)

If you haven't already, you'll need to install MongoDB on your system. Here are the basic steps for different operating systems:

**For Windows:**
1. Download the MongoDB Community Server from the [MongoDB website](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the instructions
3. Start MongoDB service

**For macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**For Ubuntu:**
```bash
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
```

### Step 2: Verify MongoDB is running

To check if MongoDB is running, run:

```bash
# For Windows
mongo

# For macOS/Linux
mongosh
```

If MongoDB is running, you should see the MongoDB shell.

### Step 3: Alternative - Use MongoDB Atlas (Cloud)

If you prefer not to install MongoDB locally, you can use MongoDB Atlas:

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (the free tier is sufficient)
3. Set up a database user with password
4. Whitelist your IP address
5. Get your connection string and update your `.env` file:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/course-learning-app?retryWrites=true&w=majority
```

Replace `<username>` and `<password>` with your actual MongoDB Atlas credentials.

## Understanding the Code Structure

Let's understand the different components of the application:

### Types (src/types/index.ts)

This file contains TypeScript interfaces and types used throughout the app, including user roles, course levels, and document interfaces for MongoDB models.

### Models (src/models/)

These files define Mongoose schemas and models for database collections:
- `user.model.ts`: User schema with authentication methods
- `course.model.ts`: Course schema with references to lessons
- `lesson.model.ts`: Lesson schema with references to topics
- `topic.model.ts`: Topic schema including support for quizzes

### Middleware (src/middleware/)

- `auth.ts`: JWT authentication and role authorization
- `error.ts`: Global error handling middleware
- `validate.ts`: Request validation using express-validator

### Services (src/services/)

These files contain business logic:
- `authService.ts`: User authentication and profile management
- `teacherService.ts`: Course, lesson, and topic management for teachers
- `studentService.ts`: Course enrollment, likes, and teacher following for students

### Controllers (src/controllers/)

Controllers handle HTTP requests and responses:
- `authController.ts`: Registration, login, and profile management
- `teacherController.ts`: Teacher-specific endpoints
- `studentController.ts`: Student-specific endpoints

### Routes (src/routes/)

These files define API routes and link them to controllers:
- `authRoutes.ts`: Authentication routes
- `teacherRoutes.ts`: Teacher routes with appropriate authorization
- `studentRoutes.ts`: Student routes with appropriate authorization

### Configuration (src/config/)

- `db.ts`: MongoDB connection setup
- `jwt.ts`: JWT token generation and verification

### Utils (src/utils/)

- `QueryBuilder.ts`: Utility for building MongoDB queries with filtering, pagination, and search

### App and Server (src/app.ts, src/server.ts)

- `app.ts`: Express application setup with middleware and routes
- `server.ts`: Server initialization and database connection

## Running the Application

### Step 1: Update package.json scripts

Ensure your `package.json` file has these scripts:

```json
"scripts": {
  "start": "node dist/server.js",
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsc",
  "lint": "eslint . --ext .ts",
  "format": "prettier --write \"src/**/*.ts\""
}
```

### Step 2: Start the development server

Run the application in development mode:

```bash
npm run dev
```

You should see output similar to:

```
[INFO] 12:34:56 ts-node-dev ver. 1.1.8 (using ts-node ver. 10.4.0, typescript ver. 4.5.4)
MongoDB Connected: localhost
Server running in development mode on port 5000
```

## Testing the API

Now let's test some of the API endpoints using Postman or any other API testing tool.

### Step 1: Create a Teacher Account

Send a POST request to `http://localhost:5000/api/v1/auth/register` with this JSON body:

```json
{
  "name": "Teacher One",
  "email": "teacher@example.com",
  "password": "password123",
  "role": "teacher"
}
```

If successful, you should receive a response with a JWT token:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "name": "Teacher One",
      "email": "teacher@example.com",
      "role": "teacher",
      "_id": "60d21b4667d0d8992e610c85",
      "createdAt": "2023-05-20T13:45:22.123Z",
      "updatedAt": "2023-05-20T13:45:22.123Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Step 2: Create a Student Account

Send a POST request to `http://localhost:5000/api/v1/auth/register` with this JSON body:

```json
{
  "name": "Student One",
  "email": "student@example.com",
  "password": "password123",
  "role": "student"
}
```

### Step 3: Login as Teacher

Send a POST request to `http://localhost:5000/api/v1/auth/login` with:

```json
{
  "email": "teacher@example.com",
  "password": "password123"
}
```

Save the token from the response for subsequent requests.

### Step 4: Create a Course (as Teacher)

Send a POST request to `http://localhost:5000/api/v1/teacher/courses` with the Authorization header set to `Bearer YOUR_TOKEN` and this JSON body:

```json
{
  "title": "Introduction to TypeScript",
  "description": "Learn the basics of TypeScript programming language",
  "level": "beginner"
}
```

### Step 5: Login as Student

Send a POST request to `http://localhost:5000/api/v1/auth/login` with:

```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

Save the student token.

### Step 6: Browse Courses (as Student)

Send a GET request to `http://localhost:5000/api/v1/student/courses` with the student's token in the Authorization header.

### Step 7: Enroll in a Course (as Student)

Send a POST request to `http://localhost:5000/api/v1/student/courses/COURSE_ID/enroll` using the course ID from step 4 and the student's token.

## API Endpoints Reference

### Authentication Routes

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `PUT /api/v1/auth/change-password` - Change password

### Teacher Routes

- `POST /api/v1/teacher/courses` - Create a new course
- `GET /api/v1/teacher/courses` - Get teacher's courses
- `GET /api/v1/teacher/courses/:courseId` - Get course details
- `PUT /api/v1/teacher/courses/:courseId` - Update course
- `DELETE /api/v1/teacher/courses/:courseId` - Delete course
- `POST /api/v1/teacher/courses/:courseId/lessons` - Add lesson to course
- `PUT /api/v1/teacher/lessons/:lessonId` - Update lesson
- `DELETE /api/v1/teacher/lessons/:lessonId` - Delete lesson
- `POST /api/v1/teacher/lessons/:lessonId/topics` - Add topic to lesson
- `PUT /api/v1/teacher/topics/:topicId` - Update topic
- `DELETE /api/v1/teacher/topics/:topicId` - Delete topic
- `GET /api/v1/teacher/analytics/courses/:courseId` - Get course analytics

### Student Routes

- `GET /api/v1/student/courses` - Get all courses
- `GET /api/v1/student/courses/:courseId` - Get course details
- `POST /api/v1/student/courses/:courseId/enroll` - Enroll in course
- `GET /api/v1/student/enrolled-courses` - Get enrolled courses
- `POST /api/v1/student/courses/:courseId/like` - Like a course
- `POST /api/v1/student/teachers/:teacherId/follow` - Follow a teacher
- `DELETE /api/v1/student/teachers/:teacherId/unfollow` - Unfollow a teacher
- `GET /api/v1/student/followed-teachers` - Get followed teachers

### Public Routes

- `GET /api/v1/course` - Browse and search courses (no authentication required)

## Troubleshooting

### MongoDB Connection Issues

**Problem**: Cannot connect to MongoDB
**Solution**:
1. Ensure MongoDB is running
2. Check the connection string in your `.env` file
3. If using MongoDB Atlas, verify your IP address is whitelisted
4. Try connecting with MongoDB Compass to verify your credentials

```js
// Testing MongoDB connection manually
const mongoose = require('mongoose');

mongoose.connect('YOUR_CONNECTION_STRING')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect', err));
```

### JWT Authentication Issues

**Problem**: Getting "Invalid token" errors
**Solution**:
1. Ensure you're including the token in the Authorization header as `Bearer TOKEN`
2. Check that your JWT_SECRET in the .env file matches what was used to generate the token
3. Verify the token hasn't expired

### Request Validation Errors

**Problem**: Getting validation errors when creating resources
**Solution**:
1. Check your request data against the validation rules in the corresponding controller
2. Ensure required fields are provided and have the correct data types
3. For nested objects like quiz questions, ensure they follow the required structure

### Adding Lessons and Topics

**Problem**: Can't add lessons or topics
**Solution**:
1. Verify you're authenticated as a teacher
2. Confirm you own the course you're trying to modify
3. Check that you're using the correct course ID or lesson ID in the request URL

## Conclusion

Congratulations! You've successfully set up a Course Learning API using Node.js, Express, MongoDB, TypeScript, and Mongoose. This API provides a solid foundation for building a full-featured learning platform.

Remember to secure your application further before deploying to production:
1. Use HTTPS
2. Add rate limiting
3. Implement proper input sanitization
4. Consider adding additional security headers
5. Change the JWT secret to a strong, unique value

Happy coding!