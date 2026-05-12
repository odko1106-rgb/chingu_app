import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ isOpen, setIsOpen, user }) => {
  const location = useLocation();
  // 2. Компонент дотор "зарлах"
  const { t, i18n } = useTranslation();

  const menuItems = [
    { key: 'menu_dashboard', path: '/', icon: '📊', show: !!user },
    { key: 'menu_level_test', path: '/level-test', icon: '🎯', show: true },
    { key: 'menu_writing_check', path: '/ai-test', icon: '✍️', show: true },
    { key: 'menu_courses', path: '/courses', icon: '📚', show: true },
    { key: 'menu_flashcards', path: '/flashcards', icon: '🃏', show: true },
    { key: 'menu_youtube', path: '/youtube', icon: '📺', show: true },
    { key: 'menu_qna', path: '/qna', icon: '🙋‍♂️', show: true },
    { key: 'menu_leaderboard', path: '/leaderboard', icon: '🏆', show: true },
    { key: 'menu_history', path: '/history', icon: '📜', show: !!user },
    { key: 'menu_settings', path: '/settings', icon: '⚙️', show: !!user },
  ];

  return (
    <div 
      // Хулгана орж гарахад setIsOpen-ийг өөрчилнө
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      style={{
        width: '280px',
        background: '#321D73',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        padding: '20px 15px',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        overflow: 'hidden',
        // Хөдөлгөөний эффект
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        // Хаалттай үед зүүн тийш -270px нуугдаж, 10px зураас үлдэнэ
        transform: isOpen ? 'translateX(0)' : 'translateX(-270px)',
        boxShadow: isOpen ? '10px 0 30px rgba(0,0,0,0.2)' : 'none',
      }}
    >
      {/* Logo хэсэг */}
      <div style={{ 
        fontSize: '20px', 
        fontWeight: 'bold', 
        marginBottom: '25px', 
        textAlign: isOpen ? 'center' : 'right', // Хаалттай үед Emoji нь баруун талдаа харагдана
        opacity: isOpen ? 1 : 0.5,
        transition: '0.3s'
      }}>
        🎓 {isOpen && <span>{t("brand_name")}</span>}
      </div>

      {/* Цэсүүд - Хаалттай үед нуугдана */}
      <nav style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2px',
        opacity: isOpen ? 1 : 0,
        transition: '0.3s'
      }}>
        {menuItems.map((item) => (
          item.show && (
            <Link 
              key={item.path} 
              to={item.path} 
              className="sidebar-link" // CSS class нэмлээ
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 18px',
                // Үндсэн өнгө нь бүдгэрсэн (тунгалаг) байна
                color: location.pathname === item.path ? '#white' : 'rgba(176, 167, 255, 0.7)',
                textDecoration: 'none',
                borderRadius: '12px',
                marginBottom: '8px',
                background: location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                
                // --- ЭНЭ ХЭСЭГ АМЬ ОРУУЛНА ---
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Зөөлөн хөдөлгөөн
                transform: location.pathname === item.path ? 'translateX(5px)' : 'translateX(0)',
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {t(item.key)}
            </Link>
          )
        ))}
      </nav>

      {/* Upgrade Banner - Зөвхөн нээлттэй үед харагдана */}
      {isOpen && !user?.isPro && (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '15px',
          borderRadius: '12px',
          marginTop: 'auto',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <p style={{ fontSize: '11px', marginBottom: '10px', color: '#B0A7FF' }}>
            {t("upgrade_text")}
          </p>
          <button style={{
            background: '#FFD700',
            border: 'none',
            padding: '8px',
            borderRadius: '8px',
            fontWeight: 'bold',
            width: '100%',
            cursor: 'pointer',
            color: '#321D73',
            fontSize: '12px'
          }}>
            {t("upgrade_button")}
          </button>
        </div>
      )}
    <style>{`
        .sidebar-link {
          /* Анхны төлөв */
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .sidebar-link:hover {
          color: #ffffff !important; /* Бичгийн өнгийг цагаан болгож тодруулна */
          background: rgba(255, 255, 255, 0.12) !important; /* Үл мэдэгдэх гэрэлтсэн дэвсгэр */
          transform: translateX(10px) scale(1.02) !important; /* Баруун тийш зөөлөн түлхэгдэж томорно */
          box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.1); /* Үл мэдэгдэх сүүдэр */
        }

        .sidebar-link:active {
          transform: scale(0.98); /* Дарах үед товчлуур мэт бага зэрэг хотойно */
        }
      `}</style>  
    </div>
  );
};

export default Sidebar;