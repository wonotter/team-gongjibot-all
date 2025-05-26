import React from 'react';
import { useNavigate } from 'react-router-dom';
import { removeTokens } from '../utils/auth';

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 토큰 제거
    removeTokens();
    
    // 홈 페이지로 이동 (로그인 여부에 따라 랜딩 페이지 또는 대시보드 표시)
    navigate('/');
  };

  return (
    <button 
      className="logout-button" 
      onClick={handleLogout}
    >
      로그아웃
    </button>
  );
}

export default Logout; 