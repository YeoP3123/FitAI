import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Community from "./pages/Community";
import CommunityUserReview from "./components/CommunityUserPost";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/:postId" element={<CommunityUserReview />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
