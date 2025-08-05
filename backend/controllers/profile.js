const User = require("../models/User");

exports.saveProfile = async (req, res) => {
    const { number, name, base64Image } = req.body;

    if (!number || !name || !base64Image) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    try {
        let user = await User.findOne({ number });
        if (user) {
            user.username = name;
            user.profileImage = base64Image;
        } else {
            user = new User({
                number: number,
                username: name,
                profileImage: base64Image,
            });
        }

        await user.save();
        res.json({ message: "Profile saved successfully", user });
    } catch (error) {
        console.error("Error saving profile:", error);
        res.status(500).json({ message: "Failed to save profile" });
    }
};