import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './Pages/Login/Login';
import OTPVerification from './Pages/OTP/OTPVerification';
import ProfileSetup from './Pages/Profile/ProfileSetup';
import MainView from './Components/MainView';

const isExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token || isExpired(token)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/otp" element={<OTPVerification />} />
        <Route path="/profile" element={<ProfileSetup />} />
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <MainView />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
