
import React, { useEffect } from "react";
import { useSelector } from 'react-redux';
import NavBar from "../componenets/navbar/NavBar";
import { ToastContainer, toast } from 'react-toastify';

const Home = () =>{
    const navActive = useSelector((state) => state.navActive.value);
    useEffect(() => {
        const bodypd = document.getElementById('cbody');
        (navActive) ?  bodypd.classList.add('body-pd') : bodypd.classList.remove('body-pd');
    }, [navActive]);

    useEffect(() => {
        const loginSuccess = localStorage.getItem('loginSuccess');
        if (loginSuccess) {
            toast.success(loginSuccess, { position: 'top-right', autoClose: 3000,  });
            localStorage.removeItem('loginSuccess');
        }
      }, []);
  
    return(<>
        <NavBar />
        <ToastContainer />
        <div id="cbody" className="cbody">
            <div className="concard">
                <h1 className="p-4">Welcome to Slot Booking Admin Panel</h1>
            </div>
        </div>
    </>);
};

export default Home;
