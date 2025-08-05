import "../../index.css"

const RecentUpdates = ({ profilePhoto, userName, statusUpdateTime }) => {
    return (
        <div id="profile-div">
            <div className="status-container">
                <img src={profilePhoto} alt="" className="profile-image status-profile-img" />
                <div className="profile-status-info">
                    <div className="profile-status-name">{userName}</div>
                    <div className="profile-status-time">{statusUpdateTime}</div>
                </div>
            </div>
        </div>
    )
}

export default RecentUpdates