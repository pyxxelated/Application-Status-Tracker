import { auth } from '../config/configure'; // Import Firebase authentication module

// Function to delete user account from Firebase Authentication
export const deleteUserAccount = async (uid) => {
  try {
    await auth.deleteUser(uid);
    console.log('Successfully deleted user account with UID:', uid);
  } catch (error) {
    console.error('Error deleting user account:', error);
  }
};