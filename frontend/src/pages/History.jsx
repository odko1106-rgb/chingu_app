import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';

const History = ({ user }) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    fetch(`${import.meta.env.VITE_API_URL}/api/history/${user.uid}`)
      .then(res => res.json())
      .then(data => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Data fetch error:", err);
        setLoading(false);
      });
  }, [user]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      {t("loading")}
    </div>
  );

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', fontFamily: "'Montserrat', sans-serif" }}>
      <h2 style={{ color: '#321D73', marginBottom: '30px' }}>📝 {t("history_title")}</h2>
      
      {history.length > 0 ? (
        history.map((item) => (
          <div key={item._id} style={historyCardStyle}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={dateStyle}>
                  📅 {new Date(item.createdAt).toLocaleString('mn-MN')}
                </span>
                <h3 style={{ margin: '5px 0 0 0', color: '#1E293B', fontSize: '18px' }}>
                  {item.title || t("history_no_title")}
                </h3>
              </div>
              <span style={scoreBadgeStyle}>TOPIK II</span>
            </div>

            <div style={essayPreviewStyle}>
              <strong>{t("history_my_essay")}</strong><br/>
              {item.essayText 
                ? `${item.essayText.substring(0, 150)}...` 
                : t("history_no_text")}
            </div>

            <details style={{ marginTop: '15px' }}>
              <summary style={viewMoreButtonStyle}>
                👨‍🏫 {t("history_view_feedback")}
              </summary>
              <div style={feedbackBoxStyle}>
                <ReactMarkdown>{item.aiFeedback}</ReactMarkdown>
              </div>
            </details>
            
          </div>
        ))
      ) : (
        <p style={{ textAlign: 'center', color: '#64748B', marginTop: '50px' }}>
          {t("history_empty")}
        </p>
      )}
    </div>
  );
};
// --- Стилиүд (Styles) ---

const historyCardStyle = {
  background: 'white',
  padding: '25px',
  borderRadius: '24px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  marginBottom: '20px',
  border: '1px solid #F1F5F9'
};

const dateStyle = { 
  fontSize: '12px', 
  color: '#94A3B8', 
  fontWeight: '600',
  textTransform: 'uppercase'
};

const scoreBadgeStyle = {
  background: '#321D73',
  color: 'white',
  padding: '5px 12px',
  borderRadius: '20px',
  fontSize: '11px',
  fontWeight: 'bold'
};

const essayPreviewStyle = {
  padding: '15px',
  background: '#F8FAFC',
  borderRadius: '15px',
  fontSize: '14px',
  color: '#475569',
  lineHeight: '1.6',
  marginTop: '15px'
};

const viewMoreButtonStyle = {
  cursor: 'pointer',
  padding: '12px',
  background: '#F0E7FF',
  color: '#321D73',
  borderRadius: '12px',
  fontWeight: 'bold',
  textAlign: 'center',
  listStyle: 'none',
  marginTop: '15px',
  transition: '0.3s'
};

const feedbackBoxStyle = {
  backgroundColor: '#FFFFFF',
  padding: '20px',
  marginTop: '15px',
  borderRadius: '15px',
  fontSize: '15px',
  lineHeight: '1.8',
  border: '1px solid #E2E8F0',
  color: '#1E293B'
};

export default History;