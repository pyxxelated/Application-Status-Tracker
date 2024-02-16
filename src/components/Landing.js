import React, { useState} from 'react';
import logo1 from '../assets/logo1.png';
import logo3 from '../assets/logo3.png';
import display1 from '../assets/img-3.png';
import display2 from '../assets/img-4.png';
import icon1 from '../assets/icon-1.png';
import icon2 from '../assets/icon-2.png';
import icon3 from '../assets/icon-3.png';
import icon4 from '../assets/icon-4.png';
import icon5 from '../assets/icon-5.png';
import styles from './styles/Landing.module.css'
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  const [activeButton, setActiveButton] = useState('');
  const handleButtonClick = (route) => {
    setActiveButton(route);
    navigate(route);
  };

  return (
    <div>
       <header className={styles.header}>
              <a href='/'><h2 className={styles.logo}><img src={logo1} className={styles.logo1}/>Statu</h2></a>
                <nav className={styles.navigation}>
                <button onClick = {() => navigate ("/Alogin")} 
                        className={activeButton === '/Alogin' ? `${styles.btn} ${styles.active}` : styles.btn1}>  Applicant </button>
                <button onClick = {() => navigate ("/Elogin")}  
                        className={activeButton === '/Elogin' ? `${styles.btn} ${styles.active}` : styles.btn1}>  Employer </button>
            </nav>
        </header>
        
        <div className={styles.ctn}>
            <div className={styles.sec1}>
              <div className={styles.box}>
                <h1 className={styles.captionn}> Are you having trouble tracking your applications? </h1>
                <p className={styles.caption}> StatuSync is here for your application progress </p>
              </div>
            </div>
            <div className={styles.sec2}>
                <img src={display1} className={styles.display1}/>
            </div>
        </div>

        <div className={styles.ctn1}/>

        <div className={styles.ctn2}>
            <img src={display2} className={styles.display2}/>
              
              <div className={styles.box2}>
                <h1 className={styles.caption1}>What is <span></span>?</h1>
                <p className={styles.caption2}> can improve and expedite the job search 
                                                process by giving recent graduates real-
                                                time visibility, enhancing organization, 
                                                promoting efficient communication, and 
                                                enabling them to manage their careers 
				                                        more proactively and intelligently. </p>
                <div className={styles.line}/>
              </div>
        </div>

        <div className={styles.ctn3}>
            <h1 className={styles.caption3}> Where can we help you? </h1>
              <div className={styles.ctn4}>
                  <div className={styles.ctn5}>
                    <img src={icon1} className={styles.icon}/>
                    <h3 className={styles.caption4}> Create Account </h3>
                    <p className={styles.caption5}> First you have to create an account here.</p>
                  </div>
                  <div className={styles.ctn6}>
                    <img src={icon2} className={styles.icon}/>
                    <h3 className={styles.caption4}> Manage Application</h3>
                    <p className={styles.caption5}> Monitor and Track your Applications from different companies. </p>
                  </div>
                  <div className={styles.ctn7}>
                   <img src={icon3} className={styles.icon}/>
                    <h3 className={styles.caption4}> Engage with Companies</h3>
                    <p className={styles.caption6}> Communicate easily and received immediate updates from companies.</p>
                  </div>
              </div>
        </div>

        <div className={styles.ctn8}>
            <div className={styles.sec3}>
              <img src={logo3} className={styles.logo2}/>
              <h1 className={styles.caption7}></h1>
            </div>
            <div className={styles.sec4}>
              <h3 className={styles.caption8}> For Employers </h3>
              <p className={styles.caption9}> Update Company Profile </p>
              <p className={styles.caption9}> Received Applicants </p>
            </div>
            <div className={styles.sec5}>
              <h3 className={styles.caption8}> For Applicants </h3>
              <p className={styles.caption9}> Create Account </p>
              <p className={styles.caption9}> Update Profile </p>
              <p className={styles.caption9}> Check Status </p>
            </div>
            <div className={styles.sec6}>
              <h3 className={styles.caption8}> Call Us </h3>
              <p className={styles.caption9}>  <img src={icon4} className={styles.icon4} />Manila </p>
              <p className={styles.caption9}>  <img src={icon5} className={styles.icon5} />statusync@gmail.com </p>
            </div>
            <div className={styles.sec7}>
                <p> BSCOE 4-2P. copyright 2023. Group 3</p>
            </div>
        </div>

    </div>
  )
}

export default Landing