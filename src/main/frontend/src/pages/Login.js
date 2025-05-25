import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

function Login() {
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/login', { userid, password });
      if (res.data.success) {
        alert('로그인 성공!');
      } else {
        alert('로그인 실패: ' + res.data.message);
      }
    } catch (err) {
      console.error('로그인 에러:', err);
    }
  };

  return (
    <div className="auth-wrapper">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" value={userid} onChange={(e) => setUserid(e.target.value)} placeholder="아이디" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" required />
        <button type="submit">로그인</button>
      </form>
      <div className="helper-text">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.open('/signup', '_blank', 'width=500,height=700');
          }}
        >
          회원가입
        </a>
        &nbsp;|&nbsp;
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.open('/find-password', '_blank', 'width=500,height=600');
          }}
        >
          비밀번호 찾기
        </a>
      </div>
    </div>
  );
}

export default Login;