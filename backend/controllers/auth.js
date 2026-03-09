const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const OTP = require("../models/OTP"); // adjust path
const User = require("../models/User");
const { Vonage } = require('@vonage/server-sdk');

// Initialize Vonage
const vonage = new Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET
});

exports.sentOtp = async (req, res) => {
    const { phone } = req.body;

    try {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP with full phone (e.g. +919876543210)
        await OTP.create({ phone, otp: otpCode });
        console.log(`OTP for ${phone}: ${otpCode}`);

        // Strip any existing +91 or 91 prefix, then add 91 (no +)
        // Vonage expects format: 919876543210 (no + sign)
        const cleanNumber = phone.replace(/^\+/, ''); // converts +919876543210 → 919876543210
        console.log('Sending OTP to:', cleanNumber);

        const response = await vonage.sms.send({
            to: cleanNumber,
            from: "Chatify",
            text: `Your Chatify OTP is: ${otpCode}. Valid for 5 minutes.`
        });

        console.log('Vonage response:', response);

        // Check if message was accepted
        const messageStatus = response?.messages?.[0]?.status;
        if (messageStatus !== '0') {
            console.error('Vonage error status:', messageStatus);
            return res.status(500).json({ error: "Failed to send OTP via SMS" });
        }

        res.json({ message: "OTP sent successfully", success: true });

    } catch (error) {
        const failedMsg = error?.response?.messages?.[0];
        console.error('Vonage error detail:', {
            status: failedMsg?.status,
            errorText: failedMsg?.['error-text'],
            to: failedMsg?.to,
        });
        res.status(500).json({ error: "Server error" });
    }
};

exports.verifyOtp = async (req, res) => {
    let { phone, otp } = req.body;
    try {
        const record = await OTP.findOne({ phone, otp });
        if (!record) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        await OTP.deleteOne({ _id: record._id });

        phone = phone.replace(/^\+?91/, "");
        const user = await User.findOne({ number: phone });
        const isNewUser = !user;
        const token = jwt.sign({ phone }, process.env.APP_JWT_SECRET, { expiresIn: "7d" });
        res.json({
            message: "OTP verified successfully",
            token,
            isNewUser,
            user: user || null  // null for new users — frontend must handle this
        });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ error: "Server error" });
    }
};
