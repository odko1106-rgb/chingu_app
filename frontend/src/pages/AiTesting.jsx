import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';

const AiTesting = ({ user }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [essay, setEssay] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!title || !essay) return alert(t("ai_fill_fields"));
    if (!user) return alert(t("ai_login_required"));

    setLoading(true);
    setResult('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/check-essay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, essay, userId: user.uid })
      });

      const data = await response.json();
      if (data.error) {
        setResult("⚠️ " + t("ai_error") + ": " + data.error);
      } else {
        setResult(data.result);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setResult("❌ " + t("ai_connection_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '30px', background: 'white', borderRadius: '20px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)', margin: '0 auto', maxWidth: '900px'
    }}>
      <h2 style={{ color: '#321D73', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        🤖 AI Writing Checker
      </h2>

      <p style={{ color: '#666', marginBottom: '20px' }}>{t("ai_description")}</p>

      <input
        type="text"
        placeholder={t("ai_title_placeholder")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: '100%', padding: '12px 15px', borderRadius: '10px',
          border: '1px solid #E2E8F0', marginBottom: '15px', fontSize: '16px',
          boxSizing: 'border-box'
        }}
      />

      <textarea
        style={{
          width: '100%', height: '250px', padding: '15px', fontSize: '16px',
          borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC',
          outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box'
        }}
        placeholder={t("ai_essay_placeholder")}
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
      />

      <button
        onClick={handleCheck}
        disabled={loading}
        style={{
          marginTop: '20px', padding: '12px 30px',
          backgroundColor: loading ? '#94A3B8' : '#321D73',
          color: 'white', border: 'none', borderRadius: '10px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold', fontSize: '16px', transition: '0.3s'
        }}
      >
        {loading ? t("ai_checking") : t("ai_check_button")}
      </button>

      {result && (
        <div style={{
          marginTop: '30px', padding: '25px', backgroundColor: '#F1F5F9',
          borderRadius: '15px', borderLeft: '5px solid #321D73', lineHeight: '1.8'
        }}>
          <h3 style={{ color: '#321D73', marginBottom: '15px' }}>👨‍🏫 {t("ai_feedback_title")}</h3>
          <div style={{ color: '#1E293B', fontSize: '15px' }}>
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiTesting;