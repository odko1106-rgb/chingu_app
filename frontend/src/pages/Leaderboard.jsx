import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const Leaderboard = ({ user }) => {
  const { t } = useTranslation();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchLeaders = async () => {
    try {
      const wordsSnap = await getDocs(collection(db, "learnedWords"));
      const counts = {};
      wordsSnap.docs.forEach(d => {
        const uid = d.data().userId;
        counts[uid] = (counts[uid] || 0) + 1;
      });

      const usersSnap = await getDocs(collection(db, "users"));

      console.log("users count:", usersSnap.size);
      console.log("users data:", usersSnap.docs.map(d => d.data()));
      console.log("counts:", counts);

      const result = usersSnap.docs.map(d => ({
        uid: d.id,
        name: d.data().displayName || t("lb_anonymous"),
        count: counts[d.id] || 0,
        streak: d.data().streakCount || 0,
      }));

      console.log("result:", result);

      result.sort((a, b) => b.count - a.count);
      setLeaders(result.slice(0, 20));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  fetchLeaders();
}, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '50px' }}>{t("loading")}</div>
  );

  const top3 = [leaders[1], leaders[0], leaders[2]]; // 2, 1, 3 дараалал (дунд нь 1-р)

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: '#321D73', marginBottom: '6px' }}>🏆 {t("lb_title")}</h2>
      <p style={{ color: '#94A3B8', marginBottom: '30px', fontSize: '14px' }}>{t("lb_subtitle")}</p>

      {/* Топ 3 */}
      {leaders.length >= 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '12px', marginBottom: '30px' }}>
          {top3.map((p, i) => {
            if (!p) return null;
            const isFirst = i === 1;
            const medals = ['🥈', '🥇', '🥉'];
            const ranks = [2, 1, 3];
            return (
              <div key={p.uid} style={{
                textAlign: 'center',
                background: 'white',
                borderRadius: '20px',
                padding: isFirst ? '24px 20px' : '18px 16px',
                width: isFirst ? '150px' : '120px',
                boxShadow: isFirst ? '0 8px 24px rgba(50,29,115,0.15)' : '0 4px 12px rgba(0,0,0,0.06)',
                border: isFirst ? '2px solid #FFD700' : '1px solid #F1F5F9',
                transform: isFirst ? 'translateY(-16px)' : 'none'
              }}>
                <div style={{ fontSize: isFirst ? '36px' : '28px', marginBottom: '8px' }}>{medals[i]}</div>
                <div style={{
                  width: isFirst ? '52px' : '40px', height: isFirst ? '52px' : '40px',
                  borderRadius: '50%', background: '#F0E7FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 8px', fontSize: isFirst ? '22px' : '18px'
                }}>👤</div>
                <div style={{ fontWeight: 'bold', fontSize: isFirst ? '14px' : '12px', color: '#1E293B', marginBottom: '4px' }}>
                  {p.name.split(' ')[0]}
                </div>
                <div style={{ fontSize: '13px', color: '#321D73', fontWeight: 'bold' }}>
                  {p.count} {t("lb_words")}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                  🔥 {p.streak}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4-р байраас доош */}
      {leaders.slice(3).map((p, idx) => {
        const rank = idx + 4;
        const isMe = user && p.uid === user.uid;
        return (
          <div key={p.uid} style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            background: isMe ? '#F0E7FF' : 'white',
            padding: '14px 18px', borderRadius: '14px', marginBottom: '10px',
            border: isMe ? '1px solid #321D73' : '1px solid #F1F5F9',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
          }}>
            <div style={{ width: '28px', textAlign: 'center', fontWeight: 'bold', color: '#94A3B8', fontSize: '14px' }}>
              {rank}
            </div>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: '#F0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
            }}>👤</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: '#1E293B', fontSize: '15px' }}>
                {p.name} {isMe && <span style={{ fontSize: '12px', color: '#321D73' }}>({t("lb_me")})</span>}
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>🔥 {p.streak} streak</div>
            </div>
            <div style={{ fontWeight: 'bold', color: '#321D73', fontSize: '15px' }}>
              {p.count} {t("lb_words")}
            </div>
          </div>
        );
      })}

      {leaders.length === 0 && (
        <p style={{ textAlign: 'center', color: '#94A3B8', marginTop: '50px' }}>{t("lb_empty")}</p>
      )}
    </div>
  );
};

export default Leaderboard;