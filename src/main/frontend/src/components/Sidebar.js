import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar() {
  const [open, setOpen] = useState(false);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <div>
      <button className="menu-button" onClick={toggleSidebar}>☰</button>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <ul>
          <li><a href="/">홈</a></li>
          <li><a href="/login">로그인</a></li>
          <li><a href="/signup">회원가입</a></li>
        </ul>
      </aside>
    </div>
  );
}

export default Sidebar;
