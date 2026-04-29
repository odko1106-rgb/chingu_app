import React from 'react';
import { auth } from '../firebase';

const Header = ({ user, setIsOpen }) => {
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
      
      {/* --- ЗҮҮН ТАЛ: Hamburger & Хайлт --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* ☰ Hamburger Icon: Hover хийхэд Sidebar нээгдэнэ */}
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

        {/* Хайлтын хэсэг */}
        <div style={{ position: 'relative', width: '350px' }}>
          <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Try to find" 
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

      {/* --- БАРУУН ТАЛ: Icons & Profile --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
        
        {/* Notification Icon */}
        <div style={{ display: 'flex', gap: '15px', color: '#64748B', fontSize: '20px', cursor: 'pointer' }}>
          <div style={{ position: 'relative' }}>
            🔔
            <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: 'red', borderRadius: '50%', border: '2px solid white' }}></span>
          </div>
        </div>

        {/* Хэл солих (Flag icon) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <img 
            src="https://flagcdn.com/us.svg" 
            alt="US Flag" 
            style={{ width: '24px', borderRadius: '4px' }} 
          />
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>EN</span>
          <span style={{ fontSize: '12px' }}>▼</span>
        </div>

        {/* Хэрэглэгчийн мэдээлэл (Profile) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', color: '#1E293B', fontSize: '14px' }}>
              {user?.displayName || "Зочин"}
            </div>
            <div 
              onClick={() => auth.signOut()} 
              style={{ fontSize: '11px', color: '#94A3B8', cursor: 'pointer', fontWeight: 'bold' }}
              onMouseEnter={(e) => e.target.style.color = '#ff4d4d'}
              onMouseLeave={(e) => e.target.style.color = '#94A3B8'}
            >
              Log out
            </div>
          </div>
          
          <img 
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=321D73&color=fff`} 
            alt="profile" 
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              objectFit: 'cover',
              border: '2px solid #F1F5F9'
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default Header;