import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import '../App.css';
import './Auth.css';

function Mypage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // 로그인 체크 제거
    // 더미 데이터 삽입
    setChatHistory([
      { question: '오늘 날씨 어때?', answer: '맑고 따뜻합니다.' },
      { question: '시간이 어떻게 되지?', answer: '오후 2시입니다.' },
      { question: '서울 날씨 알려줘', answer: '구름 조금 있는 맑은 날씨입니다.' }
    ]);
  }, []);

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
