import '../../index.css'
// import { useState } from 'react'

export default function SidebarMenuOptions({ icon, changeTab, tabName }) {
    return (
        <div
            className="sidebar-option"
            onClick={() => {
                changeTab(tabName)
            }}
        >
            <img src={icon} alt="" className="sidebar-icons" />
        </div>
    )
}