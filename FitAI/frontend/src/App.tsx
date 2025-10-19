import { useState } from 'react'
import './styles/index.css'
import Community from "./components/community";

function App() {
  const [count, setCount] = useState(0)
  const [showCommunity, setCommunityOn] = useState(false); // 커뮤니티 표시 상태 관리

  // 커뮤니티 컴포넌트가 표시되는 경우 해당 컴포넌트를 렌더링
  if (showCommunity) {
    return <Community />;
  }

  return (
    <div>
      <button onClick={() => setCommunityOn(true)}>
        커뮤니티 열기 버튼 (임시){" "}
      </button>{" "}
      <h1>FitAI 프로젝트</h1>
      <p>피트니스 AI 교정 프로젝트에 오신 것을 환영합니다 🎉</p>
      <button onClick={() => setCount((count) => count + 1)}>
        클릭 횟수: {count}
      </button>
    </div>
  )
}

export default App
