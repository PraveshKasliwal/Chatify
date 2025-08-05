import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import './Login.css'

const Login = ({ setNumber }) => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const navigate = useNavigate();

    const sendOtp = async () => {
        try {
            localStorage.clear();
            const response = await axios.post("http://localhost:5000/auth/send-otp", { number: phoneNumber });
            alert(response.data.message);
            setNumber(phoneNumber);
            navigate("/otp", { state: { otp: response.data.otp } });
        } catch (error) {
            console.log(error);
            alert("Error sending OTP. Try again.");
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