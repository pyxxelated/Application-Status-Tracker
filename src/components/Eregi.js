import React, { useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import logo1 from '../assets/logo1.png'
import display2 from '../assets/img-2.png'
import styles from './styles/Eregi.module.css';
import { useAuth } from '../context/UserAuthContext';
import { AuthErrorCodes } from 'firebase/auth';
import { auth, db } from '../config/configure';
import { doc, setDoc } from 'firebase/firestore';

function Eregi() {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [error, setError] = useState("");
    const [termsModal,setTermsModal] = useState(false);
    const termsCheckboxRef = useRef(null);
    const [user, setUser] = useState({
      email: "",
      password: "",
      confirmPassword: "",
      userType: "employer" // Specify userType here
    });
  
    const UserHandler = (e) => {
      const { name, value } = e.target;
      setUser((prev) => ({
        ...prev,
        [name]: value
      }));
    };
    
    const toggleTermsModal = () => {
      setTermsModal(!termsModal);
    }


    const SubmitHandler = async (e) => {
      e.preventDefault();
        const { email, password, confirmPassword, userType } = user;

        if (!termsCheckboxRef.current.checked) {
          setError("Please accept the terms and conditions to proceed.");
          return;
        }

         if (password !== confirmPassword) {
              setError("Passwords do not match");
              return;
          } else if (password.length < 6 || confirmPassword.length < 6) {
              setError("Password must be at least 6 characters");
              return;
          } else {
            try {
              await signUp(email, password, userType); 
                const userCredential = auth.currentUser;
                const uid = userCredential.uid;

                await storeEmployerInfo(uid);
              alert("Welcome! New user created successfully");
              navigate('/Elogin');
          } catch (err) {
              if (err.code === "auth/email-already-in-use") {
                setError("Email already in use. Try another email");
          } else if (err.code === AuthErrorCodes.WEAK_PASSWORD) {
                setError("Password must be at least 6 characters");
          } else {
                setError(err.message);
          }
        }
      }
    };

    const handleAgreeClick = () => {
      const checkbox = document.getElementById('termsCheckbox');
      checkbox.checked = true;
      toggleTermsModal(); 
    };


    const storeEmployerInfo = async (uid) => {
      const companyDocRef = doc(db, 'company_infos', uid);
      try {
        await setDoc(companyDocRef, {
          uid,
          createdAt: new Date().toISOString(), // Also store createdAt here
          // Add other initial fields if needed
        });
      } catch (error) {
        console.error('Error storing company info:', error);
      }
    };

    


  return (
    <div>
        <header className={styles.header}>
            <a href='/'><h2 className={styles.logo}><img src={logo1} className={styles.logo1}/>Statu</h2> </a>
                <nav className={styles.navigation}>
                <button className={styles.btn} onClick = {() => navigate ("/Aregi")} >  Applicant </button>
                <button className={styles.btn1}>  Employer </button>
            </nav>
        </header>

        <div className={styles.ctn}>
            <div className={styles.ctn1}>
                <div className={styles.lbl}>
                    <h2> Get Started </h2>
                        <p className={styles.p}> Already have an account? <a href='/Elogin'> Log in</a> </p>
                            <form onSubmit={SubmitHandler}> 
                                <div className={styles.box}>
                                    <p> Email </p>
                                        <span className={styles.txtIcon}>  <FontAwesomeIcon icon={faUser}/> </span>
                                        <input type="text" id="email" placeholder="john.doe@gmail.com" name="email" value={user.email} onChange={UserHandler} required />
                                    <p> Create a Password </p>
                                        <span className={styles.txtIcon2}>  <FontAwesomeIcon icon={faLock}/> </span> 
                                        <input type="password" name="password"  value={user.password}  onChange={UserHandler} required/>
                                    <p> Confirm Password </p>
                                        <span className={styles.txtIcon3}>  <FontAwesomeIcon icon={faLock}/> </span> 
                                        <input type="password"  name="confirmPassword" value={user.confirmPassword}  onChange={UserHandler} required/>
                                </div>
                                    <div className={styles.box1}>
                                      <p className={styles.p3}><input type="checkbox" ref={termsCheckboxRef} id="termsCheckbox"/> I accept to the <a onClick={toggleTermsModal} className={styles.p3a}> terms and conditions. </a> </p>
                                        <h6 className={styles.err}> {error} </h6>
                                    </div>
                            <button type="submit" className={styles.button}> Submit </button>
                        </form>
                    </div>
                </div>
        
        <div className={styles.ctn2}>
            <img src={logo} className={styles.logoImg}/>
                <h2 className={styles.desc}></h2>
                <p className={styles.p2}> Effortlessly handle a high volume of applications with automated status updates </p>
            <img src={display2} className={styles.displayImg}/>
        </div>
        </div>

      { termsModal && (
        <div className={styles.modal}>
          <div onClick={toggleTermsModal} className={styles.overlay}></div>
            <div className={styles.modalcontent}>
              <h5 className={styles.text}> Terms and Conditions </h5>
                <p className={styles.p4}> By submitting your information through our website,
                        you consent to the sharing and use of your data by the applicants for recruitment purposes, 
                        acknowledging that while we strive to maintain data security, absolute security cannot be guaranteed,
                        and you retain the right to revoke this consent at any time, 
                        understanding that doing so may affect the processing of your job hiring.</p>
                <div className={styles.btnctn}>
                  <button className={styles.btn2} onClick={toggleTermsModal}> Cancel </button>
                  <button className={styles.btn3} onClick={handleAgreeClick}> I Agree </button>
                  </div>
                </div>
          </div>
      )}

    </div>

  )
}

export default Eregi
