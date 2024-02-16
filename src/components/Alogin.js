import React, { useState} from 'react';
import logo from '../assets/logo.png'
import logo1 from '../assets/logo1.png'
import display from '../assets/img1.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/configure'; 
import { useAuth } from '../context/UserAuthContext';
import styles from './styles/Alogin.module.css';
import { doc, updateDoc } from 'firebase/firestore';

function Alogin() {
    const navigate = useNavigate();
    const { signIn, sendPasswordResetEmail } = useAuth();
    const [resetEmail, setResetEmail] = useState(""); 
    const [resetConfirmation, setResetConfirmation] = useState(""); 
    const [passwordModal, setPasswordModal] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [user, setUser] = useState({
        email: "",
        password: "",
        userType: "applicant" // Set default userType
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, password, userType } = user;

        try {
            // Pass userType to signIn function
            await signIn(email, password, userType);
            const user = auth.currentUser;
            const uid = user.uid;

            const lastSignedInString = new Date().toISOString();
            await updateApplicantInfo(uid, { lastSignedIn: lastSignedInString });

            navigate('/Adashboard'); // Redirect to applicant dashboard after successful login
        } catch (error) {
            setError(error.message);
        }
    };

    const updateApplicantInfo = async (uid, data) => {
      const applicantDocRef = doc(db, 'applicant_infos', uid);
      try {
        await updateDoc(applicantDocRef, data);
      } catch (error) {
        console.error('Error updating applicant info:', error);
      }
    };

    const handleSendResetEmail = async () => {
        try {
          await sendPasswordResetEmail(auth, resetEmail);
          setResetConfirmation("Password reset email sent successfully.");
          // Start countdown
          setCountdown(60); // Set countdown to 60 seconds
          const interval = setInterval(() => {
            setCountdown((prevCount) => prevCount - 1); // Decrement countdown every second
          }, 1000);
          // Clear interval after 60 seconds
          setTimeout(() => {
            clearInterval(interval);
          }, 60000);
        } catch (error) {
          setError(error.message);
        }
      };


      const togglePasswordModal = () => {
        setPasswordModal(!passwordModal);
      }


  return (
    <div>
        <header className={styles.header}>
            <a href='/'> <h2 className={styles.logo}><img src={logo1} className={styles.logo1}/>Statu</h2> </a>
                <nav className={styles.navigation}>
                    <button className={styles.btn}> Applicant </button>
                    <button onClick = {() => navigate ("/Elogin")} className={styles.btn1}> Employer </button>
                             </nav>
        </header>

        <div className={styles.ctn}>

            <div className={styles.ctn1}>
                <img src={logo} className={styles.logoImg}/>
                    <p> Improve your job search process</p>
                <img src = {display} className={styles.bgimg}/>
            </div> 
            
            <div className={styles.ctn2}>
                <div className={styles.lbl}>
                    <h2> Sign in </h2>
                    <p className={styles.p}> Welcome to StatuSync </p>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.box}>
                                <p> Email </p>
                                    <span className={styles.txtIcon}> <FontAwesomeIcon icon = {faUser}/> </span>
                                    <input type ='text' name= 'email' value={user.email} onChange={handleChange}   placeholder='john.doe@gmail.com' required/>
                                <p> Password </p>
                                    <span className={styles.txtIcon2}> <FontAwesomeIcon icon = {faLock}/> </span>
                                    <input type ='password' value={user.password} onChange={handleChange} name='password' required/>
                            </div>
                                <p className={styles.fpas} onClick={togglePasswordModal}> Forgot Password? </p>
                                <p className={styles.p1}> Doesn't have an account? <a href='/Aregi'>  Register </a></p>
                                <p className={styles.error}> {error}</p>
                            <button type='submit' value='login' className={styles.button}> Submit</button>
                        </form>
                </div>
            </div>
        </div>

        {passwordModal && (
            <div className={styles.modal2}>
              <div className={styles.overlay}>
                <div onClick={(e) => e.stopPropagation()} className={styles.modalcontent2}>
                  <FontAwesomeIcon icon={faXmark} className={styles.faicon1} size='m' onClick={togglePasswordModal}/>
                  <h1 className={styles.modal2text}> Reset Password </h1>
                  <input type='text' className={styles.modal2textbox} 
                         placeholder="Enter your email"
                         value={resetEmail}
                         onChange={(e) => setResetEmail(e.target.value)} />
                  <button className={styles.modal2btn} onClick={handleSendResetEmail} required> Send Email </button>
                  {resetConfirmation && <p className={styles.error1}>{resetConfirmation}</p>}
                  {countdown > 0 && <p className={styles.error2}> Resend email in {countdown} seconds</p>}


                </div>
              </div>
            </div>
          )}


    </div>
  )
}

export default Alogin