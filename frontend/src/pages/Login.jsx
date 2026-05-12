import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithGoogle } from '../firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError("Имэйл эсвэл нууц үг буруу байна!");
    }
  };

  const handleGoogleLogin = async () => {
  setError('');
  try {
    const result = await signInWithGoogle();
    if (result.user) {
      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          streakCount: 0,
          bestStreak: 0,
          lastActiveDate: null,
          createdAt: serverTimestamp()
        });
      }
      navigate('/');
    }
  } catch (err) {
    console.error(err);
    setError("Google-ээр нэвтрэхэд алдаа гарлаа.");
  }
};

  return (
    <div style={containerStyle}>
      <div style={loginCardStyle}>
        <h1 style={titleStyle}>Login Now</h1>

        {error && <p style={{ color: '#ff4d4d', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}

        <form onSubmit={handleEmailLogin} style={formStyle}>
          <input
            type="email"
            placeholder="Email or Username"
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" style={loginBtnStyle}>LOGIN</button>
        </form>

        <p style={{ margin: '25px 0', fontSize: '14px', opacity: 0.8 }}>Or login with</p>

        <div style={socialContainerStyle}>
          <button style={socialBtnStyle}>
            <img
              src="https://www.facebook.com/images/fb_icon_325x325.png"
              alt="FB"
              style={iconStyle}
            />
            Facebook
          </button>
          <button onClick={handleGoogleLogin} style={{ ...socialBtnStyle, background: 'white', color: '#555' }}>
            <img
              src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
              alt="G"
              style={iconStyle}
            />
            Google
          </button>
        </div>

        <p style={{ marginTop: '40px', fontSize: '14px' }}>
          Not a member? <span style={signupLinkStyle}>Signup now</span>
        </p>
      </div>
    </div>
  );
};

const containerStyle = {
  flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
  background: '#A5C0FF', minHeight: '100vh', padding: '20px'
};
const loginCardStyle = { width: '100%', maxWidth: '420px', textAlign: 'center', color: 'white' };
const titleStyle = { fontSize: '56px', fontWeight: '800', marginBottom: '20px', letterSpacing: '-1px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' };
const inputStyle = {
  padding: '18px 25px', borderRadius: '15px', border: 'none',
  background: '#E0E9FF', fontSize: '16px', outline: 'none',
  color: '#333', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
};
const loginBtnStyle = {
  padding: '18px', borderRadius: '15px', border: 'none',
  background: '#0035A0', color: 'white', fontWeight: 'bold',
  fontSize: '18px', cursor: 'pointer', marginTop: '10px',
  transition: '0.3s', boxShadow: '0 10px 20px rgba(0,53,160,0.2)'
};
const socialContainerStyle = { display: 'flex', justifyContent: 'center', gap: '15px' };
const socialBtnStyle = {
  flex: 1, padding: '14px', borderRadius: '15px', border: 'none',
  background: '#E0E9FF', cursor: 'pointer', fontWeight: 'bold',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: '10px', fontSize: '14px', color: '#333', transition: '0.2s'
};
const iconStyle = { width: '22px', height: '22px' };
const signupLinkStyle = { color: '#FFD700', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' };

export default Login;