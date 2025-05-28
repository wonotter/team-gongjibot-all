import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { setTokens, isAuthenticated } from '../utils/auth';
import '../App.css';
import './Auth.css';

function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chat, setChat] = useState([]);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const chatEndRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // URL 파라미터에서 토큰 추출
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    // 토큰이 URL에 있으면 저장하고 URL 파라미터 정리
    if (accessToken) {
      const tokens = {};
      tokens.accessToken = accessToken;
      if (refreshToken) tokens.refreshToken = refreshToken;
      
      // 토큰 저장
      setTokens(accessToken, refreshToken || '');
      
      // URL 파라미터 제거 (히스토리 상태 유지)
      navigate('/', { replace: true });
      
      // 로그인 상태 업데이트
      setIsLoggedIn(true);
    } else {
      // 토큰이 URL에 없으면 로컬 스토리지 확인
      setIsLoggedIn(isAuthenticated());
    }
  }, [location, navigate]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, answer]);

  // 질문을 서버에 전송하고 JSON 응답 받는 함수
  const sendQuestionToBackend = async (q) => {
    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: q }),
      });

      const data = await response.json();
      return data.answer;
    } catch (error) {
      console.error('❌ 서버 통신 오류:', error);
      return '서버와 연결할 수 없습니다.';
    }
  };

  // 질문 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    if (!started) setStarted(true);

    setChat((prev) => [...prev, { type: 'question', text: question }]);
    const fullAnswer = await sendQuestionToBackend(question);

    setQuestion('');
    setAnswer('');
    setLoading(true);

    let i = 0;
    const interval = setInterval(() => {
      if (i < fullAnswer.length) {
        setAnswer((prev) => prev + fullAnswer[i]);
        i++;
      } else {
        clearInterval(interval);
        setLoading(false);
        setChat((prev) => [...prev, { type: 'answer', text: fullAnswer }]);
        setAnswer('');
      }
    }, 50);
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
        <div className="content-inner">
          {!started ? (
            <div className="home-container">
              <div
                className="message-box"
                onClick={() => setStarted(true)}
              >
                <p>무엇을 알려드릴까요??</p>
              </div>
            </div>
          ) : (
            <div className="chat-container">
              <div className="chat-history">
                {chat.map((item, index) => (
                  <div
                    key={index}
                    className={`chat-bubble ${item.type === 'question' ? 'question' : 'answer'}`}
                  >
                    {item.text}
                  </div>
                ))}
                {answer && loading && (
                  <div className="chat-bubble answer pulse">{answer}</div>
                )}
                {loading && !answer && (
                  <div className="loading-text">답변 생성 중...</div>
                )}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSubmit} className="chat-form">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="질문을 입력하세요"
                  className="question-input"
                  autoFocus
                />
                <button
                  type="submit"
                  className="question-button"
                >
                  질문
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
