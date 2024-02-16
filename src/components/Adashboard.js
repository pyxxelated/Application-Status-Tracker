  import React, { useState, useEffect, useRef } from 'react';
  import styles from './styles/Adashboard.module.css';
  import logo1 from '../assets/logo1.png';
  import upload from '../assets/upload.png';
  import { useAsyncError, useNavigate } from 'react-router-dom';
  import { useAuth } from '../context/UserAuthContext';
  import { doc, getDoc, setDoc, deleteDoc, getDocs, collectionGroup } from 'firebase/firestore';
  import { db, storage } from '../config/configure';
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
  import email from '../assets/vmail.png';
  import { FontAwesomeIcon  } from '@fortawesome/react-fontawesome';
  import { faXmark, faPhone, faEnvelope, faLocationDot, faCircleXmark, faSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
  
 

  

  function Adashboard() {
    const navigate = useNavigate();
    const sec1 = useRef(null);
    const sec2 = useRef(null)
    const [activeButton, setActiveButton] = useState('sec1');
    const [activeSection, setActiveSection] = useState('sec1');
    const { currentuser , sendVerificationEmail, signOut, deleteUserAccount, reauthenticate  } = useAuth();
    const [logoFile, setLogoFile] = useState(null);
    const [modal, setModal] = useState(false);
    const [settingsModal, setSettingsModal] = useState(false);
    const [verifyModal, setVerifyModal] = useState(false);
    const [resetModal,setResetModal] = useState(false);
    const [logoutModal, setLogoutModal] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [password, setPassword] = useState('');
    const [deleteAccount, setDeleteAccount] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteApplicantId, setDeleteApplicantId] = useState(null);
    const [confirmation, setConfirmation] = useState('');
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(1);
    const [applicants, setApplicants] = useState([]);
    const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
    const { resetPassword } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [applicantInfo, setApplicantInfo] = useState({
      name: '',
      contact: '',
      address: '',
      objectives: '',
      school: '',
      degree: '',
      yearGrad: '',
      jobTitle: '',
      cna: '',
    });


    //Tab
    const handleTab = (tabNumber) => {
      setActiveTab(tabNumber);
    };

    //Dropdown
    const toggleDropdown = (index) => {
      setOpenDropdownIndex((prevIndex) => (prevIndex === index ? null : index));
    };
  
    const toggleDeleteAccount = () =>{
      setDeleteAccount(!deleteAccount);
    }

    // MODAL
    const toggleModal = () => {
      setModal(!modal);
    };
  
      if (modal) {
        document.body.classList.add('active-modal');
      } else {
        document.body.classList.remove('active-modal');
      }
    

    const toggleVerifyModal = (isOpen) => {
      setVerifyModal(isOpen);
    };

    const toggleSettingsModal = () => {
      setSettingsModal(!settingsModal);
    };

    const toggleResetModal = () => {
      setResetModal(!resetModal);
    }; 

    const toggleLogoutModal = () => {
      setLogoutModal(!logoutModal);
    };

    const handleDeleteAccount = async () => {
      setShowConfirmationModal(true);
    };
    
    const toggleDeleteModal = (applicantId) => {
      setDeleteModal(!deleteModal);
      setDeleteApplicantId(applicantId);
    }

    //deleteuser acoount

    const handleDeleteUserAccount = async () => {
      try {
        // Reauthenticate user before deleting account
        await reauthenticate(password);
  
        // Delete user account
        await deleteUserAccount(password);
  
        // Handle post-deletion actions or navigation
        setConfirmation('Account deleted successfully.');
      } catch (error) {
        // Handle error during deletion process
        setError('Error deleting account: ' + error.message);
      }
    };
  


    //Upload Logo
    const uploadLogo = async (file) => {
      try {
        const storageRef = ref(storage, `logos/${currentuser.uid}/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const logoUrl = await getDownloadURL(snapshot.ref);
  
        return logoUrl;
      } catch (error) {
        console.error('Error uploading logo:', error);
        throw error;
      }
    };


    //set Logo
    const handleLogoChange = (e) => {
      const file = e.target.files[0];
      setLogoFile(file);
    };



    // Fetch Applicant Information
    useEffect(() => {
      const fetchApplicantInfo = async () => {
        try {
          if (!currentuser) {
            console.log('Current user is not set.');
            return;
          }
    
          const userDocRef = doc(db, 'applicant_infos', currentuser.uid);
          const docSnapshot = await getDoc(userDocRef);
    
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setApplicantInfo(data);
          } else {
            console.log('Document does not exist!');
          }
        } catch (error) {
          console.error('Error fetching company information from Firestore:', error);
        }
      };
    
      fetchApplicantInfo();
    }, [currentuser]);


    //Fetch Resume Status
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

    
    useEffect(() => {
      const handleScroll = () => {
          const scrollPosition = window.scrollY;

          if (sec1.current?.offsetTop && scrollPosition >= sec1.current.offsetTop && scrollPosition < sec2.current.offsetTop) {
              setActiveSection('sec1');
          }
          else if (sec2.current?.offsetTop && scrollPosition >= sec2.current.offsetTop) {
          setActiveSection('sec2');
      }
      };

      window.addEventListener('scroll', handleScroll);

      return () => {
          window.removeEventListener('scroll', handleScroll);
      };
  }, [sec1, sec2]);

  const scrollToSection = (elementRef, button) => {
      window.scrollTo({
          top: elementRef.current.offsetTop,
          behavior: 'smooth',
      });

      setActiveButton(button);
      setActiveSection(button);
  };


  
    // Save Applicant Information
    const saveApplicantInfo = async () => {
      const userConfirmed = window.confirm('Are you sure you want to save?');
            
      if (userConfirmed) {
        try {
          if (!currentuser) {
            console.error('Current user is not defined.');
            return;
          }
    
          // Upload logo and get URL
          if (logoFile) {
            const logoUrl = await uploadLogo(logoFile);
            setApplicantInfo({ ...applicantInfo, logoUrl });
          }
    
          // Construct updated company information
          const updatedApplicantInfo = { ...applicantInfo, email: currentuser.email };
          const userDocRef = doc (db, 'applicant_infos', currentuser.uid);
          await setDoc(userDocRef, updatedApplicantInfo);

          alert('Applicant information saved successfully!');
          toggleModal();
        } catch (error) {
          console.error('Error saving applicant information:', error);
          alert('Error saving applicant information. Please try again.');
        }
      } else {
        alert('Save operation canceled.');
        window.location.reload();
      }
   };


   //Send Verification
   const handleSendVerificationEmail = async () => {
    try {
      await sendVerificationEmail();
      console.log('Verification email sent successfully.');
      toggleVerifyModal(true); // Open the modal after sending the verification email
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  };


  const handleResetPassword = async () => {
    try {
      if (!newPassword || newPassword.trim() === '') {
        throw new Error('New password is empty.');
      }
  
      if (newPassword !== confirmNewPassword) {
        throw new Error('New passwords do not match.');
      }
  
      // Assuming you have defined `password` somewhere in your component state
      await reauthenticate(password);
      await resetPassword(currentPassword, newPassword);
      console.log('Password reset successfully.');
    } catch (error) {
      console.error('Error resetting password:', error.message);
    }
  };

  
    //LOGOUT
      const handleLogout = () => {
          signOut();
          navigate('/');
      };


       //DELETE
       const handleDeleteResume = async (applicantId) => {
        try{
          await deleteResumeFromFirestore(applicantId);

          setApplicants(prevApplicants => prevApplicants.filter(applicant => applicant.id !== applicantId));
          setDeleteModal(false);
        } catch (error){
          console.error('Error deleting Resume: ',error);
        }
      };

      const deleteResumeFromFirestore = async (applicantId) => {
        if (!currentuser){
          console.error('User not authenticated.');
          return;
        }

      const applicantRef = doc(db, 'company_infos', currentuser.uid, 'applicants', applicantId);
      await deleteDoc(applicantRef);

    };


    return (
      <div>
         {currentuser ? (
        <>
        <header className={styles.header}>
            <h2 className={styles.logo}>
              <img src={logo1} className={styles.logo1} />Statu
            </h2>
            <button className={styles.btn1}> Applicant </button>
          <nav className={styles.navigation}>
          <button  className={`${styles.scrlbtn} ${activeButton === 'sec1' ? styles.scrlbtnActive : ''}`}
                    onClick={() => scrollToSection(sec1, 'sec1')}> Profile </button>
            <button className={`${styles.scrlbtn} ${activeButton === 'sec2' ? styles.scrlbtnActive : ''}`}
                    onClick={() => scrollToSection(sec2, 'sec2')}> Applications</button>
            <button className={styles.scrlbtn} onClick={toggleLogoutModal} > Logout </button>
          </nav>
        </header>
       
        
        
        <div className={styles.ctn}>  {/* Body  */}

            <div className={styles.container} ref={sec1}>
                <div className={styles.section1}>
                  <div className={styles.bx1}>
                    <button className={styles.button} onClick={toggleModal}> Edit Profile </button>
                    <div className={styles.frame}>
                      <img src={applicantInfo.logoUrl || logo1} alt='Applicant Logo' className={styles.logoPreview}/>
                    </div>
                    <div className={styles.divname}>
                      <h1 className={styles.t1}> {applicantInfo.name}</h1>
                    </div>
                      <div className={styles.texts}>
                        <p className={styles.t2}> <FontAwesomeIcon icon={faPhone} className={styles.ic1}/> {applicantInfo.contact}</p>
                        <p className={styles.t3}> <FontAwesomeIcon icon={faEnvelope} className={styles.ic1}/>  {applicantInfo.email} </p>
                        <p className={styles.t3}> <FontAwesomeIcon icon={faLocationDot} className={styles.ic1}/>  {applicantInfo.address} </p>
                      </div> 
                        <div className={styles.buttonctn}>
                          <button className={`${styles.button2} ${currentuser.emailVerified ? styles.verifiedButton : ''}`} 
                                  onClick={handleSendVerificationEmail}
                                  disabled={currentuser.emailVerified}>  {currentuser.emailVerified ? 'Verified' : 'Verify Email'}
                          </button>
                          <button className={styles.button2} onClick={toggleSettingsModal}> Settings </button>
                        </div>
                  </div>
                </div>

                <div className={styles.section2}>
                  <div className={styles.bx2}>
                    <div className={styles.mbx1}>
                      <h1 className={styles.text1}> Education </h1>
                        <input type='text' className={styles.input1} value={applicantInfo.school} placeholder='School' readOnly/> <br/>
                        <input type='text' className={styles.input2} value={applicantInfo.degree} placeholder='Course'readOnly/>
                        <input type='text' className={styles.input3} value={applicantInfo.yearGrad} placeholder='Year Graduated 'readOnly/>
                    </div>
                    <div className={styles.mbx2}>
                      <h1 className={styles.text2}> Work Experience </h1>
                      <input type='text' className={styles.input4} value={applicantInfo.cna} placeholder='Company Name'readOnly/>
                      <input type='text' className={styles.input5} value={applicantInfo.jobTitle} placeholder='Position'readOnly/>
                    </div>
                    <div className={styles.mbx3}>
                      <h1 className={styles.text2}> Objectives</h1>
                      <textarea className={styles.input6} value={applicantInfo.objectives}  readOnly/>
                    </div>
                  </div>
                </div>
            </div>


            {/* Status */}
            <div className={styles.container2} ref={sec2}>
              <div className={styles.bx3}>
                <h1 className={styles.text4}>Status of Application (s) </h1>
                    <div className={styles.appliedCont}>
                     {applicants.map((applicant, index) => (
                        <div key={index} className={styles.box}>
                          <div className={`${styles.box1} ${applicant.rejectApplication ? styles.red : ''}`}> 
                            <div className={styles.ctnt}  onClick={(e) => toggleDropdown(index, e)}>
                              <p className={styles.title} >{applicant.companyName} - {applicant.position} </p>
                             
                            </div>
                            <FontAwesomeIcon icon={faTrash} className={styles.faTrash} onClick={toggleDeleteModal} />
                          </div>  
              
                          {openDropdownIndex === index && (
                            <div className={styles.dropdown}>
                              <div className={styles.line}> </div>
                                <div className={styles.cont}>
                                  {applicants
                                      .filter((innerApplicant) => innerApplicant.companyName === applicant.companyName)
                                      .map((innerApplicant, innderIndex) => (
                                        <div key={innderIndex} className={styles.cont3}>
                                          <div className={`${styles.circle} ${innerApplicant.receivedApplication ? styles.blue : ''}`}></div>
                                            <div className={`${styles.box2} ${innerApplicant.receivedApplication ? styles.blue : ''}`}>
                                        <p> We Received your Application!</p>
                                      </div>
                                    </div>
                                  ))}
          
                                  {applicants
                                      .filter((innerApplicant) => innerApplicant.companyName === applicant.companyName)
                                      .map((innerApplicant, innderIndex) => (
                                        <div key={innderIndex} className={styles.cont3}>
                                          <div className={`${styles.circle} ${innerApplicant.reviewApplication ? styles.blue : ''}`}></div>
                                            <div className={`${styles.box2} ${innerApplicant.reviewApplication ? styles.blue : ''}`}>
                                        <p> Our Team is reviewing your Application </p>
                                      </div>
                                    </div>
                                  ))}

                                  {applicants
                                      .filter((innerApplicant) => innerApplicant.companyName === applicant.companyName)
                                      .map((innerApplicant, innderIndex) => (
                                        <div key={innderIndex} className={styles.cont3}>
                                          <div className={`${styles.circle} ${innerApplicant.sendEmail ? styles.blue : ''}`}></div>
                                            <div className={`${styles.box2} ${innerApplicant.sendEmail ? styles.blue : ''}`}>
                                        <p> You'll be receiveing an email from us </p>
                                      </div>
                                    </div>
                                  ))}

                                  {applicants
                                      .filter((innerApplicant) => innerApplicant.companyName === applicant.companyName)
                                      .map((innerApplicant, innderIndex) => (
                                        <div key={innderIndex} className={styles.cont3}>
                                          <div className={`${styles.circle} ${innerApplicant.initialInterview ? styles.blue : ''}`}></div>
                                            <div className={`${styles.box2} ${innerApplicant.initialInterview ? styles.blue : ''}`}>
                                        <p> Initial Interview </p>
                                      </div>
                                    </div>
                                  ))}

                                  {applicants
                                      .filter((innerApplicant) => innerApplicant.companyName === applicant.companyName)
                                      .map((innerApplicant, innderIndex) => (
                                      <div key={innderIndex} className={styles.cont3}>
                                        <div className={`${styles.circle} ${innerApplicant.finalInterview ? styles.blue : ''}`}></div>
                                          <div className={`${styles.box2} ${innerApplicant.finalInterview ? styles.blue : ''}`}>
                                        <p> Final Interview </p>
                                      </div>
                                     </div>
                                  ))}
                      
                                  {applicants
                                      .filter((innerApplicant) => innerApplicant.companyName === applicant.companyName)
                                      .map((innerApplicant, innderIndex) => (
                                      <div key={innderIndex} className={styles.cont3}>
                                        <div className={`${styles.circle} ${innerApplicant.jobOffer ? styles.blue : ''}`}></div>
                                          <div className={`${styles.box2} ${innerApplicant.jobOffer ? styles.blue : ''}`}>
                                        <p> Congratulations! You have the job offer </p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                        
                              <div className={styles.ctn4}>
                              
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                    </div>
                    <div className={styles.box3}>
                        <p className={styles.text6}> <FontAwesomeIcon icon = {faSquare} className={styles.icon3}/> Rejected </p>
                        <p className={styles.text6}> <FontAwesomeIcon icon = {faSquare} className={styles.icon4}/> On Process </p>
                  </div>
                </div>
              </div>
            

          {/* Edit Profile */}
          {modal && (
            <div className={styles.modal}>
              <div onClick={toggleModal} className={styles.overlay}></div>
              <div className={styles.modalcontent}>
                <h2 className={styles.cpt4}>Edit Profile</h2>
                  <div className={styles.ctn6}>
                    <div className={styles.bx4}>
                      <p className={styles.cpt5}> Name </p>
                        <input type='text' name='name' 
                              value={applicantInfo.name}
                              onChange={(e) => setApplicantInfo({ ...applicantInfo, name: e.target.value })}
                              className={styles.txtbox}/>
                      <p className={styles.cpt5}> Contact Info </p>
                        <input type='text' name='contact'
                              value={applicantInfo.contact}
                              onChange={(e) => setApplicantInfo({ ...applicantInfo, contact: e.target.value })} 
                              className={styles.txtbox}/>
                      <p className={styles.cpt5}> Address </p>
                        <input type='text' name='address' 
                              value={applicantInfo.address}
                              onChange={(e) => setApplicantInfo({ ...applicantInfo, address: e.target.value })} 
                              className={styles.txtbox}/>
                      <p className={styles.cpt5}> Objectives </p>
                        <textarea name='objectives'
                              value={applicantInfo.objectives}
                              onChange={(e) => setApplicantInfo({ ...applicantInfo, objectives: e.target.value })} 
                              className={styles.txtarea}/>
                    </div>
                    <div className={styles.bx5}>
                      <p className={styles.cpt5}> Education </p>
                        <input type='text' name='school' placeholder='School'
                            value={applicantInfo.school}
                            onChange={(e) => setApplicantInfo({ ...applicantInfo, school: e.target.value })} 
                            className={styles.txtbox1}/>
                        <input type='text' name='degree' placeholder='Degree' 
                            value={applicantInfo.degree}
                            onChange={(e) => setApplicantInfo({ ...applicantInfo, degree: e.target.value })}
                            className={styles.txtbox1}/>
                        <input type='text' name='yearGraduated' placeholder='Year Graduated'
                            value={applicantInfo.yearGrad}
                            onChange={(e) => setApplicantInfo({ ...applicantInfo, yearGrad: e.target.value })} 
                            className={styles.txtbox1}/>
                      <p className={styles.cpt5}> Work Experience </p>
                        <input type='text' name='jobTitle' placeholder='Job Title' 
                                value={applicantInfo.jobTitle}
                                onChange={(e) => setApplicantInfo({ ...applicantInfo, jobTitle: e.target.value })}
                                className={styles.txtbox1}/>
                        <input type='text' name='company' placeholder='Company Name'
                                value={applicantInfo.cna}
                                onChange={(e) => setApplicantInfo({ ...applicantInfo, cna: e.target.value })}
                                className={styles.txtbox1}/>
                      <p className={styles.cpt5}> Profile Picture </p>
                        <input type='file' accept='image/*' id='input-file-modal' className={styles.upl}
                                onChange={handleLogoChange}/>
                    </div>
                   </div>
                  <div className={styles.ctn3}>
                        <button className={styles.btn3} onClick={toggleModal}> Cancel </button>
                        <button className={styles.btn4} onClick={saveApplicantInfo}> Save </button>
                      </div>
                </div>
            </div>
          )}

            {/* Verify Email */}
        {verifyModal && (
          <div className={styles.modal}>
            <div onClick={() => toggleVerifyModal(false)} className={styles.overlay}>
              <div onClick={(e) => e.stopPropagation()} className={styles.modalcontent2}>
                <img src={email} alt='email' className={styles.img1}/>
                <h1 className={styles.text3}> Verification link has been sent to your email.</h1>
                <button onClick={() => toggleVerifyModal(false)} className={styles.btn7}> Done </button>
              </div>
            </div>
          </div>
        )}


         {/* Account Settings */}
         {settingsModal && (
          <div className={styles.modal1}>
            <div onClick={toggleSettingsModal} className={styles.overlay}>
              <div onClick={(e) => e.stopPropagation()} className={styles.modalcontent1}>
                <div className={styles.stn1}>
                  <h1 className={styles.txt1}> Account Settings </h1>
                      <button onClick={() => handleTab(1)} className={activeTab === 1 ? styles.btnActive : styles.btn5}> Password and Security </button>
                      <button onClick={() => handleTab(2)} className={activeTab === 2 ? styles.btnActive : styles.btn5}> Account Ownership and Control </button>
                </div>

                {activeTab === 1 && (
                <div className={styles.stn2}>
                  <FontAwesomeIcon icon={faXmark} className={styles.faicon} size='xl' onClick={toggleSettingsModal}/>
                  <h1 className={styles.txt1}> Password and Security </h1>
                    <p className={styles.txt2}> Log in and recovery </p>
                    <p className={styles.txt3}> Manage your password, login preferences and recovery methods.</p>
                    <button className={styles.btn6} onClick={toggleResetModal} > Change Password <span> {'>'} </span>  </button>
                </div>  
                )}

                {activeTab === 2 && (
                  <div className={styles.stn2}>
                    <FontAwesomeIcon icon={faXmark} className={styles.faicon} size='xl' onClick={toggleSettingsModal}/>
                    <h1 className={styles.txt1}> Account Ownership and Control </h1>
                      <p className={styles.txt2}> Deletion </p>
                      <p className={styles.txt3}> Permanently delete your account profile</p>
                    <button className={styles.btn6} onClick={toggleDeleteAccount}> Delete Account <span> {'>'} </span>  </button>
                  </div>
                )}
                
              </div>
            </div>   
          </div>
        )}

       {/* reset password modal */}
         {resetModal && (
        <div className={styles.modal}>
            <div onClick={toggleResetModal} className={styles.overlay1}>
              <div onClick={(e) => e.stopPropagation()} className={styles.modalcontent3}>
                <FontAwesomeIcon icon={faXmark} className={styles.faicon1} size='xl' onClick={toggleResetModal}/>
                  <h1 className={styles.txt4}> Change Password </h1>
                    <p className={styles.txt5}>  Your password must be atleast 6 characters 
                                              and should include a combination of numbers and letters.</p>
                        <input type="password" className={styles.textbox1} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder='Current Password'/> <br/>
                        <input type="password" className={styles.textbox1} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder='New Password'/> <br/>
                        <input type="password" className={styles.textbox1} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder='Re-type new Password'/> <br/>
                  <button className={styles.btn8} onClick={handleResetPassword}> Reset </button>
              </div>
            </div>
        </div>

        )}

          {deleteAccount && (
            <div className={styles.modal}>
              <div className={styles.overlay} onClick={toggleDeleteAccount}>
                <div className={styles.modalcontent5}>
                  <FontAwesomeIcon icon={faCircleXmark} className={styles.icon2}/>
                    <h1 className={styles.modal5text}> Are you sure? </h1>
                      <p className={styles.modal5text1}> Do you really want to delete your account? This process cannot be undone.</p>
                      <div className={styles.modal5ctnbtn}>
                        <button className={styles.modal5btn} onClick={toggleDeleteAccount}> No </button>
                        <button className={styles.modal5btn1} onClick={handleDeleteAccount}> Yes </button>
                    </div>
                  </div>
                </div>
              </div>
            )}


          {/* confirmation modal */}
          {showConfirmationModal && (
          <div className={styles.modal}>
            <div className={styles.overlay}>
              <div className={styles.modalcontent6}>
                <h2 className={styles.modal6text}>Confirmation</h2>
                  <p className={styles.modal6text1}>Please enter your password to confirm account deletion:</p>
                  {/* {error && <p>{error}</p>}
                  {currentuser && ( 
                  <> */}
                    <input type="password" value={password} className={styles.modal6textbox} 
                          onChange={(e) => setPassword(e.target.value)} placeholder='Enter your password' />
                          <div className={styles.errorctn}> 
                            {error && <p className={styles.modal6error}>{error} </p>}
                          </div>
                    <div className={styles.modal6ctnbtn}>
                      <button onClick={() => setShowConfirmationModal(false)} className={styles.modal6btn}>No</button>
                      <button  className={styles.modal6btn1} onClick={handleDeleteUserAccount}>Yes</button>
                    </div>
                   
                  {/* </>
                  )} */}
             </div>
            </div>
          </div>
        )}

        {deleteModal && (
            <div className={styles.modal}>
              <div className={styles.overlay} onClick={toggleDeleteModal}>
                <div className={styles.modalcontent5}>
                  <FontAwesomeIcon icon={faCircleXmark} className={styles.icon2}/>
                    <h1 className={styles.modal5text}> Are you sure? </h1>
                      <p className={styles.modal5text1}> Do you really want to delete these records? This process cannot be undone.</p>
                      <div className={styles.modal5ctnbtn}>
                        <button className={styles.modal5btn}> No </button>
                        <button className={styles.modal5btn1} onClick={handleDeleteResume}> Yes </button>
                    </div>
                  </div>
                </div>
              </div>
            )}








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
    );
  }

  export default Adashboard;