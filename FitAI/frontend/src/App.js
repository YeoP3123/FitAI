import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Footer from "./components/Footer";
function App() {
    return (_jsxs(Router, { children: [_jsx(Header, {}), _jsx(Routes, { children: _jsx(Route, { path: "/", element: _jsx(Home, {}) }) }), _jsx(Footer, {})] }));
}
export default App;
