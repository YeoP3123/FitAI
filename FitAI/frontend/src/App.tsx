import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Community from "./pages/Community";
import CommunityUserReview from "./components/CommunityUserPost";
import MyPage from "./pages/MyPage";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/:postId" element={<CommunityUserReview />} />
        <Route path="/MyPage" element={<MyPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
