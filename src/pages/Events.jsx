
import React, { useEffect } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import NavBar from "../componenets/navbar/NavBar";
import Event from "../componenets/event/Event";

const Events = () =>{

    // user check
    const role = useSelector((state) => state.user.userDetails.UserRole);
    const navigate = useNavigate();
    useEffect(()=>{
        if(role && role !== "Super Admin"){
            navigate("/"); 
        }
    },[role]);
    
    const navActive = useSelector((state) => state.navActive.value);
    useEffect(() => {
        const bodypd = document.getElementById('cbody');
        (navActive) ?  bodypd.classList.add('body-pd') : bodypd.classList.remove('body-pd');
    }, [navActive]);

    return(<>
        <NavBar />
        <div id="cbody" className="cbody">
            <div className="concard">
                <Event/>
            </div>
        </div>
    </>);
};

export default Events;
