import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { setTokens, isAuthenticated, getAccessToken } from '../utils/auth';
import { createApiUrl, API_ENDPOINTS } from '../utils/api';
import '../App.css';
import './Auth.css';

// 마크다운 텍스트를 HTML로 변환하는 함수
const convertMarkdownToHTML = (text) => {
  if (!text) return '';
  
  // 텍스트 줄별로 분리
  const lines = text.split('\n');
  let html = '';
  let inList = false;
  
  // 각 줄 처리
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // 볼드체 처리 (**텍스트**)
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 링크 처리 ([텍스트](URL))
    line = line.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // 리스트 항목 처리 (- 항목)
    if (line.trim().startsWith('-')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      const itemContent = line.trim().substring(1).trim();
      html += `<li>${itemContent}</li>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      
      // 빈 줄 처리
      if (line.trim() === '') {
        html += '<br/>';
      } else {
        html += `<p>${line}</p>`;
      }
    }
  }
  
  // 리스트가 끝나지 않았으면 닫아주기
  if (inList) {
    html += '</ul>';
  }
  
  return html;
};

function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chat, setChat] = useState(() => {
    const savedChat = localStorage.getItem('chatHistory');
    return savedChat ? JSON.parse(savedChat) : [];
  });
  const [started, setStarted] = useState(() => {
    return localStorage.getItem('chatStarted') === 'true';
  });
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const chatEndRef = useRef(null);
  const intervalRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const prevIsLoggedInRef = useRef(isLoggedIn);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (accessToken) {
      setTokens(accessToken, refreshToken || '');
      navigate('/', { replace: true });
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(isAuthenticated());
    }
  }, [location, navigate]);

  useEffect(() => {
    if (prevIsLoggedInRef.current !== isLoggedIn && isLoggedIn) {
      const savedChat = localStorage.getItem('chatHistory');
      const savedStarted = localStorage.getItem('chatStarted') === 'true';
      setChat(savedChat ? JSON.parse(savedChat) : []);
      setStarted(savedStarted);
      
      fetchUserInfo();
    }
    prevIsLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserInfo();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chat));
  }, [chat]);

  useEffect(() => {
    localStorage.setItem('chatStarted', started.toString());
  }, [started]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, answer, typing, loading]);

  const sendQuestionToBackend = async (q) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('인증 토큰이 없습니다. 다시 로그인해 주세요.');

      const response = await fetch(createApiUrl(API_ENDPOINTS.CHAT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ question: q }),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('인증이 만료되었습니다. 다시 로그인해 주세요.');
        else throw new Error(`서버 오류: ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.answer) throw new Error('서버 응답 형식이 올바르지 않습니다.');
      return data.answer;
    } catch (error) {
      console.error('❌ 서버 통신 오류:', error);
      return '서버와 연결할 수 없습니다.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (!started) setStarted(true);
    setChat((prev) => [...prev, { type: 'question', text: question }]);
    const currentQuestion = question;
    setQuestion('');
    setAnswer('');
    setLoading(true);
    setTyping(false);

    try {
      const fullAnswer = await sendQuestionToBackend(currentQuestion);
      setLoading(false);
      setTyping(true);
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
      console.error("답변 생성 중 오류 발생:", error);
      setLoading(false);
      setTyping(false);
      setChat((prev) => [...prev, { type: 'answer', text: "답변을 가져오는 중 오류가 발생했습니다." }]);
    }
  };

  const handleStopResponse = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setTyping(false);
      if (answer) {
        setChat((prev) => [...prev, { type: 'answer', text: answer }]);
        setAnswer('');
      }
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleNewChat = () => {
    setChat([]);
    setStarted(true);
    setQuestion('');
    setAnswer('');
    setLoading(false);
    setTyping(false);
    localStorage.removeItem('chatHistory');
    localStorage.setItem('chatStarted', 'true');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('chatStarted');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const goToMyPage = () => {
    navigate('/mypage');
  };

  const fetchUserInfo = async () => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const response = await fetch(createApiUrl(API_ENDPOINTS.PROFILE), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('인증이 만료되었습니다.');
        } else {
          throw new Error(`서버 오류: ${response.status}`);
        }
      }

      const data = await response.json();
      setUserInfo(data);
    } catch (err) {
      console.error('❌ 사용자 정보 불러오기 실패:', err);
    }
  };

  const getProfileImageUrl = () => {
    if (!userInfo) return '/default-profile.png';
    return userInfo.imageUrl || '/default-profile.png';
  };

  return (
    <div className="main-wrapper">
      <Sidebar open={sidebarOpen} onNewChat={handleNewChat} />
      <button className="menu-button" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
      <div className="site-title-container">
        <span className="site-title">KIT Chat BOT</span>
      </div>
      <div className="top-bar">
        {isLoggedIn && (
          <div className="profile-wrapper">
            <div className="profile-icon" onClick={handleProfileClick}>
              <img src={getProfileImageUrl()} alt="프로필" className="profile-img" />
            </div>
            {showProfileMenu && (
              <div className="profile-menu">
                <button onClick={goToMyPage}>
                  <i className="fas fa-user"></i> 마이페이지
                </button>
                <button onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> 로그아웃
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="content-container">
        <div className="content-inner">
          {!isLoggedIn ? (
            <div className="home-container">
              <img src="/mascot.png" alt="공지봇" className="bot-illustration" />
              <div className="message-box" onClick={handleLoginRedirect}>
                <p>로그인 후 서비스 이용이 가능합니다</p>
              </div>
            </div>
          ) : !started ? (
            <div className="home-container">
              <img src="/mascot.png" alt="공지봇" className="bot-illustration" />
              <div className="message-box" onClick={() => setStarted(true)}>
                <p>무엇을 알려드릴까요??</p>
              </div>
            </div>
          ) : (
            <div className="chat-container">
              <div className="chat-messages-wrapper">
                <div className="chat-history">
                  {chat.map((item, index) => (
                    <div key={index} className={`chat-bubble ${item.type}`}>
                      {item.type === 'answer' ? (
                        <div 
                          className="markdown-content"
                          dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(item.text) }}
                        />
                      ) : (
                        item.text
                      )}
                    </div>
                  ))}
                  {typing && (
                    <div className="chat-bubble answer pulse">
                      <div 
                        className="markdown-content"
                        dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(answer) }}
                      />
                    </div>
                  )}
                  {loading && !typing && (
                    <div className="loading-text">
                      <div className="loading-spinner"></div>
                      응답을 기다리는 중...
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
                    <button type="button" className="stop-button" onClick={handleStopResponse}>
                      중단
                    </button>
                  ) : (
                    <button type="submit" className="question-button" disabled={loading}>
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
