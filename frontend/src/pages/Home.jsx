import { useEffect, useState } from "react";
export { default as BottomNav } from '../components/Common/BottomNav';
export { default as CourseCard } from '../components/Common/CourseCard';
export { default as SearchBar } from '../components/Common/SearchBar';
import api from "../services/api";

export default function Home() {
  const [bodyParts] = useState([
    { id: 1, name: "Betis Depan", icon: "🦵" },
    { id: 2, name: "Paha Belakang", icon: "🏋️" },
  ]);

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await api.get("/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Gagal memuat kursus:", error);
      }
    };
    loadCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-green-800">
      {/* Header */}
      <div className="p-4 text-white">
        <h1 className="text-2xl font-bold">Pelatihan Sports Massage</h1>
        <p className="text-sm opacity-75">
          Pilih area tubuh untuk mulai belajar
        </p>
      </div>

      {/* Pencarian */}
      <div className="px-4 mb-6">
        <SearchBar />
      </div>

      {/* Area Tubuh */}
      <div className="grid grid-cols-2 gap-4 px-4 mb-8">
        {bodyParts.map((part) => (
          <button
            key={part.id}
            className="bg-white/10 rounded-lg p-4 backdrop-blur-sm hover:bg-white/20 transition"
          >
            <div className="text-4xl mb-2">{part.icon}</div>
            <div className="text-sm font-medium">{part.name}</div>
          </button>
        ))}
      </div>

      {/* Daftar Kursus */}
      <div className="px-4">
        <h2 className="text-white text-lg font-semibold mb-4">
          Kursus Tersedia
        </h2>
        <div className="space-y-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              title={course.title}
              progress={course.progress}
              level={course.level}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
