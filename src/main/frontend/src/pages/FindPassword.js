import React, { useState } from 'react';
import './Auth.css';

function FindPassword() {
  const [email, setEmail] = useState('');

  const validateEmail = (email) => {
    const re = /^\S+@\S+\.\S+$/;
    return re.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    if (!validateEmail(email)) {
      alert('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    const confirmed = window.confirm(`${email} 주소로 인증 메일을 보내시겠습니까?`);
    if (confirmed) {
      alert('인증 메일이 발송되었습니다!');
    }
  };

  return (
    <div className="auth-wrapper">
      <h2>비밀번호 찾기</h2>
      <p>이메일 주소를 입력하시면 초기화 링크를 보내드립니다.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="이메일 주소"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">전송</button>
      </form>
    </div>
  );
}

export default FindPassword;