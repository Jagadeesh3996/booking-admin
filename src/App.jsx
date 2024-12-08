
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';
// import loadable from '@loadable/component';
// import Loader from './componenets/loader/Loader';
import ProductedRoute from './componenets/ProductedRoute';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { getUser } from './services/api/api';
import { setUserDetails } from "./redux/slice/user";

import Login from "./pages/Login"
import Error from './pages/Error';
import Home from './pages/Home';
import Events from './pages/Events';
import ShowRooms from './pages/measuring-team/ShowRooms';
import Teams from './pages/measuring-team/Teams';
import Upcoming from './pages/schedule/Upcoming';
import Finished from './pages/schedule/Finished';
import 'react-toastify/dist/ReactToastify.css';

// const Home = loadable(() => import('./pages/Home'), { fallback: <Loader/> });

function App() {

  const dispatch = useDispatch();
  const key = "my-project-key";
  const users = useSelector((state) => state.user);    
  const [loading, setLoading] = useState(true);
  const sessionId = localStorage.getItem('sessionId'); 
  const [isLoggedIn,setIsLoggedIn] = useState(sessionId ? true : false);
  let inactivityTimeout;

  // inactive logout
  const inactiveUser = () => {
    localStorage.clear();
    localStorage.setItem('logoutSuccess', 'Session Expired!');
    window.location.href = '/login';
  };

  // timer for user active
  const activeUser = () => {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => {
      inactiveUser();
    }, 50 * 60 * 1000);   // 5 minutes
  };

  // check user acivity
  useEffect(() => {   
    if (users.loggedin === 'yes') {
      activeUser();
      const activityEvents = ['mousemove', 'keypress', 'click', 'keydown', 'keyup', 'scroll', 'touchstart', 'touchend', 'contextmenu'];
      activityEvents.forEach(event => {
          window.addEventListener(event, activeUser);
      });
      return () => {
        activityEvents.forEach(event => {
            window.removeEventListener(event, activeUser);
        });
        clearTimeout(inactivityTimeout);
      };
    }
  });

  // get user data
  useEffect(()=>{
    if(sessionId){
      const bytes = AES.decrypt(sessionId, key);
      const token = bytes.toString(Utf8);
      getUser(token)
        .then(response=>{
          if (response.status){
            const userdetails = {
              UserID: response?.data?.user.id,
              UserName: response?.data?.user.username,
              UserRole: response?.data?.user.role,
              UserEmail: response?.data?.user.email,
              UserTeamId: response?.data?.user.team_id
            }
            const isLogin = 'yes';
            dispatch(setUserDetails({ userdetails, isLogin }));
            const new_token = AES.encrypt(response.new_token, key).toString();
            localStorage.setItem('sessionId', new_token);  
          } else {
            localStorage.clear();
            localStorage.setItem('logoutSuccess', 'Session Expired!');
            window.location.href = '/login';
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  },[]);

  // check user logged in
  useEffect(() => {
    if (!loading) {
      if (users.loggedin === 'yes' && users.userDetails.UserID !== "" && users.userDetails.UserName !== "" && users.userDetails.UserRole !== "") {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    }
  }, [loading, users]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Error />} />

        {/* <Route path="/" element={<Home />} />
        <Route path="/showrooms" element={<ShowRooms />} />
        <Route path="/events" element={<Events />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/upcoming" element={<Upcoming />} />
        <Route path="/finished" element={<Finished />} /> */}

        <Route path="/" element={<ProductedRoute isLoggedIn={isLoggedIn}><Home /></ProductedRoute>} />
        <Route path="/showrooms" element={<ProductedRoute isLoggedIn={isLoggedIn}><ShowRooms /></ProductedRoute>} />
        <Route path="/events" element={<ProductedRoute isLoggedIn={isLoggedIn}><Events /></ProductedRoute>} />
        <Route path="/teams" element={<ProductedRoute isLoggedIn={isLoggedIn}><Teams /></ProductedRoute>} />
        <Route path="/upcoming" element={<ProductedRoute isLoggedIn={isLoggedIn}><Upcoming /></ProductedRoute>} />
        <Route path="/finished" element={<ProductedRoute isLoggedIn={isLoggedIn}><Finished /></ProductedRoute>} />

      </Routes>
    </Router>

  );
}

export default App;

