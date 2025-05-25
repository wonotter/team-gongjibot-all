import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Sidebar from './components/Sidebar';
import FindPassword from './pages/FindPassword';
import './App.css';

function Home() {
  return (
    <div className="home-container">
      <div className="message-box">무엇을 알려드릴까요??</div>
    </div>
  );
}

function Layout() {
  const location = useLocation();
  const hideSidebar = location.pathname === '/signup'; // 회원가입 경로에서는 사이드바 숨김

  return (
    <>
      {!hideSidebar && <Sidebar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/find-password" element={<FindPassword />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
