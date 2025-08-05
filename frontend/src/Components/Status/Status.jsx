import StatusHeader from "./StatusHeader";
import MyStatus from "./MyStatus";
import RecentUpdates from "./RecentUpdates";
import { statusdata } from "../../Data/status";
import "../../index.css"

const Status = () => {
    return (
        <div className="status-tab">
            <StatusHeader />
            <div className="all-status">
                <MyStatus 
                    profilePhoto={statusdata[0].profilePhoto} 
                    userName={"My status"} statusUpdateTime={"No updates"} 
                />
                <div>
                    <p className="recent-updated">Recent updates</p>
                </div>
                {
                    statusdata.map((statusMetaData, index) => {
                        return (
                            <RecentUpdates
                                profilePhoto={statusMetaData.profilePhoto}
                                userName={statusMetaData.userName}
                                statusUpdateTime={statusMetaData.statusUpdateTime}
                                key={index}
                            ></RecentUpdates>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default Status;