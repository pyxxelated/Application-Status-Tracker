import React, {useState} from 'react'
import styles from './styles/Admin.module.css'
import logo1 from '../assets/logo1.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons'


function Admin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin') {
      // Redirect to the dashboard
      window.location.href = '/1a0fe243-d246-4ed2-8ed8-a23d75f7da16'; // You can replace this with your actual dashboard route
    } else {
      setError('Invalid username or password');
    }
  };


  
  return (
    <div>
      <div className={styles.ctn}>
        <div className={styles.box}>
            <h2 className={styles.logo}>
              <img src={logo1} className={styles.logo1} />Statu
            </h2>
            <p className={styles.text}> Email: </p>
              <span className={styles.txtIcon}> <FontAwesomeIcon icon = {faUser}/> </span>
                <input type="text" className={styles.textbox}
                       value={username}
                       onChange={(e) => setUsername(e.target.value)}/>
            <p className={styles.text}> Password: </p>
              <span className={styles.txtIcon2}> <FontAwesomeIcon icon = {faLock}/> </span>
                <input type="password" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}className={styles.textbox}/>
            
              <div className={styles.error}>
              <p>{error}</p>
              </div>
            <button className={styles.button} onClick={handleLogin}> Login </button>
        </div>
      </div>
    </div>
  )
}

export default Admin
