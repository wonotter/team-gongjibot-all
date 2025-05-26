import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, removeTokens } from '../utils/auth';
import './Sidebar.css';

function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();

  const toggleSidebar = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    removeTokens();
    navigate('/');
    setOpen(false);
  };

  return (
    <div>
      <button className="menu-button" onClick={toggleSidebar}>☰</button>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <ul>
          <li><Link to="/" onClick={() => setOpen(false)}>홈</Link></li>
          
          {isLoggedIn ? (
            // 로그인된 경우 표시할 메뉴
            <>
              <li><button className="sidebar-logout" onClick={handleLogout}>로그아웃</button></li>
              <li><Link to="/mypage" onClick={() => setOpen(false)}>마이페이지</Link></li>
            </>
          ) : (
            // 로그인되지 않은 경우 표시할 메뉴
            <>
              <li><Link to="/login" onClick={() => setOpen(false)}>로그인</Link></li>
              <li><Link to="/signup" onClick={() => setOpen(false)}>회원가입</Link></li>
            </>
          )}
        </ul>
      </aside>
    </div>
  );
}

export default Sidebar;
