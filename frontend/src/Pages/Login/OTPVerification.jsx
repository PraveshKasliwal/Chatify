import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

import './Login.css'

const OTPVerification = ({ phoneNumber, setIsAuthenticated }) => {
    const [enteredOtp, setEnteredOtp] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const otp = location.state?.otp;

    const verifyOtp = async () => {
        if (!enteredOtp) {
            alert("Please enter the OTP.");
            return;
        }
        console.log(`Verifying OTP: ${enteredOtp} for phone: ${phoneNumber}`);
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/verify-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ phone: `+91${phoneNumber}`, otp: enteredOtp })
            });

            const resp = await response.json();
            alert(resp.message);
            localStorage.setItem("token", resp.token);
            setIsAuthenticated(true);
            if (resp.isNewUser) {
                navigate("/profile");
            } else {
                // console.log(`resp: ${JSON.stringify(resp.data)}`);
                localStorage.setItem('userId', resp.user._id);
                navigate("/main");
            }
        } catch (error) {
            console.error("Error verifying OTP", error);
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