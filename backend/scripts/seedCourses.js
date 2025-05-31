const db = require('../models');

const LOREM_IPSUM_150 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis.";

const coursesData = [
  {
    id: 1,
    judul: "Dasar-Dasar Pijat Effleurage",
    deskripsi: "Pelajari teknik dasar Effleurage untuk relaksasi dan pemulihan awal. Cocok untuk pemula.",
    imageSrc: "https://via.placeholder.com/400x225.png?text=Effleurage+Dasar",
    area: "Semua Area",
  },
  {
    id: 2,
    judul: "Petrissage untuk Otot Betis",
    deskripsi: "Teknik Petrissage mendalam yang fokus pada otot betis untuk mengatasi ketegangan dan meningkatkan sirkulasi.",
    imageSrc: "https://via.placeholder.com/400x225.png?text=Petrissage+Betis",
    area: "Betis (Depan-Belakang)",
  },
  {
    id: 3,
    judul: "Teknik Friction Sendi Bahu",
    deskripsi: "Fokus pada teknik Friction untuk mengatasi masalah pada sendi bahu dan area sekitarnya.",
    imageSrc: "https://via.placeholder.com/400x225.png?text=Friction+Bahu",
    area: "Pundak Leher Bahu",
  },
  {
    id: 4,
    judul: "Pijat Punggung Komprehensif",
    deskripsi: "Kursus lengkap untuk pijat area punggung, menggabungkan berbagai teknik untuk hasil maksimal.",
    imageSrc: "https://via.placeholder.com/400x225.png?text=Pijat+Punggung",
    area: "Pinggang Punggung",
  },
  {
    id: 5,
    judul: "Relaksasi Lengan dengan Shaking",
    deskripsi: "Pelajari teknik Shaking yang efektif untuk merelaksasi otot-otot lengan.",
    imageSrc: "https://via.placeholder.com/400x225.png?text=Shaking+Lengan",
    area: "Lengan",
  }
];

// Helper function to generate 5 unique questions for a test type (pre/post) and course
function generateTestQuestions(courseId, testTypePrefix) {
  const questions = [];
  for (let i = 1; i <= 5; i++) {
    questions.push({
      teksSoal: `${testTypePrefix} Question ${i} for Course ${courseId}: What is the primary technique used in this scenario?`,
      type: "mcq",
      options: [
        { id: `c${courseId}${testTypePrefix.toLowerCase()[0]}q${i}opt1`, text: `Option A for Q${i}` },
        { id: `c${courseId}${testTypePrefix.toLowerCase()[0]}q${i}opt2`, text: `Option B for Q${i}` },
        { id: `c${courseId}${testTypePrefix.toLowerCase()[0]}q${i}opt3`, text: `Correct Option C for Q${i}` },
        { id: `c${courseId}${testTypePrefix.toLowerCase()[0]}q${i}opt4`, text: `Option D for Q${i}` }
      ],
      correctOptionId: `c${courseId}${testTypePrefix.toLowerCase()[0]}q${i}opt3` // Assuming C is always correct for simplicity
    });
  }
  return questions;
}

