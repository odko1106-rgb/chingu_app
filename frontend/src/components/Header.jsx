import React, { useState } from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom'; // Хэрэв react-router ашиглаж байгаа бол
import '../i18n'; // Дээр үүсгэсэн файлаа дуудна
import { useTranslation } from 'react-i18next';

const Header = ({ user, setIsOpen }) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang.code); // Энэ мөр л апп-ыг бүхэлд нь сольж байгаа юм
    setCurrentLang(lang);
    setIsLangOpen(false);
  };
  const navigate = useNavigate();
  
  // --- Хэл солих State ---
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState({
    code: 'MN',
    flag: 'https://flagcdn.com/mn.svg',
    name: 'Монгол'
  });

  const languages = [
    { code: 'MN', name: 'Монгол', flag: 'https://flagcdn.com/mn.svg' },
    { code: 'EN', name: 'English', flag: 'https://flagcdn.com/us.svg' },
    { code: 'KR', name: '한국어', flag: 'https://flagcdn.com/kr.svg' }
  ];

  return (
    <div style={{
      height: '75px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 30px',
      background: 'white',
      borderBottom: '1px solid #f0f0f0',
      position: 'sticky',
      top: 0,
      zIndex: 900
    }}>
      
      {/* --- ЗҮҮН ТАЛ --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div 
          onMouseEnter={() => setIsOpen(true)}
          style={{ 
            fontSize: '24px', 
            cursor: 'pointer', 
            color: '#321D73',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            transition: 'background 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          ☰
        </div>

        <div style={{ position: 'relative', width: '350px' }}>
          <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}>🔍</span>
          <input 
            type="text" 
              placeholder={t("search_placeholder")} // "Try to find" биш ингэж бичнэ            
              style={{ 
              padding: '12px 15px 12px 40px', 
              width: '100%', 
              borderRadius: '12px', 
              border: 'none', 
              background: '#F1F5F9',
              outline: 'none',
              fontSize: '14px'
            }} 
          />
        </div>
      </div>

      {/* --- БАРУУН ТАЛ --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
        
        <div style={{ display: 'flex', gap: '15px', color: '#64748B', fontSize: '20px', cursor: 'pointer' }}>
          <div style={{ position: 'relative' }}>
            🔔
            <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: 'red', borderRadius: '50%', border: '2px solid white' }}></span>
          </div>
        </div>

        {/* --- ХЭЛ СОЛИХ DROPDOWN --- */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setIsLangOpen(!isLangOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <img 
              src={currentLang.flag} 
              alt="Flag" 
              style={{ width: '24px', borderRadius: '4px' }} 
            />
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{currentLang.code}</span>
            <span style={{ fontSize: '12px', transition: '0.3s', transform: isLangOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
          </div>

          {isLangOpen && (
            <div style={{
              position: 'absolute', top: '40px', right: 0, background: 'white',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '12px',
              padding: '8px 0', minWidth: '140px', zIndex: 1000, border: '1px solid #f0f0f0'
            }}>
              {languages.map((lang) => (
                <div 
                    key={lang.code}
                    onClick={() => {
                      i18n.changeLanguage(lang.code); // 1. i18next-ийн хэлийг солино
                      setCurrentLang(lang);           // 2. Header-ийн туг, нэрийг солино
                      setIsLangOpen(false);           // 3. Цэсийг хаана
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 15px', cursor: 'pointer', fontSize: '13px', transition: '0.2s'
                    }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 15px', cursor: 'pointer', fontSize: '13px', transition: '0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <img src={lang.flag} alt={lang.name} style={{ width: '18px', borderRadius: '2px' }} />
                  {lang.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- PROFILE / AUTH ХЭСЭГ --- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', color: '#1E293B', fontSize: '14px' }}>
              {user?.displayName || "Зочин"}
            </div>
            
            {/* Нөхцөлт харагдац: Нэвтэрсэн үед "Гарах", үгүй бол "Нэвтрэх" */}
            {user ? (
              <div 
                onClick={async () => {
                await auth.signOut();
                navigate('/login');
              }}
                style={{ fontSize: '11px', color: '#94A3B8', cursor: 'pointer', fontWeight: 'bold' }}
                onMouseEnter={(e) => e.target.style.color = '#ff4d4d'}
                onMouseLeave={(e) => e.target.style.color = '#94A3B8'}
              >
                {t("logout")}
              </div>
            ) : (
              <div 
                onClick={() => navigate('/login')} // Нэвтрэх хуудас руу шилжинэ
                style={{ fontSize: '11px', color: '#321D73', cursor: 'pointer', fontWeight: 'bold' }}
                onMouseEnter={(e) => e.target.style.color = '#4c3592'}
                onMouseLeave={(e) => e.target.style.color = '#321D73'}
              >
                {t("login")}
              </div>
            )}
          </div>
          
          <img 
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'Guest'}&background=321D73&color=fff`} 
            alt="profile" 
            style={{ 
              width: '40px', height: '40px', borderRadius: '12px', 
              objectFit: 'cover', border: '2px solid #F1F5F9'
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default Header;