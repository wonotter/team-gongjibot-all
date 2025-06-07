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
  const [chat, setChat] = useState(() => {
    // 로컬 스토리지에서 채팅 내용 불러오기
    const savedChat = localStorage.getItem('chatHistory');
    return savedChat ? JSON.parse(savedChat) : [];
  });
  const [started, setStarted] = useState(() => {
    // 로컬 스토리지에서 채팅 시작 상태 불러오기
    return localStorage.getItem('chatStarted') === 'true';
  });
  const [loading, setLoading] = useState(false); // 서버 응답 기다리는 중
  const [typing, setTyping] = useState(false);   // 답변 타이핑 중
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const chatEndRef = useRef(null);
  const intervalRef = useRef(null);  // interval 참조를 저장할 ref
  const location = useLocation();
  const navigate = useNavigate();
  const prevIsLoggedInRef = useRef(isLoggedIn); // 이전 로그인 상태를 저장하기 위한 ref

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

  // 로그인 상태가 변경될 때 채팅 데이터 관리
  useEffect(() => {
    // 로그인 상태가 변경되었고, 현재 로그인 상태인 경우
    if (prevIsLoggedInRef.current !== isLoggedIn && isLoggedIn) {
      // 새로운 사용자가 로그인한 경우, 이전 채팅 내역과 상태를 재확인
      const savedChat = localStorage.getItem('chatHistory');
      const savedStarted = localStorage.getItem('chatStarted') === 'true';
      
      // 로컬 스토리지 데이터 로드
      setChat(savedChat ? JSON.parse(savedChat) : []);
      setStarted(savedStarted);
    }
    
    // 현재 로그인 상태를 ref에 저장
    prevIsLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);

  // chat 상태가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chat));
  }, [chat]);

  // started 상태가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('chatStarted', started.toString());
  }, [started]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, answer, typing, loading]);  // 채팅, 응답, 타이핑, 로딩 상태 변경 시 스크롤

  // 질문을 서버에 전송하고 JSON 응답 받는 함수
  const sendQuestionToBackend = async (q) => {
    try {
      // 로컬 스토리지에서 토큰 가져오기
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해 주세요.');
      }

      const response = await fetch('http://wonokim.iptime.org:4000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}` // 인증 토큰 추가
        },
        body: JSON.stringify({ question: q }),
        credentials: 'include' // 쿠키 포함
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해 주세요.');
        } else {
          throw new Error(`서버 오류: ${response.status}`);
        }
      }

      const data = await response.json();

      if (!data || !data.answer) {
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }

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

    // 먼저 질문을 채팅 기록에 추가
    setChat((prev) => [...prev, { type: 'question', text: question }]);
    
    // 질문 입력 초기화 및 로딩 상태 설정
    const currentQuestion = question;
    setQuestion('');
    setAnswer('');
    setLoading(true); // 서버 응답 대기 시작
    setTyping(false);
    
    try {
      // 서버에 질문 전송 및 응답 대기
      const fullAnswer = await sendQuestionToBackend(currentQuestion);
      
      // 서버 응답 받음, 로딩 종료 및 타이핑 시작
      setLoading(false);
      setTyping(true);
      
      // 응답 한 글자씩 표시
      let i = 0;
      intervalRef.current = setInterval(() => {
        if (i < fullAnswer.length) {
          setAnswer((prev) => prev + fullAnswer[i]);
          i++;
        } else {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setTyping(false);
          setChat((prev) => [...prev, { type: 'answer', text: fullAnswer }]);
          setAnswer('');
        }
      }, 50);
    } catch (error) {
      // 오류 발생 시 처리
      console.error("답변 생성 중 오류 발생:", error);
      setLoading(false);
      setTyping(false);
      setChat((prev) => [...prev, { type: 'answer', text: "답변을 가져오는 중 오류가 발생했습니다." }]);
    }
  };

  // 답변 출력 중단 핸들러
  const handleStopResponse = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setTyping(false);
      
      // 현재까지 생성된 답변을 채팅 기록에 추가 (중단됨 문구 제거)
      if (answer) {
        setChat((prev) => [...prev, { type: 'answer', text: answer }]);
        setAnswer('');
      }
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  // 새 채팅 시작 함수
  const handleNewChat = () => {
    // 채팅 내역 초기화
    setChat([]);
    // 채팅 시작 상태를 true로 설정 (중요: 이 부분이 화면 전환에 필요)
    setStarted(true);
    // 기타 상태 초기화
    setQuestion('');
    setAnswer('');
    setLoading(false);
    setTyping(false);
    
    // 로컬 스토리지에서도 채팅 내역 초기화 및 started 상태 업데이트
    localStorage.removeItem('chatHistory');
    localStorage.setItem('chatStarted', 'true');
    
    // 진행 중인 타이핑이 있다면 중단
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 추가: 콘솔에 로그 출력
    console.log('채팅이 초기화되었습니다.');
  };

  return (
    <div className="main-wrapper">
      <Sidebar open={sidebarOpen} onNewChat={handleNewChat} />
      <button
        className="menu-button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <div className="content-container">
        <div className="content-inner">
          {!isLoggedIn ? (
            // 로그인하지 않은 상태
            <div className="home-container">
              <div
                className="message-box"
                onClick={handleLoginRedirect}
              >
                <p>로그인 후 서비스 이용이 가능합니다</p>
              </div>
            </div>
          ) : !started ? (
            // 로그인 상태이지만 채팅이 시작되지 않은 상태
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
              <div className="chat-messages-wrapper">
                <div className="chat-history">
                  {chat.map((item, index) => (
                    <div
                      key={index}
                      className={`chat-bubble ${item.type === 'question' ? 'question' : 'answer'}`}
                    >
                      {item.text}
                    </div>
                  ))}
                  {typing && (
                    <div className="chat-bubble answer pulse">
                      {answer}
                    </div>
                  )}
                  {loading && !typing && (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <div className="loading-text">응답을 기다리는 중...</div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>
              <div className="chat-input-container">
                <form onSubmit={handleSubmit} className="chat-form">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="질문을 입력하세요"
                    className="question-input"
                    autoFocus
                  />
                  {typing ? (
                    <button 
                      type="button" 
                      className="stop-button"
                      onClick={handleStopResponse}
                    >
                      중단
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="question-button"
                      disabled={loading}
                    >
                      질문
                    </button>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
