import React from 'react';

const Settings = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#321D73' }}>Энэ бол [Хуудасны Нэр] хуудас</h1>
      <p>Одоогоор хөгжүүлэлт хийгдэж байна...</p>
      
      {/* Scroll-ыг шалгахын тулд маш урт зай нэмье */}
      <div style={{ height: '1000px', background: 'linear-gradient(#eee, #fff)', marginTop: '20px', padding: '20px', borderRadius: '15px' }}>
        Scroll хийж үзээрэй. Sidebar болон Header байрандаа байх ёстой.
      </div>
    </div>
  );
};

export default Settings; // Энийг заавал бичнэ!