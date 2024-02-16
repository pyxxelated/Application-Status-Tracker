import React, {useState, useEffect} from 'react'
import styles from './styles/Astatus.module.css';
import logo1 from '../assets/logo1.png';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/configure';
import { addDoc, collection, updateDoc, doc, onSnapshot, getDocs, query, where, collectionGroup } from 'firebase/firestore';
import { useAuth } from '../context/UserAuthContext';

function Astatus() {
  const navigate = useNavigate();
  const { currentuser, signOut } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [dropdownVisibility, setDropdownVisibility] = useState({});
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [logoutModal, setLogoutModal] = useState(false);

  const toggleDropdown = (index) => {
    setOpenDropdownIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const toggleLogoutModal = () => {
    setLogoutModal(!logoutModal);
  };

  useEffect(() => {
    if (!currentuser) {
      console.error('User not authenticated.');
      return;
    }

    const fetchApplicantsStatus = async () => {
      try {
        const q = collectionGroup(db, 'applicants');
        const querySnapshot = await getDocs(q);
        const applicantList = querySnapshot.docs
          .filter((doc) => doc.data().email === currentuser.email)
          .map((doc) => doc.data());
        setApplicants(applicantList);
        console.log('Applicants:', applicantList);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchApplicantsStatus();
  }, [currentuser]);


   //LOGOUT
   const handleLogout = () => {
    signOut();
    navigate('/');
  };



  return (
    <div>
       {currentuser ? (
        <>
      <header>
        <a href='/'>
          <h2 className={styles.logo}><img src={logo1} className={styles.logo1} />Statu</h2>
        </a>
        <nav className={styles.navigation}>
          <button className={styles.btn} onClick={() => navigate('/Adashboard')}>Profile</button>
          <button className={styles.btn}>Status</button>
          <button className={styles.btn}  onClick={toggleLogoutModal} >Logout</button>
        </nav>
      </header>
      <div className={styles.ctn}>
        <button className={styles.btn1}>Employer</button>

        <div className={styles.ctn1}>
          <p className={styles.cpt1}>Status of Application (s) </p>
        </div>

        <div className={styles.ctn2}>
            <h1 className={styles.txt1}> Companies </h1>
            {applicants.map((applicant, index) => (
              <div key={index} className={styles.box}>
                <div className={styles.box1}> 
                    <div className={styles.ctnt} onClick={(e) => toggleDropdown(index, e)}>
                    <p className={styles.title}>{applicant.companyName}</p>
                    </div>
                  </div>  
              

                {openDropdownIndex === index && (
                <div className={styles.dropdown}>
                  <div className={styles.line}> </div>
                  <div className={styles.cont}>
                   {applicants
                      .filter((innerApplicant) => innerApplicant.companyName === applicant.companyName)
                      .map((innerApplicant, innderIndex) => (
                        <div key={innderIndex} className={styles.ctn3}>
                          <div className={`${styles.circle} ${innerApplicant.receivedApplication ? styles.blue : ''}`}></div>
                          <div className={`${styles.box2} ${innerApplicant.receivedApplication ? styles.blue : ''}`}>
                            <p> We Received your Application!</p>
                          </div>
                        </div>
                         ))}
                     

                      {applicants
                        .filter((innerApplicant) => innerApplicant.companyName === applicant.companyName)
                        .map((innerApplicant, innderIndex) => (
                        <div key={innderIndex} className={styles.ctn3}>
                          <div className={`${styles.circle} ${innerApplicant.reviewApplication ? styles.blue : ''}`}></div>
                          <div className={`${styles.box2} ${innerApplicant.reviewApplication ? styles.blue : ''}`}>
                            <p> Our Team is reviewing your Application </p>
                          </div>
                      </div>
                      ))}

                      {applicants
                        .filter((innerApplicant) => innerApplicant.companyName === applicant.companyName)
                        .map((innerApplicant, innderIndex) => (
                        <div key={innderIndex} className={styles.ctn3}>
                          <div className={`${styles.circle} ${innerApplicant.sendEmail ? styles.blue : ''}`}></div>
                          <div className={`${styles.box2} ${innerApplicant.sendEmail ? styles.blue : ''}`}>
                            <p> You'll be receiveing an email from us </p>
                          </div>
                      </div>
                      ))}

                      {applicants
                        .filter((innerApplicant) => innerApplicant.companyName === applicant.companyName)
                        .map((innerApplicant, innderIndex) => (
                        <div key={innderIndex} className={styles.ctn3}>
                          <div className={`${styles.circle} ${innerApplicant.initialInterview ? styles.blue : ''}`}></div>
                          <div className={`${styles.box2} ${innerApplicant.initialInterview ? styles.blue : ''}`}>
                            <p> Initial Interview </p>
                         </div>
                      </div>
                      ))}

                        {applicants
                          .filter((innerApplicant) => innerApplicant.companyName === applicant.companyName)
                          .map((innerApplicant, innderIndex) => (
                        <div key={innderIndex} className={styles.ctn3}>
                          <div className={`${styles.circle} ${innerApplicant.finalInterview ? styles.blue : ''}`}></div>
                          <div className={`${styles.box2} ${innerApplicant.finalInterview ? styles.blue : ''}`}>
                            <p> Final Interview </p>
                          </div>
                      </div>
                       ))}
                      

                      {applicants
                        .filter((innerApplicant) => innerApplicant.companyName === applicant.companyName)
                        .map((innerApplicant, innderIndex) => (
                        <div key={innderIndex} className={styles.ctn3}>
                          <div className={`${styles.circle} ${innerApplicant.jobOffer ? styles.blue : ''}`}></div>
                          <div className={`${styles.box2} ${innerApplicant.jobOffer ? styles.blue : ''}`}>
                            <p> Congratulations! You have the job offer </p>
                          </div>
                      </div>
                    ))}
                    </div>
                        
                  <div className={styles.ctn4}> </div>
                    
                </div>
              )}
              
              </div>

            ))}

                {logoutModal && (
                  <div className={styles.logoutOverlay} onClick={toggleLogoutModal}>
                    <div className={styles.logoutModal} onClick={(e) => e.stopPropagation()}>
                      <p>Are you sure you want to <br /> Log out?</p>
                        <div className={styles.btnctn}>
                          <button className={styles.btn9} onClick={toggleLogoutModal}> No </button>
                          <button className={styles.btn10} onClick={handleLogout}> Yes </button>
                        </div>
                    </div>
                  </div>
                )}
            
        </div>
        
          
      </div> 
        </>
        ) : (
          // Render loading state or redirect when currentuser is not defined
          <div className={styles.ctn5}>
                <h1 className={styles.txt6}> Error Message </h1>
                  <p className={styles.txt7}> Your session expired, please login again. </p>
                  <button className={styles.btn11} onClick={() => navigate('/')}> Back to Home page. </button>
              </div>
      )}
      
    </div>
    
  )
}

export default Astatus
