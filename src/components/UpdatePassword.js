import { auth } from '../config/configure';
import { updatePassword as updateCurrentUserPassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const UpdatePassword = async (currentPassword, newPassword) => {
  try {
    if (!auth.currentuser) {
      throw new Error('User not logged in.');
    }

    // Reauthenticate the user using their current password
    const credential = EmailAuthProvider.credential(auth.currentuser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentuser, credential);

    // Update the user's password to the new password using Firebase Auth method
    await updateCurrentUserPassword(auth.currentuser, newPassword);

    console.log('Password updated successfully.');
  } catch (error) {
    console.error('Error updating password:', error.message);
    throw error;
  }
};

export default UpdatePassword;