import React, { useState } from 'react';
import styles from './styles/Logout.module.css';

function Logout() {
  const [logoutModal, setLogoutModal] = useState(false);

  const toggleLogoutModal = () => {
    setLogoutModal(!logoutModal);
  };
  
 

  return (
    <div>
       {logoutModal && (
        <div className={styles.logoutOverlay} onClick={toggleLogoutModal}>
          <div className={styles.logoutModal} onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to <br /> Log out?</p>
            <button className={styles.logoutButton}>
              Yes
            </button>
            <button className={styles.logoutButton} onClick={toggleLogoutModal}>
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Logout