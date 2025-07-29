import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getAccessToken } from '../utils/auth';
import { createApiUrl, API_ENDPOINTS } from '../utils/api';
import '../App.css';
import './Auth.css';

// 마크다운 텍스트를 HTML로 변환하는 함수
const convertMarkdownToHTML = (text, searchTerm = '') => {
  if (!text) return '';
  
  // 텍스트 줄별로 분리
  const lines = text.split('\n');
  let html = '';
  let inList = false;
  
  // 각 줄 처리
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // 검색어 하이라이트 적용 함수
    const applyHighlight = (content) => {
      if (!searchTerm || !searchTerm.trim()) return content;
      
      return content.replace(
        new RegExp(`(${searchTerm})`, 'gi'),
        '<mark style="background-color: #fff3cd; padding: 0 2px;">$1</mark>'
      );
    };
    
    // 볼드체 처리 전에 검색어 하이라이트 적용
    if (searchTerm) {
      line = applyHighlight(line);
    }
    
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

function Mypage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('all'); // 'all', 'question', 'answer'
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보 상태 추가
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      alert('로그인 후 이용해주세요.');
      navigate('/login');
    } else {
      fetchChatHistory(token);
      fetchUserInfo(token); // 사용자 정보 가져오기
    }
  }, [navigate]);

  // 새 채팅 시작 함수
  const handleNewChat = () => {
    // 로컬 스토리지에서 채팅 내역 초기화
    localStorage.removeItem('chatHistory');
    localStorage.setItem('chatStarted', 'true');
    
    // 홈으로 이동
    navigate('/');
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('chatStarted');
    navigate('/login');
  };

  // 사용자 정보를 가져오는 함수
  const fetchUserInfo = async (token) => {
    try {
      const response = await fetch(createApiUrl(API_ENDPOINTS.PROFILE), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해 주세요.');
        } else {
          throw new Error(`서버 오류: ${response.status}`);
        }
      }

      const data = await response.json();
      setUserInfo(data);
    } catch (err) {
      console.error('❌ 사용자 정보 불러오기 실패:', err);
      setError(err.message || '사용자 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const fetchChatHistory = async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(createApiUrl(API_ENDPOINTS.CHAT_HISTORY), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해 주세요.');
        } else {
          throw new Error(`서버 오류: ${response.status}`);
        }
      }

      const data = await response.json();
      
      // 날짜 기준으로 정렬 (최신순)
      const sortedHistory = (data.history || []).sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      
      setChatHistory(sortedHistory);
    } catch (err) {
      console.error('❌ 채팅 내역 불러오기 실패:', err);
      setError(err.message || '채팅 내역을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = chatHistory.filter((chat) => {
    if (!search.trim()) return true;
    
    const lowerCaseSearch = search.toLowerCase();
    
    if (searchType === 'question') {
      return chat.question.toLowerCase().includes(lowerCaseSearch);
    } else if (searchType === 'answer') {
      return chat.answer.toLowerCase().includes(lowerCaseSearch);
    } else {
      // 질문과 답변 모두에서 검색
      return chat.question.toLowerCase().includes(lowerCaseSearch) || 
             chat.answer.toLowerCase().includes(lowerCaseSearch);
    }
  });

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 검색 결과에서 검색어 하이라이트 처리 (HTML 문자열 버전)
  const highlightTextInHTML = (html, searchTerm) => {
    if (!searchTerm.trim()) return html;
    
    // 1. 볼드체 등 HTML 태그 내부의 텍스트도 하이라이트하기 위해 처리
    // 먼저 태그와 텍스트를 분리
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // 모든 텍스트 노드를 찾아서 하이라이트 처리
    const walkAndHighlight = (node) => {
      if (node.nodeType === 3) { // 텍스트 노드인 경우
        const text = node.textContent;
        if (text.trim() !== '') {
          const regex = new RegExp(`(${searchTerm})`, 'gi');
          if (regex.test(text)) {
            const wrapper = document.createElement('span');
            const parts = text.split(regex);
            
            wrapper.innerHTML = parts.map(part => 
              part.toLowerCase() === searchTerm.toLowerCase()
                ? `<mark style="background-color: #fff3cd; padding: 0 2px;">${part}</mark>`
                : part
            ).join('');
            
            // 원래 텍스트 노드를 래퍼로 교체
            node.parentNode.replaceChild(wrapper, node);
          }
        }
      } else if (node.nodeType === 1) { // 요소 노드인 경우
        Array.from(node.childNodes).forEach(walkAndHighlight);
      }
    };
    
    Array.from(tempDiv.childNodes).forEach(walkAndHighlight);
    return tempDiv.innerHTML;
  };

  // 일반 텍스트 하이라이트 처리
  const highlightText = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() 
        ? <mark key={index} style={{ backgroundColor: '#fff3cd', padding: '0 2px' }}>{part}</mark> 
        : part
    );
  };

  // 프로필 이미지 URL 결정
  const getProfileImageUrl = () => {
    if (!userInfo) return '/default-profile.png';
    return userInfo.imageUrl || '/default-profile.png';
  };

  // 사용자 정보 렌더링 컴포넌트
  const UserProfileSection = () => {
    if (!userInfo) return <div className="loading-message">사용자 정보를 불러오는 중입니다...</div>;

    // 소셜 로그인 여부 확인
    const isSocialLogin = userInfo.socialType !== null;
    
    // 날짜 포맷팅 - 유효한 날짜인지 확인
    const formatCreateDate = (dateString) => {
      if (!dateString) return '정보 없음';
      
      try {
        return formatDate(dateString);
      } catch (error) {
        console.error('날짜 형식 오류:', error);
        return '정보 없음';
      }
    };

    return (
      <div className="user-profile-section">
        <h3>사용자 정보</h3>
        <div className="user-profile-card">
          <div className="user-profile-image">
            <img src={getProfileImageUrl()} alt="프로필" />
          </div>
          <div className="user-profile-details">
            <p><strong>닉네임:</strong> {userInfo.nickname || '미설정'}</p>
            
            {/* 소셜 로그인이 아닌 경우에만 이메일 표시 */}
            {!isSocialLogin && (
              <p><strong>이메일:</strong> {userInfo.email || '미설정'}</p>
            )}
            
            <p><strong>가입 유형:</strong> {
              isSocialLogin 
                ? `소셜 계정 (${userInfo.socialType})` 
                : '일반 계정'
            }</p>
            <p><strong>가입일:</strong> {formatCreateDate(userInfo.createDate)}</p>
          </div>
        </div>
      </div>
    );
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
      <div className="site-title-container">
        <span className="site-title">KIT Chat BOT</span>
      </div>
      <div className="top-bar">
        <div className="profile-wrapper">
          <div className="profile-icon" onClick={handleProfileClick}>
            <img src={getProfileImageUrl()} alt="프로필" className="profile-img" />
          </div>
          {showProfileMenu && (
            <div className="profile-menu">
              <button onClick={() => navigate('/')}>
                <i className="fas fa-home"></i> 홈으로
              </button>
              <button onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> 로그아웃
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="content-container">
        <div className="content-inner">
          <h2 style={{ marginBottom: '20px' }}>마이페이지</h2>
          
          {/* 사용자 정보 섹션 */}
          <UserProfileSection />
          
          {/* 채팅 내역 섹션 */}
          <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>채팅 내역</h3>

          <div className="search-container">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="채팅 내용 검색"
              className="question-input"
            />
            <div className="search-options">
              <label>
                <input 
                  type="radio" 
                  name="searchType" 
                  value="all" 
                  checked={searchType === 'all'} 
                  onChange={() => setSearchType('all')} 
                />
                전체
              </label>
              <label>
                <input 
                  type="radio" 
                  name="searchType" 
                  value="question" 
                  checked={searchType === 'question'} 
                  onChange={() => setSearchType('question')} 
                />
                질문만
              </label>
              <label>
                <input 
                  type="radio" 
                  name="searchType" 
                  value="answer" 
                  checked={searchType === 'answer'} 
                  onChange={() => setSearchType('answer')} 
                />
                답변만
              </label>
            </div>
          </div>

          {loading ? (
            <div className="loading-message">채팅 내역을 불러오는 중입니다...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredHistory.length === 0 ? (
            <div className="empty-history">
              <p>채팅 내역이 없습니다.</p>
              {search && <p>검색어 "{search}"에 대한 결과가 없습니다.</p>}
              <button 
                onClick={() => navigate('/')} 
                className="start-chat-button"
              >
                채팅 시작하기
              </button>
            </div>
          ) : (
            <div className="chat-history-list">
              {filteredHistory.map((chat, idx) => (
                <div key={idx} className="chat-history-item">
                  <div className="chat-timestamp">{formatDate(chat.timestamp)}</div>
                  <div className="chat-bubble question">
                    <strong>Q</strong> {
                      // 검색어가 있고, 검색 유형이 '전체' 또는 '질문만'인 경우에만 하이라이트 적용
                      search && (searchType === 'all' || searchType === 'question')
                        ? highlightText(chat.question, search) 
                        : chat.question
                    }
                  </div>
                  <div className="chat-bubble answer">
                    <strong>A</strong> 
                    <div 
                      className="markdown-content"
                      dangerouslySetInnerHTML={{ 
                        __html: convertMarkdownToHTML(
                          chat.answer,
                          search && (searchType === 'all' || searchType === 'answer') ? search : ''
                        ) 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Mypage;

