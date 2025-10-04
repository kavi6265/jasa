import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, update, set } from 'firebase/database';
import '../css/XeroxOrderpreviewtempadmin.css';
import { useParams, useNavigate } from 'react-router-dom';

function XeroxOrderpreviewtempadmin() {
  const { userId, orderId, gt } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState({
    orderId: '',
    grandTotal: '',
    username: '',
    deliveryAmount: '',
    paid: false,
    delivered: false,
    address: '',
    userId: '',
    phoneNumber: '',
    deliveryTime: '' // Added deliveryTime field
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState({}); 

  const auth = getAuth();
  const database = getDatabase();
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          // Redirect to login if not authenticated
          window.location.href = '/login';
          return;
        }
        
        // Get URL parameters
        const grandTotal = gt || '0'; // Default to '0' if not provided

        console.log("OrderID:", orderId);
        console.log("UserID:", userId);
        console.log("Grand Total:", grandTotal);
        
        if (!orderId || !userId) {
          console.error("Missing required parameters. OrderID:", orderId, "UserID:", userId);
          // Don't redirect, just show empty state
        }
        
        // Set initial order details with values from URL parameters
        setOrderDetails({
          orderId: orderId || '',
          grandTotal: grandTotal || '0',
          username: '',
          deliveryAmount: '',
          paid: false,
          delivered: false,
          address: '',
          userId: userId || '',
          phoneNumber: '',
          deliveryTime: '' // Initialize deliveryTime
        });
        
        if (userId && orderId) {
          // Fetch user's phone number from Firebase
          const userRef = ref(database, `users/${userId}`);
          const userSnapshot = await get(userRef);
          
          let phoneNumber = 'N/A';
          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            phoneNumber = userData.phno || 'N/A';
          }
          
          // Fetch order details from Firebase
          const pdfsRef = ref(database, `pdfs/${userId}/${orderId}`);
          const pdfsSnapshot = await get(pdfsRef);
          
          // FIX: Correctly fetch address and deliveryTime from uploadscreenshots reference
          let address = '';
          let deliveryTime = ''; // Added deliveryTime variable
          const uploadScreenshotsRef = ref(database, `uploadscreenshots/${orderId}`);
          const uploadScreenshotsSnapshot = await get(uploadScreenshotsRef);
          
          if (uploadScreenshotsSnapshot.exists()) {
            const screenshotData = uploadScreenshotsSnapshot.val();
            address = screenshotData.address || '';
            deliveryTime = screenshotData.deliveryTime || 'Not specified'; // Get deliveryTime
          }
          
          // If address is still empty, try from orders reference as fallback
          if (!address) {
            console.log("Fetching address from orders reference");
            const ordersRef = ref(database, `orders/${userId}/${orderId}`);
            const ordersSnapshot = await get(ordersRef);
            
            if (ordersSnapshot.exists()) {
              const orderData = ordersSnapshot.val();
              address = orderData.address || '';
            }
          }
          
          const filesList = [];
          let firstFile = null;
          
          if (pdfsSnapshot.exists()) {
            pdfsSnapshot.forEach((fileSnapshot) => {
              const fileData = fileSnapshot.val();
              
              // Save the first file data to extract common order details
              if (!firstFile) {
                firstFile = fileData;
                
                // Update order details from first file
                setOrderDetails({
                  orderId: orderId || '',
                  grandTotal: fileData.grandTotal0 || grandTotal,
                  username: fileData.username || 'User',
                  deliveryAmount: fileData.deliveyamt0 || 'Free',
                  paid: fileData.paid || false,
                  delivered: fileData.delivered || false,
                  address: address, // Set the address we fetched
                  userId: userId || '',
                  phoneNumber: phoneNumber, // Add the phone number
                  deliveryTime: deliveryTime // Add the delivery time
                });
              }
              
              filesList.push({
                id: fileSnapshot.key,
                name: fileData.name0 || '',
                uri: fileData.uri0 || '',
                copies: fileData.qty0 || 1,
                pages: fileData.pages0 || 1,
                printType: fileData.color0 || 'Black & White',
                format: fileData.format0 || 'Single Side',
                sheet: fileData.sheet0 || 'A4',
                ratio: fileData.ratio0 || '1:1',
                pricePerPage: fileData.perpage0 || 0,
                finalAmount: fileData.finalamt0 || 0,
                uploadTime: fileData.uploadTime || 0,
                notes: fileData.notes || '',
                spiral: fileData.spiral || false
              });
            });
          }
          
          setFiles(filesList);
          
          // Initialize download status for each file
          const initialDownloadStatus = {};
          filesList.forEach(file => {
            initialDownloadStatus[file.id] = 'ready';
          });
          setDownloadStatus(initialDownloadStatus);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [auth, database, orderId, userId, gt]);
  
  // Function to handle confirming order
  const handleConfirmOrder = async () => {
    try {
      setProcessingOrder(true);
      const { orderId, userId } = orderDetails;
      
      if (!orderId || !userId) {
        alert('Order information is incomplete');
        setProcessingOrder(false);
        return;
      }
      
      // Variables to track completion status
      let dev = false;
      let up = false;
      
      // First update the delivered status for all files in this order
      const pdfsRef = ref(database, `pdfs/${userId}/${orderId}`);
      const pdfsSnapshot = await get(pdfsRef);
      
      if (pdfsSnapshot.exists()) {
        // Process each file in the order
        const filePromises = [];
        const copyPromises = [];
        
        pdfsSnapshot.forEach((fileSnapshot) => {
          // 1. Update delivered status in pdfs
          const updatePromise = update(ref(database, `pdfs/${userId}/${orderId}/${fileSnapshot.key}`), {
            delivered: true
          });
          filePromises.push(updatePromise);
          
          // 2. Copy data to orderstempadmin (similar to Android code)
          const fileData = fileSnapshot.val();
          if (fileData) {
            // First set the basic file data
            const copyPromise = set(ref(database, `orderstempadmin/${orderId}/${fileSnapshot.key}`), fileData)
              .then(() => {
                // Then update the delivered status after the copy
                return update(ref(database, `orderstempadmin/${orderId}/${fileSnapshot.key}`), {
                  delivered: true
                });
              });
            copyPromises.push(copyPromise);
          }
        });
        
        // Wait for pdfs updates to complete
        await Promise.all(filePromises);
        dev = true;
        
        // Wait for copying to orderstempadmin to complete
        await Promise.all(copyPromises);
        up = true;
        
        // Also update the main order status if it exists
        await update(ref(database, `orders/${userId}/${orderId}`), {
          delivered: true
        });
        
        // Update local state
        setOrderDetails(prev => ({
          ...prev,
          delivered: true
        }));
        
        if (dev && up) {
          alert('Order processed successfully!');
          // Navigate to main admin page
          navigate('/admin/dashboard');
        }
      } else {
        alert('No files found for this order');
      }
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Failed to process order: ' + error.message);
    } finally {
      setProcessingOrder(false);
    }
  };
  
  // Enhanced function to handle individual file download
  // Enhanced function to handle individual file download
  const handleDownloadPDF = (file) => {
    const link = document.createElement('a');
    link.href = file.uri;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Get download button text based on status
  const getDownloadButtonText = (fileId) => {
    switch(downloadStatus[fileId]) {
      case 'downloading':
        return 'Downloading...';
      case 'completed':
        return 'Downloaded!';
      case 'error':
        return 'Try Again';
      default:
        return 'Download PDF';
    }
  };
  
  // Get download button class based on status
  const getDownloadButtonClass = (fileId) => {
    const baseClass = 'download-buttoni';
    switch(downloadStatus[fileId]) {
      case 'downloading':
        return `${baseClass} downloadingi`;
      case 'completed':
        return `${baseClass} completedi`;
      case 'error':
        return `${baseClass} errori`;
      default:
        return baseClass;
    }
  };
  
  if (loading) {
    return (
      <div className="profile-loadingi">
        <div className="spinneri"></div>
        <p className="loading-texti">Loading order details...</p>
      </div>
    );
  }
  
  return (
    <div className="xerox-preview-containeri">
      <div className="preview-headeri">
        <h2 className="admin-titlei">Order Details</h2>
        <div className="order-id-displayi">#{orderDetails.orderId}</div>
      </div>
      
      <div className="order-summaryi">
        <div className="summary-cardi">
          <div className="order-details-gridi">
            <div className="order-detail-itemi">
              <span className="detail-labeli">Customer:</span> 
              <span className="detail-valuei">{orderDetails.username}</span>
            </div>
            <div className="order-detail-itemi">
              <span className="detail-labeli">Phone:</span> 
              <span className="detail-valuei">{orderDetails.phoneNumber}</span>
            </div>
            <div className="order-detail-itemi">
              <span className="detail-labeli">Delivery:</span> 
              <span className="detail-valuei">{orderDetails.deliveryAmount}</span>
            </div>
            <div className="order-detail-itemi">
              <span className="detail-labeli">Status:</span> 
              <span className={`status-badgei ${orderDetails.delivered ? 'deliveredi' : 'pendingi'}`}>
                {orderDetails.delivered ? 'Delivered' : 'Pending'}
              </span>
            </div>
            
            <div className="order-detail-itemi address-itemi">
              <span className="detail-labeli">Delivery Address:</span> 
              <span className="detail-valuei addressi">{orderDetails.address || 'Not provided'}</span>
            </div>
            
            {/* Added Delivery Time Display */}
            <div className="order-detail-itemi delivery-time-itemi">
              <span className="detail-labeli">Delivery Time:</span> 
              <span className="detail-valuei delivery-timei">{orderDetails.deliveryTime || 'Not specified'}</span>
            </div>
          </div>
          
          <div className="admin-actionsi">
            <button 
              className="confirm-order-buttoni"
              onClick={handleConfirmOrder}
              disabled={processingOrder || orderDetails.delivered}
            >
              {processingOrder ? 'Processing...' : orderDetails.delivered ? 'Order Confirmed' : 'Confirm Order'}
            </button>
          </div>
        </div>
      </div>
      
      {files.length === 0 ? (
        <div className="no-files-messagei">
          <p className="empty-messagei">No files found for this order</p>
        </div>
      ) : (
        <div className="files-containeri">
          <h3 className="section-titlei">Files ({files.length})</h3>
          <div className="files-listi">
            {files.map((file, index) => (
              <div key={file.id || index} className="file-itemi">
                <div className="file-headeri">
                  <div className="file-name-containeri">
                    <span className="file-iconi">📄</span>
                    <div className="file-namei">{file.name || 'Unnamed Document'}</div>
                  </div>
                  <div className="upload-timei">Uploaded: {formatDate(file.uploadTime)}</div>
                </div>
                
                <div className="file-infoi">
                  <div className="file-detailsi">
                    <div className="detail-groupi">
                      <div className="detail-itemi">
                        <span className="detail-labeli">Pages:</span> 
                        <span className="detail-valuei">{file.pages}</span>
                      </div>
                      <div className="detail-itemi">
                        <span className="detail-labeli">Copies:</span> 
                        <span className="detail-valuei">{file.copies}</span>
                      </div>
                    </div>
                    
                    <div className="detail-groupi">
                      <div className="detail-itemi">
                        <span className="detail-labeli">Print:</span> 
                        <span className="detail-valuei">{file.printType}</span>
                      </div>
                      <div className="detail-itemi">
                        <span className="detail-labeli">Format:</span> 
                        <span className="detail-valuei">{file.format}</span>
                      </div>
                    </div>
                    
                    <div className="detail-groupi">
                      <div className="detail-itemi">
                        <span className="detail-labeli">Sheet:</span> 
                        <span className="detail-valuei">{file.sheet}</span>
                      </div>
                      <div className="detail-itemi">
                        <span className="detail-labeli">Ratio:</span> 
                        <span className="detail-valuei">{file.ratio}</span>
                      </div>
                    </div>
                    
                    <div className="detail-groupi">
                      <div className="detail-itemi">
                        <span className="detail-labeli">Price/Page:</span> 
                        <span className="detail-valuei">₹{file.pricePerPage}</span>
                      </div>
                      <div className="detail-itemi">
                        <span className="detail-labeli">Amount:</span> 
                        <span className="detail-valuei amounti">₹{file.finalAmount}</span>
                      </div>
                    </div>
                    
                    <div className="detail-itemi">
                      <span className="detail-labeli">Spiral Binding:</span> 
                      <span className="detail-valuei">{file.spiral ? "Yes" : "No"}</span>
                    </div>
                  </div>
                  
                  {file.notes && (
                    <div className="file-notesi">
                      <span className="notes-labeli">Notes:</span> 
                      <p className="notes-contenti">{file.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="file-actionsi">
                  <button 
                    className={getDownloadButtonClass(file.id)}
                    onClick={() => handleDownloadPDF(file)}
                    disabled={!file.uri || downloadStatus[file.id] === 'downloading'}
                  >
                    {getDownloadButtonText(file.id)}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bottom-actionsi">
            <div className="grand-totali">
              <span className="total-labeli">Total Amount:</span> 
              <span className="total-valuei">₹{orderDetails.grandTotal}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default XeroxOrderpreviewtempadmin;