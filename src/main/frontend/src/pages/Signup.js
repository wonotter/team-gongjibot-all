import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

function Signup() {
  const [userid, setUserid] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      const res = await axios.post('http://localhost:8080/api/signup', {
        userid, email, password
      });
      if (res.data.success) {
        alert('회원가입 성공!');
      } else {
        alert('회원가입 실패: ' + res.data.message);
      }
    } catch (err) {
      console.error('회원가입 에러:', err);
    }
  };

  return (
    <div className="auth-wrapper">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" value={userid} onChange={(e) => setUserid(e.target.value)} placeholder="아이디" required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" required />
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="비밀번호 확인" required />
        <button type="submit">회원가입</button>
      </form>
      <div className="helper-text">
        이미 계정이 있으신가요? <a href="/login">로그인</a>
      </div>
    </div>
  );
}

export default Signup;