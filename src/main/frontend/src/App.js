import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Mypage from './pages/Mypage';
import FindPassword from './pages/FindPassword';
import { initializeAuth } from './utils/auth';
import './App.css';


function Layout() {
  const location = useLocation();
  const hideSidebar = location.pathname === '/signup' || location.pathname === '/login' || location.pathname === '/password-reset'; // 회원가입, 로그인, 비밀번호 찾기 경로에서는 사이드바 숨김

  return (
    <>
      {!hideSidebar && <Sidebar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/mypage" element={<Mypage />}/>
          <Route path="/password-reset" element={<FindPassword />}/>
        </Routes>
      </main>
    </>
  );
}

function App() {
  // 앱 시작 시 인증 초기화 - JWT 토큰 관리
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
