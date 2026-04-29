import React from 'react';

const Courses = () => {
  const courses = [
    { title: "Анхан шат (Level 1)", lessons: "12 хичээл", progress: "0%", color: "#4F39A3" },
    { title: "Дунд шат (Level 2)", lessons: "15 хичээл", progress: "0%", color: "#FFD700" },
    { title: "TOPIK бэлтгэл", lessons: "20 хичээл", progress: "0%", color: "#0035A0" }
  ];

  return (
    <div>
      <h2 style={{ color: '#321D73', marginBottom: '30px' }}>Миний сургалтууд</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {courses.map((course, index) => (
          <div key={index} style={{ 
            background: 'white', 
            padding: '25px', 
            borderRadius: '20px', 
            boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
            borderTop: `8px solid ${course.color}`
          }}>
            <h3 style={{ marginBottom: '10px' }}>{course.title}</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>{course.lessons}</p>
            <div style={{ marginTop: '20px', height: '8px', background: '#eee', borderRadius: '4px' }}>
              <div style={{ width: course.progress, height: '100%', background: course.color, borderRadius: '4px' }}></div>
            </div>
            <button style={{ 
              marginTop: '20px', 
              width: '100%', 
              padding: '10px', 
              borderRadius: '10px', 
              border: 'none', 
              background: '#F1F5F9', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>Үргэлжлүүлэх</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;