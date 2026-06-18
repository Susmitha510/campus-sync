# CampusSync

CampusSync is a full-stack MERN application built to help students manage their academic and career-related activities in one place. Instead of using multiple platforms for assignments, project collaboration, interview preparation, and career guidance, CampusSync brings everything together in a single application.

The platform allows students to collaborate on projects and hackathons, organize assignments, share interview experiences, and evaluate their career readiness through a clean and responsive interface.

## Live Demo

🔗 Frontend: https://campus-sync-sigma.vercel.app/

🔗 Backend API: https://campus-sync-production.up.railway.app/

## Features

* Secure user authentication (Login, Register, Forgot Password, Reset Password)
* Project and Hackathon Collaboration Board
* Assignment Management System
* Interview Experience Sharing
* Career Readiness Check
* User Profile Management
* Responsive design for desktop and mobile devices

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

## Modules

### Authentication

Users can create an account, log in securely, and reset their password through email verification using the Brevo Email API.

### Collaboration Board

Students can create project and hackathon posts by adding details such as title, description, required skills, and team size. This helps students find teammates and collaborate easily.

### Assignment Management

Students can add, edit, and delete assignments and keep track of their academic tasks in an organized way.

### Interview Experiences

Students can share their placement experiences, interview rounds, and preparation strategies so that others can learn from them.

### Career Check

This module helps students assess their preparation level and identify areas that need improvement for placements.

### Profile Management

Users can view and update their personal information and manage their profile details.

## Installation

### Clone the Repository

```bash
git clone https://github.com/Susmitha510/campus-sync.git
cd campus-sync
```

### Install Dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### Environment Variables

Create a `.env` file inside the server folder and add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
BREVO_API_KEY=your_brevo_api_key
CLIENT_URL=http://localhost:3000
```

### Run the Application

Backend:

```bash
cd server
npm start
```

Frontend:

```bash
cd client
npm start
```

## What I Learned

Through this project, I gained practical experience in:

* Building full-stack applications using the MERN stack
* Developing and integrating REST APIs
* Implementing JWT-based authentication
* Working with MongoDB and Mongoose
* Integrating third-party services like the Brevo Email API
* Building responsive user interfaces using React
* Deploying applications using Vercel and Railway

## Future Improvements

* Real-time chat between collaborators
* Notifications and reminders
* File sharing support
* AI-based career recommendations
* Team invitation system
* Mobile application version

## Author

**Susmitha P**

