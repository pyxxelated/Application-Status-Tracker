import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Elogin from './components/Elogin';
import Eregi from './components/Eregi';
import Landing from './components/Landing';
import  UserAuthContext  from './context/UserAuthContext';
import Edashboard from './components/Edashboard';
import Eapplications from './components/Eapplications';
import VerifyEmail from './components/VerifyEmail';
import Alogin from './components/Alogin';
import Aregi from './components/Aregi';
import Adashboard from './components/Adashboard'
import Admin from './components/Admin';
import Dashboard from './components/Dashboard';
import Logout from './components/Logout';

function App() {
  return (
    <>
      <Router>
        <UserAuthContext>
          <Routes>
            <Route path='/' element={<Landing/>}/>
            <Route path='Elogin' element={<Elogin/>}/>
            <Route path='Eregi' element={<Eregi/>}/>
            <Route path='Edashboard' element={<Edashboard/>}/>
            <Route path='Eapplications' element={<Eapplications/>}/>
            <Route path='VerifyEmail' element={<VerifyEmail/>}/>
            <Route path='Alogin' element={<Alogin/>}/>
            <Route path='Aregi' element={<Aregi/>}/>
            <Route path='Adashboard' element={<Adashboard/>}/>
            <Route path='Admin' element={<Admin/>}/> 
            <Route path='1a0fe243-d246-4ed2-8ed8-a23d75f7da16' element={<Dashboard/>}/>
            <Route path= 'Logout' element={<Logout/>}/>
          </Routes>
        </UserAuthContext>
      </Router>
    </>
    
  );
}

export default App;
