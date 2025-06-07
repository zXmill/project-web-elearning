const { Sequelize } = require('sequelize');
const path = require('path');

// Define the selective logger function
const selectiveLogger = (sqlQuery, sequelizeQueryOptions) => {
  // Define the contexts for which logging should occur
  const allowedContexts = [
    'userRegister',
    'userEnrollment',
    'userProfileChange',
    'adminChange',
    // 'userCourseFinish' will be an application-level log, not a direct SQL log via this function
  ];

  if (sequelizeQueryOptions && sequelizeQueryOptions.loggingContext) {
    if (allowedContexts.includes(sequelizeQueryOptions.loggingContext)) {
      console.log(`[SEQUELIZE_LOG][${sequelizeQueryOptions.loggingContext}] ${sqlQuery}`);
    }
  }
  // No action for other cases (e.g., development logs for NO_CONTEXT) in this version
  // to keep it clean and focused on the required logging.
  // If no loggingContext is provided, or if it's not in allowedContexts, nothing is logged.
};

module.exports = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'data', 'elearning.sqlite'),
  logging: selectiveLogger, // Use the custom selective logger
});
