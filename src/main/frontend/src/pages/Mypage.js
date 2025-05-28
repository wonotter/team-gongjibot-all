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
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      alert('로그인 후 이용해주세요.');
      navigate('/login');
    } else {
      fetchChatHistory(token);
    }
  }, [navigate]);

  const fetchChatHistory = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/history', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('응답 실패');

      const data = await response.json();
      setChatHistory(data.history || []);
    } catch (err) {
      console.error('❌ 채팅 내역 불러오기 실패:', err);
    }
  };

  const filteredHistory = chatHistory.filter((chat) =>
    chat.question.toLowerCase().includes(search.toLowerCase())
  );

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
          <h2 style={{ marginBottom: '20px' }}>마이페이지 - 채팅 내역</h2>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="채팅 내용 검색"
            className="question-input"
            style={{ marginBottom: '20px' }}
          />

          <div className="chat-history">
            {filteredHistory.length === 0 ? (
              <p>채팅 내역이 없습니다.</p>
            ) : (
              filteredHistory.map((chat, idx) => (
                <div key={idx} className="chat-bubble-container">
                  <div className="chat-bubble question">
                    Q. {chat.question}
                  </div>
                  <div className="chat-bubble answer">
                    A. {chat.answer}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mypage;
