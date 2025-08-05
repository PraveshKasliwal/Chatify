require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

exports.sentOtp = async (req, res) => {
    const { number } = req.body;
    if (!number) return res.status(400).json({ message: "number and name are required" });

    try {
        const otp = Math.floor(10000 + Math.random() * 90000).toString();
        console.log(`Generated OTP for ${number}: ${otp}`);
        res.json({ message: "OTP sent successfully", otp });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Failed to send OTP", error });
    }
};

exports.verifyOtp = async (req, res) => {
    const { number, otp, enteredOtp } = req.body;

    if (!number || !enteredOtp) {
        return res.status(400).json({ message: "number and OTP are required" });
    }

    if (otp !== enteredOtp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ number });
    const isNewUser = !user;

    const token = jwt.sign({ number }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "OTP verified successfully", token, isNewUser, user: user });
};
