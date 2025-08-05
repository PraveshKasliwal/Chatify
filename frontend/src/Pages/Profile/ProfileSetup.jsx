import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileSetup = ({ number }) => {
    const [name, setName] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [base64Image, setBase64Image] = useState("");
    const navigate = useNavigate();

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
    
        if (file && file.size > 2 * 1024 * 1024) {
            alert("Please select an image smaller than 2MB");
            return;
        }
    
        const reader = new FileReader();
        reader.onloadend = () => {
            setBase64Image(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const saveProfile = async () => {
        if (!name || !base64Image) {
            alert("Please enter a name and select a profile image.");
            return;
        }
        try {
            const response = await axios.post("http://localhost:5000/user/save-profile", {
                number,
                name,
                base64Image
            });
            console.log(`response: ${JSON.stringify(response.data)}`);
            localStorage.setItem("userId", response.data.user._id);
            alert("Profile saved successfully!");
            navigate("/main");
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile. Try again.");
        }
    };

    return (
        <div className="profile-setup-container">
            <h2>Set Up Your Profile</h2>
            <input
                type="text"
                className="profile-input"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input type="file" className="profile-file" onChange={handleImageUpload} />
            <button className="profile-button" onClick={saveProfile}>Save Profile</button>
        </div>
    );
};

export default ProfileSetup;