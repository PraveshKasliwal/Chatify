import '../index.css';

import { useState } from 'react';
import axios from "axios";

import Chats from './Chats/Chats';
import NavBar from './NavBar';
import ChatArea from './Chats/ChatArea';
import Calls from './Call/Calls';
import Status from './Status/Status';
import CallArea from './Call/CallArea';
import StatusArea from './Status/StatusArea';
import ChatsSummary from './Chats/ChatsSummary';

import whatsappIcon from '../assets/whatsappIcon.png'

const MainView = () => {
    const [tab, setTab] = useState("Chats");
    const [openProfile, setOpenProfile] = useState(null);
    // console.log(openProfile);
    const [chats, setChats] = useState({});
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [openChatSummary, setOpenChatSummary] = useState(false);

    const handleSummarize = async () => {
        setLoading(true);
        // const reversedMessages = [...selectedMessages].reverse();
        const orderedMessages = [...selectedMessages].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        // console.log("Messages: ", orderedMessages);

        try {
            const response = await axios.post('http://localhost:5000/chat/summarize', {
                messages: orderedMessages,
            });

            setSummary(response.data.response);
        } catch (err) {
            console.error(err);
            setSummary('Error summarizing messages.');
        } finally {
            setLoading(false);
            setOpenChatSummary(true);
            console.log("Summary:", openChatSummary);
        }
    };

    const changeTab = (tabName) => {
        if (tab !== tabName) setTab(tabName);
    };

    return (
        <div className='main-page'>
            <NavBar changeTab={changeTab} tab={tab} />
            {tab === "Chats" && (
                <div className='chat-menu'>
                    <Chats openProfile={openProfile} setOpenProfile={setOpenProfile} />
                    {openProfile ?
                        <ChatArea
                            openProfile={openProfile}
                            setOpenProfile={setOpenProfile}
                            chats={chats}
                            setChats={setChats}
                            handleSummarize={handleSummarize}
                            loading={loading}
                            summary={summary}
                            setSummary={setSummary}
                            selectedMessages={selectedMessages}
                            setSelectedMessages={setSelectedMessages}
                        /> :
                        <div className='chat-display-container'>
                            <img src={whatsappIcon} alt="" />
                            <h3>Whatsapp</h3>
                            <p>Send and receive messages without keeping your phone online.</p>
                        </div>
                    }
                    {
                        openChatSummary &&
                        <ChatsSummary
                            summary={summary}
                            loading={loading}
                            setOpenChatSummary={(val) => {
                                setOpenChatSummary(val);
                                if (!val) {
                                    setSummary('');
                                    setSelectedMessages([]);
                                }
                            }}
                        />
                    }
                </div>
            )}
            {tab === "Call" && (
                <div className='call-menu'>
                    <Calls />
                    <CallArea />
                </div>
            )}
            {tab === "Status" && (
                <div className='status-menu'>
                    <Status />
                    <StatusArea />
                </div>
            )}
        </div>
    );
};

export default MainView;
