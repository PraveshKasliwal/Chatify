import { useState } from 'react'
import '../../index.css'

import filtericon from "../../assets/filtericon.png"
import newchaticon from "../../assets/newchaticon.png"

const ChatsHeader = ({ openModel, onSearch }) => {

    return (
        <div id='chat-menu-header'>
            <div className="chat-tab-header">
                <h2 className="chat-tab-heading">Chats</h2>
                <div className='chat-tab-header-option'>
                    <img src={filtericon} alt="" className="chat-tab-filter-icon" />
                    <img
                        src={newchaticon}
                        alt=""
                        className="chat-tab-newchat-icon"
                        placeholder='Search or start a new chat'
                        onClick={openModel}
                    />
                </div>
            </div>
            <div id='chat-tab-search-chat'>
                <input 
                    type="text" 
                    className='chat-tab-search-chat' 
                    placeholder='Search or start a new chat'
                    onChange={(e) => onSearch(e.target.value)}
                    />
            </div>
        </div>
    )
}

export default ChatsHeader