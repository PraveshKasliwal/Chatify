import addcallicon from "../../assets/addcallicon.png"
import "../../index.css"

const CallHeader = () => {
    return(
        <div id='call-menu-header'>
            <div className="call-tab-header">
                <h2 className="call-tab-heading">Calls</h2>
                <div>
                    <img src={addcallicon} alt="" className="call-tab-addNewCall-icon"/>
                </div>
            </div>
            <div id='call-tab-search-call'>
                <input type="text" className="call-tab-search-call" placeholder="Search or start a new call"/>
            </div>
        </div>
    )
}

export default CallHeader;