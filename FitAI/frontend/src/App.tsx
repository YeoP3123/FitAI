import { useState } from 'react'
import './styles/index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>FitAI 프로젝트</h1>
      <p>피트니스 AI 교정 프로젝트에 오신 것을 환영합니다 🎉</p>
      <button onClick={() => setCount((count) => count + 1)}>
        클릭 횟수: {count}
      </button>
    </div>
  )
}

export default App
