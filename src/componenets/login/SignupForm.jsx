
import React, { useState, useEffect } from "react";
import "./Style.css";
import Logo from '../../assets/images/logo/logo1.svg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { userSignup } from '../../services/api/api';
import { Navigate } from 'react-router-dom';
import { Password } from 'primereact/password';

const SignupForm = () => {

  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "SignUp Page";
    document.querySelector('meta[name="description"]').setAttribute('content', "User Signup Page'");

    return () => {
        document.title = "Booking | Admin Panel";  // Reset the title when the component unmounts
        document.querySelector('meta[name="description"]').setAttribute('content', "Slot Booking Admin Panel'");
    };  
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(validate()){
      setLoading(true);
      try {
        const response = await userSignup(formValues);
        if (response.status) {
            localStorage.setItem('userCreated', response.message);
            window.location.href = '/login';
        } else {
          toast.error(`Login Failed ${response.message}`, {
            position: "top-right",  // Use position as a string
          });
        }
      } catch (error) {
        toast.error(`Login Failed ${error.message}`, {
          position: "top-right",  // Use position as a string
        });
      } finally {
        setLoading(false); // Set loading to false after the API call finishes
      };
    }
  }
  
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
        setErrors({ ...errors, [name]: '' }); // Clear error on input change
        if (name === 'password'){
            if (value.length < 8) {
                setErrors({ ...errors, [name]: 'Need Strong Password'});
            } else {
                setErrors({ ...errors, [name]: '' });
            }
        }
        if (name === 'confirmpassword'){
            if (formValues.password !== value) {
                setErrors({ ...errors, [name]: 'Password do not match'});
            } else {
                setErrors({ ...errors, [name]: '' });
            }
        }
    };

  const validate = () => {
    const newErrors = {};
    // Name validation
    if (!formValues.name) {
        newErrors.name = 'Name is required';
    } 
    // Email validation
    if (!formValues.email) {
        newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
        newErrors.email = 'Email Invalid';
    }
    // Password validation
    if (!formValues.password) {
        newErrors.password = 'Password is required';
    } else if ((formValues.password).length < 8) {
        newErrors.password = 'Need Strong Password';
    }
    // Confirm Password validation
    if (!formValues.confirmpassword) {
        newErrors.confirmpassword = 'Confirm Password is required';
    } else if (formValues.password !== formValues.confirmpassword) {
        newErrors.confirmpassword = 'Password do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  if (localStorage.getItem('sessionId')){
    return <Navigate to="/" replace />;
  }

  return (<>

    <div>
      <ToastContainer />
      <div className="container-fluid flex login-container">
        <div className="card my-5 login-wrapper blur-10">
          <form className="card-body p-lg-5 bg-glass" onSubmit={handleSubmit}>
            <div className="text-center">
              <img src={Logo} className="img-fluid profile-image-pic img-thumbnail rounded-circle mb-5" alt="profile" />
            </div>
            <div className="mb-3">
              <input
                name="name"
                type="text"
                className={errors.name ? "form-control border border-danger" : "form-control" } 
                id="name"
                placeholder="Name *"
                value={formValues.name}
                onChange={handleChange}
              />
              {errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}
            </div>
            <div className="mb-3">
              <input
                name="email"
                type="email"
                className={errors.email ? "form-control border border-danger" : "form-control" } 
                id="email"
                placeholder="Email *"
                value={formValues.email}
                onChange={handleChange}
              />
              {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
            </div>

            <Password 
              name="password"
              className={`form-password ${errors.password ? "border border-danger" : ""}`}
              id="password"
              placeholder="Password *"
              feedback = {true}
              value={formValues.password}
              onChange={handleChange}
              toggleMask 
            />
            {errors.password && <span style={{ color: 'red' }}>{errors.password}</span>}

            <Password 
              name="confirmpassword"
              className={`mt-3 form-password ${errors.confirmpassword ? "border border-danger" : ""}`}
              id="confirmpassword"
              placeholder="Confirm Password *"
              feedback = {false}
              value={formValues.confirmpassword}
              onChange={handleChange}
              toggleMask 
            />
            {errors.confirmpassword && <span style={{ color: 'red' }}>{errors.confirmpassword}</span>}

            <div className="mt-3 text-center">
              <button type="submit" className="btn btn-color px-5 mb-3 w-100" disabled={loading}><b>{loading ? 'Loading...' : 'SignUp'}</b></button>
            </div>

            <div className="form-text text-center text-light">
                Already have an account ?
              <a href="/login" className="text-light fw-bold"> Login</a>
            </div>

          </form>
        </div>
      </div>    
    </div>
  </>);
};

export default SignupForm;