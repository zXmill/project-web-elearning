# Project E-Learning Unesa

## Overview
Project E-Learning Unesa is a comprehensive e-learning system featuring a React-based frontend and an Express/Node.js backend. The application supports user authentication, course enrollment, multimedia content delivery, administrative dashboards, offline video caching, and certificate generation.

## Features
- **User Authentication:** Secure login using local credentials and social sign-in options.
- **Course Management:** Browse available courses and enroll seamlessly.
- **Content Delivery:** Access video lectures, textual content, PDFs, and interactive tests.
- **Admin Dashboard:** Monitor user statistics and course summaries.
- **Offline Support:** Cache videos locally for uninterrupted learning.
- **Certificate Generation:** Automatically create PDF certificates upon course completion.

## Directory Structure
```
e:\project_elearning\e-learning_unesa\
├── backend/        # Express backend with controllers, models, routes, etc.
├── frontend/       # React-based frontend using Tailwind CSS.
├── data/           # SQLite database file (created on first run).
├── git_commit.sh   # Bash script to automate Git commit and push.
└── README.md       # This file.
```

## Installation

### Prerequisites
- Node.js (v14+ recommended)
- Git (with a configured user identity)
- For Windows users, Git Bash is recommended for running bash scripts.

### Setup Steps
1. **Clone the Repository:**
   ```bash
   git clone git@github.com:zXmill/project-web-elearning.git
   ```
2. **Navigate to the Project Directory:**
   ```bash
   cd e:\project_elearning\e-learning_unesa
   ```
3. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```
4. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```


### Environment Variables
In the **backend/** folder, create a `.env` file with required configuration:
```dotenv
PORT=3000
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
# Add other necessary variables as needed
```

## Running the Application

### Start the Backend
From the `backend` directory:
```bash
npm start
```
The server will start on the port defined in your `.env` file.

### Start the Frontend
From the `frontend` directory:
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Git Workflow: Using the Commit Script

A handy script is provided to automate the Git commit and push workflow:

1. Open Git Bash (or run bash via PowerShell) in the project root (`e:\project_elearning\e-learning_unesa`).
2. Run the script:
   ```bash
   bash git_commit.sh
   ```
   
The script will:
- Stage all changes.
- Generate a commit message listing updated files (or a summary if there are too many files).
- Commit the changes.
- Push to the remote repository.

*Note:* If too many files are changed, the commit message will be shortened to avoid an excessively long argument list.

## Troubleshooting

- **Git Identity Not Set:**  
  If prompted with a message about unknown author identity, configure your Git user name and email as shown above.

- **Authentication Issues:**  
  Ensure your remote URL uses SSH or a PAT since GitHub no longer accepts password authentication for HTTPS remotes.

- **Rename Detection Warning:**  
  You may adjust the rename limit via:  
  ```bash
  git config diff.renameLimit 43610
  ```
  if you consistently work with a large number of files.

- **SSH Key Issues:**  
  Verify that your SSH key is added to your GitHub account by visiting [GitHub SSH settings](https://github.com/settings/keys).

## Contribution
Contributions are welcome! Fork this repository, make your changes, and open a pull request.

## License
This project is licensed under the MIT License.