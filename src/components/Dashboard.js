import React, {useRef, useState, useEffect} from 'react'
import styles from './styles/Dashboard.module.css'
import logo1 from '../assets/logo1.png';
import pic from '../assets/email.png'
import pic1 from '../assets/email1.png'
import { useNavigate }from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faUser, faSquare, faTableList, faTrashCan, faXmark, faX } from '@fortawesome/free-solid-svg-icons';
import { db, auth } from '../config/configure';
import { collection, query, where, doc, getDocs, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/UserAuthContext';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';




function Dashboard() {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const sec1 = useRef(null);
    const sec2 = useRef(null)
    const [activeButton, setActiveButton] = useState('sec1');
    const [activeSection, setActiveSection] = useState('sec1');
    const [resumeModal, setResumeModal] = useState(false);
    const [applicantModal, setApplicantModal] = useState(false);
    const [editApplicantModal, setEditApplicantModal] = useState(false);
    const [editCompanyModal, setEditCompanyModal] = useState(false);
    const [companyModal, setCompanyModal] = useState(false);
    const [applicants, setApplicants] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [editedApplicant, setEditedApplicant] = useState({});
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [editedCompany, setEditedCompany] = useState({});
    const [totalApplicants, setTotalApplicants] = useState(0);
    const [totalCompanies, setTotalCompanies] = useState(0);
    const [totalResumes, setTotalResumes] = useState(0);
    const [resumeData, setResumeData] = useState([]);
    const componentPDFapplicant = useRef();
    const componentPDFcompany = useRef();
    const componentPDFresume = useRef();
    const componentPDFapplicantDetails = useRef();
    const componentPDFcompanyDetails = useRef();
    const [logoutModal, setLogoutModal] = useState(false)


    //modal
    const toggleResumeModal = async (companyId) => {
        try {
            const resumesSnapshot = await getDocs(collection(db, `company_infos/${companyId}/applicants`));
            const resumeData = resumesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setResumeData(resumeData);
            setResumeModal(!resumeModal);
            setSelectedCompany(companies.find(company => company.id === companyId)); // Set selected company
        } catch (error) {
            console.error("Error fetching resume details: ", error);
        }
    }

    const toggleLogoutModal = () => {
        setLogoutModal(!logoutModal);
      };

    const handleLogout = () => {
        signOut();
        navigate('/');
      };


    const toggleApplicantModal = () => {
        setApplicantModal(!applicantModal);
    }

    const toggleEditApplicantModal = () => {
        setEditApplicantModal(!editApplicantModal);
        setApplicantModal(false);
    }

    const toggleEditCompanyModal = () => {
        setEditCompanyModal(!editCompanyModal);
        setCompanyModal(false);
    }

    const toggleCompanyModal = () => {
        setCompanyModal(!companyModal);
    }

    const handleViewDetails = (applicant) => {
        setSelectedApplicant(applicant);
        setApplicantModal(true);
    };

    const handleViewCompanyDetails = (company) => {
        setSelectedCompany(company);
        toggleCompanyModal();
    };
    
    
    const handleCloseModal = () => {
        setApplicantModal(false);
    };



    const handleEditChange = (e) => {
      const { name, value } = e.target;
        setEditedApplicant(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleEditCompanyChange = (e) => {
      const { name, value } = e.target;
        setEditedCompany(prevState => ({
            ...prevState,
            [name]: value
        }));
    };




    //handle scroll
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
  
            if (sec1.current?.offsetTop && scrollPosition >= sec1.current.offsetTop && scrollPosition < sec2.current.offsetTop) {
                setActiveSection('sec1');
            }
            else if (sec2.current?.offsetTop && scrollPosition >= sec2.current.offsetTop) {
            setActiveSection('sec2');
        }};
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



    ////////////////////////////////////////////////READ DATA//////////////////////////////////////////////////
    // applicants
        const fetchApplicants = async () => {
            const querySnapshot = await getDocs(collection(db, 'applicant_infos'));
            const applicantData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setApplicants(applicantData);
        };

    // companies
        const fetchCompanies = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'company_infos'));
                const companyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCompanies(companyData);
        
                // Calculate total resumes for each company
                const totalResumesCount = {};
                for (const company of companyData) {
                    const resumesSnapshot = await getDocs(collection(db, `company_infos/${company.id}/applicants`));
                    totalResumesCount[company.id] = resumesSnapshot.size;
                }
                setTotalResumes(totalResumesCount);
            } catch (error) {
                console.error('Error fetching companies:', error);
            }
        };


    ////////////////////////////////////////////////DELETE DATA//////////////////////////////////////////////////
    // applicants
        const deleteApplicant = async (applicantId) => {
            try {
                await deleteDoc(doc(db, 'applicant_infos', applicantId));
                fetchApplicants();
            } catch (error) {
                console.error("Error deleting document: ", error);
                throw error; 
            }
        };
        
        const handleDeleteApplicant = async (applicantId, uid) => {
            try {
                await deleteApplicant(applicantId);
                console.log("Applicant deleted successfully!");
            } catch (error) {
                console.error("Error deleting applicant: ", error);
            }
        };

    // companies
    const handleDeleteCompany = async (companyId, uid) => {
        try {
            await deleteDoc(doc(db, 'company_infos', companyId));
            console.log('Company deleted successfully!');
            fetchCompanies(); // Refresh companies list
        } catch (error) {
            console.error('Error deleting company:', error);
        }
    };

    //Resume
    const deleteResume = async (applicantsId, companyId) => {
        try {
            await deleteDoc(doc(db, `company_infos/${companyId}/applicants`, applicantsId));
            // Fetch the updated resume data after deletion
            const resumesSnapshot = await getDocs(collection(db, `company_infos/${companyId}/applicants`));
            const updatedResumeData = resumesSnapshot.docs.map(doc => doc.data());
            setResumeData(updatedResumeData);
            console.log("Resume deleted successfully!");
        } catch (error) {
            console.error("Error deleting resume: ", error);
        }
    }

        
    //////////////////////////////////////////////UPDATE DATA/////////////////////////////////////////////////
    // aplicants
        const handleSaveEdit = async () => {
            try {
                await updateApplicant(selectedApplicant.id, editedApplicant);
                console.log("Applicant details updated successfully!");
                toggleEditApplicantModal(); 
            } catch (error) {
                console.error("Error updating applicant details: ", error);
            }
        };

        const updateApplicant = async (applicantId, updatedDetails) => {
            try {
                const applicantRef = doc(db, 'applicant_infos', applicantId);
                await updateDoc(applicantRef, updatedDetails);
                fetchApplicants(); 
            } catch (error) {
                console.error("Error updating applicant in Firestore: ", error);
                throw error;
            }
        };

    //companies
          const handleSaveCompanyEdit = async () => {
            try {
                await updateCompany(selectedCompany.id, editedCompany);
                console.log("Company details updated successfully!");
                toggleEditCompanyModal(); 
            } catch (error) {
                console.error("Error updating Company details: ", error);
            }
        };

        const updateCompany = async (companyId, updatedDetails) => {
            try {
                const companyRef = doc(db, 'company_infos', companyId);
                await updateDoc(companyRef, updatedDetails);
                fetchCompanies(); 
            } catch (error) {
                console.error("Error updating applicant in Firestore: ", error);
                throw error;
            }
        };

        useEffect(() => {
            fetchApplicants();
            fetchCompanies();
          }, []);

    

        //COUNT USERS
        useEffect(() => {
            const fetchTotalApplicants = async () => {
                try {
                    const querySnapshot = await getDocs(collection(db, 'applicant_infos'));
                    const totalApplicantsCount = querySnapshot.size;
                    setTotalApplicants(totalApplicantsCount);
                } catch (error) {
                    console.error('Error fetching total applicants: ', error);
                }
            };

            const fetchTotalCompanies = async () => {
                try {
                    const querySnapshot = await getDocs(collection(db, 'company_infos'));
                    const totalCompaniesCount = querySnapshot.size;
                    setTotalCompanies(totalCompaniesCount);
                } catch (error) {
                    console.error('Error fetching total companies: ', error);
                }
            };

            fetchTotalApplicants();
            fetchTotalCompanies();
        }, []);



        const generatedPDFApplicant = useReactToPrint({
            content: () => componentPDFapplicant.current,
            documentTitle: "Applicants User",
            onAfterPrint: ()=>("Data save successfully")
        });

        
        const generatedPDFCompany = useReactToPrint({
            content: () => componentPDFcompany.current,
            documentTitle: "Company User",
            onAfterPrint: ()=>("Data save successfully")
        });

        const generatedPDFResume = useReactToPrint({
            content: () => componentPDFresume.current,
            documentTitle: "Resumes",
            onAfterPrint: ()=>("Data save successfully")
        });
     
        const generatedPDFApplicantDetails= useReactToPrint({
            content: () => componentPDFapplicantDetails.current,
            documentTitle: "Resumes",
            onAfterPrint: ()=>("Data save successfully")
        });
     
        const generatedPDFCompanyDetails = useReactToPrint({
            content: () => componentPDFcompanyDetails.current,
            documentTitle: "Resumes",
            onAfterPrint: ()=>("Data save successfully")
        });
     
        const generateExcelFile = () => {
            // Convert applicants data to array of arrays
            const data = applicants.map(applicant =>
                     [  applicant.uid,
                        applicant.name,
                        applicant.email,
                        applicant.contact,
                        applicant.school,
                        applicant.degree,
                        applicant.yearGrad,
                        applicant.createdAt, 
                        applicant.lastSignedIn
                       ]);
        
            // Add header row
            data.unshift(['UID', 'Name', 'Email', 'Contact', 'School', 'Degree', 'Year Graduated',  'Date Created', 'Last Signed In']);
        
            // Create a workbook
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(data);

            ws['!rows'] = [{ hpx: 30, // Set height of header row
                             s: { bold: true, // Make header row bold
                          fill: { patternType: 'solid', fgColor: { rgb: 'FFC0C0C0' } } // Set background color
                        }
                  }];
        
            // Add the worksheet to the workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Applicants');
        
            // Save the workbook as an Excel file
            XLSX.writeFile(wb, 'applicants.xlsx');
          };

          const generateExcelFilecompany = () => {
            // Convert applicants data to array of arrays
            const data = companies.map(company =>
                     [  company.uid,
                        company.companyName,
                        company.email,
                        company.companyAddress,
                        company.companySite,
                        company.companySize,
                        company.companyType,
                        company.createdAt, 
                        company.lastSignedIn
                       ]);
        
            // Add header row
            data.unshift(['UID', 'Company Name', 'Company Email', 'Company Address', 'Company Site', 'Company Size', 'Company Type',  'Date Created', 'Last Signed In']);
        
            // Create a workbook
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(data);

            ws['!rows'] = [{ hpx: 30, // Set height of header row
                        s: { bold: true, // Make header row bold
                              fill: { patternType: 'solid', fgColor: { rgb: 'FFC0C0C0' } } // Set background color
                            }
                  }];
        
            // Add the worksheet to the workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Companies');
        
            // Save the workbook as an Excel file
            XLSX.writeFile(wb, 'companies.xlsx');
          };

    



  return (
    <div>
         <header className={styles.header}>
            <h2 className={styles.logo}>
              <img src={logo1} className={styles.logo1} />Statu
            </h2>
            <button className={styles.btn1}> Admin </button>
          <nav className={styles.navigation}>
            <button className={styles.btn}  onClick={() => scrollToSection(sec1, 'sec1')}> Applicant </button>
            <button className={styles.btn}  onClick={() => scrollToSection(sec2, 'sec2')}> Employer </button>
            <button className={styles.btn} onClick={toggleLogoutModal}> Logout </button>
          </nav>
        </header>

        <div className={styles.ctn}>
            <div className={styles.container} ref={sec1}>
                <div className={styles.section1}>
                    <h1 className={styles.title}> Overall Status </h1>
                        <div className={styles.bx1}>
                            <div className={styles.box1}>
                                <img src={pic} alt='email' className={styles.email}/> 
                                    <h1 className={styles.title1}> Registered Accounts </h1>
                            </div>
                            <div className={styles.line}></div>
                            <div className={styles.box2}>
                              <div ref={componentPDFapplicant}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr className={styles.row1}>
                                            <th className={styles.header1}> Accounts </th>
                                            <th className={styles.header2}> Date Created </th>
                                            <th className={styles.header3}> Signed In</th>
                                            <th className={styles.header4} colSpan="2"> Action </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {applicants.map(applicant => (
                                        <tr key={applicant.id} className={styles.row2}>
                                            <td className={styles.column1}> <FontAwesomeIcon icon={faUser} className={styles.faUser}/> {applicant.email} </td>
                                            <td className={styles.column2}> {applicant.createdAt} </td>
                                            <td className={styles.column3}> {applicant.lastSignedIn}</td>
                                            <td className={styles.column4} onClick={() => handleViewDetails(applicant)}> <FontAwesomeIcon icon={faTableList} className={styles.faUser} /> View Details </td>
                                            <td className={styles.column5} onClick={() => handleDeleteApplicant(applicant.id, applicant.uid)}> <FontAwesomeIcon icon={faTrashCan} className={styles.faUser}/> Delete </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                             </div>
                            </div>
                            <button className={styles.button} onClick={() => { generateExcelFile(); generatedPDFApplicant(); }}> Generate Report </button>
                        </div>
                </div>
                <div className={styles.section2}>
                    <div className={styles.bx2}>
                        <div className={styles.box3}>
                           <div className={styles.circle}>
                                <h1 className={styles.number}> {totalApplicants} </h1> 
                           </div> 
                        </div>
                        <div className={styles.box4}>
                            <h1 className={styles.title2}> Registered Applicants </h1>
                            <p className={styles.text1}> <FontAwesomeIcon icon={faSquare} className={styles.faSquare}/> Verified Email </p>
                            <p className={styles.text1}> <FontAwesomeIcon icon={faSquare} className={styles.faSquare1}/> Not yet verified </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.container1} ref={sec2}>
            <div className={styles.section1}>
                    <h1 className={styles.title3}> Overall Status </h1>
                        <div className={styles.bx1}>
                            <div className={styles.box5}>
                                <img src={pic1} alt='email' className={styles.email}/> 
                                    <h1 className={styles.title4}> Registered Employer </h1>
                            </div>
                            <div className={styles.line1}></div>
                            <div className={styles.box2}>
                             <div ref={componentPDFcompany}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr className={styles.row1}>
                                            <th className={styles.header5}> Accounts </th>
                                            <th className={styles.header6}> Date Created </th>
                                            <th className={styles.header7}> Signed In </th>
                                            <th className={styles.header8}> Resume </th>
                                            <th className={styles.header9} colSpan="2"> Action </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                      {companies.map(company => (
                                        <tr key={company.id} className={styles.row2}>
                                            <td className={styles.column6}> <FontAwesomeIcon icon={faUser} className={styles.faUser}/>  {company.email} </td>
                                            <td className={styles.column7}> {company.createdAt} </td>
                                            <td className={styles.column8}> {company.lastSignedIn}  </td>
                                            <td className={styles.column9}> <p className={styles.resumeCount} onClick={() => toggleResumeModal(company.id)}>  {totalResumes[company.id] || 0} </p> </td>
                                            <td className={styles.column10} onClick={() => handleViewCompanyDetails(company)}> <FontAwesomeIcon icon={faTableList} className={styles.faUser}/> View Details </td>
                                            <td className={styles.column11} onClick={() => handleDeleteCompany(company.id, company.uid)}> <FontAwesomeIcon icon={faTrashCan} className={styles.faUser}/> Delete </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                </table>
                              </div>
                            </div>
                            <button className={styles.button} onClick={() => { generateExcelFilecompany(); generatedPDFCompany(); }}> Generate Report </button>
                        </div>
                </div>
                <div className={styles.section2}>
                    <div className={styles.bx2}>
                        <div className={styles.box3}>
                            <div className={styles.circle}>
                                <h1 className={styles.number}> {totalCompanies} </h1> 
                           </div> 
                        </div>
                        <div className={styles.box4}>
                            <h1 className={styles.title2}> Registered Employers </h1>
                            <p className={styles.text1}> <FontAwesomeIcon icon={faSquare} className={styles.faSquare}/> Verified Email </p>
                            <p className={styles.text1}> <FontAwesomeIcon icon={faSquare} className={styles.faSquare1}/> Not yet verified </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        
        { resumeModal && (
            <div className={styles.modal}>
                <div className={styles.overlay}></div>
                    <div className={styles.modalcontent}>
                        <FontAwesomeIcon icon={faXmark} className={styles.close} onClick={toggleResumeModal} />
                            <h1 className={styles.modaltitle}> Uploaded Resume</h1> 
                                <div className={styles.box6}>
                                  <div ref={componentPDFresume}>
                                    <table className={styles.table1}>
                                        <thead>
                                            <tr className={styles.row1}>
                                                <th className={styles.header10}> Resume </th>
                                                <th className={styles.header11}> Created Date </th>
                                                <th className={styles.header111}> Action </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {resumeData.map((resume, index) => (
                                            <tr key={index} className={styles.row2}>
                                                <td className={styles.column12}> <FontAwesomeIcon icon={faUser} className={styles.faUser}/> {resume.email} </td>
                                                <td className={styles.column13}> {resume.dateAdded} </td>
                                                <td className={styles.column14}>  {selectedCompany && selectedCompany.id && (
                                                    <FontAwesomeIcon icon={faTrashCan} className={styles.faUser} 
                                                                    onClick={() => deleteResume(resume.id, selectedCompany.id)} /> 
                                                     )} Delete </td>
                                              </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                  </div>
                                </div>  
                        </div>
                </div>
        )}

        { applicantModal && (
            <div className={styles.modal}>
                <div className={styles.overlay}></div>
                    <div className={styles.modalcontent1}>
                        <FontAwesomeIcon icon={faXmark} className={styles.close}  onClick={toggleApplicantModal}/>
                            <h1 className={styles.modal1title}> Applicant Information </h1> 
                                <div className={styles.box7}>
                                  <div ref={componentPDFapplicantDetails}>
                                    <table className={styles.table2}>
                                        <thead>
                                            <tr className={styles.row1}>
                                                <td className={styles.header12}>  </td>
                                                <td className={styles.header13}> Details </td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Name </td>
                                                <td className={styles.column16}>  {selectedApplicant.name}</td>
                                            </tr>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Contact </td>
                                                <td className={styles.column16}>  {selectedApplicant.contact} </td>
                                            </tr>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Address </td>
                                                <td className={styles.column16}>  {selectedApplicant.address} </td>
                                            </tr>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> School </td>
                                                <td className={styles.column16}>  {selectedApplicant.school} </td>
                                            </tr>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Degree </td>
                                                <td className={styles.column16}> {selectedApplicant.degree} </td>
                                            </tr>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Year Graduated </td>
                                                <td className={styles.column16}>  {selectedApplicant.yearGrad} </td>
                                            </tr>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Company Name </td>
                                                <td className={styles.column16}>  {selectedApplicant.cna} </td>
                                            </tr>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Position</td>
                                                <td className={styles.column16}>  {selectedApplicant.jobTitle} </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                  </div>
                                </div> 
                            <div className={styles.modal1btnctn}> 
                                <button className={styles.modal1button} onClick={toggleEditApplicantModal}> Edit </button>
                            </div>
                    </div>
            </div>
        )}

        {editApplicantModal && (
            <div className={styles.modal}>
                <div className={styles.overlay}></div>
                <div className={styles.modalcontent1}>
                    <FontAwesomeIcon icon={faXmark} className={styles.close} onClick={toggleEditApplicantModal}/>
                    <h1 className={styles.modal1title}>Edit Applicant Details</h1> 
                    <div className={styles.box7}>
                        <table className={styles.table2}>
                            <thead>
                                <tr className={styles.row1}>
                                    <td className={styles.header12}></td>
                                    <td className={styles.header13}>Details</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className={styles.row2}>
                                    <td className={styles.column15}>Name</td>
                                    <td className={styles.column16}>
                                        <input
                                            type="text"
                                            name="name"
                                            className={styles.mtextbox}
                                            value={editedApplicant.name || selectedApplicant.name}
                                            onChange={handleEditChange}
                                        />
                                    </td>
                                </tr>
                                <tr className={styles.row2}>
                                    <td className={styles.column15}>Contact</td>
                                    <td className={styles.column16}>
                                        <input
                                            type="text"
                                            name="contact"
                                            className={styles.mtextbox}
                                            value={editedApplicant.contact || selectedApplicant.contact}
                                            onChange={handleEditChange}
                                        />
                                    </td>
                                </tr>
                                <tr className={styles.row2}>
                                    <td className={styles.column15}>Adress</td>
                                    <td className={styles.column16}>
                                        <input
                                            type="text"
                                            name="address"
                                            className={styles.mtextbox}
                                            value={editedApplicant.address || selectedApplicant.address}
                                            onChange={handleEditChange}
                                        />
                                    </td>
                                </tr>
                                <tr className={styles.row2}>
                                    <td className={styles.column15}>School</td>
                                    <td className={styles.column16}>
                                        <input
                                            type="text"
                                            name="school"
                                            className={styles.mtextbox}
                                            value={editedApplicant.school || selectedApplicant.school}
                                            onChange={handleEditChange}
                                        />
                                    </td>
                                </tr>
                                <tr className={styles.row2}>
                                    <td className={styles.column15}>Degree</td>
                                    <td className={styles.column16}>
                                        <input
                                            type="text"
                                            name="degree"
                                            className={styles.mtextbox}
                                            value={editedApplicant.degree || selectedApplicant.degree}
                                            onChange={handleEditChange}
                                        />
                                    </td>
                                </tr>
                                <tr className={styles.row2}>
                                    <td className={styles.column15}>Year Graduated</td>
                                    <td className={styles.column16}>
                                        <input
                                            type="text"
                                            className={styles.mtextbox}
                                            value={editedApplicant.yearGrad || selectedApplicant.yearGrad}
                                            onChange={handleEditChange}
                                        />
                                    </td>
                                </tr>
                                <tr className={styles.row2}>
                                    <td className={styles.column15}>Company Name</td>
                                    <td className={styles.column16}>
                                        <input
                                            type="text"
                                            name="cna"
                                            className={styles.mtextbox}
                                            value={editedApplicant.cna || selectedApplicant.cna}
                                            onChange={handleEditChange}
                                        />
                                    </td>
                                </tr>
                                <tr className={styles.row2}>
                                    <td className={styles.column15}>Position</td>
                                    <td className={styles.column16}>
                                        <input
                                            type="text"
                                            name="jobTitle"
                                            className={styles.mtextbox}
                                            value={editedApplicant.jobTitle || selectedApplicant.jobTitle}
                                            onChange={handleEditChange}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div> 
                    <div className={styles.modal1btnctn}> 
                        <button className={styles.modal1button} onClick={handleSaveEdit}>Save</button>
                    </div>
                </div>
            </div>
        )}

        { companyModal && (
             <div className={styles.modal}>
                <div className={styles.overlay}></div>
                    <div className={styles.modalcontent2}>
                        <FontAwesomeIcon icon={faXmark} className={styles.close}  onClick={toggleCompanyModal}/>
                            <h1 className={styles.modal2title}> Company Information </h1> 
                                <div className={styles.box8}>
                                  <div ref={componentPDFcompanyDetails}>
                                    <table className={styles.table3}>
                                        <thead>
                                            <tr className={styles.row1}>
                                                <td className={styles.header12}>  </td>
                                                <td className={styles.header13}> Details </td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Company Name </td>
                                                <td className={styles.column16}> {selectedCompany.companyName} </td>
                                            </tr>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Company Email </td>
                                                <td className={styles.column16}> {selectedCompany.email} </td>
                                            </tr>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Company Website </td>
                                                <td className={styles.column16}> {selectedCompany.companySite}</td>
                                            </tr>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Company Address </td>
                                                <td className={styles.column16}> {selectedCompany.companyAddress}  </td>
                                            </tr>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Company Type </td>
                                                <td className={styles.column16}> {selectedCompany.companyType} </td>
                                            </tr>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Company Size </td>
                                                <td className={styles.column16}> {selectedCompany.companySize} </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                  </div>
                                </div>
                                <div className={styles.modal2btnctn}> 
                                    <button className={styles.modal2button} onClick={toggleEditCompanyModal}> Edit </button>
                            </div>
                    </div>
            </div>

        )}

        { editCompanyModal && (
             <div className={styles.modal}>
                <div className={styles.overlay}></div>
                    <div className={styles.modalcontent2}>
                        <FontAwesomeIcon icon={faXmark} className={styles.close}  onClick={editCompanyModal}/>
                            <h1 className={styles.modal2title}> Company Details </h1> 
                                <div className={styles.box8}>
                                    <table className={styles.table3}>
                                        <thead>
                                            <tr className={styles.row1}>
                                                <td className={styles.header12}>  </td>
                                                <td className={styles.header13}> Details </td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Company Name </td>
                                                <td className={styles.column16}>
                                                    <input
                                                        type="text"
                                                        name="companyName"
                                                        className={styles.mtextbox}
                                                        value={editedCompany.companyName || selectedCompany.companyName}
                                                        onChange={handleEditCompanyChange}
                                                    />
                                                </td>
                                            </tr>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Company Email </td>
                                                <td className={styles.column16}>
                                                    <input
                                                        type="text"
                                                        name="companyEmail"
                                                        className={styles.mtextbox}
                                                        value={editedCompany.email || selectedCompany.email}
                                                        onChange={handleEditCompanyChange}
                                                    />
                                                </td>
                                            </tr>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Company Website </td>
                                                <td className={styles.column16}>
                                                    <input
                                                        type="text"
                                                        name="companySite"
                                                        className={styles.mtextbox}
                                                        value={editedCompany.companySite || selectedCompany.companySite}
                                                        onChange={handleEditCompanyChange}
                                                    />
                                                </td>
                                            </tr>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Company Address </td>
                                                <td className={styles.column16}>
                                                    <input
                                                        type="text"
                                                        name="companyAddress"
                                                        className={styles.mtextbox}
                                                        value={editedCompany.companyAddress || selectedCompany.companyAddress}
                                                        onChange={handleEditCompanyChange}
                                                    />
                                                </td>
                                            </tr>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Company Type </td>
                                                <td className={styles.column16}>
                                                    <input
                                                        type="text"
                                                        name="companyTye"
                                                        className={styles.mtextbox}
                                                        value={editedCompany.companyType || selectedCompany.companyType}
                                                        onChange={handleEditCompanyChange}
                                                    />
                                                </td>
                                            </tr>
                                            <tr className={styles.row2}>
                                                <td className={styles.column15}> Company Size </td>
                                                <td className={styles.column16}>
                                                    <input
                                                        type="text"
                                                        name="companySize"
                                                        className={styles.mtextbox}
                                                        value={editedCompany.companySize || selectedCompany.companySize}
                                                        onChange={handleEditCompanyChange}
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className={styles.modal2btnctn}> 
                                    <button className={styles.modal2button} onClick={handleSaveCompanyEdit}> Edit </button>
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
  )
}

export default Dashboard
