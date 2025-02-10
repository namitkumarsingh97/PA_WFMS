import "./styles.css";
import Navbar from "./components/Navbar.js";
import BottomNav from "./components/BottomNav.js";
import Home from "./pages/Home.js";
import Attendence from "./components/SubComponent/Attendence/Attendence.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <div>
      <Router>
        <Navbar />
        <BottomNav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/attendence" element={<Attendence />} />
        </Routes>
      </Router>
    </div>
  );
}
