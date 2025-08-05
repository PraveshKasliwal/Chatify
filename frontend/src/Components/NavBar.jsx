import SidebarMenuOptions from './commons/SidebarMenuOptions'
import { images } from '../images'
import '../index.css'

const NavBar = ({ tab, changeTab }) => {
    return (
        <div id='sidebar-options-tab'>
            <div className='sidebar-options-tab1'>
                {
                    images.map((image, index) => {
                        return (
                            index < 3 && (
                                <SidebarMenuOptions
                                    icon={image.image}
                                    tabName={image.tabName}
                                    changeTab={changeTab}
                                    key={index}
                                >
                                </SidebarMenuOptions>
                            )
                        )
                    }
                    )
                }
            </div>
            <div className='sidebar-options-tab2'>
                {
                    images.map((image, index) => {
                        return (
                            index > 2 && (
                                <SidebarMenuOptions
                                    icon={image.image}
                                    key={index}
                                >
                                </SidebarMenuOptions>
                            )
                        )
                    }
                    )
                }
            </div>
        </div>
    )
}

export default NavBar