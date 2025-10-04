import React, { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, set, get, remove } from 'firebase/database';
import '../css/Tempadmincontrol.css';

function Tempadmincontrol() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const adminRef = ref(database, 'tempadmin1');
      const snapshot = await get(adminRef);
      
      if (snapshot.exists()) {
        const adminData = snapshot.val();
        const adminList = Object.keys(adminData).map(key => ({
          id: key,
          ...adminData[key]
        }));
        setAdmins(adminList);
      } else {
        setAdmins([]);
      }
    } catch (err) {
      console.error('Error fetching admin details:', err);
      setError('Failed to fetch admin details');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !name) {
      setError('Please enter both email and name');
      return;
    }

    try {
      setIsLoading(true);
     
      
      // Sanitize email to be a valid Firebase key
      const sanitizedEmail = email.replace(/\./g, ',');
      
      // Create user data object
      const userData = {
        email: email,
        name: name,
        
      };
      
      
      
      // Set data in tempadmin using sanitized email as the key
      const adminRef2 = ref(database, `tempadmin/${sanitizedEmail}`);
      await set(adminRef2, userData);

      // Clear form and show success message
      setEmail('');
      setName('');
      setSuccess('Admin details added successfully!');
      setError('');

      // Refresh the admin list
      fetchAdmins();
    } catch (err) {
      console.error('Error adding admin details:', err);
      setError('Failed to add admin details');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle admin deletion
  const handleDeleteAdmin = async (admin, e) => {
    e.stopPropagation(); // Prevent navigation when clicking delete button
    
    if (window.confirm(`Are you sure you want to remove ${admin.name} as an admin?`)) {
      try {
        setIsLoading(true);
        // First get the complete admin data from tempadmin1
        const adminRef1 = ref(database, `tempadmin1/${admin.id}`);
        const snapshot = await get(adminRef1);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          
          // Format the email to use as a key (replace dots with commas)
          const emailKey = userData.email.replace(/\./g, ',');
          
          // Move the admin to the users node using their userId
          const userRef = ref(database, `users/${admin.id}`);
          await set(userRef, userData);
          
          // Remove from tempadmin1 using userId
          await remove(adminRef1);
          
          // Also remove from tempadmin using the email key
          const adminRef2 = ref(database, `tempadmin/${emailKey}`);
          await remove(adminRef2);
          
          // Refresh the admin list
          fetchAdmins();
          setSuccess(`${admin.name} removed from admin role successfully`);
        } else {
          setError('Failed to find admin data');
        }
      } catch (err) {
        console.error('Error handling admin deletion:', err);
        setError('Failed to delete admin');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Filter admins based on search query
  const filteredAdmins = admins.filter(admin => 
    admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        
        <h1 className="page-title">Temp Admin Control</h1>
        <div className="spacer"></div>
      </div>
      
      <div className="admin-form-container">
        <h2 className="section-title">Add New Admin</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                id="email"
                type="email" 
                placeholder="Enter Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                id="name"
                type="text" 
                placeholder="Enter Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="add-button"
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Admin'}
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="search-container">
        <input
          type="text"
          placeholder="Search admins by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="admin-list-container">
        <h2 className="section-title">Current Admins</h2>
        {isLoading ? (
          <div className="loading-indicator">Loading admins...</div>
        ) : filteredAdmins.length === 0 ? (
          <p className="no-data-message">No admins found</p>
        ) : (
          <div className="admin-list">
            {filteredAdmins.map((admin) => (
              <div 
                key={admin.id}
                className="admin-card"
                onClick={() => window.location.href = `/viewAdminProfile/${admin.id}`}
              >
                <div className="admin-info">
                  <div className="admin-avatar">
                    <img 
                      src={admin.profileuri || '/person3.jpg'}
                      alt={admin.name}
                      onError={(e) => { e.target.src = '/person3.jpg'; }}
                    />
                  </div>
                  <div className="admin-details">
                    <div className="admin-name">{admin.name}</div>
                    <div className="admin-email">{admin.email}</div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteAdmin(admin, e)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tempadmincontrol;