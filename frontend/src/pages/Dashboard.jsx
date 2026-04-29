import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useLocation, useNavigate } from 'react-router-dom';
// Flashcards.jsx-ийн хамгийн дээр байгаа импортыг ингэж өөрчил:
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore'; // 👈 Энд Timestamp-ийг нэмж өгнө
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Dashboard.css'; // Хуанли болон нэмэлт стильд зориулав

const Dashboard = ({ user }) => {
  const location = useLocation();
  const [stats, setStats] = useState({
    learnedCount: 0,
    reviewToday: 0,
    streak: 5, // Үүнийг дараа нь логикоор бодож гаргаж болно
  });
  const [todayTasks, setTodayTasks] = useState([]);
  const [date, setDate] = useState(new Date());

  // 🔄 1. Firestore-оос бодит тоонуудыг татах
  
    useEffect(() => {
    const fetchDashboardData = async () => {
    // 1. User бэлэн байгаа эсэхийг маш сайн шалгах
    if (!user || !user.uid) {
      console.log("🚧 Хэрэглэгч нэвтрээгүй эсвэл UID ирээгүй байна...");
      return;
    }

    try {
      console.log("🔍 Шүүж буй UID:", user.uid);

      // 2. Нийт цээжилсэн үгсийг татах (Зөвхөн userId-аар шүүнэ)
      const qLearned = query(
        collection(db, "learnedWords"), 
        where("userId", "==", user.uid)
      );
      
      const learnedSnap = await getDocs(qLearned);
      console.log("📊 Firestore-оос ирсэн нийт баримтын тоо:", learnedSnap.size);

      // 3. Өнөөдөр давтах үгс
      const now = new Date();
      const qReview = query(
        collection(db, "learnedWords"), 
        where("userId", "==", user.uid),
        where("nextReview", "<=", now)
      );
      const reviewSnap = await getDocs(qReview);

      // 4. State шинэчлэх
      setStats(prev => ({
        ...prev,
        learnedCount: learnedSnap.size, // Энэ тоо шууд нэмэгдэх ёстой
        reviewToday: reviewSnap.size
      }));

      // Task-ийг шинэчлэх
      if (reviewSnap.size > 0) {
        setTodayTasks([{
          id: 1,
          title: `Давтах ёстой ${reviewSnap.size} үг байна`,
          category: 'Spaced Repetition',
          color: '#FFD700'
        }]);
      } else {
        setTodayTasks([]);
      }

    } catch (error) {
      console.error("❌ Dashboard Алдаа:", error);
      // Хэрэв консол дээр "Index" гэсэн үгтэй урт алдаа гарвал тэр линк дээр заавал дарж индекс үүсгэнэ!
    }
  };

    fetchDashboardData();
  }, [user, location.pathname]); // location.pathname өөрчлөгдөх бүрт (хуудас солигдоход) датаг дахин татна // location нэмснээр хуудас хооронд шилжихэд датаг дахин татна

  return (
    <div className="dashboard-container" style={{ display: 'flex', gap: '25px', padding: '20px', flexWrap: 'wrap' }}>
      
      {/* 1️⃣ ЗҮҮН ТАЛ: Үндсэн мэдээлэл (Stats & Tasks) */}
      <div style={{ flex: '2', minWidth: '600px' }}>
        
        {/* Welcome Card */}
        <div style={welcomeCard}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '26px', marginBottom: '10px', fontWeight: 'bold' }}>
              Өнөөдөр ч гэсэн өдрийг сайхан өнгөрүүлээрэй, {user?.displayName?.split(' ')[0] || 'Суралцагч'}! ✨
            </h2>
            <p style={{ opacity: 0.9, fontSize: '16px' }}>
              Та энэ долоо хоногт тууштай суралцаж байна. Өөртөө итгэлтэй байгаарай!
            </p>
          </div>
          <div style={{ fontSize: '70px', marginLeft: '20px' }}>👩‍💻</div>
        </div>

        {/* Stats Grid */}
        <div style={statsGrid}>
          <div style={statCard}>
            <div style={iconBox('#E8F1FF')}>🎓</div>
            <h3 style={{ margin: '15px 0 5px', fontSize: '24px', fontWeight: 'bold' }}>{stats.learnedCount}</h3>
            <p style={{ fontSize: '14px', color: '#64748B' }}>Цээжилсэн үгс</p>
          </div>
          <div style={statCard}>
            <div style={iconBox('#FFF9E5')}>📝</div>
            <h3 style={{ margin: '15px 0 5px', fontSize: '24px', fontWeight: 'bold' }}>{stats.reviewToday}</h3>
            <p style={{ fontSize: '14px', color: '#64748B' }}>Өнөөдөр давтах</p>
          </div>
          <div style={statCard}>
            <div style={iconBox('#FFE8E8')}>🔥</div>
            <h3 style={{ margin: '15px 0 5px', fontSize: '24px', fontWeight: 'bold' }}>{stats.streak}</h3>
            <p style={{ fontSize: '14px', color: '#64748B' }}>Өдрийн Streak</p>
          </div>
        </div>

        {/* Today Tasks Section */}
        <div style={sectionCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#321D73', fontWeight: 'bold' }}>Өнөөдрийн даалгавар</h3>
            <span style={{ color: '#94A3B8', fontSize: '14px', cursor: 'pointer' }}>Бүгдийг харах</span>
          </div>

          {todayTasks.length > 0 ? todayTasks.map(task => (
            <div 
                key={task.id} 
                style={taskItem(task.color)}
                // 👇 ЭНЭ МӨРИЙГ ИНГЭЖ СОЛИОРОЙ:
                onClick={() => window.location.href = '/flashcards?mode=review'} 
            >
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
            /* ... Tasks дууссан үед харагдах хэсэг ... */
            <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8' }}>
                <span style={{ fontSize: '30px' }}>🎉</span>
                <p>Өнөөдөртөө бүх даалгавар дууссан байна!</p>
            </div>
            )}
        </div>

        {/* Activity Chart Placeholder */}
        <div style={{ ...sectionCard, marginTop: '25px' }}>
          <h3 style={{ marginBottom: '15px', color: '#321D73', fontWeight: 'bold' }}>Hours Activity</h3>
          <div style={{ height: '200px', background: '#F8FAFC', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
            [Энд суралцсан цагийн график харагдана]
          </div>
        </div>
      </div>

      {/* 2️⃣ БАРУУН ТАЛ: Хуанли болон Мэдээлэл (Sidebar) */}
      <div style={{ flex: '1', minWidth: '320px' }}>
        
        {/* Calendar Card */}
        <div style={sectionCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontWeight: 'bold', color: '#321D73' }}>Хуанли</h3>
          </div>
          <Calendar 
              onChange={setDate} 
              value={date} 
              className="custom-calendar"
              
              // 1. Гаригуудын нэрийг хүчээр Монгол болгох
              formatShortWeekday={(locale, date) => {
                const days = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Шя'];
                return days[date.getDay()];
              }}

              // 2. Сарын нэрийг хүчээр Монгол болгох (Жишээ: 2026 оны 4-р сар)
              formatMonthYear={(locale, date) => {
                const months = [
                  '1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар',
                  '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'
                ];
                return `${date.getFullYear()} оны ${months[date.getMonth()]}`;
              }}

              // 3. Өдрийн тооны ард "ил" (1일, 2일) гэж гараад байвал үүнийг нэмээрэй
              formatDay={(locale, date) => date.getDate()}
            />
        </div>

        {/* Info & Upcoming Section */}
        <div style={{ ...sectionCard, marginTop: '25px' }}>
          <h3 style={{ marginBottom: '20px', fontWeight: 'bold', color: '#321D73' }}>Мэдээлэл & Зөвлөгөө</h3>
          
          <div style={infoBox('#F0E7FF', '#321D73')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span>💡</span>
              <span style={{ fontWeight: 'bold' }}>Зөвлөгөө</span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
              Үг цээжлэх хамгийн үр дүнтэй арга бол унтахынхаа өмнө нэг удаа гүйлгэж харах юм.
            </p>
          </div>

          <div style={infoBox('#F0FFF4', '#2F855A')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span>📢</span>
              <span style={{ fontWeight: 'bold' }}>Мэдэгдэл</span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
              Тун удахгүй AI суралцах хэсэг шинэчлэгдэх болно. Хүлээгээрэй!
            </p>
          </div>
        </div>

        {/* Upgrade Pro Card (Optional - Зурган дээр байсан) */}
        <div style={upgradeCard}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🚀</div>
          <h4 style={{ margin: '0 0 10px 0' }}>Upgrade to Pro</h4>
          <p style={{ fontSize: '12px', marginBottom: '15px' }}>Бүх боломжийг хязгааргүй ашиглахыг хүсвэл Pro болоорой.</p>
          <button style={upgradeBtn}>Дэлгэрэнгүй</button>
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