import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth } from './firebase';

// Components
import Sidebar from './components/Siderbar.jsx';
import Header from './components/Header';
import Footer from './components/Footer'; // Footer-ээ тусад нь файл болгож импортлоорой

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AiTesting from './pages/AiTesting';
import Flashcards from './pages/Flashcards';
import History from './pages/History';
import LevelTest from './pages/LevelTest.jsx';
import Courses from './pages/Courses';
import YoutubeLessons from './pages/YoutubeLessons'; 
import Qna from './pages/Qna';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';

// Routing болон Layout-ийг удирдах дотоод компонент
function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Footer нуух замууд
  const hideFooterRoutes = ['/ai-test', '/level-test'];
  const shouldShowFooter = !user && !hideFooterRoutes.includes(location.pathname);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#321D73', color: 'white' }}>
        Уншиж байна...
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      overflowX: 'hidden', 
      background: user ? '#F8F9FE' : '#F0F4FF' 
    }}>
      
      {/* SIDEBAR: Static */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={user} />

      <div style={{ 
        flex: 1, 
        marginLeft: isSidebarOpen ? '280px' : '0px', 
        transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        
        <Header user={user} setIsOpen={setIsSidebarOpen} />
        
        <main style={{ 
          flex: 1, 
          margin: user ? '20px' : '0px', 
          borderRadius: user ? '30px' : '0px', 
          background: user ? '#fff' : 'transparent',
          boxShadow: user ? '0 10px 30px rgba(0,0,0,0.05)' : 'none',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ flex: 1 }}>
            <Routes>
                {/* 🏠 ҮНДСЭН ЗАМ & DASHBOARD */}
                <Route 
                  path="/" 
                  element={user ? <Dashboard user={user} /> : <LandingPage user={user} />} 
                />
                
                {/* 🔑 LOGIN */}
                <Route 
                  path="/login" 
                  element={user ? <Navigate to="/" /> : <Login />} 
                />

                {/* 🔒 ХУВИЙН ХЭСЭГ (Нэвтэрсэн үед л харагдана) */}
                <Route 
                  path="/dashboard" 
                  element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/history" 
                  element={user ? <History user={user} /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/settings" 
                  element={user ? <Settings user={user} /> : <Navigate to="/login" />} 
                />

                {/* 🌍 НЭЭЛТТЭЙ ХЭСЭГ (Нэвтрээгүй байсан ч орох боломжтой, гэвч дата хадгалахад user хэрэгтэй) */}
                <Route path="/level-test" element={<LevelTest user={user} />} />
                <Route path="/ai-test" element={<AiTesting user={user} />} />
                <Route path="/courses" element={<Courses user={user} />} />
                <Route path="/flashcards" element={<Flashcards user={user} />} />
                <Route path="/youtube" element={<YoutubeLessons user={user} />} />
                <Route path="/qna" element={<Qna user={user} />} />
                <Route path="/leaderboard" element={<Leaderboard user={user} />} />

                {/* 🚫 БУРУУ ЗАМ (404) */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
          </div>

          {/* FOOTER: Нөхцөлт харагдац */}
          {shouldShowFooter && <Footer />}
        </main>
      </div>
    </div>
  );
}

// Үндсэн App функц
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}