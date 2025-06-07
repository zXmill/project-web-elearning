import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate
import SearchBar from "../components/Common/SearchBar";
import ContentCard from "../components/Common/ContentCard";
import { useAuth } from "../contexts/AuthContext"; // Corrected useAuth import
import api from "../services/api"; // Import api service
// import { Cog8ToothIcon } from '@heroicons/react/24/outline'; // For an icon - currently unused

const bodyAreas = [
  "Semua Area", "Betis (Depan-Belakang)", "Paha (Depan-Belakang)", 
  "Pinggang Punggung", "Pundak Leher Bahu", "Lengan", "Dada", "Perut"
];

// const massageLevels = [ // Removed as level filter is being removed
//   "Semua Level", "Effleurage", "Petrissage", "Shaking", 
//   "Tapotement", "Friction", "Vibration"
// ];

export default function Home() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [selectedArea, setSelectedArea] = useState(bodyAreas[0]);
  // const [selectedLevel, setSelectedLevel] = useState(massageLevels[0]); // Removed
  const { user, loading: authLoading } = useAuth(); // Use the auth hook

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [errorCourses, setErrorCourses] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        setErrorCourses('');
        const response = await api.get('/courses'); // Fetch from /api/courses
        if (response.data && response.data.status === 'success') {
          setCourses(response.data.data.courses);
        } else {
          setErrorCourses('Gagal mengambil data kursus.');
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setErrorCourses(err.response?.data?.message || 'Terjadi kesalahan server saat mengambil kursus.');
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const userNameToDisplay = user ? (user.namaLengkap || user.email || "Pengguna") : "Pengguna";

  const handleSearch = (query) => {
    console.log("Search Query:", query);
    // Future: Implement search logic based on API if backend supports it,
    // or filter 'courses' state locally.
  };

  // const handleLevelChange = (e) => { // Removed
  //   setSelectedLevel(e.target.value);
  // };
  
  // Filtering logic now only uses 'area' from the fetched courses
  const filteredCourses = courses.filter(course => 
    (selectedArea === "Semua Area" || course.area === selectedArea)
    // && (selectedLevel === "Semua Level" || course.level === selectedLevel) // Level filter removed
  );

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teraplus-accent"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section 
        className="w-full py-16 md:py-24 lg:py-32" 
      style={{ backgroundImage: "url('/images/mockup.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white">
            Selamat Datang, {userNameToDisplay}
          </h1>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 opacity-90 text-white">
            Video panduan lengkap & materi terstruktur untuk pemulihan optimal Anda.
          </p>
          <div className="max-w-xl mx-auto">
            <SearchBar 
              placeholder="Cari video, teknik, atau area tubuh..." 
              onSearch={handleSearch}
              variant="hero"
            />
          </div>
        </div>
      </section>

      {/* Content Selection Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-teraplus-text-default mb-8 md:mb-12 text-center">
            Jelajahi Course
          </h2>

          {/* Filter Buttons */}
          <div className="mb-8 md:mb-10 flex flex-wrap justify-center items-center gap-2 sm:gap-3">
            {bodyAreas.map(area => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
                  ${selectedArea === area 
                    ? 'bg-teraplus-accent text-white shadow-md' 
                    : 'bg-teraplus-primary text-teraplus-text-default hover:bg-teraplus-secondary hover:text-teraplus-text-strong border border-teraplus-accent border-opacity-30'
                  }`}
              >
                {area}
              </button>
            ))}
          </div>
          
          {/* Content Cards Grid */}
          {loadingCourses ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teraplus-accent"></div>
            </div>
          ) : errorCourses ? (
            <p className="col-span-full text-center text-red-500">{errorCourses}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <ContentCard
                    key={course.id}
                    title={course.judul}
                    category={`${course.area || 'General'}`} // Display area only
                    imageSrc={course.imageSrc || `https://via.placeholder.com/400x225.png?text=${encodeURIComponent(course.judul)}`} // Use imageSrc from API or fallback
                    onViewClick={() => navigate(`/course/${course.slug || course.id}`)} // Navigate using slug or ID
                  />
                ))
              ) : (
                <p className="col-span-full text-center text-teraplus-text-default opacity-70">
                  Tidak ada kursus yang sesuai dengan filter Anda atau belum ada kursus yang tersedia.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
