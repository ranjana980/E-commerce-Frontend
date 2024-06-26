import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthBanner } from "./auth-banner";
import './styles.scss'
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOtpAction } from "../entities/auth-reducer";
import swal from "sweetalert";

export const Auth = () => {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const login = searchParams.get('login');
  const signup = searchParams.get('signup')
  const verify_otp = searchParams.get('verify_otp')
  const [email, setEmail] = useState('')
  const [otp, setOTP] = useState(Array(6).fill(''));
  const [emailError, setEmailError] = useState('')
  const dispatch = useDispatch()
  const authData = useSelector(state => state.auth);
  const { data } = authData
  const navigate = useNavigate()

  const handleChangeOtp = (index, event) => {
    const newOTP = [...otp];
    newOTP[index] = event.target.value;
    setOTP(newOTP);
    if (event.target.nextSibling) {
      event.target.nextSibling.focus();
    }
    if (event.target.previousSibling) {
      event.target.previousSibling.focus();
    }
  };

  const handleChange = (event) => {
    setEmail(event.target.value)
    setEmailError("")
  };

  const handlePaste = event => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text/plain').trim();
    if (pastedData.length !== 6 || !/^\d+$/.test(pastedData)) {
      return;
    }
    const newOTP = pastedData.split('').slice(0, 6);
    setOTP(newOTP);
  };

  const handleSubmit = (emailValue, type) => {
    if (type !== 'resend') {
      if (emailValue) {
        const emailRegex = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
        if ((emailRegex).test(email)) {
          const onSuccess = () => {
            navigate('/account?verify_otp=true')
          }
          dispatch(sendOtpAction({ emailValue }, onSuccess))
        }
        else setEmailError('Invalid email')
      }
      else {
        setEmailError("Email is Required!")
      }
    }
    else {
      const onSuccess = () => {
        swal({
          title: "Success",
          text: "Resend OTP SuccessFully!",
          icon: "success",
          button: "Okay",
        });
      }
      dispatch(sendOtpAction({ emailValue }, onSuccess))
    }
  }


  return (
    <div className="auth">
      <div className="auth-container">
        <AuthBanner />
        <div className="auth-form">
          {verify_otp && <span>Please enter the OTP sent to {data.email}.</span>}
          {!verify_otp ? <input
            placeholder="Enter email"
            value={email}
            className="form-control"
            onChange={handleChange}
          /> : <div className="auth-form-otp">
            {otp.map((item, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={item}
                onChange={e => handleChangeOtp(index, e)}
                onPaste={handlePaste}
                className="form-control auth-form-otp-input"
              />
            ))}
          </div>}
          {emailError && <span className="error-msg">{emailError}</span>}
          {!verify_otp && <p>By continuing, you agree to Flipkart's <a>Terms of Use</a> and <a>Privacy Policy</a>.</p>}
          <button
            onClick={handleSubmit(email, 'login')}
            className={`${verify_otp ? 'auth-button-otp' : 'auth-button'}`}
          >
            {login ? 'Request OTP' : signup ? 'Continue' : 'Verify Otp'}
          </button>
          {verify_otp ? <span >Not received your code? <b><a onClick={handleSubmit(data.email, 'resend')}>Resend code</a></b></span> : <div className="auth-bottom-section">
            {login ? <h6> New to Here?<Link to='/account?signup=true'> Create an account</Link></h6> : <h6>Existing User?<Link to='/account?login=true'> Login</Link></h6>}
          </div>}
        </div>
      </div>
    </div>
  );
};
