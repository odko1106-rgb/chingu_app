import React from 'react';

const Footer = () => {
  const accentColor = "#FFD700"; // Алтлаг шар

  return (
    <footer style={footerWrapper}>
      <div style={footerContainer}>
        
        {/* Зүүн тал: Танилцуулга */}
        <div style={footerBrand}>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '15px', color: '#fff' }}>
            🎓 CHINGU KOREAN
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', maxWidth: '300px' }}>
            Монголын анхны AI-д суурилсан Солонгос хэл сурах платформ. Бид сургалтыг илүү хүртээмжтэй, ухаалаг болгохыг зорьдог.
          </p>
        </div>

        {/* Дунд тал: Холбоосууд */}
        <div style={{ flex: 1, minWidth: '150px' }}>
          <h4 style={{ color: accentColor, marginBottom: '20px' }}>Цэс</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a href="#" style={footerLink}>Бидний тухай</a>
            <a href="#" style={footerLink}>Зааварчилгаа</a>
            <a href="#" style={footerLink}>Үйлчилгээний нөхцөл</a>
          </div>
        </div>

        {/* Баруун тал: Холбоо барих */}
        <div style={footerContact}>
          <h4 style={{ color: accentColor, marginBottom: '20px', fontSize: '18px' }}>Холбоо барих</h4>
          <p style={contactItem}>📍 Улаанбаатар хот, СБД</p>
          <p style={contactItem}>📧 support@chingu.mn</p>
          <p style={contactItem}>📞 +976 88xx-xxxx</p>
        </div>
      </div>

      <div style={copyrightBar}>
        <p style={{ margin: 0, opacity: 0.6 }}>
          © 2026 Chingu Korean. Бүх эрх хуулиар хамгаалагдсан.
        </p>
      </div>
    </footer>
  );
};

// --- Styles ---
const footerWrapper = {
  background: '#1A0F3D', 
  color: 'white',
  padding: '60px 50px 30px',
  borderTop: '1px solid rgba(255,255,255,0.1)',
  marginTop: 'auto' // Энэ нь Footer-ийг үргэлж доор байлгана
};

const footerContainer = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '40px',
};

const footerBrand = { flex: '1.5', minWidth: '250px' };
const footerContact = { flex: '1', minWidth: '200px' };

const footerLink = {
  color: 'rgba(255,255,255,0.6)',
  textDecoration: 'none',
  fontSize: '14px',
  transition: '0.3s'
};

const contactItem = {
  fontSize: '14px',
  color: 'rgba(255,255,255,0.7)',
  marginBottom: '10px',
};

const copyrightBar = {
  maxWidth: '1200px',
  margin: '40px auto 0',
  paddingTop: '20px',
  borderTop: '1px solid rgba(255,255,255,0.05)',
  textAlign: 'center',
  fontSize: '12px',
};

export default Footer;