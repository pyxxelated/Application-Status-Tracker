import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Elogin from './components/Elogin';
import Eregi from './components/Eregi';
import Landing from './components/Landing';
import UserAuthContext  from './context/UserAuthContext';
import Edashboard from './components/Edashboard';
import Eapplications from './components/Eapplications';
import Alogin from './components/Alogin';
import Aregi from './components/Aregi';
import Adashboard from './components/Adashboard';
import Astatus from './components/Astatus';


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
            <Route path='Alogin' element={<Alogin/>}/>
            <Route path='Aregi' element={<Aregi/>}/>
            <Route path='Adashboard' element={<Adashboard/>}/>
            <Route path='Astatus' element={<Astatus/>}/>
          </Routes>
        </UserAuthContext>
      </Router>
    </>
    
  );
}

export default App;
