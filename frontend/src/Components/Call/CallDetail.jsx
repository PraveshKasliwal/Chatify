import "../../index.css"

export default function CallDetail({ profilePhoto, userName, callDirection }) {
    return (
        <div id="profile-div">
            <img src={profilePhoto} alt="" className="profile-image"/>
            <div className="profile-call-info">
                <div className="profile-call-name">{userName}</div>
                <div className="profile-call-direction">{callDirection}</div>
            </div>
        </div>
    )
}