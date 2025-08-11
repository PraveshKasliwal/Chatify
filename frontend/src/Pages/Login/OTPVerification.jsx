import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

import './Login.css'

const OTPVerification = ({ number, setIsAuthenticated }) => {
    const [enteredOtp, setEnteredOtp] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const otp = location.state?.otp;

    const verifyOtp = async () => {
        if (!number || !enteredOtp) {
            alert("Please enter the OTP.");
            return;
        }
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/verify-otp`, {
                number,
                otp,
                enteredOtp
            });

            alert(response.data.message);
            localStorage.setItem("token", response.data.token);
            setIsAuthenticated(true);
            if (response.data.isNewUser) {
                navigate("/profile");
            } else {
                // console.log(`response: ${JSON.stringify(response.data)}`);
                localStorage.setItem('userId', response.data.user._id);
                navigate("/main");
            }
        } catch (error) {
            console.error("OTP Verification Error:", error);
            alert(error.response?.data?.message || "OTP verification failed. Try again.");
        }
    };

    return (
        <div className="otp-container">
            <div className="login-title-container">
                <h2 className="otp-title">Enter OTP</h2>
            </div>
            <div className="input-container">
                <input
                    type="text"
                    className="otp-input"
                    placeholder="Enter OTP"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                />
                <button className="otp-button" onClick={verifyOtp}>Verify OTP</button>
            </div>
        </div>
    );
};

export default OTPVerification;