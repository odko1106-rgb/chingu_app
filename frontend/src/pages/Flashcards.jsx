import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 👈 Навигаци болон байршил хянах
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, Timestamp } from 'firebase/firestore';

const Flashcards = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Үндсэн өгөгдөл
  const defaultSets = {
    Family: [{ kr: '가족', mn: 'Гэр бүл' }, { kr: '아버지', mn: 'Аав' }, { kr: '어머니', mn: 'Ээж' }],
    School: [{ kr: '학교', mn: 'Сургууль' }, { kr: '선생님', mn: 'Багш' }, { kr: '학생', mn: 'Оюутан' }],
    Sport: [{ kr: '축구', mn: 'Хөлбөмбөг' }, { kr: '농구', mn: 'Сагсан бөмбөг' }, { kr: '수영', mn: 'Усан сэлэлт' }],
    'TOPIK 1': [{ kr: '사과', mn: 'Алим' }, { kr: '우유', mn: 'Сүү' }],
    'TOPIK 2': [{ kr: '환경', mn: 'Хүрээлэн буй орчин' }, { kr: '경제', mn: 'Эдийн засаг' }]
  };

  // 2. Төлөвүүд (States)
  const [currentCategory, setCurrentCategory] = useState('Family');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [customSets, setCustomSets] = useState([]);
  const [currentWords, setCurrentWords] = useState([]);
  
  const [isTesting, setIsTesting] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [testScore, setTestScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newWords, setNewWords] = useState([{ kr: '', mn: '' }]);
  const [isSaving, setIsSaving] = useState(false);

  // 3. Firestore-оос өгөгдөл татах
  useEffect(() => {
    const fetchWords = async () => {
      if (!user) return;

      const urlParams = new URLSearchParams(location.search);
      const mode = urlParams.get('mode');

      try {
        // Хэрэглэгчийн үүсгэсэн багцуудыг татах
        const q = query(collection(db, "customSets"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const sets = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCustomSets(sets);

        // Review Mode шалгах
        if (mode === 'review') {
          const now = Timestamp.now(); 
          const qReview = query(
            collection(db, "learnedWords"),
            where("userId", "==", user.uid),
            where("nextReview", "<=", now)
          );

          const reviewSnap = await getDocs(qReview);
          if (!reviewSnap.empty) {
            const reviewWords = reviewSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCurrentWords(reviewWords);
            setCurrentCategory('Давтах үгс ⏳');
            setCurrentIndex(0);
            return;
          }
        }
        
        // Ердийн үед Family багцыг харуулна
        setCurrentWords(defaultSets['Family']);
        setCurrentCategory('Family');
        setCurrentIndex(0);

      } catch (e) {
        console.error("Алдаа гарлаа:", e);
      }
    };

    fetchWords();
  }, [user, location.search]);

  // 4. Функцүүд
  const changeCategory = (catName) => {
    setCurrentCategory(catName);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsTesting(false);

    if (defaultSets[catName]) {
      setCurrentWords(defaultSets[catName]);
    } else {
      const foundSet = customSets.find(s => s.setName === catName);
      setCurrentWords(foundSet ? foundSet.words : []);
    }
  };

  const startTest = () => {
    if (currentWords.length < 2) return alert("Тест өгөхөд дор хаяж 2 үг хэрэгтэй!");
    const shuffled = [...currentWords].sort(() => Math.random() - 0.5);
    setTestQuestions(shuffled);
    setCurrentQuestionIdx(0);
    setTestScore(0);
    setIsTesting(true);
    setShowResult(false);
  };

  const handleAnswer = (userAnswer) => {
    if (userAnswer === testQuestions[currentQuestionIdx].mn) {
      setTestScore(prev => prev + 1);
    }
    if (currentQuestionIdx + 1 < testQuestions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const saveLearnedWords = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const promises = testQuestions.map(async (word) => {
        const q = query(collection(db, "learnedWords"), where("userId", "==", user.uid), where("kr", "==", word.kr));
        const querySnapshot = await getDocs(q);

        const nextDate = new Date();
        const currentLevel = !querySnapshot.empty ? (querySnapshot.docs[0].data().level || 1) : 1;
        
        // Spaced Repetition: Түвшин ахих тусам давтах хугацаа холдоно (1, 2, 4, 8 хоног...)
        const daysToAdd = Math.pow(2, currentLevel - 1); 
        nextDate.setDate(nextDate.getDate() + daysToAdd);

        if (!querySnapshot.empty) {
          const docId = querySnapshot.docs[0].id;
          await updateDoc(doc(db, "learnedWords", docId), {
            nextReview: Timestamp.fromDate(nextDate),
            level: currentLevel + 1,
            lastTested: Timestamp.now()
          });
        } else {
          await addDoc(collection(db, "learnedWords"), {
            userId: user.uid,
            kr: word.kr,
            mn: word.mn,
            nextReview: Timestamp.fromDate(nextDate),
            level: 1,
            createdAt: Timestamp.now()
          });
        }
      });

      await Promise.all(promises);
      alert("Цээжилсэн үгс хадгалагдлаа!");
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      alert("Алдаа гарлаа.");
    } finally {
      setIsSaving(false);
    }
  };

  const saveNewSet = async () => {
    if (!newSetName || newWords[0].kr === '') return alert("Мэдээллээ оруулна уу!");
    setIsSaving(true);
    try {
      const filtered = newWords.filter(w => w.kr !== '' && w.mn !== '');
      const docRef = await addDoc(collection(db, "customSets"), {
        userId: user.uid,
        setName: newSetName,
        words: filtered,
        createdAt: Timestamp.now()
      });
      setCustomSets(prev => [...prev, { id: docRef.id, setName: newSetName, words: filtered }]);
      setShowModal(false);
      setNewSetName('');
      setNewWords([{ kr: '', mn: '' }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Туслах Style Функцүүд ---
  const getCardSideStyle = (isBack) => ({
    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
    background: isBack ? '#321D73' : 'white', color: isBack ? 'white' : '#321D73',
    borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: isBack ? '32px' : '40px', fontWeight: 'bold', 
    transform: isBack ? 'rotateY(180deg)' : 'none',
    border: isBack ? 'none' : '2px solid #F1F5F9'
  });

  const getCircularStyle = (score, total) => {
    const percentage = total > 0 ? (score / total) * 100 : 0;
    return {
      width: '150px', height: '150px', borderRadius: '50%', margin: '0 auto',
      background: `conic-gradient(#FFD700 ${percentage}%, #E2E8F0 ${percentage}%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', boxShadow: 'inset 0 0 0 15px white'
    };
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '20px 20px 100px' }}>
      <h2 style={{ color: '#321D73', marginBottom: '20px' }}>🗂 Flashcards</h2>

      {currentCategory === 'Давтах үгс ⏳' && !isTesting && (
        <div style={reviewBannerStyle}>✨ Өнөөдөр давтах ёстой үгнүүд ачаалагдлаа.</div>
      )}

      {/* БАГЦ СОНГОХ */}
      {!isTesting && (
        <div style={tabContainerStyle}>
          {Object.keys(defaultSets).map(cat => (
            <button key={cat} onClick={() => changeCategory(cat)} 
              style={{ ...tabButtonStyle, background: currentCategory === cat ? '#321D73' : '#E2E8F0', color: currentCategory === cat ? 'white' : '#64748B' }}>
              {cat}
            </button>
          ))}
          {customSets.map(set => (
            <button key={set.id} onClick={() => changeCategory(set.setName)}
              style={{ ...tabButtonStyle, border: '1px solid #321D73', background: currentCategory === set.setName ? '#321D73' : 'white', color: currentCategory === set.setName ? 'white' : '#321D73' }}>
              🌟 {set.setName}
            </button>
          ))}
          <button onClick={() => user ? setShowModal(true) : navigate('/login')} style={addSetBtnStyle}>+ Шинэ багц</button>
        </div>
      )}

      {/* КАРТ ХАРАХ */}
      {!isTesting ? (
        <>
          {currentWords.length > 0 ? (
            <div style={{ padding: '20px' }}>
              <div onClick={() => setIsFlipped(!isFlipped)} style={cardContainerStyle}>
                <div style={{ ...innerCardStyle, transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                  <div style={getCardSideStyle(false)}>{currentWords[currentIndex]?.kr}</div>
                  <div style={getCardSideStyle(true)}>{currentWords[currentIndex]?.mn}</div>
                </div>
              </div>
              <div style={navControlStyle}>
                <button onClick={() => { setIsFlipped(false); setCurrentIndex(p => (p - 1 + currentWords.length) % currentWords.length)}} style={navBtnStyle}>←</button>
                <span style={{ fontWeight: 'bold' }}>{currentIndex + 1} / {currentWords.length}</span>
                <button onClick={() => { setIsFlipped(false); setCurrentIndex(p => (p + 1) % currentWords.length)}} style={navBtnStyle}>→</button>
              </div>
              <button onClick={startTest} style={testStartBtnStyle}>📝 Тест эхлүүлэх</button>
            </div>
          ) : <p>Үг олдсонгүй...</p>}
        </>
      ) : (
        /* ТЕСТ ХЭСЭГ */
        <div style={testBoxStyle}>
          {!showResult ? (
            <>
              <div style={testWordStyle}>{testQuestions[currentQuestionIdx]?.kr}</div>
              <div style={answerGridStyle}>
                {(() => {
                  const correct = testQuestions[currentQuestionIdx].mn;
                  const filtered = currentWords.filter(w => w.mn !== correct).map(w => w.mn);
                  const wrongs = filtered.sort(() => 0.5 - Math.random()).slice(0, 3);
                  const choices = [correct, ...wrongs].sort(() => 0.5 - Math.random());
                  return choices.map((c, i) => (
                    <button key={i} onClick={() => handleAnswer(c)} style={answerBtnStyle}>{c}</button>
                  ));
                })()}
              </div>
            </>
          ) : (
            <div>
              <h3>Үр дүн</h3>
              <div style={getCircularStyle(testScore, testQuestions.length)}>
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{Math.round((testScore / testQuestions.length) * 100)}%</span>
              </div>
              <p>Зөв: {testScore} / {testQuestions.length}</p>
              <button onClick={saveLearnedWords} disabled={isSaving} style={saveBtnStyle}>{isSaving ? 'Хадгалж байна...' : 'Цээжилсэн үгс рүү хадгалах'}</button>
              <button onClick={() => setIsTesting(false)} style={cancelBtnStyle}>Болих</button>
            </div>
          )}
        </div>
      )}

      {/* МОДАЛ */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Шинэ багц үүсгэх</h3>
            <input placeholder="Багцын нэр" value={newSetName} onChange={e => setNewSetName(e.target.value)} style={inputStyle} />
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {newWords.map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                  <input placeholder="KR" value={w.kr} onChange={e => { const u = [...newWords]; u[i].kr = e.target.value; setNewWords(u); }} style={inputStyle} />
                  <input placeholder="MN" value={w.mn} onChange={e => { const u = [...newWords]; u[i].mn = e.target.value; setNewWords(u); }} style={inputStyle} />
                </div>
              ))}
            </div>
            <button onClick={() => setNewWords([...newWords, { kr: '', mn: '' }])} style={addWordBtn}>+ Үг нэмэх</button>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={saveNewSet} style={saveBtnStyle}>Хадгалах</button>
              <button onClick={() => setShowModal(false)} style={cancelBtnStyle}>Болих</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Стилиуд (Тусдаа объект болгов) ---
const reviewBannerStyle = { background: '#FFFBEB', padding: '15px', borderRadius: '15px', color: '#92400E', fontWeight: 'bold', marginBottom: '20px' };
const tabContainerStyle = { display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' };
const tabButtonStyle = { padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold' };
const addSetBtnStyle = { padding: '8px 16px', borderRadius: '20px', border: '2px dashed #321D73', background: 'none', color: '#321D73', cursor: 'pointer' };
const cardContainerStyle = { width: '100%', height: '300px', perspective: '1000px', cursor: 'pointer' };
const innerCardStyle = { position: 'relative', width: '100%', height: '100%', transition: '0.6s', transformStyle: 'preserve-3d' };
const navControlStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', marginTop: '20px' };
const navBtnStyle = { width: '45px', height: '45px', borderRadius: '50%', border: 'none', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' };
const testStartBtnStyle = { marginTop: '30px', padding: '12px 30px', borderRadius: '12px', border: 'none', background: '#FFD700', color: '#321D73', fontWeight: 'bold', cursor: 'pointer' };
const testBoxStyle = { padding: '30px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' };
const testWordStyle = { fontSize: '40px', fontWeight: 'bold', color: '#321D73', marginBottom: '30px' };
const answerGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' };
const answerBtnStyle = { padding: '15px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' };
const saveBtnStyle = { flex: 1, padding: '12px', background: '#321D73', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' };
const cancelBtnStyle = { flex: 1, padding: '12px', background: '#F1F5F9', color: '#333', border: 'none', borderRadius: '10px', cursor: 'pointer' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: 'white', padding: '25px', borderRadius: '20px', width: '90%', maxWidth: '400px' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #DDD', boxSizing: 'border-box' };
const addWordBtn = { width: '100%', padding: '8px', border: '1px dashed #321D73', background: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '10px' };

export default Flashcards;