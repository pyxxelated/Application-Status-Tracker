
import { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../config/configure';
import { onAuthStateChanged, createUserWithEmailAndPassword,
         EmailAuthProvider, updatePassword, reauthenticateWithCredential, 
         deleteUser, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, 
         sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, getDocs, query, collection, writeBatch } from 'firebase/firestore';

const UserAuthContext = createContext();

export const useAuth = () => useContext(UserAuthContext);
  export const UserAuthProvider = ({ children }) => {
    const [currentuser, setCurrentuser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentuser(user);
        setLoading(false);
      });

      return () => unsubscribe();
    }, []);


  //upload company info
  const profileInformation = async (profile) => {
    try {
      if (!currentuser) {
        console.error('Current user is not defined.');
        return;
      }

      const updatedProfile = { ...profile, email: currentuser.email };
      const userDocRef = doc(db, 'company_infos', currentuser.uid);
      await setDoc(userDocRef, updatedProfile);
      console.log('User profile updated successfully!');
    } catch (error) {
      console.error('Error updating user profile information in Firestore:', error);
      throw error;
    }
  };


  //signup function
  const signUp = async (email, password, userType) => {
    try {
      if (!userType) {
        throw new Error('User type is required.');
      }
  
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Store user type in Firestore
      const userDocRef = doc(db, 'user', user.uid);
      await setDoc(userDocRef, { userType });
  
      return user;
    } catch (error) {
      console.error('Error signing up:', error.message);
      throw error;
    }
  };



  //signin function
  const signIn = async (email, password, userType) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Retrieve user type from Firestore
      const userDocRef = doc(db, 'user', user.uid);
      const userDocSnapshot = await getDoc(userDocRef);
      const userData = userDocSnapshot.data();
      
      if (userData && userData.userType === userType) {
        return user;
      } else {
        throw new Error('Invalid user type');
      }
    } catch (error) {
      console.error('Error signing in:', error.message);
      throw error;
    }
  };


  //email verification
  const sendVerificationEmail = async () => {
    try {
      if (!currentuser) {
        console.error('Current user is not defined.');
        return;
      }

      await sendEmailVerification(currentuser);
      console.log('Verification email sent successfully.');
    } catch (error) {
      console.error('Error sending verification email:', error.message);
      throw error;
    }
  };


  //reset password
  const resetPassword = async (currentPassword, newPassword) => {
    try {
      if (!currentuser) {
        throw new Error('User is not logged in.');
      }
  
      if (!newPassword) {
        throw new Error('New password is missing.');
      }
  
      const credential = EmailAuthProvider.credential(currentuser.email, currentPassword);
      await reauthenticateWithCredential(currentuser, credential);
      await updatePassword(currentuser, newPassword); // Use updatePassword function from Firebase
  
      console.log('Password reset successfully.');
    } catch (error) {
      console.error('Error resetting password:', error.message);
      throw error;
    }
  };


  //reauthenticate
  const reauthenticate = async (password) => {
    try {
      if (!currentuser) {
        throw new Error('User is not logged in.');
      }
  
      const credential = EmailAuthProvider.credential(
        currentuser.email,
        password
      );
  
      await reauthenticateWithCredential(currentuser, credential);
      console.log('User reauthenticated successfully.');
    } catch (error) {
      console.error('Error reauthenticating user:', error.message);
      throw error;
    }
  };

 
  //Delete account
  const deleteUserAccount = async (password) => {
    try {
      if (!currentuser) {
        throw new Error('User is not logged in.');
      }
  
      // Reauthenticate user before deleting account
      const credential = EmailAuthProvider.credential(currentuser.email, password);
      await reauthenticateWithCredential(currentuser, credential);
  
      // Delete account from Authentication
      await deleteUser(currentuser);
  
      // Delete user data from Firestore
      await deleteUserDataFromFirestore(currentuser.uid);
  
      console.log('User account and data deleted successfully.');
    } catch (error) {
      console.error('Error deleting account:', error.message);
      throw error;
    }
  };



  const deleteUserDataFromFirestore = async (currentuser) => {
    try {
      const batch = writeBatch(db); // Initialize a Firestore batch
  
      // Delete documents from 'company_infos' collection
      const companyInfoQuerySnapshot = await getDocs(query(collection(db, 'company_infos').where('uid', '==', currentuser.uid)));
      companyInfoQuerySnapshot.forEach((doc) => {
        batch.delete(doc.ref); // Add document reference to the batch for deletion
      });
  
      // Delete documents from 'user' collection
      const userQuerySnapshot = await getDocs(query(collection(db, 'user').where('uid', '==', currentuser.uid)));
      userQuerySnapshot.forEach((doc) => {
        batch.delete(doc.ref); // Add document reference to the batch for deletion
      });
  
      // Commit the batch operation
      await batch.commit();
  
      console.log('User data deleted from Firestore successfully.');
    } catch (error) {
      console.error('Error deleting user data from Firestore:', error.message);
      throw error;
    }
  };

  const value = {
    currentuser,
    signUp,
    signIn,
    profileInformation,
    signOut: () => signOut(auth),
    sendVerificationEmail,
    deleteUserAccount,
    reauthenticate,
    sendPasswordResetEmail,
    resetPassword,
    deleteUserDataFromFirestore,
  };

  return (
    <UserAuthContext.Provider value={value}>
      {!loading && children}
    </UserAuthContext.Provider>
  );
};

export default UserAuthProvider;