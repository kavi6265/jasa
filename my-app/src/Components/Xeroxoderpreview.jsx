import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import '../css/Xeroxorderpreview.css';

function Xeroxorderpreview() {
  const [orderDetails, setOrderDetails] = useState({
    orderId: '',
    grandTotal: '',
    username: '',
    deliveryAmount: '',
    paid: false,
    delivered: false,
    address: '',
    deliveryTime: '' // Added deliveryTime field
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

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
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('id');
        const grandTotal = urlParams.get('gt');
        const userid = urlParams.get('userid');
        
        if (!orderId) {
          window.location.href = '/xeroxordersuser';
          return;
        }
        
        setOrderDetails({
          orderId,
          grandTotal,
          username: '',
          deliveryAmount: '',
          paid: false,
          delivered: false,
          address: '',
          deliveryTime: '' // Initialize deliveryTime
        });
        
        // Determine which user ID to use for fetching PDF data
        const userIdToUse = userid || currentUser.uid;
        console.log(userIdToUse)
        const pdfsRef = ref(database, `pdfs/${userIdToUse}/${orderId}`);
        const pdfsSnapshot = await get(pdfsRef);
        
        // Fetch address and deliveryTime from uploadscreenshots reference
        const uploadScreenshotsRef = ref(database, `uploadscreenshots/${orderId}`);
        const uploadScreenshotsSnapshot = await get(uploadScreenshotsRef);
        
        let address = '';
        let deliveryTime = ''; // Added deliveryTime variable
        if (uploadScreenshotsSnapshot.exists()) {
          const screenshotData = uploadScreenshotsSnapshot.val();
          address = screenshotData.address || '';
          deliveryTime = screenshotData.deliveryTime || 'Not specified'; // Get deliveryTime
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
                orderId,
                grandTotal: fileData.grandTotal0 || grandTotal,
                username: fileData.username || currentUser.displayName || 'User',
                deliveryAmount: fileData.deliveyamt0 || 'Free',
                paid: fileData.paid || false,
                delivered: fileData.delivered || false,
                address: address, // Set the address from uploadscreenshots
                deliveryTime: deliveryTime // Set the delivery time from uploadscreenshots
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
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, []);
  
  // Function to handle individual file download
  const handleDownloadPDF = (file) => {
    const link = document.createElement('a');
    link.href = file.uri;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
 
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="xerox-preview-container">
      <div className="preview-header">
        <h2>Order Details</h2>
      </div>
      
      <div className="order-summary">
        <div className="order-details-grid">
          <div className="order-detail-item">
            <span>Order ID:</span> {orderDetails.orderId}
          </div>
          <div className="order-detail-item">
            <span>Customer:</span> {orderDetails.username}
          </div>
          <div className="order-detail-item">
            <span>Delivery:</span> {orderDetails.deliveryAmount}
          </div>
          <div className="order-detail-item">
            <span>Status:</span> 
            <span className={`status-badge ${orderDetails.delivered ? 'delivered' : 'pending'}`}>
              {orderDetails.delivered ? 'Delivered' : 'Pending'}
            </span>
          </div>
          <div className="order-detail-item address-item">
            <span>Delivery Address:</span> {orderDetails.address || 'Not provided'}
          </div>
          {/* Added Delivery Time Display */}
          <div className="order-detail-item delivery-time-item">
            <span>Delivery Time:</span> {orderDetails.deliveryTime || 'Not specified'}
          </div>
        </div>
      </div>
      
      {files.length === 0 ? (
        <div className="no-files-message">
          <p>No files found for this order</p>
        </div>
      ) : (
        <div className="files-container">
          <div className="files-list">
            {files.map((file, index) => (
              <div key={file.id || index} className="file-item">
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="upload-time">Uploaded: {formatDate(file.uploadTime)}</div>
                  
                  <div className="file-details">
                    <div className="detail-item">
                      <span>Pages:</span> {file.pages}
                    </div>
                    <div className="detail-item">
                      <span>Copies:</span> {file.copies}
                    </div>
                    <div className="detail-item">
                      <span>Print:</span> {file.printType}
                    </div>
                    <div className="detail-item">
                      <span>Format:</span> {file.format}
                    </div>
                    <div className="detail-item">
                      <span>Sheet:</span> {file.sheet}
                    </div>
                    <div className="detail-item">
                      <span>Ratio:</span> {file.ratio}
                    </div>
                    <div className="detail-item">
                      <span>Price/Page:</span> ₹{file.pricePerPage}
                    </div>
                    <div className="detail-item">
                      <span>Amount:</span> ₹{file.finalAmount}
                    </div>
                    <div className="detail-item">
                      <span>Spiral Binding:</span> {file.spiral ? "Yes" : "No"}
                    </div>
                  </div>
                  
                  {file.notes && (
                    <div className="file-notes">
                      <span>Notes:</span> {file.notes}
                    </div>
                  )}
                </div>
                <div className="file-actions">
                  <button 
                    className="view-button"
                    onClick={() => handleDownloadPDF(file)}
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bottom-actions">
            <div className="grand-total">
              <span>Total Amount:</span> ₹{orderDetails.grandTotal}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Xeroxorderpreview;