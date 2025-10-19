import { useState } from "react";
import "../styles/community.css";

function Community() {
  return (
    <div>
      <div className='publicHeader'>
        <button>FitAI</button>
        <button>운동</button>
        <button>자세교정</button>
        <button>커뮤니티</button>
        <button>내 기록</button>
        <button>사용자 닉네임 (임시)</button>
        <button>사용자 닉네임 (임시)</button>
        
      </div>
      <div className="mainContent">
        FitAI 커뮤니티
        <h2>커뮤니티</h2>
        <p>여기는 커뮤니티 페이지입니다.</p>
      </div>
    </div>
  );
}

export default Community;
