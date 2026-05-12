import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const Flashcards = ({ user }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const defaultSets = {
    Family: [{ kr: '가족', mn: 'Гэр бүл' }, { kr: '아버지', mn: 'Аав' }, { kr: '어머니', mn: 'Ээж' }],
    School: [{ kr: '학교', mn: 'Сургууль' }, { kr: '선생님', mn: 'Багш' }, { kr: '학생', mn: 'Оюутан' }],
    Sport: [{ kr: '축구', mn: 'Хөлбөмбөг' }, { kr: '농구', mn: 'Сагсан бөмбөг' }, { kr: '수영', mn: 'Усан сэлэлт' }],
    'TOPIK 1': [{ kr: '사과', mn: 'Алим' }, { kr: '우유', mn: 'Сүү' }],
    'TOPIK 2': [{ kr: '환경', mn: 'Хүрээлэн буй орчин' }, { kr: '경제', mn: 'Эдийн засаг' }]
  };

  const [currentCategory, setCurrentCategory] = useState('Family');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [customSets, setCustomSets] = useState([]);
  const [currentWords, setCurrentWords] = useState([]);

  const [isTesting, setIsTesting] = useState(false);
  const [isSingleWord, setIsSingleWord] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [testScore, setTestScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [choices, setChoices] = useState([]);
  const [correctWords, setCorrectWords] = useState([]);
  const [wrongWords, setWrongWords] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newWords, setNewWords] = useState([{ kr: '', mn: '' }]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Firestore-оос өгөгдөл татах
  useEffect(() => {
    const fetchWords = async () => {
      if (!user) return;
      const urlParams = new URLSearchParams(location.search);
      const mode = urlParams.get('mode');
      try {
        const q = query(collection(db, "customSets"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const sets = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCustomSets(sets);

        if (mode === 'review') {
          const now = Timestamp.now();
          const qReview = query(
            collection(db, "learnedWords"),
            where("userId", "==", user.uid),
            where("nextReview", "<=", now)
          );
          const reviewSnap = await getDocs(qReview);
          if (!reviewSnap.empty) {
            const reviewWords = reviewSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            setCurrentWords(reviewWords);
            setCurrentCategory('Давтах үгс ⏳');
            setCurrentIndex(0);
            return;
          }
        }
        setCurrentWords(defaultSets['Family']);
        setCurrentCategory('Family');
        setCurrentIndex(0);
      } catch (e) {
        console.error("Алдаа гарлаа:", e);
      }
    };
    fetchWords();
  }, [user, location.search]);

  // Хариулт shuffle — асуулт өөрчлөгдөх бүрт
  useEffect(() => {
    if (!testQuestions[currentQuestionIdx] || isSingleWord) return;
    const correct = testQuestions[currentQuestionIdx].mn;
    // Алдсан үгсийн pool болон бүх currentWords-аас буруу хариулт авах
    const allWords = [...currentWords, ...wrongWords];
    const wrongs = allWords
      .filter(w => w.mn !== correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.mn);
    setChoices([correct, ...wrongs].sort(() => Math.random() - 0.5));
  }, [currentQuestionIdx, testQuestions, isSingleWord]);

  // Солонгос дуу унших
  const speakKorean = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const trySpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const koreanVoice = voices.find(v => v.lang === 'ko-KR' && v.name.includes('Heami'))
        || voices.find(v => v.lang === 'ko-KR');

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      if (koreanVoice) utterance.voice = koreanVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = trySpeak;
    } else {
      trySpeak();
    }
  };

  // Өөрийн багц устгах
  const deleteCustomSet = async (setId, setName) => {
    if (!window.confirm(t("fc_delete_confirm"))) return;
    try {
      await deleteDoc(doc(db, "customSets", setId));
      setCustomSets(prev => prev.filter(s => s.id !== setId));
      if (currentCategory === setName) {
        setCurrentCategory('Family');
        setCurrentWords(defaultSets['Family']);
        setCurrentIndex(0);
      }
    } catch (e) {
      console.error("Устгах алдаа:", e);
    }
  };

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

  const startTest = (wordsToTest = currentWords) => {
    // 1 үг байвал тусгай горим
    if (wordsToTest.length === 1) {
      setIsSingleWord(true);
      setTestQuestions(wordsToTest);
      setCurrentQuestionIdx(0);
      setIsTesting(true);
      setShowResult(false);
      return;
    }

    if (wordsToTest.length < 2) return alert(t("fc_min_words"));

    const shuffled = [...wordsToTest].sort(() => Math.random() - 0.5);
    setTestQuestions(shuffled);
    setCurrentQuestionIdx(0);
    setTestScore(0);
    setCorrectWords([]);
    setWrongWords([]);
    setIsSingleWord(false);
    setIsTesting(true);
    setShowResult(false);
  };

  const handleAnswer = (userAnswer) => {
    const isCorrect = userAnswer === testQuestions[currentQuestionIdx].mn;

    if (isCorrect) {
      setTestScore(prev => prev + 1);
      setCorrectWords(prev => [...prev, testQuestions[currentQuestionIdx]]);
    } else {
      setWrongWords(prev => [...prev, testQuestions[currentQuestionIdx]]);
    }

    if (currentQuestionIdx + 1 < testQuestions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const retryWrongWords = () => {
    // Алдсан үгсийг ахин шалгалт эхлүүлэх
    // correctWords хуримтлагдсаар байна, wrongWords дахин тест болно
    const toRetry = [...wrongWords];
    setWrongWords([]);
    startTest(toRetry);
  };

  const saveLearnedWords = async (wordsToSave = correctWords) => {
    if (!user || wordsToSave.length === 0) return;
    setIsSaving(true);
    try {
      const intervals = [1, 3, 7, 15, 30, 90];
      const promises = wordsToSave.map(async (word) => {
        const q = query(
          collection(db, "learnedWords"),
          where("userId", "==", user.uid),
          where("kr", "==", word.kr)
        );
        const querySnapshot = await getDocs(q);
        const nextDate = new Date();
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const docId = docSnap.id;
          const currentLevel = docSnap.data().level || 1;
          const daysToAdd = intervals[currentLevel - 1] || 90;
          nextDate.setDate(nextDate.getDate() + daysToAdd);
          await updateDoc(doc(db, "learnedWords", docId), {
            nextReview: Timestamp.fromDate(nextDate),
            level: currentLevel + 1,
            lastTested: Timestamp.now()
          });
        } else {
          nextDate.setDate(nextDate.getDate() + 1);
          await addDoc(collection(db, "learnedWords"), {
            userId: user.uid,
            kr: word.kr,
            mn: word.mn,
            nextReview: Timestamp.fromDate(nextDate),
            level: 1,
            createdAt: Timestamp.now(),
            lastTested: Timestamp.now()
          });
        }
      });
      await Promise.all(promises);
      alert(t("save_success"));
      navigate('/dashboard');
    } catch (e) {
      console.error("❌ Хадгалах явцад алдаа гарлаа:", e);
      alert(t("save_error"));
    } finally {
      setIsSaving(false);
    }
  };

  const saveNewSet = async () => {
    if (!newSetName || newWords[0].kr === '') return alert(t("fc_fill_info"));
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

  const currentWord = currentWords[currentIndex];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '20px 20px 100px' }}>
      <h2 style={{ color: '#321D73', marginBottom: '20px' }}>🗂 {t("menu_flashcards")}</h2>

      {currentCategory === 'Давтах үгс ⏳' && !isTesting && (
        <div style={reviewBannerStyle}>✨ {t("fc_review_loaded")}</div>
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
            <div key={set.id} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <button onClick={() => changeCategory(set.setName)}
                style={{
                  ...tabButtonStyle,
                  paddingRight: '32px',
                  border: '1px solid #321D73',
                  background: currentCategory === set.setName ? '#321D73' : 'white',
                  color: currentCategory === set.setName ? 'white' : '#321D73'
                }}>
                🌟 {set.setName}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteCustomSet(set.id, set.setName); }}
                style={{
                  position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                  width: '18px', height: '18px', borderRadius: '50%', border: 'none',
                  background: currentCategory === set.setName ? 'rgba(255,255,255,0.3)' : '#E2E8F0',
                  color: currentCategory === set.setName ? 'white' : '#64748B',
                  cursor: 'pointer', fontSize: '10px', padding: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                ✕
              </button>
            </div>
          ))}

          <button onClick={() => user ? setShowModal(true) : navigate('/login')} style={addSetBtnStyle}>
            + {t("fc_new_set")}
          </button>
        </div>
      )}

      {/* КАРТ ХАРАХ */}
      {!isTesting ? (
        <>
          {currentWords.length > 0 ? (
            <div style={{ padding: '20px' }}>
              <div onClick={() => setIsFlipped(!isFlipped)} style={cardContainerStyle}>
                <div style={{ ...innerCardStyle, transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                  <div style={getCardSideStyle(false)}>{currentWord?.kr}</div>
                  <div style={getCardSideStyle(true)}>{currentWord?.mn}</div>
                </div>
              </div>

              <div style={{ marginTop: '15px' }}>
                <button
                  onClick={() => currentWord?.kr && speakKorean(currentWord.kr)}
                  style={{
                    background: isSpeaking ? '#321D73' : '#F0E7FF',
                    color: isSpeaking ? 'white' : '#321D73',
                    border: 'none', borderRadius: '50%',
                    width: '48px', height: '48px', fontSize: '20px',
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                  🔊
                </button>
              </div>

              <div style={navControlStyle}>
                <button onClick={() => { setIsFlipped(false); setCurrentIndex(p => (p - 1 + currentWords.length) % currentWords.length); }} style={navBtnStyle}>←</button>
                <span style={{ fontWeight: 'bold' }}>{currentIndex + 1} / {currentWords.length}</span>
                <button onClick={() => { setIsFlipped(false); setCurrentIndex(p => (p + 1) % currentWords.length); }} style={navBtnStyle}>→</button>
              </div>

              <button onClick={() => startTest()} style={testStartBtnStyle}>📝 {t("fc_start_test")}</button>
            </div>
          ) : <p>{t("fc_no_words")}</p>}
        </>
      ) : (
        <div style={testBoxStyle}>

          {/* ── 1 ҮГ ГОРИМ ── */}
          {isSingleWord && !showResult && (
            <>
              <p style={{ color: '#F59E0B', fontWeight: 'bold', marginBottom: '16px' }}>⚠️ Сүүлийн 1 үг үлдлээ!</p>
              <div style={testWordStyle}>{testQuestions[0]?.kr}</div>
              <button onClick={() => speakKorean(testQuestions[0]?.kr)} style={speakerBtnStyle(isSpeaking)}>🔊</button>
              <p style={{ color: '#94A3B8', fontSize: '14px', margin: '8px 0 24px' }}>Энэ үгийг мэдэж байна уу?</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => saveLearnedWords([testQuestions[0]])} disabled={isSaving} style={saveBtnStyle}>
                  {isSaving ? t("fc_saving") : '✅ Мэдэж байна'}
                </button>
                <button onClick={() => navigate('/dashboard')} style={cancelBtnStyle}>
                  ⏭ Алгасах
                </button>
              </div>
            </>
          )}

          {/* ── ЕРДИЙН ШАЛГАЛТ ── */}
          {!isSingleWord && !showResult && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '30px' }}>
                <div style={testWordStyle}>{testQuestions[currentQuestionIdx]?.kr}</div>
                <button
                  onClick={() => testQuestions[currentQuestionIdx]?.kr && speakKorean(testQuestions[currentQuestionIdx].kr)}
                  style={speakerBtnStyle(isSpeaking)}>
                  🔊
                </button>
              </div>
              <div style={answerGridStyle}>
                {choices.map((c, i) => (
                  <button key={i} onClick={() => handleAnswer(c)} style={answerBtnStyle}>{c}</button>
                ))}
              </div>
            </>
          )}

          {/* ── ҮР ДҮН ── */}
          {showResult && (
            <div>
              <h3>{t("fc_result")}</h3>
              <div style={getCircularStyle(testScore, testQuestions.length)}>
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {Math.round((testScore / testQuestions.length) * 100)}%
                </span>
              </div>
              <p>{t("fc_correct")}: {testScore} / {testQuestions.length}</p>

              {/* Зөв хариулсан үгсийг хадгалах */}
              {correctWords.length > 0 && (
                <button onClick={() => saveLearnedWords(correctWords)} disabled={isSaving} style={saveBtnStyle}>
                  {isSaving ? t("fc_saving") : `✅ ${correctWords.length} үг цээжилсэнд нэмэх`}
                </button>
              )}

              {/* Алдсан үгс байвал ахин давтах, үгүй бол гарах */}
              {wrongWords.length > 0 ? (
                <button onClick={retryWrongWords} style={{ ...cancelBtnStyle, marginTop: '8px', background: '#FFF3E0', color: '#E65100' }}>
                  🔄 {wrongWords.length} алдсан үгийг ахин давтах
                </button>
              ) : (
                <button onClick={() => setIsTesting(false)} style={{ ...cancelBtnStyle, marginTop: '8px' }}>
                  {t("fc_cancel")}
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* МОДАЛ */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>{t("fc_create_set")}</h3>
            <input placeholder={t("fc_set_name")} value={newSetName} onChange={e => setNewSetName(e.target.value)} style={inputStyle} />
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {newWords.map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                  <input placeholder="KR" value={w.kr} onChange={e => { const u = [...newWords]; u[i].kr = e.target.value; setNewWords(u); }} style={inputStyle} />
                  <input placeholder="MN" value={w.mn} onChange={e => { const u = [...newWords]; u[i].mn = e.target.value; setNewWords(u); }} style={inputStyle} />
                </div>
              ))}
            </div>
            <button onClick={() => setNewWords([...newWords, { kr: '', mn: '' }])} style={addWordBtn}>
              + {t("fc_add_word")}
            </button>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={saveNewSet} style={saveBtnStyle}>{t("fc_save_set")}</button>
              <button onClick={() => setShowModal(false)} style={cancelBtnStyle}>{t("fc_cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Стилиуд ---
const speakerBtnStyle = (isSpeaking) => ({
  background: isSpeaking ? '#321D73' : '#F0E7FF',
  color: isSpeaking ? 'white' : '#321D73',
  border: 'none', borderRadius: '50%',
  width: '44px', height: '44px', fontSize: '18px',
  cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  margin: '10px auto'
});

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
const testWordStyle = { fontSize: '40px', fontWeight: 'bold', color: '#321D73' };
const answerGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' };
const answerBtnStyle = { padding: '15px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontSize: '15px' };
const saveBtnStyle = { width: '100%', padding: '12px', background: '#321D73', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', marginBottom: '8px' };
const cancelBtnStyle = { width: '100%', padding: '12px', background: '#F1F5F9', color: '#333', border: 'none', borderRadius: '10px', cursor: 'pointer' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: 'white', padding: '25px', borderRadius: '20px', width: '90%', maxWidth: '400px' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #DDD', boxSizing: 'border-box' };
const addWordBtn = { width: '100%', padding: '8px', border: '1px dashed #321D73', background: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '10px' };

export default Flashcards;
