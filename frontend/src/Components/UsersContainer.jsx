import React from 'react'
import '../index.css'
import '../Pages/AddChat/NewChatModel.css'

const UsersContainer = ({ id, profilePhoto, userName, number, onclick, selectedUserIds }) => {
    return (
        <div id="profile-div" onClick={onclick} className={`user-item ${selectedUserIds.includes(id) ? 'selected' : ''}`}>
            <div className="profile-div-info">
                <img src={profilePhoto} alt="" className="profile-image" />
                <div className="profile-chat-info">
                    <div className="profile-name">{userName}</div>
                    <div className="profile-last-chat">{number}</div>
                </div>
            </div>
        </div>
    )
}

export default UsersContainer