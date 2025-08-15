const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const OTP = require("../models/OTP"); // adjust path
const User = require("../models/User");
const Vonage = require('@vonage/server-sdk');

// Initialize Vonage
const vonage = new Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET
});

exports.sentOtp = async (req, res) => {
    const { phone } = req.body;

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in MongoDB
    await OTP.create({ phone, otp: otpCode });
    console.log(`OTP for ${phone}: ${otpCode}`);
    res.json({ message: "OTP sent successfully", success: true });
    // Send OTP via SMS
    // vonage.message.sendSms("VonageAPI", phone, `Your OTP is: ${otpCode}`, (err, responseData) => {
    //     if (err) {
    //         return res.status(500).json({ error: "Failed to send OTP" });
    //     }
    //     res.json({ message: "OTP sent successfully", success: true });
    // });
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
        res.json({ message: "OTP verified successfully", token, isNewUser, user: user });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ error: "Server error" });
    }
};
