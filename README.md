# Project E-Learning Unesa

## Overview
Project E-Learning Unesa is a comprehensive e-learning platform featuring a modern React frontend and an Express/Node.js backend. This project supports multiple authentication methods and rich course content management, while also planning for administrative functionality, user progress tracking, and assessment-based certification.

## Features (Current & Planned)

### Authentication & User Management
- [x] User registration (local)
- [x] User login (local)
- [x] Google OAuth login
- [x] Display user email on homepage after login
- [x] Admin role and dashboard
- [x] User profile page
- [x] Password reset functionality

### Course & Content Management (Admin)
- [ ] CRUD operations for courses
- [ ] CRUD operations for modules within courses
- [ ] CRUD operations for content (videos, articles) within modules
- [ ] Ability to set course prerequisites
- [ ] Ability to manage course categories/tags

### Course & Content Consumption (User)
- [ ] Browse and filter courses
- [x] Enroll in courses
- [ ] View course content (videos, articles)
- [x] Track course progress
- [x] Mark modules/content as complete
- [ ] Search functionality for courses and content

### Assessment & Certification
- [x] Quizzes/assessments within modules
- [x] Automatic grading for quizzes
- [ ] Certificate generation upon course completion
- [ ] View and download certificates

## How to Use

### Installation & Setup
1. **Clone the Repository:**
   ```bash
   git clone git@github.com:zXmill/project-web-elearning.git
   ```
2. **Navigate to the Project Root:**
   ```bash
   cd e:\project_elearning\e-learning_unesa
   ```
3. **Install Dependencies:**
   - From the `backend` folder:
     ```bash
     cd backend
     npm install
     ```
   - From the `frontend` folder:
     ```bash
     cd ../frontend
     npm install
     ```

### Running the Application
- **Backend:**  
  Start the Express server from the `backend` folder:  
  ```bash
  npm run dev
  ```
- **Frontend:**  
  Start the React application from the `frontend` folder:  
  ```bash
  npm start
  ```
  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Additional Notes
- **.env Files:**  
  Use the provided `.env.example` in the backend as a guide. Ensure you do NOT commit your actual `.env` file by listing it in `.gitignore`.
- **Authentication:**  
  Configure your Git identity and use SSH or a personal access token for GitHub.
- **Contribution:**  
  Contributions are welcome! Please fork the repository, create your feature branch, and open a pull request.

## License
Fix commit