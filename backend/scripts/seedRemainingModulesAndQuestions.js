const { sequelize, Module, Question, Course } = require('../models'); // Added Course

async function seedRemainingModulesAndQuestions() {
  try {
    // For courses 1 through 5
    for (let courseId = 1; courseId <= 5; courseId++) {
      // Update Course to set needsPreTest and needsPostTest to true
      await Course.update(
        { needsPreTest: true, needsPostTest: true },
        { where: { id: courseId } }
      );
      console.log(`ℹ️ Updated course ${courseId} to set needsPreTest and needsPostTest to true.`);

      let courseName;
      let courseContent;
      
      // Set specific content based on course ID
      switch (courseId) {
        case 1:
          courseName = 'Effleurage';
          courseContent = 'teknik pijat dengan gerakan mengusir ketegangan otot secara lembut';
          break;
        case 2:
          courseName = 'Petrissage';
          courseContent = 'teknik pijat dengan gerakan meremas dan mengangkat otot';
          break;
        case 3:
          courseName = 'Friction';
          courseContent = 'teknik pijat dengan gerakan melingkar menggunakan ujung jari atau ibu jari';
          break;
        case 4:
          courseName = 'Pijat Punggung';
          courseContent = 'teknik pijat komprehensif untuk area punggung';
          break;
        case 5:
          courseName = 'Shaking';
          courseContent = 'teknik pijat dengan gerakan mengguncang untuk relaksasi';
          break;
        default:
          courseName = 'Unknown';
          courseContent = 'deskripsi tidak tersedia';
      }

      // Create modules for each course
      const modules = [
        {
          courseId,
          judul: `Pre-Test: Pengetahuan Dasar ${courseName}`,
          type: 'pre_test',
          contentText: `Silakan jawab pertanyaan berikut untuk mengukur pemahaman awal Anda tentang ${courseName}.`,
          order: 1
        },
        {
          courseId,
          judul: `Pengenalan ${courseName}`,
          type: 'text',
          contentText: `${courseName} adalah ${courseContent}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
          order: 2
        },
        {
          courseId,
          judul: `Panduan Detail ${courseName}`,
          type: 'pdf',
          pdfPath: '/uploads/dummy.pdf',
          contentText: `Silakan pelajari panduan lengkap teknik ${courseName} dalam bentuk PDF berikut ini.`,
          order: 3
        },
        {
          courseId,
          judul: `Video Tutorial ${courseName}`,
          type: 'video',
          videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          contentText: `Tonton video tutorial berikut untuk mempelajari teknik ${courseName} dengan detail.`,
          order: 4
        },
        {
          courseId,
          judul: `Post-Test: Evaluasi ${courseName}`,
          type: 'post_test',
          contentText: `Silakan jawab pertanyaan berikut untuk mengukur pemahaman Anda tentang ${courseName} setelah mengikuti kursus.`,
          order: 5
        }
      ];

      // Create modules
      for (const moduleData of modules) {
        const createdModule = await Module.create(moduleData);
        console.log(`✅ Created module: ${moduleData.judul} for course ${courseId}`);

        // Add questions for pre-test and post-test modules
        if (moduleData.type === 'pre_test' || moduleData.type === 'post_test') {
          const questions = [
            {
              moduleId: createdModule.id,
              teksSoal: `Apa tujuan utama dari teknik ${courseName}?`,
              type: 'mcq',
              options: JSON.stringify([
                { id: 'a', text: 'Meningkatkan sirkulasi darah' },
                { id: 'b', text: 'Mengurangi ketegangan otot' },
                { id: 'c', text: `Memberikan efek ${courseContent}` },
                { id: 'd', text: 'Semua jawaban benar' }
              ]),
              correctOptionId: 'd',
              explanation: `${courseName} memberikan semua manfaat tersebut secara menyeluruh.`
            },
            {
              moduleId: createdModule.id,
              teksSoal: `Kapan teknik ${courseName} sebaiknya tidak digunakan?`,
              type: 'mcq',
              options: JSON.stringify([
                { id: 'a', text: 'Saat ada luka terbuka' },
                { id: 'b', text: 'Saat terjadi peradangan' },
                { id: 'c', text: 'Saat ada infeksi kulit' },
                { id: 'd', text: 'Semua jawaban benar' }
              ]),
              correctOptionId: 'd',
              explanation: 'Semua kondisi tersebut merupakan kontraindikasi untuk pijat.'
            },
            {
              moduleId: createdModule.id,
              teksSoal: `Berapa tekanan ideal untuk teknik ${courseName}?`,
              type: 'mcq',
              options: JSON.stringify([
                { id: 'a', text: 'Sangat ringan' },
                { id: 'b', text: 'Sedang' },
                { id: 'c', text: 'Disesuaikan dengan kondisi' },
                { id: 'd', text: 'Selalu kuat' }
              ]),
              correctOptionId: 'c',
              explanation: 'Tekanan harus disesuaikan dengan kondisi dan kebutuhan klien.'
            },
            {
              moduleId: createdModule.id,
              teksSoal: `Apa persiapan penting sebelum melakukan ${courseName}?`,
              type: 'mcq',
              options: JSON.stringify([
                { id: 'a', text: 'Mencuci tangan' },
                { id: 'b', text: 'Memeriksa kondisi klien' },
                { id: 'c', text: 'Menyiapkan ruangan' },
                { id: 'd', text: 'Semua jawaban benar' }
              ]),
              correctOptionId: 'd',
              explanation: 'Semua persiapan tersebut penting untuk sesi pijat yang aman dan efektif.'
            },
            {
              moduleId: createdModule.id,
              teksSoal: `Bagaimana cara mengakhiri sesi ${courseName} yang benar?`,
              type: 'mcq',
              options: JSON.stringify([
                { id: 'a', text: 'Langsung berhenti' },
                { id: 'b', text: 'Perlahan mengurangi intensitas' },
                { id: 'c', text: 'Memberikan gerakan penutup yang lembut' },
                { id: 'd', text: 'B dan C benar' }
              ]),
              correctOptionId: 'd',
              explanation: 'Mengakhiri sesi pijat harus dilakukan secara bertahap dan lembut.'
            }
          ];

          for (const question of questions) {
            await Question.create(question);
          }
          console.log(`✅ Created 5 questions for module: ${moduleData.judul}`);
        }
      }
    }

    console.log('✅ Successfully seeded modules and questions for remaining courses');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding modules and questions:', error);
    process.exit(1);
  }
}

// Run the seeding
seedRemainingModulesAndQuestions();