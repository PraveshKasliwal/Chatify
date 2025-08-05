import { useState } from "react";
import axios from "axios";

import moreOptionsIcon from '../../assets/moreOptionsIcon.png'

const ChatDetail = ({ id, profilePhoto, userName, recentMsg, openProfile, setOpenProfile, userObj }) => {
    const [chatOptions, setChatOptions] = useState(false);
    const userId = localStorage.getItem("userId");
    const handleDeleteChat = async () => {
        try {
            await axios.delete(`http://localhost:5000/chat/delete-chat/${userObj.chatId}/${userId}`);
            setOpenProfile(null);
            setChatOptions(false);
        } catch (err) {
            console.error("Failed to delete chat:", err);
        }
    };

    return (
        <div id="profile-div" className={openProfile && openProfile.chatId === id && 'selected'} onClick={() => {setOpenProfile(userObj)}}>
            <div className="profile-div-info">
                <img src={profilePhoto} alt="" className="profile-image" />
                <div className="profile-chat-info">
                    <div className="profile-name">{userName}</div>
                    <div className="profile-last-chat">{recentMsg}</div>
                </div>
            </div>
            <div className="chat-options" onClick={(e) => { e.stopPropagation(); setChatOptions(!chatOptions); }}>
                <img src={moreOptionsIcon} alt="" />
            </div>
            {
                chatOptions && (
                    <div className="chat-option-list">
                        <div onClick={(e) => { e.stopPropagation(); handleDeleteChat(); }}>
                            Delete
                        </div>
                        {/* <div>Archive chat</div>
                        <div>Archive chat</div>
                        <div>Archive chat</div>
                        <div>Archive chat</div> */}
                    </div>
                )
            }
        </div>
    );
}

export default ChatDetail;