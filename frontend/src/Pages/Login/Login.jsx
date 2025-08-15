import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import './Login.css'

const Login = ({ phoneNumber, setPhoneNumber }) => {
    const navigate = useNavigate();

    const sendOtp = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/send-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ phone: `+91${phoneNumber}` })
            });

            const data = await response.json();
            console.log(data);
            if (data.success) {
                alert("OTP sent successfully!");
                navigate("/otp");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error sending OTP", error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-title-container">
                <h2 className="login-title">Enter Phone Number</h2>
            </div>
            <div className="input-container">
                <input
                    type="text"
                    className="login-input"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <button className="login-button" onClick={sendOtp}>Send OTP</button>
            </div>
        </div>
    );
};

export default Login;