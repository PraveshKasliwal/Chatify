import CallHeader from "./CallHeader";
import CallDetail from "./CallDetail";
import { callsdata } from "../../Data/calls";

import "../../index.css"

const Calls = () => {
    return(
        <div className='call-tab'>
            <CallHeader/>
            <div className="all-calls">
            {
                callsdata.map((callMetaData, index) => {
                    return (
                            <CallDetail
                                profilePhoto={callMetaData.profilePhoto} 
                                userName={callMetaData.userName} 
                                callDirection={callMetaData.callDirection} 
                                key={index}
                            ></CallDetail>
                    )
                })
            }
            </div>
        </div>
    )
}

export default Calls;