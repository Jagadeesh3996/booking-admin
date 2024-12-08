
import React, { useEffect } from "react";
import { useSelector } from 'react-redux';
import NavBar from "../../componenets/navbar/NavBar";
import FinishedList from "../../componenets/schedule/FinishedList";

const Finished = () =>{
    const navActive = useSelector((state) => state.navActive.value);
    useEffect(() => {
        const bodypd = document.getElementById('cbody');
        (navActive) ?  bodypd.classList.add('body-pd') : bodypd.classList.remove('body-pd');
    }, [navActive]);

    return(<>
        <NavBar />
        <div id="cbody" className="cbody">
            <div className="concard">
                <FinishedList />
            </div>
        </div>
    </>);
};

export default Finished;