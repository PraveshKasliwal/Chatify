import "../../index.css"

const MyStatus = ({ profilePhoto, userName, statusUpdateTime }) => {
    return (
        <div className="profile-div">
            <div id="profile-div">
                <div className="status-container">
                    <img src={profilePhoto} alt="" className="profile-image" />
                    <div className="profile-status-info">
                        <div className="profile-status-name">{userName}</div>
                        <div className="profile-status-time">{statusUpdateTime}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MyStatus