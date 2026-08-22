\# PROMPTS.md



\## Car Dealership Kata – AI-Assisted Development Prompts



This document records the prompts used during the development of the Car Dealership application.



\---



\## 1. Project Planning



\### Prompt



> Give me a complete step-by-step implementation plan for the Car Dealership kata, including the database schema, API structure, TDD test cases, React pages, Git commit sequence, README, and exactly what to put in PROMPTS.md.



\### Purpose



Used to establish the overall project architecture, development workflow, database design, API requirements, testing strategy, frontend structure, and documentation plan.



\---



\## 2. Backend Setup



\### Prompt



> Give me the backend implementation for the Car Dealership application using Node.js, Express, TypeScript, and SQLite. Include the project structure, database connection, server setup, routes, middleware, authentication, and vehicle management APIs.



\### Purpose



Used to implement the initial REST API and backend architecture.



\---



\## 3. Database Setup



\### Prompt



> Create the SQLite database schema for a car dealership inventory system. Include users, vehicles, authentication-related fields, timestamps, and seed data for testing.



\### Purpose



Used to create the persistent data layer and initial development data.



\---



\## 4. Authentication



\### Prompt



> Implement user registration and login using Express, SQLite, bcrypt, and JWT. Include password hashing, JWT generation, authentication middleware, and role-based authorization for admin users.



\### Purpose



Used to implement secure authentication and distinguish normal users from administrators.



\---



\## 5. Vehicle APIs



\### Prompt



> Implement REST APIs for the vehicle inventory. Include public vehicle listing, vehicle search, admin-only create/update/delete operations, authenticated vehicle purchase, and admin vehicle restocking.



\### Purpose



Used to implement the core dealership inventory functionality.



\---



\## 6. Search and Filtering



\### Prompt



> Add vehicle search functionality that supports filtering by make, model, category, minimum price, and maximum price. Use parameterized SQLite queries.



\### Purpose



Used to implement vehicle discovery and filtering while avoiding unsafe SQL construction.



\---



\## 7. TDD / Backend Testing



\### Prompt



> Create Jest and Supertest test cases for the backend. Follow a TDD-style approach and cover authentication, registration, duplicate users, missing fields, vehicle operations, authorization, purchasing, and restocking.



\### Purpose



Used to define and implement automated backend tests.



\---



\## 8. React Frontend



\### Prompt



> Create a React and TypeScript frontend for the Car Dealership application. Include login, vehicle listing, search, purchase functionality, logout, and an admin dashboard.



\### Purpose



Used to implement the user interface and connect the frontend to the REST API.



\---



\## 9. Admin Dashboard



\### Prompt



> Create an AdminPanel React component that allows administrators to add, update, delete, and restock vehicles. Use Axios and JWT authentication when calling protected backend endpoints.



\### Purpose



Used to implement administrative inventory management.



\---



\## 10. JWT Role Handling



\### Prompt



> The JWT contains an ADMIN role but the frontend is checking for lowercase "admin". Fix the frontend role check so that ADMIN and admin are both recognized correctly.



\### Purpose



Used to resolve a case-sensitivity issue between the backend JWT role and frontend authorization check.



\### Resolution



The frontend role check was changed to:



```typescript

return String(payload.role).toLowerCase() === "admin";

