import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Community from "./pages/Community";
import CommunityUserReview from "./components/CommunityUserPost";
function App() {
    return (_jsxs(Router, { children: [_jsx(Header, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/community", element: _jsx(Community, {}) }), _jsx(Route, { path: "/community/:postId", element: _jsx(CommunityUserReview, {}) })] }), _jsx(Footer, {})] }));
}
export default App;
