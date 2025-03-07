# Task Manager

A modern, full-stack task management application built with React, Node.js, and MongoDB.

## Features

- 🔐 User Authentication (Register/Login)
- 📝 Task Creation and Management
- 🎨 Customizable Categories
- 📅 Calendar Integration
- ⏰ Task Reminders
- 🌓 Dark/Light Mode
- 🔔 Real-time Notifications
- 📱 Responsive Design

## Tech Stack

### Frontend
- React
- TypeScript
- Material-UI
- Context API for State Management
- React Router for Navigation
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- RESTful API Architecture

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shubhamrsaroj/TaskManager.git
cd TaskManager
```

2. Install Backend Dependencies:
```bash
cd backend
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory with:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Install Frontend Dependencies:
```bash
cd ../frontend
npm install
```

5. Start the Backend Server:
```bash
cd backend
npm start
```

6. Start the Frontend Development Server:
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
TaskManager/
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # Context providers
│   │   ├── styles/        # CSS styles
│   │   └── utils/         # Utility functions
│   └── public/            # Static files
└── backend/               # Node.js backend
    ├── controllers/       # Route controllers
    ├── models/           # Database models
    ├── routes/           # API routes
    └── middleware/       # Custom middleware
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Shubham Saroj - [@shubhamrsaroj](https://github.com/shubhamrsaroj) 