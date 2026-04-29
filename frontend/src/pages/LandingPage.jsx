import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = ({ user }) => { // App.jsx-ээс user-ийг авна
  const navigate = useNavigate();
  const primaryColor = "#321D73";
  const accentColor = "#FFD700";

  // Нэвтрэх эсвэл Dashboard руу шилжих логик
  const handleAction = (path) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(path || '/dashboard');
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', overflowX: 'hidden' }}>
      
      {/* --- HERO SECTION --- */}
      <section style={heroStyle} className="animate-on-load">
        <div style={blobStyle}></div>
        
        <nav style={{
            padding: '30px 50px',
            display: 'flex',
            justifyContent: 'flex-end', // Лого байхгүй болсон тул товчийг баруун тийш шахна
            zIndex: 10
        }}>
            {/* Лого болон Guest Mode таг байсан хэсгийг бүрэн устгав */}
            
            <button 
            onClick={() => user ? navigate('/settings') : navigate('/login')} 
            style={loginBtn}
            >
            {user ? "Миний профайл" : "Нэвтрэх"}
            </button>
        </nav>

        <div style={heroContent}>
          <h1 style={mainTitle}>
            Солонгос хэлийг <br/>
            <span style={{ color: accentColor }}>AI-тай хамт</span> эзэмш
          </h1>
          <p style={subTitle}>
            Хиймэл оюун ухаанаар түвшнээ тогтоож, өөртөө тохирсон замаар суралцаарай. 
            Нэвтэрснээр та өөрийн ахиц дэвшлийг хадгалах боломжтой.
          </p>
          <button 
            onClick={() => handleAction('/dashboard')} 
            className="cta-button" 
            style={ctaButton}
          >
            {user ? "Сургалтаа үргэлжлүүлэх" : "Үнэгүй эхлэх"}
          </button>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: primaryColor, fontSize: '32px', marginBottom: '50px' }}>
          Яагаад Chingu гэж?
        </h2>
        
        <div style={gridStyle}>
          {/* AI Testing */}
          <div className="feature-card" style={featureCard} onClick={() => handleAction('/ai-test')}>
            <div style={mockupPlaceholder}>
              <span style={{fontSize: '50px'}}>🤖</span>
              <p style={{marginTop: '10px', fontWeight: 'bold'}}>AI Level Test</p>
            </div>
            <h3>Ухаалаг түвшин тогтоох</h3>
            <p style={cardText}>Таны мэдлэгийг AI бодит цаг хугацаанд үнэлж, сурах төлөвлөгөөг чинь гаргана.</p>
          </div>

          {/* Flashcards */}
          <div className="feature-card" style={featureCard} onClick={() => handleAction('/flashcards')}>
            <div style={{...mockupPlaceholder, backgroundColor: '#FEF3C7'}}>
              <span style={{fontSize: '50px'}}>🃏</span>
              <p style={{marginTop: '10px', fontWeight: 'bold'}}>Smart Flashcards</p>
            </div>
            <h3>Өөрийн Flashcard үүсгэх</h3>
            <p style={cardText}>Цээжлэх үгсээ нэмж, AI-аар тайлбарлуулж, өөрийн цуглуулгыг үүсгээрэй.</p>
          </div>

          {/* Leaderboard */}
          <div className="feature-card" style={featureCard} onClick={() => handleAction('/leaderboard')}>
            <div style={{...mockupPlaceholder, backgroundColor: '#E0E7FF'}}>
              <span style={{fontSize: '50px'}}>🏆</span>
              <p style={{marginTop: '10px', fontWeight: 'bold'}}>Leaderboard</p>
            </div>
            <h3>Бусадтай өрсөлдөх</h3>
            <p style={cardText}>Суралцах явцдаа оноо цуглуулж, шилдэг суралцагчдын жагсаалтад ороорой.</p>
          </div>
        </div>
      </section>
      

      {/* Footer хэсэг (Таны өмнөх кодтой ижил) */}
      {/* ... */}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-on-load { animation: fadeInUp 1s ease-out forwards; }
        .feature-card { transition: all 0.4s ease !important; cursor: pointer; border: 1px solid #eee; border-radius: 20px; }
        .feature-card:hover { 
            transform: translateY(-15px); 
            box-shadow: 0 20px 40px rgba(50, 29, 115, 0.1); 
            border-color: #9D72FF; 
        }
        .cta-button { transition: 0.3s; border: none; }
        .cta-button:hover { transform: scale(1.05); cursor: pointer; }
      `}</style>
    </div>
  );
};

// Нэмэлт стильүүд
const guestTag = {
  fontSize: '10px',
  background: '#FFD700',
  color: '#321D73',
  padding: '2px 8px',
  borderRadius: '4px',
  marginLeft: '10px'
};

// --- STYLES ---
const heroStyle = {
  background: '#321D73',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  color: 'white'
};

const navStyle = {
  padding: '30px 50px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 10
};

const logoContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer'
};

const loginBtn = {
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.3)',
  color: 'white',
  padding: '8px 25px',
  borderRadius: '20px',
  cursor: 'pointer',
  transition: '0.3s'
};

const heroContent = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  zIndex: 10,
  padding: '0 20px'
};

const mainTitle = {
  fontSize: 'clamp(2.5rem, 8vw, 4rem)',
  fontWeight: '900',
  lineHeight: 1.1,
  marginBottom: '20px'
};

const subTitle = {
  fontSize: '1.2rem',
  maxWidth: '700px',
  opacity: 0.8,
  marginBottom: '40px'
};

const ctaButton = {
  background: '#FFD700',
  color: '#321D73',
  padding: '18px 45px',
  borderRadius: '35px',
  fontSize: '18px',
  fontWeight: 'bold',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 10px 25px rgba(255,215,0,0.3)',
  transition: 'transform 0.2s'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '30px'
};

const featureCard = {
  padding: '40px 30px',
  borderRadius: '24px',
  background: '#fff',
  border: '1px solid #f0f0f0',
  transition: 'all 0.4s ease',
  textAlign: 'center'
};

const mockupPlaceholder = {
  width: '100%',
  height: '220px',
  background: '#F3F4F6',
  borderRadius: '16px',
  marginBottom: '25px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
};

const cardText = {
  color: '#666',
  lineHeight: '1.6',
  marginTop: '10px'
};

const footerStyle = {
  background: '#321D73',
  color: 'white',
  padding: '80px 50px 30px',
  borderTop: '8px solid #FFD700'
};

const footerGrid = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '50px',
  maxWidth: '1200px',
  margin: '0 auto'
};

const footerLink = {
  color: '#B0A7FF',
  textDecoration: 'none',
  fontSize: '14px',
  transition: '0.3s'
};

const footerInfo = {
  opacity: 0.8,
  fontSize: '14px',
  marginBottom: '10px'
};

const copyright = {
  textAlign: 'center',
  marginTop: '60px',
  paddingTop: '30px',
  borderTop: '1px solid rgba(255,255,255,0.05)',
  fontSize: '13px',
  opacity: 0.5
};

const blobStyle = {
  position: 'absolute',
  width: '600px',
  height: '600px',
  background: 'rgba(157, 114, 255, 0.15)',
  borderRadius: '50%',
  top: '-100px',
  right: '-100px',
  filter: 'blur(80px)'
};

export default LandingPage;