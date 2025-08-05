import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

import Login from "./Pages/Login/Login";
import OTPVerification from "./Pages/Login/OTPVerification";
import MainView from "./Components/MainView";
import ProfileSetup from "./Pages/Profile/ProfileSetup";
import NewChatModal from "./Pages/AddChat/NewChatModel";

function App() {
  const [number, setNumber] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        return true; // Token expired
      }
      return false;
    } catch (error) {
      return true; // Invalid token
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isTokenExpired(token)) {
      localStorage.clear();
      setIsAuthenticated(false);
      navigate("/"); // Redirect to login
      return;
    }
    setIsAuthenticated(true);
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Login setNumber={setNumber} />} />
        <Route path="/otp" element={<OTPVerification number={number} setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/profile" element={<ProfileSetup number={number} />} />
        <Route path="/main" element={<MainView />} />
      </Routes>

      {showModal && (
        <NewChatModal
          closeModal={() => setShowModal(false)}
          onCreateChat={(chat) => {
            console.log("New chat created:", chat);
          }}
        />
      )}
    </>
  );
}

export default App;