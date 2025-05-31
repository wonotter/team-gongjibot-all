import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getAccessToken } from '../utils/auth';
import '../App.css';
import './Auth.css';

function Mypage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('all'); // 'all', 'question', 'answer'
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보 상태 추가
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

  // 사용자 정보를 가져오는 함수
  const fetchUserInfo = async (token) => {
    try {
      const response = await fetch('http://wonokim.iptime.org:4000/api/v1/auth/profile', {
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
      
      const response = await fetch('http://wonokim.iptime.org:4000/api/history', {
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

  // 검색 결과에서 검색어 하이라이트 처리
  const highlightText = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() 
        ? <mark key={index} style={{ backgroundColor: '#fff3cd', padding: '0 2px' }}>{part}</mark> 
        : part
    );
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
          {userInfo.imageUrl && (
            <div className="user-profile-image">
              <img src={userInfo.imageUrl} alt="프로필" />
            </div>
          )}
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
      <Sidebar open={sidebarOpen} />
      <button
        className="menu-button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

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
                    <strong>Q.</strong> {
                      search ? highlightText(chat.question, search) : chat.question
                    }
                  </div>
                  <div className="chat-bubble answer">
                    <strong>A.</strong> {
                      search ? highlightText(chat.answer, search) : chat.answer
                    }
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

