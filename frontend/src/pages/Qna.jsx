import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Qna = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: t("qna_q1"), a: t("qna_a1"), icon: "📱" },
    { q: t("qna_q2"), a: t("qna_a2"), icon: "🤖" },
    { q: t("qna_q3"), a: t("qna_a3"), icon: "📚" },
    { q: t("qna_q4"), a: t("qna_a4"), icon: "✈️" },
    { q: t("qna_q5"), a: t("qna_a5"), icon: "📋" },
    { q: t("qna_q6"), a: t("qna_a6"), icon: "🎓" },
    { q: t("qna_q7"), a: t("qna_a7"), icon: "📝" },
    { q: t("qna_q8"), a: t("qna_a8"), icon: "🏙️" },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: '#321D73', marginBottom: '30px' }}>{t("qna_title")}</h2>
      {faqs.map((item, index) => (
        <div
          key={index}
          style={{
            background: 'white',
            borderRadius: '12px',
            marginBottom: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: openIndex === index ? '1px solid #321D73' : '1px solid #F1F5F9',
            overflow: 'hidden',
            transition: 'border 0.2s'
          }}
        >
          <div
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            style={{
              padding: '18px 20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer', fontWeight: 'bold', color: '#321D73'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>{item.icon}</span>
              <span>{item.q}</span>
            </div>
            <span style={{
              fontSize: '18px', transition: 'transform 0.2s',
              transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▾
            </span>
          </div>
          {openIndex === index && (
            <div style={{
              padding: '0 20px 18px 44px',
              color: '#666', lineHeight: '1.7', fontSize: '15px'
            }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Qna;