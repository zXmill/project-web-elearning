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
- [x] User profile picture upload
- [x] User profile fields for affiliation and phone number
- [ ] Multi Create User

### Course & Content Management (Admin)
- [x] CRUD operations for courses
- [x] CRUD operations for modules within courses
- [x] CRUD operations for content (videos, articles, PDFs) within modules
- [x] Ability to set course prerequisites
- [x] Support for PDF as a module content type
- [x] SEO-friendly slugs for courses
- [x] "Initial content" field for modules
- [x] Configuration for course post-tests (e.g., linking questions)
- [x] "Explanation" field for quiz/assessment questions
- [x] Tracking of correct option for quiz/assessment questions
- [ ] Ability to manage course categories/tags

### Course & Content Consumption (User)
- [x] Browse and filter courses
- [x] Enroll in courses
- [x] View course content (videos, articles, PDFs)
- [x] Track course progress
- [x] Mark modules/content as complete
- [ ] Search functionality for courses and content

### Assessment & Certification
- [x] Quizzes/assessments within modules
- [x] Automatic grading for quizzes
- [x] Certificate download upon course completion (currently serves a dummy PDF: `dokumen/sertif.pdf`)
- [ ] View certificate page (frontend route `/course/:courseId/certificate` is planned)

## How to Use

### Installation & Setup
1. **Clone the Repository:**
   ```bash
   git clone git@github.com:zXmill/project-web-elearning.git
   ```
2. **Navigate to the Project Root:**
   ```bash
   cd project-web-elearning 
   ```
   (Or the name you cloned the repository as)
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

## Environment Variables

Create a `.env` file in the `backend` folder based on `.env.example`:

```
SESSION_SECRET=your_session_secret_here
DATABASE_URL=sqlite://./data/elearning.sqlite
FRONTEND_URL=http://localhost:3000
```

## Database Setup

1. **Run Migrations:**
   ```powershell
   cd backend
   npx sequelize-cli db:migrate
   ```
2. **Seed the Database:**
   ```powershell
   node scripts/seedCourses.js
   # You might also need to run: node scripts/seedRemainingModulesAndQuestions.js
   ```
   The seeding process creates a default user. Credentials can be found in `dokumen/credentials.txt`:
   - **Email:** `test@teraplus.com`
   - **Password:** `password123`
   This user may have admin privileges.

## Default User Credentials
After seeding the database, a default user account is available for testing:
- **Email:** `test@teraplus.com`
- **Password:** `password123`
This account may have administrative privileges depending on the seed data.

## Testing

- **Backend:**
  - Add your Jest or Mocha tests in `backend/tests/`.
  - Example run:
    ```powershell
    cd backend
    npx jest
    ```
- **Frontend:**
  - Add your React Testing Library or Jest tests in `frontend/src/__tests__/`.
  - Example run:
    ```powershell
    cd frontend
    npm test
    ```

## Certificate Download

- Upon completing a course and its post-test, users can download a certificate from the post-test results page.
- Currently, the system serves a **dummy certificate** located at `dokumen/sertif.pdf` (downloaded as `sertifikat_kompetensi.pdf`).
- **Future Enhancements:**
    - Dynamic certificate generation using a template (e.g., `dokumen/sertif.png`).
    - A "Confirm Name" modal will allow users to verify their name before the certificate is generated with their actual name.
    - A dedicated page to view certificates online (planned for frontend route `/course/:courseId/certificate`).

## Additional Notes
- **.env Files:**  
  Use the provided `.env.example` in the backend as a guide. Ensure you do NOT commit your actual `.env` file by listing it in `.gitignore`.
- **Authentication:**  
  Configure your Git identity and use SSH or a personal access token for GitHub.
- **Contribution:**  
  Contributions are welcome! Please fork the repository, create your feature branch, and open a pull request.

## License
