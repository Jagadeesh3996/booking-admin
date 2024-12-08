
import React, { useEffect, useState } from 'react';
import logo1 from '../../assets/images/logo/logo1.svg';
import logo2 from '../../assets/images/logo/logo2.svg';
import lightMode from '../../assets/images/light-mode.svg';
import './NavBar.css';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toggle, show, hide } from '../../redux/slice/navactive';
import { active } from '../../redux/slice/activelink';
import { dptoggle, dpshow } from '../../redux/slice/dropdown';
import { Tooltip } from 'react-tooltip';
import { setUserDetails } from "../../redux/slice/user";
import { activeTheme } from '../../redux/slice/theme';
import Swal from 'sweetalert2';

const NavBar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const lastSegment = location.pathname.split('/').filter(Boolean).pop() || 'dashboard';
    const navActive = useSelector((state) => state.navActive.value);
    const activeLink = useSelector((state) => state.activeLink.value);
    const dropdown = useSelector((state) => state.dropdown.value);
    const user = useSelector((state) => state.user);
    const userRole = user.userDetails.UserRole; 
    const section1 = ['showrooms', 'teams'];
    const section2 = ['upcoming', 'finished'];
    const theme = useSelector((state) => state.theme.value);

    // theme toggle
    const toggleTheme = () => {
        const currentTheme = document.body.getAttribute('data-theme');
        if  (currentTheme === 'light') {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            dispatch(activeTheme('dark'));
        } else {
            document.body.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            dispatch(activeTheme('light'));
        }
    };
        
    // display navbar in responsive
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            dispatch(activeTheme(savedTheme));
        }

        (window.innerWidth < 768) ?  dispatch(hide()) : dispatch(show());

        const handleResize = () => (window.innerWidth < 768) ?  dispatch(hide()) : dispatch(show());

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // display navbar toggle
    useEffect(() => {
        const headerpd = document.getElementById('header');
        if (navActive) {
            headerpd.classList.add('header-pd');
            dispatch(dpshow(section1.includes(activeLink) ? 'section1' : section2.includes(activeLink) ? 'section2' : null));
        } else { 
            headerpd.classList.remove('header-pd');
            dispatch(dpshow(null));
        }
    }, [navActive]);

    // url active tab
    useEffect(() => {
        dispatch(active(lastSegment));
    }, [lastSegment]);

    // logout function
    const logoutMethod = () => {
        Swal.fire({
            title: 'Are you sure you want to logout?',
            text: 'You will need to log in again to access your account.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#28a745',
            confirmButtonText: 'Yes, log me out!',
            cancelButtonText: 'Cancel',
            customClass: {
                title: 'swal2-title-custom',
                htmlContainer: 'swal2-text-custom',
                confirmButton: 'swal2-confirm-button-custom',
                cancelButton: 'swal2-cancel-button-custom' 
            }
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(setUserDetails({ loggedin : 'no', userDetails : {} }));
                localStorage.clear();
                localStorage.setItem('logoutSuccess', 'logout successful!');
                navigate('/login');
            }
        });
    };
    
    return (
        <div>
            <header className={`header ${navActive ? 'header-pd' : ''}`} id="header">
                <div 
                    className="header-toggle" 
                    onClick={() => dispatch(toggle())}
                >
                { navActive ?
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 512 512"
                        className='svg-toggle'
                    >
                        <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                    </svg>
                    :
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 448 512"
                        className='svg-toggle'
                    >
                        <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/>
                    </svg>
                }
                </div>
                <div className="flex" >
                    { theme==='light' ?
                        <svg
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 384 512"
                        className='svg-theme'
                        data-tooltip-id="tooltip1"
                        data-tooltip-content="Dark Mode"
                        data-tooltip-offset={15}
                        onClick={toggleTheme}
                        >
                        <path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/>
                        </svg>
                        :
                        <img 
                        className="svg-theme" 
                        src={lightMode} 
                        alt="lightMode"
                        data-tooltip-id="tooltip2"
                        data-tooltip-content="Light Mode"
                        data-tooltip-offset={15}
                        onClick={toggleTheme}
                        />
                    }
                    <Tooltip id="tooltip1" className="tooltip" />
                    <Tooltip id="tooltip2" className="tooltip" />
                    <div className='header-user'>
                        <div className='user-info text-end'>
                            <h6 className='m-0'>{user?.userDetails?.UserName}</h6>
                            <p className='m-0'>{user?.userDetails?.UserRole}</p>
                        </div>
                        <div 
                            className='user-icon'
                            data-tooltip-id="userIcon"
                            data-tooltip-html={`
                                <h6 class='m-0'><b>${user?.userDetails?.UserName || 'Unknown User'}</b></h6>
                                <p class='m-0'>${user?.userDetails?.UserRole || 'Unknown Role'}</p>
                              `}
                            data-tooltip-place = "bottom"
                            data-tooltip-offset={15}
                        >
                            <h2><b>{user?.userDetails?.UserName[0]}</b></h2>
                        </div>
                        <Tooltip id="userIcon" place="bottom" className="tooltip d-sm-none" />
                    </div>
                </div>
            </header>

            <div className={`side-navbar ${navActive ? 'shownav' : ''}`} >
                <nav className="nav">
                    <div className="w-100">

                        <div className="logo-div">
                            { theme==='dark' ?
                                <img className="logo-img" src={logo1} alt="logo" />
                                :
                                <img className="logo-img" src={logo2} alt="logo" />
                            }
                            {navActive && <span className="logo-name">Livin Interiors</span>}
                        </div>

                        <div className="menu-list">
                            <Link 
                                className={`nav-link ${activeLink === 'dashboard' ? 'active' : ''}`}
                                onClick={() => {
                                    dispatch(active('dashboard'));
                                    dispatch(dpshow(null));
                                }}
                                to="/"
                                data-tooltip-id="tooltip3"
                                data-tooltip-content="Dashboard"
                                data-tooltip-offset={15}
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 576 512"
                                    className='nav-svg' 
                                >
                                    <path d="M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 .7 160.2c0 2.7-.2 5.4-.5 8.1l0 16.2c0 22.1-17.9 40-40 40l-16 0c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1L416 512l-24 0c-22.1 0-40-17.9-40-40l0-24 0-64c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32l0 64 0 24c0 22.1-17.9 40-40 40l-24 0-31.9 0c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2l-16 0c-22.1 0-40-17.9-40-40l0-112c0-.9 0-1.9 .1-2.8l0-69.7-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/>
                                </svg>
                                {navActive && <span className="nav-name">Dashboard</span>}
                            </Link>
                            {!navActive && <Tooltip id="tooltip3" className="tooltip" />}

                            { userRole === "Super Admin" && (
                                <Link 
                                    className={`nav-link ${activeLink === 'events' ? 'active' : ''}`}
                                    onClick={() => {
                                        dispatch(active('events'));
                                        dispatch(dpshow(null));
                                    }}
                                    to="/events"
                                    data-tooltip-id="tooltip4"
                                    data-tooltip-content="Events"
                                    data-tooltip-offset={15}
                                >
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        viewBox="0 0 448 512"
                                        className='nav-svg' 
                                    >
                                        <path d="M160 112c0-35.3 28.7-64 64-64s64 28.7 64 64l0 48-128 0 0-48zm-48 48l-64 0c-26.5 0-48 21.5-48 48L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-208c0-26.5-21.5-48-48-48l-64 0 0-48C336 50.1 285.9 0 224 0S112 50.1 112 112l0 48zm24 48a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm152 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z"/>
                                    </svg>
                                    {navActive && <span className="nav-name">Events</span>}
                                </Link>
                            )}
                            {!navActive && <Tooltip id="tooltip4" className="tooltip" />}

                            { userRole === "Super Admin" && (
                                <li>
                                    <a
                                        className={`nav-link mb-2 ${(section1.includes(activeLink) ? 'ddactive' : '')}`}
                                        role="button"
                                        onClick={() => {
                                            dispatch(show());
                                            dispatch(dptoggle('section1'));
                                        }}
                                        data-tooltip-id="tooltip5"
                                        data-tooltip-content="Measuring Team"
                                        data-tooltip-offset={15}
                                    >
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            viewBox="0 0 576 512"
                                            className='nav-svg'
                                        >
                                            <path d="M248 0L208 0c-26.5 0-48 21.5-48 48l0 112c0 35.3 28.7 64 64 64l128 0c35.3 0 64-28.7 64-64l0-112c0-26.5-21.5-48-48-48L328 0l0 80c0 8.8-7.2 16-16 16l-48 0c-8.8 0-16-7.2-16-16l0-80zM64 256c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l160 0c35.3 0 64-28.7 64-64l0-128c0-35.3-28.7-64-64-64l-40 0 0 80c0 8.8-7.2 16-16 16l-48 0c-8.8 0-16-7.2-16-16l0-80-40 0zM352 512l160 0c35.3 0 64-28.7 64-64l0-128c0-35.3-28.7-64-64-64l-40 0 0 80c0 8.8-7.2 16-16 16l-48 0c-8.8 0-16-7.2-16-16l0-80-40 0c-15 0-28.8 5.1-39.7 13.8c4.9 10.4 7.7 22 7.7 34.2l0 160c0 12.2-2.8 23.8-7.7 34.2C323.2 506.9 337 512 352 512z"/>
                                        </svg>
                                        {navActive && 
                                            <span className="nav-name">
                                                Measuring Team
                                                { dropdown==='section1' ? 
                                                    <span className='arrow'>
                                                        <svg 
                                                            xmlns="http://www.w3.org/2000/svg" 
                                                            viewBox="0 0 320 512"
                                                            className='nav-svg'
                                                        >
                                                            <path d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8l256 0c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"/>
                                                        </svg>
                                                    </span>
                                                    :
                                                    <span className='arrow'>
                                                        <svg 
                                                            xmlns="http://www.w3.org/2000/svg" 
                                                            viewBox="0 0 320 512"
                                                            className='nav-svg'
                                                        >
                                                            <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>
                                                        </svg>
                                                    </span>
                                                }
                                            </span>
                                        }
                                    </a>
                                    {!navActive && <Tooltip id="tooltip5" className="tooltip" />}
                                    <div className={`collapse ${dropdown==='section1' ? 'shownav' : ''}`}>
                                        <ul className="list-unstyled">
                                            <li>
                                                <Link 
                                                    className={`nav-link ${activeLink === 'showrooms' ? 'active' : ''}`}
                                                    onClick={() => {
                                                        dispatch(active('showrooms'));
                                                        dispatch(dpshow('section1'));
                                                    }}
                                                    to="/showrooms"
                                                >
                                                    <span className="nav-name ps-3">Show Rooms</span>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    className={`nav-link ${activeLink === 'teams' ? 'active' : ''}`}
                                                    onClick={() => {
                                                        dispatch(active('teams'));
                                                        dispatch(dpshow('section1'));
                                                    }}
                                                    to="/teams"
                                                >
                                                    <span className="nav-name ps-3">Teams</span>
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </li>
                            )}

                            <li>
                                <a
                                    className={`nav-link mb-2 ${(section2.includes(activeLink) ? 'ddactive' : '')}`}
                                    role="button"
                                    onClick={() => {
                                        dispatch(show());
                                        dispatch(dptoggle('section2'));
                                    }}
                                    data-tooltip-id="tooltip6"
                                    data-tooltip-content="Schedule"
                                    data-tooltip-offset={15}  
                                >
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        viewBox="0 0 384 512"
                                        className='nav-svg'
                                    >
                                        <path d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM80 64l64 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L80 96c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64l64 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-64 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm54.2 253.8c-6.1 20.3-24.8 34.2-46 34.2L80 416c-8.8 0-16-7.2-16-16s7.2-16 16-16l8.2 0c7.1 0 13.3-4.6 15.3-11.4l14.9-49.5c3.4-11.3 13.8-19.1 25.6-19.1s22.2 7.7 25.6 19.1l11.6 38.6c7.4-6.2 16.8-9.7 26.8-9.7c15.9 0 30.4 9 37.5 23.2l4.4 8.8 54.1 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-64 0c-6.1 0-11.6-3.4-14.3-8.8l-8.8-17.7c-1.7-3.4-5.1-5.5-8.8-5.5s-7.2 2.1-8.8 5.5l-8.8 17.7c-2.9 5.9-9.2 9.4-15.7 8.8s-12.1-5.1-13.9-11.3L144 349l-9.8 32.8z"/>
                                    </svg>
                                    {navActive && 
                                        <span className="nav-name">
                                        Schedule
                                        { dropdown==='section2' ? 
                                            <span className='arrow'>
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    viewBox="0 0 320 512"
                                                    className='nav-svg'
                                                >
                                                    <path d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8l256 0c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"/>
                                                </svg>
                                            </span>
                                            :
                                            <span className='arrow'>
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    viewBox="0 0 320 512"
                                                    className='nav-svg'
                                                >
                                                    <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>
                                                </svg>
                                            </span>
                                        }
                                        </span>
                                    }
                                </a>
                                {!navActive && <Tooltip id="tooltip6" className="tooltip" />}
                                <div className={`collapse ${dropdown==='section2' ? 'shownav' : ''}`}>
                                    <ul className="list-unstyled">
                                        <li>
                                            <Link 
                                                className={`nav-link ${activeLink === 'upcoming' ? 'active' : ''}`}
                                                onClick={() => {
                                                    dispatch(active('upcoming'));
                                                    dispatch(dpshow('section2'));
                                                }}
                                                to="/upcoming"
                                            >
                                                <span className="nav-name ps-3">Upcoming</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link 
                                                className={`nav-link ${activeLink === 'finished' ? 'active' : ''}`}
                                                onClick={() => {
                                                    dispatch(active('finished'));
                                                    dispatch(dpshow('section2'));
                                                }}
                                                to="/finished"
                                            >
                                                <span className="nav-name ps-3">Finished</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </li>

                            <Link 
                                className="nav-link"
                                onClick={()=>{logoutMethod()}}
                                data-tooltip-id="tooltip7"
                                data-tooltip-content="SignOut"
                                data-tooltip-offset={15}
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 512 512"
                                    className='nav-svg'
                                >
                                    <g transform="scale(-1, 1) translate(-500, 0)">
                                        <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"/>
                                    </g>
                                </svg>
                                {navActive && <span className="nav-name">Sign Out</span>}
                            </Link>
                            {!navActive && <Tooltip id="tooltip7" className="tooltip" />}
                        </div>

                        <div className="footer-user">
                            <div className='user-icon'>
                                <h2
                                    data-tooltip-id="tooltip8"
                                    data-tooltip-content={user?.userDetails?.UserName}
                                    data-tooltip-offset={20}
                                >
                                    <b>{user?.userDetails?.UserName[0]}</b>
                                </h2>
                            </div>
                            {navActive && 
                                <div className='user-info text-start ms-3'>
                                    <h6 className='m-0'>{user?.userDetails?.UserName}</h6>
                                    <p className='m-0'>{user?.userDetails?.UserRole}</p>
                                </div>
                            }
                            {!navActive && <Tooltip id="tooltip8" className="tooltip" />}
                        </div>

                    </div>
                </nav>
            </div>
        </div>
    );
};

export default NavBar;
