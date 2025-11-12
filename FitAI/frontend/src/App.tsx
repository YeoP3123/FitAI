import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Community from "./pages/Community";
import CommunityUserReview from "./components/CommunityUserPost";
import Exercise from "./pages/Exercise";
import ExerciseDetail from "./pages/ExerciseDetail";
import MyProfile from "./pages/myProfile";
import PostureCorrection from "./pages/PostureCorrection";
import ExerciseResult from './pages/ExerciseResult';
import CreatePost from "./pages/CreatePost";
import MyPage from "./pages/MyPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import EditPost from "./pages/EditPost";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exercise" element={<Exercise />} />
        <Route path="/exercise/:type" element={<ExerciseDetail />} />
        <Route path="/posture-correction/:exerciseId" element={<PostureCorrection />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/:postId" element={<CommunityUserReview />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/MyPage" element={<MyPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/exercise-result" element={<ExerciseResult />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/edit-post/:postId" element={<EditPost />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;