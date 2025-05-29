import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setTokens } from '../utils/auth';
import Sidebar from '../components/Sidebar';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://wonokim.iptime.org:4000/login',
        { email, password },
        { 
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
      
      const accessToken = response.headers['authorization'];
      const refreshToken = response.headers['authorization-refresh'];
      
      if (accessToken && refreshToken) {
        setTokens(accessToken, refreshToken);
        alert('로그인 성공!');
        navigate('/');
      } else {
        setError('토큰을 받지 못했습니다. 관리자에게 문의하세요.');
      }
    } catch (err) {
      console.error('로그인 에러:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  // ✅ OAuth 로그인 경로로 이동
  const handleOAuthLogin = (provider) => {
    window.location.href = `http://wonokim.iptime.org:4000/oauth2/authorization/${provider}`;
  };

  return (
    <div className="main-wrapper">
      <Sidebar open={sidebarOpen} />
      <button
        className="menu-button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>
      
      <div className="content-container">
        <div className="auth-wrapper">
          <h2>로그인</h2>
          <form onSubmit={handleSubmit}>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="이메일" 
              required 
            />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="비밀번호" 
              required 
            />
            {error && <div className="error-message">{error}</div>}
            <button type="submit">로그인</button>
          </form>

          <div className="oauth-wrapper">
            <p className="oauth-title">또는 SNS 계정으로 로그인</p>
            <div className="oauth-buttons">
              <button onClick={() => handleOAuthLogin('kakao')} className="oauth-button kakao">카카오로 로그인</button>
              <button onClick={() => handleOAuthLogin('google')} className="oauth-button google">구글로 로그인</button>
              <button onClick={() => handleOAuthLogin('naver')} className="oauth-button naver">네이버로 로그인</button>
            </div>
          </div>

          <div className="helper-text">
            <a href="/signup">회원가입</a>
            &nbsp;|&nbsp;
            <a href="/password-reset">비밀번호 찾기</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
