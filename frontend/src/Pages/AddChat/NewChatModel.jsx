import { useState, useEffect } from 'react';
import axios from 'axios';

import UsersContainer from '../../Components/UsersContainer';
import './NewChatModel.css';
import '../../index.css'

import backArrow from '../../assets/backArrow.png'

const NewChatModal = ({ closeModal }) => {
    const [users, setUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [groupName, setGroupName] = useState("");
    const [groupImage, setGroupImage] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const loggedInUserId = localStorage.getItem("userId");
                const res = await axios.get(`http://localhost:5000/chat/users/all`);
                // Exclude self
                const otherUsers = res.data.filter(user => user._id !== loggedInUserId);
                setUsers(otherUsers);
            } catch (err) {
                console.error("Error fetching users", err);
            }
        };
        fetchUsers();
    }, []);

    const toggleUser = (id) => {
        setSelectedUserIds((prev) =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => reject(err);
        });
    };

    const handleSubmit = async () => {
        if (selectedUserIds.length === 0) return;

        try {
            const creatorId = localStorage.getItem("userId");

            let base64Image = null;
            if (groupImage) {
                base64Image = await fileToBase64(groupImage);
            }

            const payload = {
                creatorId,
                memberIds: selectedUserIds,
                groupName: selectedUserIds.length > 1 ? groupName : null,
                profileImage: base64Image,
            };

            const res = await axios.post("http://localhost:5000/chat/create", payload);
            // onCreateChat(res.data.chat);
            closeModal();
        } catch (err) {
            console.error("Error creating chat:", err);
        }
    };

    return (
        <div className="modal-bg">
            <div className='model-header'>
                <img src={backArrow} alt="" onClick={closeModal} />
                <h2 className='chat-tab-heading'>New chat</h2>
            </div>

            <div>
                <input type="text" placeholder='Search' className='chat-tab-search-chat' />
            </div>

            <div className='model-all-options'>
                <div className="users-list">
                    {users.map(user => (
                        <UsersContainer
                            id={user._id}
                            profilePhoto={user.profileImage}
                            userName={user.username}
                            number={user.number}
                            selectedUserIds={selectedUserIds}
                            onclick={() => toggleUser(user._id)}
                        />
                    ))}
                </div>

                {selectedUserIds.length > 1 && (
                    <>
                        <input
                            type="text"
                            className='chat-tab-search-chat'
                            placeholder="Group Name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setGroupImage(e.target.files[0])}
                        />
                    </>
                )}

                <button className='create-chat-button' onClick={handleSubmit}>
                    Create {selectedUserIds.length > 1 ? "Group" : "Chat"}
                </button>
            </div>
        </div>
    );
};

export default NewChatModal;