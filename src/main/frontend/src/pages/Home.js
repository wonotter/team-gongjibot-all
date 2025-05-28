import React,{ useState, useEffect, useRef } from "react";
import './Auth.css';
import Sidebar from '../components/Sidebar';

function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chat, setChat] = useState([]);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, answer]);

  const mockAnswer = (q) => {
    if (q.includes('날씨')) return '오늘은 맑고 따뜻한 날씨입니다.';
    if (q.includes('시간')) return '지금은 오후 3시 24분입니다.';
    return '좋은 질문이에요! 하지만 저는 아직 그에 대한 정보를 학습하지 못했어요.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    if (!started) setStarted(true);

    setChat((prev) => [...prev, { type: 'question', text: question }]);
    const fullAnswer = mockAnswer(question);
    setQuestion('');
    setAnswer('');
    setLoading(true);

    let i = 0;
    const interval = setInterval(() => {
      if (i < fullAnswer.length) {
        setAnswer((prev) => prev + fullAnswer[i]);
        i++;
      } else {
        clearInterval(interval);
        setLoading(false);
        setChat((prev) => [...prev, { type: 'answer', text: fullAnswer }]);
        setAnswer(''); // ✅ 애니메이션 상태 초기화
      }
    }, 50);
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
          {!started ? (
            <div className="home-container">
              <div
                className="message-box"
                onClick={() => setStarted(true)}
              >
                <p>무엇을 알려드릴까요??</p>
              </div>
            </div>
          ) : (
            <div className="chat-container">
              <div className="chat-history">
                {chat.map((item, index) => (
                  <div
                    key={index}
                    className={`chat-bubble ${item.type === 'question' ? 'question' : 'answer'}`}
                  >
                    {item.text}
                  </div>
                ))}
                {answer && loading && (
                  <div className="chat-bubble answer pulse">{answer}</div>
                )}
                {loading && !answer && (
                  <div className="loading-text">답변 생성 중...</div>
                )}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSubmit} className="chat-form">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="질문을 입력하세요"
                  className="question-input"
                  autoFocus
                />
                <button
                  type="submit"
                  className="question-button"
                >
                  질문
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
