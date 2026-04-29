import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { auth } from '../firebase'; // 👈 ЭНЭ МӨР ЧУХАЛ: Firebase-ийн auth-ыг импортлох

const AiTesting = () => {
  const [title, setTitle] = useState(''); // Сэдэв нэмэх
  const [essay, setEssay] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!title || !essay) return alert("Сэдэв болон эссэгээ бичнэ үү!");
    if (!auth.currentUser) return alert("Та эхлээд нэвтрэх хэрэгтэй!");

    setLoading(true);
    setResult(''); 
    
    try {
      const response = await fetch('http://localhost:5000/api/check-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title, // Сэдвийг нэмж явуулна
          essay: essay, 
          userId: auth.currentUser.uid 
        })
      });
      
      const data = await response.json();
      
      // Серверээс HTML алдаа ирвэл json() хөрвүүлэлт гацах магадлалтай тул шалгах
      if (data.error) {
        setResult("⚠️ Алдаа гарлаа: " + data.error);
      } else {
        setResult(data.result);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setResult("❌ Сервертэй холбогдоход алдаа гарлаа. (Backend ажиллаж байгаа эсэхийг шалгана уу)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '30px', 
      background: 'white', 
      borderRadius: '20px', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      margin: '0 auto',
      maxWidth: '900px'
    }}>
      <h2 style={{ color: '#321D73', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        🤖 AI Writing Checker
      </h2>
      
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Солонгос хэл дээрх эссэгээ доорх хэсэгт бичиж, AI багшаар засуулаарай.
      </p>
      {/* Сэдэв оруулах хэсэг */}
      <input 
        type="text"
        placeholder="Эссэний сэдэв (Жишээ: 환경 보호, Интернет хэрэглээ...)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 15px',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          marginBottom: '15px',
          fontSize: '16px'
        }}
      />
      <textarea
        style={{ 
          width: '100%', 
          height: '250px', 
          padding: '15px', 
          fontSize: '16px', 
          borderRadius: '12px', 
          border: '1px solid #E2E8F0',
          background: '#F8FAFC',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'inherit'
        }}
        placeholder="Энд Солонгос хэл дээрх эссэгээ бичнэ үү..."
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
      />

      <button 
        onClick={handleCheck}
        disabled={loading}
        style={{ 
          marginTop: '20px', 
          padding: '12px 30px', 
          backgroundColor: loading ? '#94A3B8' : '#321D73', 
          color: 'white', 
          border: 'none', 
          borderRadius: '10px', 
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          fontSize: '16px',
          transition: '0.3s'
        }}
      >
        {loading ? 'Багш засаж байна...' : 'Шалгуулах'}
      </button>

      {/* --- ХАРИУ ХАРАГДАХ ХЭСЭГ --- */}
      {result && (
        <div style={{ 
          marginTop: '30px', 
          padding: '25px', 
          backgroundColor: '#F1F5F9', 
          borderRadius: '15px', 
          borderLeft: '5px solid #321D73',
          lineHeight: '1.8' 
        }}>
          <h3 style={{ color: '#321D73', marginBottom: '15px' }}>👨‍🏫 Багшийн засалт & Зөвлөгөө:</h3>
          
          <div className="result-box" style={{ color: '#1E293B', fontSize: '15px' }}>
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiTesting;