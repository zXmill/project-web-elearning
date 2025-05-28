// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import GradientHeader from '../components/Layout/GradientHeader';
import SearchBar from '../components/Common/SearchBar';
import CourseCard from '../components/Common/CourseCard';
import BottomNav from '../components/Common/BottomNav';

export default function Home() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/courses')
      .then(r => setCourses(r.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="pb-16">
      <GradientHeader title="Selamat Datang, User!" subtitle="Mulai belajar sekarang" />

      <div className="p-4 space-y-4">
        <SearchBar placeholder="Cari Course" onSearch={() => {}} />

        {/* List Course */}
        <div className="space-y-3">
          {courses.map(c => (
            <CourseCard
              key={c.id}
              title={c.judul}
              level={1}
              image="/placeholder.jpg"
              onClick={() => {}}
            />
          ))}
        </div>
      </div>

      <BottomNav active="Eksplor" />
    </div>
  );
}
