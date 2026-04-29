import React, { useState } from 'react';

const Qna = () => {
  const faqs = [
    { q: "Энэ апп-ыг яаж ашиглах вэ?", a: "Та AI Testing хэсэгт эссэгээ бичиж шалгуулснаар өөрийн алдаагаа засаж сурах боломжтой." },
    { q: "AI засалт хэр найдвартай вэ?", a: "Бид хамгийн сүүлийн үеийн Llama 3.3 загварыг ашиглаж байгаа тул дүрмийн засалт маш өндөр түвшинд хийгддэг." },
    { q: "Сургалт хэсэгт юу байгаа вэ?", a: "Энд Солонгос хэлний анхан шатнаас гүнзгий шат хүртэлх системтэй хичээлүүд багтсан." }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#321D73', marginBottom: '30px' }}>Түгээмэл асуулт хариулт</h2>
      {faqs.map((item, index) => (
        <details key={index} style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '15px', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          cursor: 'pointer'
        }}>
          <summary style={{ fontWeight: 'bold', color: '#321D73' }}>{item.q}</summary>
          <p style={{ marginTop: '15px', color: '#666', lineHeight: '1.6' }}>{item.a}</p>
        </details>
      ))}
    </div>
  );
};

export default Qna;