import {FC, Fragment, useRef} from 'react';
// -------- custom hook -------- //
import useSticky from 'hooks/useSticky';
import {useAuth} from "auth/useAuth";
// -------- custom component -------- //
import NextLink from 'components/reuseable/links/NextLink';
import SocialLinks from 'components/reuseable/links/SocialLinks';
import ListItemLink from 'components/reuseable/links/ListItemLink';
import DropdownToggleLink from 'components/reuseable/links/DropdownToggleLink';
import RegisterLink from 'components/reuseable/links/RegisterLink';
// -------- partial header component -------- //
import Info from './partials/Info';
import Signin from './partials/Signin';
import Signup from './partials/Signup';
// -------- data -------- //
import {contactInfo} from 'data/contact';
import styles from './navbar.module.css'
import {useRouter} from "next/router";

interface NavbarProps {
    barSitsOnTop?: boolean;
}

const NavbarICPS: FC<NavbarProps> = ({barSitsOnTop}) => {
    const sticky = useSticky(350);
    const navbarRef = useRef<HTMLElement | null>(null);
    const {isLoggedIn, currentUser} = useAuth();
    const router = useRouter();

    // dynamically render the logo
    const logo = 'ICPSLogo';
    // dynamically added navbar classname
    const fixedClassName = 'navbar navbar-expand-lg center-nav transparent navbar-light navbar-clone fixed';
    const navOtherClass = 'navbar-other w-100 d-flex ms-auto'
    const navClassName = `navbar navbar-expand-lg center-nav transparent navbar-light ${barSitsOnTop ? styles.navbarCloneNobg : ""}`

    // all main header contents
    const headerContent = (
        <Fragment>
            <div className="navbar-brand w-100">
                <NextLink href="/" title={<img alt="logo" src={`/img/logos/${logo}.png`}
                                               srcSet={`/img/logos/${logo}@2x.png 2x`}/>}/>
            </div>

            <div id="offcanvas-nav" data-bs-scroll="true"
                 className="navbar-collapse offcanvas offcanvas-nav offcanvas-start">
                <div className="offcanvas-header d-lg-none">
                    <NextLink href="/"
                              title={<img className="mb-4 ms-n1" src="/img/logos/ICPSLogo-White.png" width={120}
                                          alt=""/>}/>
                    <button type="button" aria-label="Close" data-bs-dismiss="offcanvas"
                            className="btn-close btn-close-white"/>
                </div>

                <div className="offcanvas-body ms-lg-auto d-flex flex-column h-100">
                    <ul className="navbar-nav">
                        <ListItemLink title={<i className="uil uil-home" />} href='/'/>

                        <li className="nav-item dropdown">
                            <DropdownToggleLink title="Awards" className="nav-link dropdown-toggle"/>

                            <ul className="dropdown-menu">
                                <ListItemLink href="/awards" title="About" linkClassName="dropdown-item"/>
                                <ListItemLink href="/awards/schedule" title="Schedule" linkClassName="dropdown-item"/>
                                {/*<ListItemLink href="/awards/location" title="Location" linkClassName="dropdown-item"/>*/}
                                <ListItemLink href="/awards/categories" title="Categories" linkClassName="dropdown-item"/>
                                <ListItemLink href="/awards/sponsors" title="Sponsors" linkClassName="dropdown-item"/>
                                <ListItemLink href="/awards/judges" title="Judges" linkClassName="dropdown-item"/>
                                {/*<ListItemLink href="/awards/whatsapp" title="WhatsApp Group" linkClassName="dropdown-item" />*/}
                                {/*<ListItemLink href="/awards/visa" title="Visa Requirements" linkClassName="dropdown-item" />*/}
                                 <ListItemLink href="/awards/submit" title="Submit Nomination" linkClassName="dropdown-item" />
                                <li className="dropdown dropdown-submenu dropend">
                                    <DropdownToggleLink title="2025"/>
                                    <ul className="dropdown-menu">
                                        <ListItemLink href="/awards/2025/winners" title="Winners"
                                                      linkClassName="dropdown-item"/>
                                        <ListItemLink href="/awards/2025" title="About"
                                                      linkClassName="dropdown-item"/>

                                        <ListItemLink href="/awards/2025/schedule" title="Schedule"
                                                      linkClassName="dropdown-item"/>
                                    </ul>
                                </li>
                                <li className="dropdown dropdown-submenu dropend">
                                    <DropdownToggleLink title="2024"/>
                                    <ul className="dropdown-menu">
                                        <ListItemLink href="/awards/2024/winners" title="Winners"
                                                      linkClassName="dropdown-item"/>
                                        <ListItemLink href="/awards/2024" title="About"
                                                      linkClassName="dropdown-item"/>
                                        <ListItemLink href="/awards/2024/judges" title="Judges"
                                                      linkClassName="dropdown-item"/>
                                        <ListItemLink href="/awards/2024/location" title='Location'
                                                      linkClassName="dropdown-item"/>
                                        <ListItemLink href="/awards/2024/schedule" title="Schedule"
                                                      linkClassName="dropdown-item"/>
                                    </ul>
                                </li>
                                <li className="dropdown dropdown-submenu dropend">
                                    <DropdownToggleLink title="2023"/>
                                    <ul className="dropdown-menu">
                                        <ListItemLink href="/awards/2023/winners" title="Winners"
                                                      linkClassName="dropdown-item"/>
                                        <ListItemLink href="/awards/2023/about" title="About"
                                                      linkClassName="dropdown-item"/>
                                        <ListItemLink href="/awards/2023/judges" title="Judges"
                                                      linkClassName="dropdown-item"/>
                                        <ListItemLink href="/awards/2023/location" title='Location'
                                                      linkClassName="dropdown-item"/>
                                        <ListItemLink href="/awards/2023/schedule" title="Schedule"
                                                      linkClassName="dropdown-item"/>
                                        <ListItemLink href="/awards/2023/events" title="Events"
                                                      linkClassName="dropdown-item"/>
                                        <ListItemLink href="/awards/2023/sponsors" title='Sponsors'
                                                      linkClassName="dropdown-item"/>
                                    </ul>
                                </li>
                            </ul>
                        </li>

                        <ListItemLink title="Events" href='/events'/>

                        <ListItemLink title="Articles" href='/articles'/>

                        <ListItemLink title="Gallery" href='/gallery'/>

                        <ListItemLink title="Contact" href='/contact'/>

                        {isLoggedIn && currentUser?.user_metadata?.role === 'admin' && (
                            <ListItemLink title="Admin" href="/admin/dashboard"/>
                        )}
                    </ul>

                    {/* ============= show contact info in the small device sidebar ============= */}
                    <div className="offcanvas-footer d-lg-none">
                        <div>
                            <div className="my-6 d-flex flex-row">
                                {/* ============= Join button ============= */}
                                {!isLoggedIn &&
                                    <RegisterLink title="Register" className="btn btn-sm btn-primary rounded me-4"/>
                                }
                                {/* ============= Sign in/out button ============= */}
                                {
                                    isLoggedIn ?
                                        <NextLink
                                            title="Account"
                                            className="btn btn-sm primary my-custom-btn"
                                            href='/account'/> :
                                        <button
                                            className="btn btn-sm btn-outline-secondary my-custom-btn"
                                            data-bs-toggle="modal"
                                            data-bs-target="#modal-signin">
                                            Sign In
                                        </button>
                                }
                            </div>


                            <NextLink title={contactInfo.email} className="link-inverse"
                                      href={contactInfo.emailPrompt}/>
                            <br/>
                            <NextLink href={contactInfo.phonePrompt} title={contactInfo.phone}/>
                            <br/>
                            <SocialLinks/>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============= right side header content ============= */}
            <div className={navOtherClass}>
                <ul className="navbar-nav flex-row align-items-center ms-auto">
                    {/* ============= info button ============= */}
                    <li className="nav-item">
                        <a className="nav-link mx-6 mx-md-0" data-bs-toggle="offcanvas"
                           data-bs-target="#offcanvas-info">
                            <i className="uil uil-info-circle"/>
                        </a>
                    </li>

                    {/* ============= Join button ============= */}
                    {!isLoggedIn &&
                        <li className="nav-item d-none d-sm-block">
                            <RegisterLink title="Register" className="btn btn-sm btn-primary rounded"/>
                        </li>}

                    {/* ============= Sign in/out button ============= */}
                    <li className="nav-item d-none d-sm-block">
                        {
                            isLoggedIn ?

                                <NextLink
                                    title="Account"
                                    className="btn btn-sm btn-outline-primary my-custom-btn"
                                    href='/account'/> :
                                <button
                                    className="btn btn-sm btn-outline-secondary my-custom-btn"
                                    data-bs-toggle="modal"
                                    data-bs-target="#modal-signin">
                                    Sign In
                                </button>
                        }
                    </li>


                    {/* ============= humburger button for small device ============= */}
                    <li className="nav-item d-lg-none">
                        <button data-bs-toggle="offcanvas" data-bs-target="#offcanvas-nav"
                                className="hamburger offcanvas-nav-btn">
                            <span/>
                        </button>
                    </li>
                </ul>
            </div>
        </Fragment>
    );

    return (
        <Fragment>

            <nav ref={navbarRef} className={sticky ? fixedClassName : navClassName}>
                <div className="container flex-lg-row flex-nowrap align-items-center">{headerContent}</div>
            </nav>

            {/* ============= signin modal ============= */}
            <Signin/>

            {/* ============= signup modal ============= */}
            <Signup/>

            {/* ============= info sidebar ============= */}
            <Info/>
        </Fragment>
    );
};

export default NavbarICPS;
