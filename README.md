# CampusSync

CampusSync is a full-stack web application developed using the MERN stack (MongoDB, Express.js, React.js, and Node.js). The platform is designed to provide students with a centralized space to collaborate on projects and hackathons, manage assignments, share interview experiences, and assess their career readiness.

## Live Demo

Frontend: https://campus-sync-sigma.vercel.app/

Backend API: https://campus-sync-production.up.railway.app/

## Features

* Secure user authentication with Login, Registration, Forgot Password, and Reset Password functionalities.
* Project and Hackathon Collaboration Board for creating and managing collaboration posts.
* Assignment Management System for organizing and tracking academic tasks.
* Interview Experience Sharing module to help students prepare for placements.
* Career Readiness Check module for evaluating skills and placement preparation.
* User Profile Management for viewing and updating personal information.
* Responsive user interface that works across desktop and mobile devices.

## Tech Stack

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript
* Axios
* React Router DOM
* Vercel (Deployment)

### Backend

* Node.js
* Express.js
* JWT Authentication
* Brevo Email API
* Railway (Deployment)

### Database

* MongoDB
* Mongoose

## Project Structure

```text
campus-sync
│
├── client
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── context
│   │   ├── services
│   │   └── App.js
│
├── server
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── config
│   └── server.js
│
└── README.md
```

## Modules

### User Authentication

Allows users to register and log in securely using JWT authentication. It also includes Forgot Password and Reset Password functionalities using the Brevo Email API.

### Collaboration Board

Enables students to create and view project and hackathon posts by specifying project details, required skills, and team size. Users can create, edit, and manage collaboration opportunities efficiently.

### Assignment Management

Allows students to create, update, and delete assignments and maintain their academic schedules in an organized manner.

### Interview Experiences

Provides a platform for students to share interview experiences, placement tips, and company recruitment processes, helping peers prepare effectively for placements.

### Career Check

Helps students evaluate their career readiness and identify areas that require improvement in their placement preparation.

### Profile Management

Allows users to view and update their personal information and maintain their profile details within the platform.

## Installation

### Clone the Repository

```bash
git clone https://github.com/Susmitha510/campus-sync.git
cd campus-sync
```

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Install Backend Dependencies

```bash
cd ../server
npm install
```

### Configure Environment Variables

Create a `.env` file inside the server folder and add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
BREVO_API_KEY=your_brevo_api_key
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:3000
```

### Run Backend Server

```bash
cd server
npm start
```

### Run Frontend Application

```bash
cd client
npm start
```

Frontend:
http://localhost:3000

Backend:
http://localhost:5000

## Learning Outcomes

This project provided practical experience in:

* Full-stack web development using the MERN stack
* RESTful API development and integration
* JWT-based authentication and authorization
* MongoDB database design and management
* Email service integration using the Brevo Email API
* Component-based architecture and state management in React
* Responsive web design and cloud deployment using Vercel and Railway

## Future Enhancements

* Real-time chat and messaging system
* Notifications and reminders
* File and document sharing
* AI-powered career recommendations
* Team invitation and approval system
* Mobile application support

## Author

**Susmitha P**

B.E. Computer Science and Engineering

SSN College of Engineering

MERN Stack Developer | Full Stack Enthusiast
