import React , {useState, useEffect} from 'react'
import styles from './styles/Eapplications.module.css';
import logo1 from '../assets/logo1.png';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/configure';
import { addDoc, collection, updateDoc, doc, onSnapshot, getDocs, query, getDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/UserAuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

function Eapplications() {
  const navigate = useNavigate();
  const { currentuser, signOut } = useAuth();
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [logoutModal, setLogoutModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [appModal, setAppModal] = useState(false);
  const [deleteApplicantId, setDeleteApplicantId] = useState(null);
  const [companyName, setCompanyName] = useState(''); 
  const [companyAddress, setCompanyAddress] = useState(''); 
  const [applicants, setApplicants] = useState([]);
  const [dropdownVisibility, setDropdownVisibility] = useState({});



  //Modals
  const toggleLogoutModal = () => {
    setLogoutModal(!logoutModal);
  };

  const toggleModal = () => {
    setModal(!modal);
  }; 

  const toggleappModal = () => {
    appModal(!appModal);
  };

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
        if (!currentuser) {
          console.error('User not authenticated.');
          return;
      }
  
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
        companyName: companyInfoData.companyName, 
        companyAddress: companyInfoData.companyAddress,
      });
  
      console.log('Document written with ID: ', docRef.id);
  
      setName('');
      setEmail('');
      toggleModal();
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


  //LOGOUT
  const handleLogout = () => {
    signOut();
    navigate('/');
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
        <a href='/'>
          <h2 className={styles.logo}><img src={logo1} className={styles.logo1} />Statu</h2>
        </a>
        <nav className={styles.navigation}>
          <button className={styles.btn} onClick={() => navigate('/Edashboard')}>Profile</button>
          <button className={styles.btn}>Applications</button>
          <button className={styles.btn} onClick={toggleLogoutModal}>Logout</button>
        </nav>
      </header>
      <div className={styles.ctn}>
        <button className={styles.btn1}>Employer</button>

        <div className={styles.ctn1}>
          <p className={styles.cpt1}>Applications Received</p>
          
        </div>

        <div className={styles.ctn2}>
          {/* Display applicants */}
          {applicants.map((applicant, index) => (
            <div key={index} className={styles.box}>
              <div className={styles.box1}> 
                <div className={styles.circle}> </div>
                <div className={styles.ctnt} onClick={() => toggleDropdown(index)}>
                  <p> {applicant.name} </p>
                  <FontAwesomeIcon icon={faTrash} className={styles.icon1} onClick={() => toggleDeleteModal(applicant.id)}/>
                  
                </div>
              </div>

              {dropdownVisibility[index] && (
                   <div className={styles.dropdown}>
                      <div className={styles.chckContainer}>
                          <input type="checkbox" className={styles.chck} 
                                  onChange={(e) => handleCheckboxChange(index, "receivedApplication", e.target.checked)} />
                          <p className={styles.txt2}>Received Application</p>
                      </div>
                      <div className={styles.chckContainer}>
                          <input type="checkbox" className={styles.chck}
                                  onChange={(e) => handleCheckboxChange(index, "rejectApplication", e.target.checked)}  />
                          <p className={styles.txt2}>Reject Application</p>
                      </div>
                      <div className={styles.chckContainer}>
                          <input type="checkbox" className={styles.chck}
                                 onChange={(e) => handleCheckboxChange(index, "reviewApplication", e.target.checked)}  />
                          <p className={styles.txt2}>Review Application</p>
                      </div>
                      <div className={styles.chckContainer}>
                          <input type="checkbox" className={styles.chck} 
                                  onChange={(e) => handleCheckboxChange(index, "sendEmail", e.target.checked)}  />
                          <p className={styles.txt2}>Send Email for Initial Interview</p>
                      </div>
                      <div className={styles.chckContainer}>
                          <input type="checkbox" className={styles.chck}
                                 onChange={(e) => handleCheckboxChange(index, "initialInterview", e.target.checked)}  />
                          <p className={styles.txt2}>Qualified for Initial Interview</p>
                      </div>
                      <div className={styles.chckContainer}>
                          <input type="checkbox" className={styles.chck}
                                 onChange={(e) => handleCheckboxChange(index, "finalInterview", e.target.checked)}  />
                          <p className={styles.txt2}>Qualified for Final Interview</p>
                      </div>
                      <div className={styles.chckContainer}>
                          <input type="checkbox" className={styles.chck}
                                 onChange={(e) => handleCheckboxChange(index, "jobOffer", e.target.checked)}  />
                          <p className={styles.txt2}>Send Job Offer</p>
                      </div>
                   </div>
                 )}

             
            </div>
          ))}
          <button className={styles.btn2} onClick={toggleappModal}>+ Add Applicant </button>
        </div>

        {modal && (
          <div className={styles.modal}>
            <div onClick={toggleModal} className={styles.overlay}></div>
              <div className={styles.modalcontent}>
                <h1 className={styles.title1}>Add Applicant</h1>
                  <p className={styles.txt1}>Applicant's Name:</p>
                <input type='text' className={styles.tb1} value={name} onChange={(e) => setName(e.target.value)} />
              <p className={styles.txt1}>Applicant's Email:</p>
              <input type='text' className={styles.tb1} value={email} onChange={(e) => setEmail(e.target.value)} />
              <div className={styles.sec}>
                <button className={styles.btn3} onClick={toggleModal}>Cancel</button>
                <button className={styles.btn4} onClick={handleAdd}>Add</button>
              </div>
            </div>
          </div>
        )}

        {deleteModal && (
            <div className={styles.modal}>
              <div className={styles.overlay} onClick={toggleDeleteModal}>
                <div className={styles.modalcontent1}>
                  <FontAwesomeIcon icon={faCircleXmark} className={styles.icon2}/>
                    <h1 className={styles.txt3}> Are you sure? </h1>
                      <p className={styles.txt4}> Do you really want to delete these records? This process cannot be undone.</p>
                      <div className={styles.ctnbtn}>
                        <button className={styles.btn12}> No </button>
                        <button className={styles.btn13} onClick={() => handleDeleteApplicant(deleteApplicantId)}> Yes </button>
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
          <div className={styles.ctn4}>
                <h1 className={styles.txt6}> Error Message </h1>
                  <p className={styles.txt7}> Your session expired, please login again. </p>
                  <button className={styles.btn11} onClick={() => navigate('/')}> Back to Home page. </button>
            </div>
       )}
    </div>
   
  )
}

export default Eapplications;