async function seedDatabase() {
  try {
    console.log('Ensuring database schema is up to date (manual step or use migrations/alter:true)...');
    // IMPORTANT: For development, you might use `await db.sequelize.sync({ alter: true });`
    // For production, use migrations.
    // await db.sequelize.sync({ alter: true }); // Uncomment for dev if needed, then re-comment

    for (const courseData of coursesData) {
      const [course, courseCreated] = await db.Course.findOrCreate({
        where: { id: courseData.id }, // Use ID to ensure we're targeting specific courses
        defaults: { ...courseData, needsPreTest: true } // All courses need pre-test
      });

      if (courseCreated) {
        console.log(`Course "${course.judul}" (ID: ${course.id}) created with needsPreTest=true.`);
      } else {
        // Ensure existing courses also have needsPreTest set to true
        if (!course.needsPreTest) {
          await course.update({ needsPreTest: true });
          console.log(`Course "${course.judul}" (ID: ${course.id}) updated to needsPreTest=true.`);
        } else {
          console.log(`Course "${course.judul}" (ID: ${course.id}) already exists and has needsPreTest=true.`);
        }
      }

      // --- Create Pre-Test Module and Questions ---
      const [preTestModule, preTestModuleCreated] = await db.Module.findOrCreate({
        where: { courseId: course.id, isPreTest: true },
        defaults: {
          courseId: course.id,
          judul: `Pre-Test: ${course.judul}`,
          type: "web",
          isPreTest: true,
          isPostTest: false,
          hasQuiz: true,
        }
      });
      if (preTestModuleCreated) console.log(`  Pre-Test Module for "${course.judul}" created.`);
      
      const preTestQuestionsData = generateTestQuestions(course.id, "PreTest");
      for (const qData of preTestQuestionsData) {
        await db.Question.findOrCreate({
          where: { moduleId: preTestModule.id, teksSoal: qData.teksSoal },
          defaults: { ...qData, moduleId: preTestModule.id }
        });
      }
      console.log(`    Added 5 Pre-Test questions for "${course.judul}".`);

      // --- Create Content Modules ---
      // 1. Pendahuluan
      await db.Module.findOrCreate({
        where: { courseId: course.id, judul: `Pendahuluan: ${course.judul}` },
        defaults: {
          courseId: course.id,
          judul: `Pendahuluan: ${course.judul}`,
          type: "web",
          contentText: LOREM_IPSUM_150,
          isPreTest: false,
          isPostTest: false,
          hasQuiz: false,
          order: 1, // Order for content modules
        }
      });
      console.log(`  Content Module "Pendahuluan" for "${course.judul}" created/checked.`);

      // 2. Materi PDF
      await db.Module.findOrCreate({
        where: { courseId: course.id, judul: `Materi PDF: ${course.judul}` },
        defaults: {
          courseId: course.id,
          judul: `Materi PDF: ${course.judul}`,
          type: "pdf",
          pdfPath: 'penelitian.pdf', // Use the actual uploaded PDF
          isPreTest: false,
          isPostTest: false,
          hasQuiz: false,
          order: 2, // Order for content modules
        }
      });
      console.log(`  Content Module "Materi PDF" for "${course.judul}" created/checked.`);
      
      // 3. Video Pembelajaran
      await db.Module.findOrCreate({
        where: { courseId: course.id, judul: `Video Pembelajaran: ${course.judul}` },
        defaults: {
          courseId: course.id,
          judul: `Video Pembelajaran: ${course.judul}`,
          type: "web", // Assuming video link will be embedded in a web page/component
          videoLink: "dQw4w9WgXcQ", // Placeholder YouTube Video ID
          isPreTest: false,
          isPostTest: false,
          hasQuiz: false,
          order: 3, // Order for content modules
        }
      });
      console.log(`  Content Module "Video Pembelajaran" for "${course.judul}" created/checked.`);

      // --- Create Post-Test Module and Questions ---
      const [postTestModule, postTestModuleCreated] = await db.Module.findOrCreate({
        where: { courseId: course.id, isPostTest: true },
        defaults: {
          courseId: course.id,
          judul: `Post-Test: ${course.judul}`,
          type: "web",
          isPreTest: false,
          isPostTest: true,
          hasQuiz: true,
        }
      });
      if (postTestModuleCreated) console.log(`  Post-Test Module for "${course.judul}" created.`);

      const postTestQuestionsData = generateTestQuestions(course.id, "PostTest");
      for (const qData of postTestQuestionsData) {
        await db.Question.findOrCreate({
          where: { moduleId: postTestModule.id, teksSoal: qData.teksSoal },
          defaults: { ...qData, moduleId: postTestModule.id }
        });
      }
      console.log(`    Added 5 Post-Test questions for "${course.judul}".`);
      console.log('---');
    }
    console.log('Full database seeding finished.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); // Renamed function call
