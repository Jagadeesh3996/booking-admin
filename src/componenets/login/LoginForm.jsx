
import React, { useState, useEffect } from "react";
import AES from 'crypto-js/aes';
import "./Style.css";
import Logo from '../../assets/images/logo/logo1.svg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loginCheck, getUser } from '../../services/api/api';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUserDetails } from "../../redux/slice/user";
import { Password } from 'primereact/password';

const LoginForm = () => {

  const users = useSelector((state) => state.user);
  const key = "my-booking-user-key";
  const dispatch = useDispatch();
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const logoutSuccess = localStorage.getItem('logoutSuccess');
  const userCreated = localStorage.getItem('userCreated');

  // Meta datas
  useEffect(() => {
    document.title = "Login Page";
    document.querySelector('meta[name="description"]').setAttribute('content', "User Login Page'");

    return () => {
        document.title = "Booking | Admin Panel";  // Reset the title when the component unmounts
        document.querySelector('meta[name="description"]').setAttribute('content', "Slot Booking Admin Panel'");
    };  
  }, []);

  // logout toast
  useEffect(() => {
    if (logoutSuccess) {
      toast.error(logoutSuccess, { position: 'top-right', autoClose: 3000, });
      setTimeout(() => {
        localStorage.removeItem('logoutSuccess');
      }, 500);
    }
    if (userCreated) {
      toast.success(userCreated, { position: 'top-right', autoClose: 3000, });
      setTimeout(() => {
        localStorage.removeItem('userCreated');
      }, 500);
    }
  }, [logoutSuccess, userCreated]);


  // validations
  const validate = () => {
    const newErrors = {};
    // Email validation
    if (!formValues.email) {
        newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
        newErrors.email = 'Please enter a valid email';
    }
    // Password validation
    if (!formValues.password) {
        newErrors.password = 'Password is required';
    } 
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  // form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(validate()){
      setLoading(true);
      try {
        const response = await loginCheck(formValues.email, formValues.password);        
        if (response.status) {
          const token = AES.encrypt(response.token, key).toString();
          localStorage.setItem('sessionId', token);
          try{
            const userData = await getUser(response.token);
            if (userData.status) {
              let userdetails = {
                UserID: userData?.data?.id,
                UserName: userData?.data?.name,
                UserRole: userData?.data?.role,
                UserEmail: userData?.data?.email,
                UserTeamId: userData?.data?.team_id
              }
              let isLogin = 'yes';
              dispatch(setUserDetails({ userdetails, isLogin }));
              localStorage.setItem('loginSuccess', 'Login successful!');
            } else{
              toast.error(`Login Failed ${userData.message}`, {
                position: "top-right",
              });
            }
          } catch(error) {
            toast.error(`Login Failed ${error.message}`, {
              position: "top-right",
            });
          }
        } else {
          toast.error(`Login Failed ${response.message}`, {
            position: "top-right",
          });
        }
      } catch (error) {
        toast.error(`Login Failed ${error.message}`, {
          position: "top-right",
        });
      } finally {
        setLoading(false);
      };
    }
  }
  
  // data handle
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    setErrors({ ...errors, [name]: '' }); // Clear error on input change
  };

  // check user loggedin
  if ((users.loggedin === 'yes') && (users.userDetails.UserID !== "") && (users.userDetails.UserName !== "") && (users.userDetails.UserRole !== "")) {
    return <Navigate to="/" replace />;
  }

  return (<>
    <div>
      <ToastContainer />
      <div className="container-fluid d-flex justify-content-center align-items-center login-container">
        <div className="card my-5 login-wrapper">
          <form className="card-body cardbody-color p-lg-5 bg-glass" onSubmit={handleSubmit}>

            <div className="text-center">
              <img src={Logo} className="img-fluid profile-image-pic img-thumbnail rounded-circle mb-5"
                width="200px" alt="profile" />
            </div>

            <div className="mb-3">
              <input
                name="email"
                type="text"
                className={errors.email ? "form-control border border-danger" : "form-control" } 
                id="email"
                aria-describedby="emailHelp"
                placeholder="Email *"
                value={formValues.email}
                onChange={handleChange}
              />
               {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
            </div>

            <Password 
              name = "password"
              className={errors.password ? "form-password border border-danger" : "form-password" }
              id="password"
              placeholder="Password *"
              feedback = {false}
              value={formValues.password}
              onChange={handleChange}
              toggleMask 
            />
            {errors.password && <span style={{ color: 'red' }}>{errors.password}</span>}

            <div className="text-center">
              <button type="submit" className="btn btn-color px-5 mt-4 mb-3 w-100" disabled={loading}><b>{loading ? 'Loading...' : 'Login'}</b></button>
            </div>

            <div className="form-text text-center mb-1 text-light">
              <a href="#" className="text-light fw-bold">Forgot Password ?</a>
            </div>

            <div className="form-text text-center text-light">
              Not Registered ?
              <a href="/signup" className="text-light fw-bold"> Create an Account</a>
            </div>

          </form>
        </div>
      </div>    
    </div>
  </>);
};

export default LoginForm;
