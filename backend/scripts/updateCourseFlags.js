const db = require('../models');

async function updateCourseFlags() {
  try {
    const courseId = 1;
    const course = await db.Course.findByPk(courseId);
    if (!course) {
      console.error(`Course with ID ${courseId} not found.`);
      process.exit(1);
    }
    course.needsPreTest = true;
    course.needsPostTest = true;
    await course.save();
    console.log(`Course ID ${courseId} updated: needsPreTest and needsPostTest set to true.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating course flags:', error);
    process.exit(1);
  }
}

updateCourseFlags();
