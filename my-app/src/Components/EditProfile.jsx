import "../css/EditProfile.css";
import React, { useState, useEffect, useRef } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, set, get, child } from 'firebase/database';

const EditProfile = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const auth = getAuth();
  const storage = getStorage();
  const database = getDatabase();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      // Load user data when component mounts
      loadUserData();
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      const userRef = dbRef(database, `users/${currentUser.uid}`);
      
      // Get name
      const nameSnapshot = await get(child(userRef, 'name'));
      if (nameSnapshot.exists()) {
        setName(nameSnapshot.val());
      }
      
      // Get phone number
      const phoneSnapshot = await get(child(userRef, 'phno'));
      if (phoneSnapshot.exists()) {
        setPhoneNumber(phoneSnapshot.val());
      }
      
      // Get profile image
      const profileImageSnapshot = await get(child(userRef, 'profileImageUrl'));
      if (profileImageSnapshot.exists() && profileImageSnapshot.val()) {
        // Only use the URL if it exists and is not null
        setImagePreview(profileImageSnapshot.val());
      } else {
        // Set default profile image if URL doesn't exist or is null
        setImagePreview('person3.jpg');
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 10 digits
    if (/^\d{0,10}$/.test(value)) {
      setPhoneNumber(value);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !phoneNumber.trim()) {
      alert('All fields are required');
      return;
    }
    
    setUploading(true);
    
    try {
      // Update profile name
      await updateProfile(currentUser, {
        displayName: name
      });
      
      // Update database info
      const userRef = dbRef(database, `users/${currentUser.uid}`);
      await set(child(userRef, 'name'), name);
      await set(child(userRef, 'phno'), phoneNumber);
      
      setIsSuccess(true);
      
      // If image was changed, upload it
      if (imageFile) {
        await uploadProfileImage();
      } else {
        setUploading(false);
        handleSuccess();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('Failed to update profile');
      setUploading(false);
    }
  };
  
  const uploadProfileImage = async () => {
    try {
      const imageRef = storageRef(storage, `profileimages/${currentUser.uid}`);
      
      // Upload image
      await uploadBytes(imageRef, imageFile);
      
      // Get download URL - corrected function name
      const downloadURL = await getDownloadURL(imageRef);
      
      // Update profile image URL in database
      const userRef = dbRef(database, `users/${currentUser.uid}`);
      await set(child(userRef, 'profileImageUrl'), downloadURL);
      
      alert('Image uploaded successfully');
      setUploading(false);
      handleSuccess();
    } catch (error) {
      console.error("Error uploading image:", error);
      alert('Failed to upload image');
      setUploading(false);
      
      // If other profile updates were successful, still consider it a success
      if (isSuccess) {
        handleSuccess();
      }
    }
  };
  
  const handleSuccess = () => {
    if (isSuccess) {
      alert('Profile updated successfully');
      
      window.history.back();
    }
  };

  return (
    <div className="edit-profile-container">
      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="edit-profile-form">
          <div className="profile-image-container" onClick={handleImageClick}>
            <img 
              src={imagePreview} 
              alt="Profile" 
              className="profile-image1"
            />
            <div className="change-photo-overlay">
              <span>Change Photo</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>
          
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input 
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input 
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="Phone Number"
                required
                maxLength="10"
              />
            </div>
            
            <button 
              type="submit" 
              className="save-button"
              disabled={uploading}
            >
              {uploading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}
      
      {uploading && (
        <div className="upload-overlay">
          <div className="upload-spinner"></div>
          <p>Updating profile...</p>
        </div>
      )}
    </div>
  );
};

export default EditProfile;