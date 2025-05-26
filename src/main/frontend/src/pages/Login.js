import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setTokens } from '../utils/auth';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:4000/login', 
        { email, password },
        { 
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true // 쿠키를 주고받기 위해 필요
        }
      );
      
      // 응답 헤더에서 JWT 토큰 추출
      const accessToken = response.headers['authorization'];
      const refreshToken = response.headers['authorization-refresh'];
      
      if (accessToken && refreshToken) {
        // 토큰 저장 및 axios 기본 헤더 설정
        setTokens(accessToken, refreshToken);
        
        alert('로그인 성공!');
        navigate('/'); // 홈 페이지로 이동
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

  return (
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
      <div className="helper-text">
        <a href="/signup">회원가입</a>
        &nbsp;|&nbsp;
        <a href="/password-reset">비밀번호 찾기</a>
      </div>
    </div>
  );
}

export default Login;