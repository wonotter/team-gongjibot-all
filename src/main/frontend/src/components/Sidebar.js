import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, removeTokens } from '../utils/auth';
import './Sidebar.css';

function Sidebar({ open, onNewChat }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 확인 (마운트와 변경 시)
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, [open]); // open prop이 변경될 때마다 로그인 상태 확인

  const handleLogout = () => {
    // 로그아웃 시 채팅 관련 로컬 스토리지 데이터 삭제
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('chatStarted');
    
    // 인증 토큰 제거
    removeTokens();
    setIsLoggedIn(false);
    navigate('/');
  };

  // 새 채팅 버튼 클릭 핸들러
  const handleNewChatClick = () => {
    // 채팅 초기화 함수 호출
    if (onNewChat) {
      onNewChat();
    } else {
      // onNewChat prop이 전달되지 않았을 경우 기본 동작
      localStorage.removeItem('chatHistory');
      localStorage.setItem('chatStarted', 'true');
      
      // 현재 홈 화면이 아니라면 홈으로 이동
      if (location.pathname !== '/') {
        navigate('/');
      }
    }
  };

  // 현재 경로에 따라 active 클래스 추가
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-title">공지봇</div>
      <ul>
        <li><Link to="/" className={isActive('/')}>홈</Link></li>
        
        {isLoggedIn ? (
          // 로그인된 경우 표시할 메뉴
          <>
            <li><button className="sidebar-logout" onClick={handleLogout}>로그아웃</button></li>
            <li><Link to="/mypage" className={isActive('/mypage')}>마이페이지</Link></li>
            <li><button className="sidebar-new-chat" onClick={handleNewChatClick}>새 채팅</button></li>
          </>
        ) : (
          // 로그인되지 않은 경우 표시할 메뉴
          <>
            <li><Link to="/login" className={isActive('/login')}>로그인</Link></li>
            <li><Link to="/signup" className={isActive('/signup')}>회원가입</Link></li>
          </>
        )}
      </ul>
    </aside>
  );
}

export default Sidebar;
