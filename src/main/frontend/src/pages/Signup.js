import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCertificating, setIsCertificating] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  // 이메일 인증코드 발송 요청
  const handleSendVerification = async () => {
    if (!email) {
      alert('이메일을 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/v1/auth/email-certification', {
        email: email,
        purpose: "SIGN_UP"
      });

      if (response.status === 200) {
        setIsCertificating(true);
        alert('인증코드가 발송되었습니다. 이메일을 확인해주세요.');
      }
    } catch (error) {
      console.error('이메일 인증 요청 에러:', error);
      alert('이메일 인증 요청에 실패했습니다.');
    }
  };

  // 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!verificationCode) {
      alert('이메일 인증코드를 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/v1/auth/sign-up', {
        email: email,
        password: password,
        nickname: nickname,
        verificationCode: verificationCode
      });

      if (response.status === 200) {
        alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
        navigate('/login');
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      if (error.response && error.response.data) {
        alert(`회원가입 실패: ${error.response.data.message || '알 수 없는 오류가 발생했습니다.'}`);
      } else {
        alert('회원가입에 실패했습니다.');
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="이메일" 
            required 
          />
          <button 
            type="button" 
            onClick={handleSendVerification}
            disabled={isCertificating && isVerified}
          >
            인증코드 발송
          </button>
        </div>
        
        {isCertificating && (
          <input 
            type="text" 
            value={verificationCode} 
            onChange={(e) => setVerificationCode(e.target.value)} 
            placeholder="인증코드 입력" 
            required 
          />
        )}
        
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="비밀번호" 
          required 
        />
        <input 
          type="password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          placeholder="비밀번호 확인" 
          required 
        />
        <input 
          type="text" 
          value={nickname} 
          onChange={(e) => setNickname(e.target.value)} 
          placeholder="닉네임" 
          required 
        />
        
        <button type="submit">회원가입</button>
      </form>
      <div className="helper-text">
        이미 계정이 있으신가요? <a href="/login">로그인</a>
      </div>
    </div>
  );
}

export default Signup;