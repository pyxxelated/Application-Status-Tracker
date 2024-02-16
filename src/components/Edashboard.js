import React, { useState, useEffect, useRef } from 'react';
import styles from './styles/Edashboard.module.css';
import logo1 from '../assets/logo1.png';
import { useAsyncError, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/UserAuthContext';
import { doc, getDoc, updateDoc, addDoc, collection, deleteDoc, getDocs, query, onSnapshot} from 'firebase/firestore';
import { db, storage } from '../config/configure';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FontAwesomeIcon  } from '@fortawesome/react-fontawesome';
import { faXmark, faPhone, faEnvelope, faLocationDot, faTrash, faCircleXmark, faGlobe } from '@fortawesome/free-solid-svg-icons';
import vmail from '../assets/vmail.png';




function Edashboard() {
  const navigate = useNavigate();
  const sec1 = useRef(null);
  const sec2 = useRef(null);
  const [activeButton, setActiveButton] = useState('sec1');
  const [activeSection, setActiveSection] = useState('sec1');
  const { currentuser, profileInformation , sendVerificationEmail, 
          signOut, deleteUserAccount, reauthenticate, deleteUserDataFromFirestore } = useAuth(); 
  const [modal, setModal] = useState(false);
  const [deleteAccount, setDeleteAccount] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const [resetModal,setResetModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [applicantModal, setApplicantModal] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteApplicantId, setDeleteApplicantId] = useState(null);
  const [companyName, setCompanyName] = useState(''); 
  const [companyAddress, setCompanyAddress] = useState(''); 
  const [applicants, setApplicants] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [dropdownVisibility, setDropdownVisibility] = useState({});
  const [activeTab, setActiveTab] = useState(1);
  const [confirmation, setConfirmation] = useState('');
  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    companyAddress: '',
    companySite: '',
    companyType: '',
    companySize: '',
    companyDescription: '',
  });

        //Tab
        const handleTab = (tabNumber) => {
          setActiveTab(tabNumber);
        };

        // MODAL
        const toggleModal = () => {
          setModal(!modal);
  
        };

        if (modal) {
          document.body.classList.add('active-modal');
        } else {
          document.body.classList.remove('active-modal');
        }

        const toggleSettingsModal = () => {
          setSettingsModal(!settingsModal);
        };

        const toggleVerifyModal = (isOpen) => {
          setVerifyModal(isOpen);
        };

        const toggleResetModal = () => {
          setResetModal(!resetModal);
        }; 

        const toggleLogoutModal = () => {
          setLogoutModal(!logoutModal);
        };

        const toggleApplicantModal = () => {
          setApplicantModal(!applicantModal);
        }
        
        const toggleDeleteAccount = () =>{
          setDeleteAccount(!deleteAccount);
        }

        const handleDeleteAccount = async () => {
          setShowConfirmationModal(true);
        };

        //SET LOGO
        const handleLogoChange = (e) => {
          const file = e.target.files[0];
          setLogoFile(file);
        };

        

        //SET COMPANY
        const handleSaveCompanyInfo = async () => {
          const userConfirmed = window.confirm('Are you sure you want to save?');
          
          if (userConfirmed) {
            try {
              // Check if currentuser is defined before accessing its properties
              if (!currentuser) {
                console.error('Current user is not defined.');
                return;
              }
        
              // Upload logo and get URL
              if (logoFile) {
                const logoUrl = await uploadLogo(logoFile);
                setCompanyInfo({ ...companyInfo, logoUrl });
              }
        
              // Construct updated company information
              const updatedCompanyInfo = { ...companyInfo, email: currentuser.uid };
        
              // Call profileInformation with the updated company information
              await profileInformation(updatedCompanyInfo);
              alert('Company information saved successfully!');
              toggleModal();
            } catch (error) {
              console.error('Error saving company information:', error);
              alert('Error saving company information. Please try again.');
            }
          } else {
            alert('Save operation canceled.');
            window.location.reload();
          }
        };

        //upload logo to firebase storage
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

        //Display data
        useEffect(() => {
          const fetchCompanyInfo = async () => {
            try {
              if (!currentuser) {
                console.log('Current user is not set.');
                return;
              }
        
              const userDocRef = doc(db, 'company_infos', currentuser.uid);
              const docSnapshot = await getDoc(userDocRef);
        
              if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setCompanyInfo(data);
              } else {
                console.log('Document does not exist!');
              }
            } catch (error) {
              console.error('Error fetching company information from Firestore:', error);
            }
          };
        
          fetchCompanyInfo();
        }, [currentuser]);


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
        
        //tab scroll
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

            //LOGOUT
            const handleLogout = () => {
              signOut();
              navigate('/');
            };


            //delete user account
            const handleDeleteUserAccount = async () => {
              try {
                if (!currentuser) {
                  throw new Error('User is not logged in.');
                } if (!password) {
                  throw new Error('Password is required for account deletion.');
                }
          
                await reauthenticate(password);
                await deleteUserAccount(password);
                await deleteUserDataFromFirestore(currentuser.uid);
            
                setConfirmation('Account deleted successfully.');
              } catch (error) {
                setError('Error deleting account: ' + error.message);
              }
            };



            ///////////////////APPLICATION FUNCTIONS////////////
            
            const [name, setName] = useState('');
            const [email, setEmail] = useState('');
            const [position, setPosition] = useState('');

            const toggleDeleteModal = (applicantId) => {
              setDeleteModal(!deleteModal);
              setDeleteApplicantId(applicantId);
            }

            
            useEffect(() => {
              if (!currentuser) {
                console.error('User not authenticated.');
                return;
              }
          
              //Fetch Applicants
              const fetchApplicants = async () => {
                try {
                  const applicantsRef = collection(db, 'company_infos', currentuser.uid, 'applicants');
                  const q = query(applicantsRef);
                  const querySnapshot = await getDocs(q);
                  const updatedApplicants = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                  }));
                  setApplicants(updatedApplicants);
          
                  const unsubscribe = onSnapshot(q, snapshot => {
                    const updatedApplicants = snapshot.docs.map(doc => ({
                      id: doc.id,
                      ...doc.data(),
                    }));
                    setApplicants(updatedApplicants);
                  });
          
                  return unsubscribe;
                } catch (error) {
                  console.error('Error fetching data: ', error);
                }
              };
          
              fetchApplicants();
            }, [currentuser]);
          
          
          
              //ADD RESUME
               const handleAdd = async () => {
                try {
                // Fetch the company info to get companyName and companyAddress
                const companyInfoDoc = await getDoc(doc(db, 'company_infos', currentuser.uid));
                const companyInfoData = companyInfoDoc.data();
            
                // Add the new applicant with companyName and companyAddress
                const docRef = await addDoc(collection(db, 'company_infos', currentuser.uid, 'applicants'), {
                  name: name,
                  email: email,
                  receivedApplication: false,
                  rejectApplication: false,
                  reviewApplication: false,
                  sendEmail: false,
                  initialInterview: false,
                  finalInterview: false,
                  jobOffer: false,
                  position: position,
                  companyName: companyInfoData.companyName, 
                  companyAddress: companyInfoData.companyAddress,
                  dateAdded: new Date().toISOString(),
                });
            
                console.log('Document written with ID: ', docRef.id);
            
                setName('');
                setEmail('');
                setPosition('');
                toggleApplicantModal();
                setCompanyName(''); 
                setCompanyAddress(''); 
              } catch (error) {
                console.error('Error adding document: ', error);
              }
            };
          
              //DROPDOWN
              const toggleDropdown = index => {
                setDropdownVisibility(prevVisibility => ({
                  ...prevVisibility,
                  [index]: !prevVisibility[index],
                }));
              };
          
          
            //CHECKBOX
            const handleCheckboxChange = async (index, fieldName, checked) => {
              try {
                if (!currentuser) {
                  console.error('User not authenticated.');
                  return;
                }
          
                const applicantId = applicants[index].id;
                const applicantRef = doc(db, 'company_infos', currentuser.uid, 'applicants', applicantId);
          
                await updateDoc(applicantRef, {
                  [fieldName]: checked,
                });
              } catch (error) {
                console.error('Error updating checkbox state: ', error);
              }
            };

            //DELETE
            const handleDeleteApplicant = async (applicantId) => {
              try{
                await deleteApplicantFromFirestore(applicantId);

                setApplicants(prevApplicants => prevApplicants.filter(applicant => applicant.id !== applicantId));
                setDeleteModal(false);
              } catch (error){
                console.error('Error deleting applicant: ',error);
              }
            };

            const deleteApplicantFromFirestore = async (applicantId) => {
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
          <button className={styles.btn1}> Employer </button>
        <nav className={styles.navigation}>
          <button  className={`${styles.btn} ${activeButton === 'sec1' ? styles.btnActive : ''}`}
                    onClick={() => scrollToSection(sec1, 'sec1')}> Profile </button>
            <button className={`${styles.btn} ${activeButton === 'sec2' ? styles.btnActive : ''}`}
                    onClick={() => scrollToSection(sec2, 'sec2')}> Applications</button>
            <button className={styles.btn} onClick={toggleLogoutModal}> Logout </button>
        </nav>
      </header>
      <div className={styles.ctn}>
        <div className={styles.container} ref={sec1}>
          <div className={styles.section1}>
            <div className={styles.bx1}>
              <button className={styles.button} onClick={toggleModal}> Edit Profile </button>
                  <div className={styles.frame}>
                    <img src={companyInfo.logoUrl || logo1} alt='Company Logo' className={styles.logoPreview}/>
                  </div>
                  <div className={styles.texts}>
                        <p className={styles.t2}> <FontAwesomeIcon icon={faGlobe} className={styles.ic1}/> {companyInfo.companySite}</p>
                        <p className={styles.t3}> <FontAwesomeIcon icon={faEnvelope} className={styles.ic1}/> {companyInfo.email} </p>
                        <p className={styles.t3}> <FontAwesomeIcon icon={faLocationDot} className={styles.ic1}/> {companyInfo.companyAddress} </p>
                  </div>
                  <div className={styles.buttonctn}>
                          <button className={styles.button2} 
                                  onClick={handleSendVerificationEmail}
                                  disabled={currentuser.emailVerified}>  {currentuser.emailVerified ? 'Verified' : 'Verify Email'} </button>
                          <button className={styles.button2} onClick={toggleSettingsModal} > Settings </button>
                  </div>
              </div>
          </div>
          <div className={styles.section2}>
            <div className={styles.bx2}>
              <div className={styles.texts1}>
                <h1 className={styles.t1}> {companyInfo.companyName}</h1>
              </div>
                <div className={styles.mbx1}>
                  <h1 className={styles.text2}> Company </h1>
                    <input type='text' className={styles.input4} value={companyInfo.companyType} placeholder='Type of Company'readOnly/>
                    <input type='text' className={styles.input5} value={companyInfo.companySize} placeholder='Company Size'readOnly/>
                </div>
                <div className={styles.mbx2}>
                 <h1 className={styles.text2}> Company Description</h1>
                      <textarea className={styles.input6} value={companyInfo.companyDescription}  readOnly/>
                </div>
              </div>
            </div>
        </div>

        {/* dashboard */}
        <div className={styles.container1} ref={sec2}>
          <div className={styles.bx3}>
              <h1 className={styles.text4}>Applications</h1>
                <h1 className={styles.text5}> </h1>
                  <div className={styles.applicantcont}> 
                    {applicants.map((applicant, index) => (
                      <div key={index} className={styles.box}>
                        <div className={styles.box1}> 
                          <div className={styles.ctnt} onClick={() => toggleDropdown(index)}>
                              <p> {applicant.name}  - {applicant.position} </p>
                          </div>
                            <FontAwesomeIcon icon={faTrash} className={styles.icon1} onClick={() => toggleDeleteModal(applicant.id)}/>
                              <div className={styles.circle}> </div>
                          </div>
                          
                          {dropdownVisibility[index] && (
                            <div className={styles.dropdown}>
                              <div className={styles.chckContainer}>
                                <input type="checkbox" className={styles.chck}  checked={applicant.receivedApplication}
                                       onChange={(e) => handleCheckboxChange(index, "receivedApplication", e.target.checked)} />
                                <p className={styles.txt2}>Received Application</p>
                              </div>
                              <div className={styles.chckContainer}>
                                  <input type="checkbox" className={styles.chck} checked={applicant.rejectApplication}
                                          onChange={(e) => handleCheckboxChange(index, "rejectApplication", e.target.checked)}  />
                                  <p className={styles.txt2}>Reject Application</p>
                              </div>
                              <div className={styles.chckContainer}> 
                                  <input type="checkbox" className={styles.chck} checked={applicant.reviewApplication}
                                        onChange={(e) => handleCheckboxChange(index, "reviewApplication", e.target.checked)}  />
                                  <p className={styles.txt2}>Review Application</p>
                              </div>
                              <div className={styles.chckContainer}>
                                <input type="checkbox" className={styles.chck} checked={applicant.sendEmail}
                                      onChange={(e) => handleCheckboxChange(index, "sendEmail", e.target.checked)}  />
                                <p className={styles.txt2}>Send Email for Initial Interview</p>
                              </div>
                              <div className={styles.chckContainer}> 
                                <input type="checkbox" className={styles.chck} checked={applicant.initialInterview}
                                      onChange={(e) => handleCheckboxChange(index, "initialInterview", e.target.checked)}  />
                                <p className={styles.txt2}>Qualified for Initial Interview</p>
                              </div>
                              <div className={styles.chckContainer}>
                                <input type="checkbox" className={styles.chck} checked={applicant.finalInterview}
                                       onChange={(e) => handleCheckboxChange(index, "finalInterview", e.target.checked)}  />
                                <p className={styles.txt2}>Qualified for Final Interview</p>
                              </div>
                              <div className={styles.chckContainer}>
                                <input type="checkbox" className={styles.chck} checked={applicant.jobOffer}
                                      onChange={(e) => handleCheckboxChange(index, "jobOffer", e.target.checked)}  />
                                <p className={styles.txt2}>Send Job Offer</p>
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                </div>
                <button className={styles.btn2} onClick={toggleApplicantModal}>+ Add Applicant </button>
              </div>
            </div>





        {/* Edit Profile */}
        {modal && (
          <div className={styles.modal}>
            <div onClick={toggleModal} className={styles.overlay}></div>
              <div className={styles.modalcontent}>
                <h2 className={styles.modaltext1}>Edit Company Profile</h2>
                  <p className={styles.modaltext2}> Company Name </p>
                    <input type='text' name='companyName' value={companyInfo.companyName}
                           onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value})}
                           className={styles.modaltextbox}/>
                    <div className={styles.modalbox}>
                      <p className={styles.modaltext2}> Company Details</p>
                      <input type='text' name='companySite' value={companyInfo.companySite}
                               onChange={(e) => setCompanyInfo({ ...companyInfo, companySite: e.target.value})}
                              className={styles.modaltextbox1}
                              placeholder='Website'/>
                      <input type='text' name='companyAddress' value={companyInfo.companyAddress}
                               onChange={(e) => setCompanyInfo({ ...companyInfo, companyAddress: e.target.value})}
                              className={styles.modaltextbox2}
                              placeholder='Company Address'/>
                      <input type='text' name='companyType' value={companyInfo.companyType}
                               onChange={(e) => setCompanyInfo({ ...companyInfo, companyType: e.target.value})}
                              className={styles.modaltextbox1}
                              placeholder='Company Type'/>
                      <input type='text' name='companySize' value={companyInfo.companySize}
                               onChange={(e) => setCompanyInfo({ ...companyInfo, companySize: e.target.value})}
                              className={styles.modaltextbox4}
                              placeholder='Company Size'/>
                    </div>
                      <p className={styles.modaltext2}> Company Description </p>
                        <textarea type='text' name='companyDescription' value={companyInfo.companyDescription}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, companyDescription: e.target.value})}
                          className={styles.modaltextarea}/>
                      <p className={styles.modaltext2}> Profile Picture </p>
                        <input type='file' accept='image/*' id='input-file-modal' className={styles.upl}
                                onChange={handleLogoChange}/>
                    <div className={styles.modalctnbtn}>
                      <button className={styles.modalbtn} onClick={toggleModal}> Cancel </button>
                      <button className={styles.modalbtn1} onClick={handleSaveCompanyInfo}> Save </button>
                    </div>
            </div>
          </div>
        )}



        {/* Account Settings */}
        {settingsModal && (
          <div className={styles.modal1}>
            <div onClick={toggleSettingsModal} className={styles.overlay}>
              <div onClick={(e) => e.stopPropagation()} className={styles.modalcontent1}>
                <div className={styles.modal1stn}>
                  <h1 className={styles.modal1text}> Account Settings </h1>
                      <button onClick={() => handleTab(1)} className={activeTab === 1 ? styles.modal1btnActive : styles.modal1btn}> Password and Security </button>
                      <button onClick={() => handleTab(2)} className={activeTab === 2 ? styles.modal1btnActive : styles.modal1btn}> Account Ownership and Control </button>
                </div>

                {activeTab === 1 && (
                <div className={styles.modal1stn1}>
                  <FontAwesomeIcon icon={faXmark} className={styles.faicon} size='xl' onClick={toggleSettingsModal}/>
                  <h1 className={styles.modal1text}> Password and Security </h1>
                    <p className={styles.modal1text2}> Log in and recovery </p>
                    <p className={styles.modal1text3}> Manage your password, login preferences and recovery methods.</p>
                    <button className={styles.modal1btn1} onClick={toggleResetModal} > Change Password <span> {'>'} </span>  </button>
                </div>  
                )}

                {activeTab === 2 && (
                  <div className={styles.modal1stn1}>
                    <FontAwesomeIcon icon={faXmark} className={styles.faicon} size='xl' onClick={toggleSettingsModal}/>
                    <h1 className={styles.modal1text}> Account Ownership and Control </h1>
                      <p className={styles.modal1text2}> Deletion </p>
                      <p className={styles.modal1text3}> Permanently delete your account profile</p>
                    <button className={styles.modal1btn1} onClick={toggleDeleteAccount}> Delete Account <span> {'>'} </span>  </button>
                  </div>
                )}
                
              </div>
            </div>   
          </div>
        )}

        {/* Verify Email */}
         {verifyModal && (
          <div className={styles.modal}>
            <div onClick={() => toggleVerifyModal(false)} className={styles.overlay}>
              <div onClick={(e) => e.stopPropagation()} className={styles.modalcontent2}>
                <img src={vmail} alt='email' className={styles.img1}/>
                <h1 className={styles.modal2text}> Verification link has been sent to your email.</h1>
                <button onClick={() => toggleVerifyModal(false)} className={styles.modal2btn}> Done </button>
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
                  <h1 className={styles.modal3text}> Change Password </h1>
                    <p className={styles.modal3text1}>  Your password must be atleast 6 characters 
                                              and should include a combination of numbers and letters.</p>
                        <input type="password" className={styles.modal3textbox} placeholder='Current Password'/> <br/>
                        <input type="password" className={styles.modal3textbox} placeholder='New Password'/> <br/>
                        <input type="password" className={styles.modal3textbox} placeholder='Re-type new Password'/> <br/>
                  <button className={styles.modal3btn}> Reset </button>
              </div>
            </div>
        </div>
        )}

        {applicantModal && (
          <div className={styles.modal}>
            <div onClick={toggleApplicantModal} className={styles.overlay}></div>
              <div className={styles.modalcontent4}>
                <h1 className={styles.modal4text}>Add Applicant</h1>
                  <p className={styles.modal4text1}>Applicant's Name:</p>
                    <input type='text' className={styles.modal4textbox} value={name} onChange={(e) => setName(e.target.value)} />
                  <p className={styles.modal4text1}>Applicant's Email:</p>
                    <input type='text' className={styles.modal4textbox} value={email} onChange={(e) => setEmail(e.target.value)} />
                  <p className={styles.modal4text1}>Applied Position:</p>
                    <input type='text' className={styles.modal4textbox} value={position} onChange={(e) => setPosition(e.target.value)} />
                <div className={styles.modal4ctnbtn}>
                <button className={styles.modal4btn} onClick={toggleApplicantModal}>Cancel</button>
                <button className={styles.modal4btn1} onClick={handleAdd}>Add</button>
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
                        <button className={styles.modal5btn1} onClick={() => handleDeleteApplicant(deleteApplicantId)}> Yes </button>
                    </div>
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
        <div className={styles.ctn4}>
              <h1 className={styles.txt6}> Error Message </h1>
                <p className={styles.txt7}> Your session expired, please login again. </p>
                <button className={styles.btn11} onClick={() => navigate('/')}> Back to Home page. </button>
            </div>
          
      )}
      
    </div>
  );
}

export default Edashboard;