import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>Ragchat에 오신 것을 환영합니다</h1>
        <p className="landing-description">
          Ragchat은 빠르고 간편한 대화형 채팅 서비스입니다.
          지금 바로 가입하고 다양한 기능을 경험해보세요.
        </p>
        
        <div className="landing-buttons">
          <Link to="/signup" className="btn btn-primary">회원가입</Link>
          <Link to="/login" className="btn btn-secondary">로그인</Link>
        </div>
        
        <div className="landing-features">
          <div className="feature-item">
            <h3>안전한 대화</h3>
            <p>최신 보안 기술로 안전하게 대화를 나눌 수 있습니다.</p>
          </div>
          <div className="feature-item">
            <h3>간편한 사용</h3>
            <p>직관적인 인터페이스로 누구나 쉽게 이용할 수 있습니다.</p>
          </div>
          <div className="feature-item">
            <h3>다양한 기능</h3>
            <p>다양한 부가 기능으로 더욱 풍부한 대화를 경험하세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage; 