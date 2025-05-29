import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './Auth.css';

function Signup() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    verificationCode: ''
  });
  const [emailStatus, setEmailStatus] = useState(null); // 'success' | 'error'
  const [isCertificating, setIsCertificating] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const updatedForm = { ...form, [e.target.name]: e.target.value };
    setForm(updatedForm);

    if (e.target.name === 'confirmPassword') {
      setPasswordMatch(updatedForm.password === updatedForm.confirmPassword);
    }
  };

  const handleSendVerification = async () => {
    if (!form.email.includes('@')) {
      setEmailStatus('error');
      return;
    }

    try {
      const response = await axios.post('http://wonokim.iptime.org:4000/api/v1/auth/email-certification', {
        email: form.email,
        purpose: 'SIGN_UP',
      });

      if (response.status === 200) {
        setIsCertificating(true);
        setEmailStatus('success');
      }
    } catch (error) {
      console.error('이메일 인증 요청 에러:', error);
      setEmailStatus('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordMatch || !form.verificationCode) return;

    try {
      const response = await axios.post('http://wonokim.iptime.org:4000/api/v1/auth/sign-up', {
        email: form.email,
        password: form.password,
        nickname: form.nickname,
        verificationCode: form.verificationCode
      });

      if (response.status === 200) {
        alert('회원가입 완료!');
        navigate('/login');
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      alert(error.response?.data?.message || '회원가입에 실패했습니다.');
    }
  };

  const isFormValid =
    form.email &&
    form.password &&
    form.confirmPassword &&
    form.nickname &&
    emailStatus === 'success' &&
    passwordMatch &&
    form.verificationCode;

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
        <div className="auth-wrapper animate-fade-in">
          <h2>회원가입</h2>
          <form onSubmit={handleSubmit} className="form-slide">
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                name="email"
                type="email"
                placeholder="이메일"
                value={form.email}
                onChange={handleChange}
                required
                style={{ flex: 6 }}
              />
              <button
                type="button"
                onClick={handleSendVerification}
                style={{ flex: 4, height: '50px' }}
                disabled={isVerified}
              >
                인증코드 발송
              </button>
            </div>

            {emailStatus === 'success' && (
              <p className="helper-text" style={{ color: 'green' }}>
                인증 코드가 정상적으로 발송되었습니다.
              </p>
            )}
            {emailStatus === 'error' && (
              <p className="helper-text" style={{ color: 'red' }}>
                이메일 형식이 올바르지 않거나 발송에 실패했습니다.
              </p>
            )}

            {isCertificating && (
              <input
                name="verificationCode"
                type="text"
                placeholder="인증코드 입력"
                value={form.verificationCode}
                onChange={handleChange}
                required
              />
            )}

            <input
              name="nickname"
              placeholder="닉네임"
              value={form.nickname}
              onChange={handleChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange}
              required
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="비밀번호 확인"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            {!passwordMatch && (
              <p className="helper-text" style={{ color: 'red', fontSize: '0.8rem' }}>
                비밀번호가 일치하지 않습니다.
              </p>
            )}

            <button
              type="submit"
              disabled={!isFormValid}
              style={{
                opacity: isFormValid ? 1 : 0.5,
                cursor: isFormValid ? 'pointer' : 'not-allowed',
              }}
            >
              가입하기
            </button>
          </form>

          {message && <p className="helper-text fade-in-delay">{message}</p>}
          <p className="helper-text fade-in-delay">
            이미 계정이 있으신가요? <a href="/login">로그인</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
