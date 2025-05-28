import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function FindPassword() {
  const [step, setStep] = useState(1); // 1: 이메일 입력, 2: 인증코드 및 새 비밀번호 입력
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [emailStatus, setEmailStatus] = useState(null); // 'success' | 'error'
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 이메일 형식 검증
  const validateEmail = (email) => {
    const re = /^\S+@\S+\.\S+$/;
    return re.test(email);
  };

  // 비밀번호 형식 검증 (8~13자 영문 대소문자, 숫자, 특수문자)
  const validatePassword = (password) => {
    const re = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[#@$!%\?&])[A-Za-z0-9#@$!%\?&]{8,13}$/;
    return re.test(password);
  };

  // 이메일 인증코드 요청 처리
  const handleSendVerification = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/v1/auth/email-certification', {
        email: email,
        purpose: 'RESET_PASSWORD'
      });

      if (response.status === 200) {
        setEmailStatus('success');
        setStep(2);
      }
    } catch (error) {
      console.error('이메일 인증 요청 에러:', error);
      setError(error.response?.data?.message || '인증코드 발송에 실패했습니다.');
      setEmailStatus('error');
    }
  };

  // 비밀번호 재설정 처리
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!code) {
      setError('인증코드를 입력해주세요.');
      return;
    }

    if (!newPassword) {
      setError('새 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMatch(false);
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('비밀번호는 8~13자 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/v1/auth/password-reset', {
        email: email,
        code: code,
        newPassword: newPassword
      });

      if (response.status === 200) {
        alert('비밀번호가 성공적으로 재설정되었습니다. 새 비밀번호로 로그인해주세요.');
        navigate('/login');
      }
    } catch (error) {
      console.error('비밀번호 재설정 에러:', error);
      setError(error.response?.data?.message || '비밀번호 재설정에 실패했습니다.');
    }
  };

  return (
    <div className="auth-wrapper animate-fade-in">
      <h2>비밀번호 찾기</h2>
      
      {step === 1 ? (
        // 1단계: 이메일 입력 및 인증코드 요청
        <>
          <p>이메일 주소를 입력하시면 초기화 링크를 보내드립니다.</p>
          <form onSubmit={handleSendVerification} className="form-slide">
            <input
              type="email"
              placeholder="이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">전송</button>
            
            {error && (
              <p className="helper-text" style={{ color: 'red' }}>
                {error}
              </p>
            )}
          </form>
        </>
      ) : (
        // 2단계: 인증코드 및 새 비밀번호 입력
        <>
          <p>인증코드와 새 비밀번호를 입력해주세요.</p>
          <form onSubmit={handleResetPassword} className="form-slide">
            <input
              type="text"
              placeholder="인증코드"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="새 비밀번호 (8~13자 영문, 숫자, 특수문자 포함)"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordMatch(e.target.value === confirmPassword);
              }}
              required
            />
            <input
              type="password"
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordMatch(e.target.value === newPassword);
              }}
              required
            />
            
            {!passwordMatch && (
              <p className="helper-text" style={{ color: 'red', fontSize: '0.8rem' }}>
                비밀번호가 일치하지 않습니다.
              </p>
            )}
            
            {error && (
              <p className="helper-text" style={{ color: 'red' }}>
                {error}
              </p>
            )}
            
            <button type="submit">비밀번호 재설정</button>
          </form>
        </>
      )}
      
      <p className="helper-text fade-in-delay">
        <a href="/login">로그인 페이지로 돌아가기</a>
      </p>
    </div>
  );
}

export default FindPassword;