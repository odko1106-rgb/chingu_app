import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useLocation, useNavigate } from 'react-router-dom';
// Flashcards.jsx-ийн хамгийн дээр байгаа импортыг ингэж өөрчил:
import { collection, query, where, getDocs, doc, getDoc,setDoc, updateDoc, Timestamp } from 'firebase/firestore';

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Dashboard.css'; // Хуанли болон нэмэлт стильд зориулав
import { useTranslation } from 'react-i18next';

const Dashboard = ({ user }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [stats, setStats] = useState({
    learnedCount: 0,
    reviewToday: 0,
    streak: 0,
  });
  const [todayTasks, setTodayTasks] = useState([]);
  const [date, setDate] = useState(new Date());

useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !user.uid) return;

      try {
        // 1. Статистик татах
        const qLearned = query(collection(db, "learnedWords"), where("userId", "==", user.uid));
        const learnedSnap = await getDocs(qLearned);
        
        const now = new Date();
        const qReview = query(collection(db, "learnedWords"), where("userId", "==", user.uid), where("nextReview", "<=", now));
        const reviewSnap = await getDocs(qReview);

        // 2. STREAK ЗАСВАР (ЯГ ЭНЭ ХЭСГИЙГ СОЛИОРОЙ)
        const userRef = doc(db, "users", user.uid);
        let userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            displayName: user.displayName || "",
            email: user.email || "",
            streakCount: 0,
            bestStreak: 0,
            lastActiveDate: null,
            createdAt: Timestamp.now()
          });
          userSnap = await getDoc(userRef);
        } else if (!userSnap.data().displayName) {
          // ← Хуучин document-д displayName байхгүй бол нэмэх
          await updateDoc(userRef, {
            displayName: user.displayName || "",
            email: user.email || "",
          });
        }
        let finalStreak = 0;

        if (userSnap.exists()) {
          const userData = userSnap.data();
          finalStreak = userData.streakCount || 0;
          const lastActiveDate = userData.lastActiveDate; // "YYYY-MM-DD"
          
          const today = new Date();
          const todayStr = today.toLocaleDateString('en-CA');
          
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toLocaleDateString('en-CA');

          // --- 🛠️ "Уян хатан" өнөөдөр шалгах (Сүүлийн 24 цаг доторх бүх идэвхийг харна) ---
          const last24h = new Date(today.getTime() - (24 * 60 * 60 * 1000));
          const qToday = query(
            collection(db, "learnedWords"),
            where("userId", "==", user.uid),
            where("lastTested", ">=", Timestamp.fromDate(last24h))
          );
          const todaySnap = await getDocs(qToday);
          
          // ← ЭНД НЭМЭХ
          console.log("=== STREAK DEBUG ===");
          console.log("1. learnedWords count:", learnedSnap.size);
          console.log("2. Sample doc fields:", learnedSnap.docs[0] ? Object.keys(learnedSnap.docs[0].data()) : "NO DOCS");
          console.log("3. todaySnap size:", todaySnap.size);
          console.log("4. lastActiveDate:", lastActiveDate);
          console.log("5. todayStr:", todayStr);
          console.log("6. yesterdayStr:", yesterdayStr);
          console.log("7. streakCount:", userData.streakCount);
          console.log("===================");


          if (todaySnap.size > 0 && lastActiveDate !== todayStr) {
            // Хэрэв сүүлийн 24 цагт үг цээжилсэн бол:
            let newStreak = (lastActiveDate === yesterdayStr) ? finalStreak + 1 : 1;

            await updateDoc(userRef, {
              streakCount: newStreak,
              lastActiveDate: todayStr,
              bestStreak: Math.max(newStreak, userData.bestStreak || 0)
            });
            finalStreak = newStreak;
          } else if (lastActiveDate !== todayStr && lastActiveDate !== yesterdayStr) {
            // Хэрэв өнөөдөр ороогүй, өчигдөр ч ороогүй бол
            finalStreak = 0;
            if (userData.streakCount > 0) await updateDoc(userRef, { streakCount: 0 });
          }
        }

        setStats({
          learnedCount: learnedSnap.size,
          reviewToday: reviewSnap.size,
          streak: finalStreak,
        });

        // setStats(...) дуусаад доор нэм
        const now2 = new Date();
        const qTasks = query(
          collection(db, "learnedWords"),
          where("userId", "==", user.uid),
          where("nextReview", "<=", now2)
        );
        const tasksSnap = await getDocs(qTasks);

        const colors = ['#6C63FF', '#FF6584', '#43D9A2', '#FFB347', '#5BC0EB'];
        const tasks = tasksSnap.docs.map((d, i) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.kr,        // ← Солонгос үг
            category: data.mn,     // ← Монгол орчуулга
            color: colors[i % colors.length],
          };
        });
        setTodayTasks(tasks);

      } catch (error) {
        console.error("Streak Error:", error);
      }
    };
    fetchDashboardData();
  }, [user, location.pathname, t]);
  return (
    <div className="dashboard-container" style={{ display: 'flex', gap: '25px', padding: '20px', flexWrap: 'wrap' }}>
      
      {/* 1️⃣ ЗҮҮН ТАЛ */}
      <div style={{ flex: '2', minWidth: '600px' }}>
        
        {/* Welcome Card */}
        <div style={welcomeCard}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '26px', marginBottom: '10px', fontWeight: 'bold' }}>
              {t("dash_welcome", { name: user?.displayName?.split(' ')[0] || t("dash_learner") })}
            </h2>
            <p style={{ opacity: 0.9, fontSize: '16px' }}>
              {t("dash_subtitle")}
            </p>
          </div>
          <div style={{ fontSize: '70px', marginLeft: '20px' }}>👩‍💻</div>
        </div>

        {/* Stats Grid */}
        <div style={statsGrid}>
          <div style={statCard}>
            <div style={iconBox('#E8F1FF')}>🎓</div>
            <h3 style={{ margin: '15px 0 5px', fontSize: '24px', fontWeight: 'bold' }}>{stats.learnedCount}</h3>
            <p style={{ fontSize: '14px', color: '#64748B' }}>{t("dash_learned_words")}</p>
          </div>
          <div style={statCard}>
            <div style={iconBox('#FFF9E5')}>📝</div>
            <h3 style={{ margin: '15px 0 5px', fontSize: '24px', fontWeight: 'bold' }}>{stats.reviewToday}</h3>
            <p style={{ fontSize: '14px', color: '#64748B' }}>{t("dash_review_today")}</p>
          </div>
          <div style={statCard}>
            <div style={iconBox('#FFE8E8')}>🔥</div>
            <h3 style={{ margin: '15px 0 5px', fontSize: '24px', fontWeight: 'bold' }}>{stats.streak}</h3>
            <p style={{ fontSize: '14px', color: '#64748B' }}>{t("dash_daily_streak")}</p>
          </div>
        </div>

        {/* Today Tasks */}
        <div style={sectionCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#321D73', fontWeight: 'bold' }}>{t("dash_today_tasks")}</h3>
            <span style={{ color: '#94A3B8', fontSize: '14px', cursor: 'pointer' }}>{t("dash_view_all")}</span>
          </div>

          {todayTasks.length > 0 ? todayTasks.map(task => (
            <div key={task.id} style={taskItem(task.color)} onClick={() => window.location.href = '/flashcards?mode=review'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: task.color }}></div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1E293B' }}>{task.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{task.category}</div>
                  </div>
                </div>
                <div style={{ color: '#94A3B8' }}>→</div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8' }}>
                <span style={{ fontSize: '30px' }}>🎉</span>
                <p>{t("dash_no_tasks")}</p>
            </div>
          )}
        </div>

        {/* Activity Chart */}
        <div style={{ ...sectionCard, marginTop: '25px' }}>
          <h3 style={{ marginBottom: '15px', color: '#321D73', fontWeight: 'bold' }}>{t("dash_hours_activity")}</h3>
          <div style={{ height: '200px', background: '#F8FAFC', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
            [Энд суралцсан цагийн график харагдана]
          </div>
        </div>
      </div>

      {/* 2️⃣ БАРУУН ТАЛ */}
      <div style={{ flex: '1', minWidth: '320px' }}>
        
        {/* Calendar */}
        <div style={sectionCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontWeight: 'bold', color: '#321D73' }}>{t("dash_calendar")}</h3>
          </div>
          <Calendar 
            onChange={setDate} 
            value={date} 
            className="custom-calendar"
            locale={i18n.language === 'MN' ? 'mn-MN' : i18n.language === 'KR' ? 'ko-KR' : 'en-US'}
            formatShortWeekday={(locale, date) => {
              const daysMN = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Шя'];
              const daysEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const daysKR = ['일', '월', '화', '수', '목', '금', '토'];
              if (i18n.language === 'MN') return daysMN[date.getDay()];
              if (i18n.language === 'KR') return daysKR[date.getDay()];
              return daysEN[date.getDay()];
            }}
            formatMonthYear={(locale, date) => {
              if (i18n.language === 'MN') {
                const months = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];
                return `${date.getFullYear()} оны ${months[date.getMonth()]}`;
              }
              if (i18n.language === 'KR') return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
              return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            }}
            formatDay={(locale, date) => date.getDate()}
          />
        </div>

        {/* Info & Tips */}
        <div style={{ ...sectionCard, marginTop: '25px' }}>
          <h3 style={{ marginBottom: '20px', fontWeight: 'bold', color: '#321D73' }}>{t("dash_info_tips")}</h3>
          <div style={infoBox('#F0E7FF', '#321D73')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span>💡</span>
              <span style={{ fontWeight: 'bold' }}>{t("dash_tip_title")}</span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>{t("dash_tip_desc")}</p>
          </div>
          <div style={infoBox('#F0FFF4', '#2F855A')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span>📢</span>
              <span style={{ fontWeight: 'bold' }}>{t("dash_notice_title")}</span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>{t("dash_notice_desc")}</p>
          </div>
        </div>

        {/* Upgrade Pro */}
        <div style={upgradeCard}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🚀</div>
          <h4 style={{ margin: '0 0 10px 0' }}>{t("dash_upgrade_pro")}</h4>
          <p style={{ fontSize: '12px', marginBottom: '15px' }}>{t("dash_upgrade_desc")}</p>
          <button style={upgradeBtn}>{t("dash_details")}</button>
        </div>
      </div>
    </div>
  );
};

// --- ШИНЭЧЛЭГДСЭН СТИЛИҮД (Монгол фонтыг илүү гоё харагдуулна) ---

const welcomeCard = {
  background: 'linear-gradient(135deg, #F0E7FF 0%, #E0D4FF 100%)', // Бага зэрэг градиент нэмсэн
  padding: '30px',
  borderRadius: '24px',
  display: 'flex',
  alignItems: 'center',
  marginBottom: '25px',
  color: '#321D73',
  fontFamily: "'Montserrat', sans-serif" // Гоё фонт ашиглах
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
  marginBottom: '25px'
};

const statCard = {
  background: 'white',
  padding: '20px',
  borderRadius: '20px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  textAlign: 'left',
  border: '1px solid #F1F5F9'
};

const iconBox = (bgColor) => ({
  width: '44px', // Бага зэрэг томруулсан
  height: '44px',
  borderRadius: '12px',
  background: bgColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '22px',
  marginBottom: '12px'
});

const sectionCard = {
  background: 'white',
  padding: '25px',
  borderRadius: '24px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
  border: '1px solid #F1F5F9'
};

const taskItem = (color) => ({
  padding: '16px',
  borderRadius: '18px',
  background: '#F8FAFC',
  borderLeft: `6px solid ${color}`,
  marginBottom: '12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'transform 0.2s ease', // Хөдөлгөөн нэмсэн
  // Монгол текстэнд зориулсан тохиргоо:
  letterSpacing: '-0.01em',
  lineHeight: '1.4'
});

const infoBox = (bgColor, color) => ({
  padding: '18px',
  borderRadius: '18px',
  background: bgColor,
  color: color,
  textAlign: 'left',
  marginBottom: '12px',
  fontWeight: '500', // Монгол үсэг 500-600 дээр гоё харагддаг
  fontSize: '14px',
  lineHeight: '1.5'
});

const upgradeCard = {
  marginTop: '25px',
  background: 'linear-gradient(135deg, #321D73 0%, #4C2EAD 100%)',
  padding: '30px',
  borderRadius: '24px',
  color: 'white',
  textAlign: 'center',
  boxShadow: '0 10px 25px rgba(50, 29, 115, 0.2)'
};

const upgradeBtn = {
  background: 'white',
  color: '#321D73',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '14px',
  fontWeight: '700',
  cursor: 'pointer',
  marginTop: '15px',
  fontSize: '14px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  fontFamily: "'Montserrat', sans-serif"
};

// Текстүүдэд тусгайлан ашиглах нэмэлт стилиуд
const mongolTitle = {
  fontWeight: '700',
  letterSpacing: '-0.02em',
  lineHeight: '1.2',
  color: '#1E293B',
  marginBottom: '5px'
};

const mongolSubTitle = {
  fontWeight: '400',
  fontSize: '13px',
  color: '#64748B',
  lineHeight: '1.4'
};

export default Dashboard;