import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/ConfirmOrder.css";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, set, get } from "firebase/database";
import { getAuth } from "firebase/auth";

function ConfirmOrder() {
  const [orderDetails, setOrderDetails] = useState({ files: [], totalCost: 0 });
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  
  const auth = getAuth();
  const database = getDatabase();
  const storage = getStorage();

  useEffect(() => {
    // Retrieve file data and total cost from sessionStorage
    const storedFiles = sessionStorage.getItem('serializableFiles');
    const storedTotalCost = sessionStorage.getItem('totalCost');
    
    if (storedFiles && storedTotalCost) {
      const parsedFiles = JSON.parse(storedFiles);
      const totalCost = parseFloat(storedTotalCost);
      
      
      const fileObjects = window.FileStorage || {};
      
      
      const reconstructedFiles = parsedFiles.map((fileData, index) => {
        return {
          ...fileData,
          file: fileObjects[index] 
        };
      });
      
      
      const missingFiles = reconstructedFiles.filter(file => !file.file);
      
      if (missingFiles.length > 0) {
        console.error(`Missing File objects for ${missingFiles.length} files`);
        setError(`${missingFiles.length} files are missing data. Please go back and try again.`);
      }
      
      // Set order details
      setOrderDetails({
        files: reconstructedFiles,
        totalCost: totalCost
      });
    } else {
      // Redirect if no data found
      navigate('/xerox');
    }
    
    // Fetch username
    if (auth.currentUser) {
      fetchUsername(auth.currentUser.uid);
    }
  }, [navigate, auth.currentUser]);

  const fetchUsername = async (userId) => {
    try {
      const userRef = dbRef(database, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUsername(userData.name || userData.displayName || "User");
      } else {
        setUsername(auth.currentUser?.displayName || "User");
      }
    } catch (error) {
      console.error("Error fetching username:", error);
      setUsername(auth.currentUser?.displayName || "User");
    }
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleGoBack = () => {
    navigate('/xerox');
  };

  // Helper to convert File objects to Blob for Firebase upload
  const fileToBlob = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const blob = new Blob([reader.result]);
        resolve(blob);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const uploadFilesToFirebase = async (orderId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setError("User not authenticated. Please login again.");
      return null;
    }

    const fileDetailsArray = [];

    try {
      // Check if we have any files to upload
      console.log("Files to upload:", orderDetails.files.length);
      if (!orderDetails.files || orderDetails.files.length === 0) {
        setError("No files found for upload");
        return null;
      }

      // Upload each file and collect details
      for (let index = 0; index < orderDetails.files.length; index++) {
        const fileData = orderDetails.files[index];
        
        // Double check that file object exists
        if (!fileData.file) {
          console.error(`No file object at index ${index}`);
          setError(`Missing file data for file ${index + 1}. Please go back and try again.`);
          continue;
        }
        
        // Access the actual File object
        const file = fileData.file;
        console.log(`Processing file ${index}:`, file.name, file.type, file.size);
        
        if (!file.name || !file.type || file.size === 0) {
          console.error(`Invalid file at index ${index}`);
          setError(`File ${index + 1} is invalid. Please go back and try again.`);
          continue;
        }
        
        // Create a safe filename (replace spaces and special chars)
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        
        // Create a reference to the file path - store directly under the filename
        const fileStorageRef = storageRef(
          storage, 
          `pdfs/${orderId}/${safeFileName}`
        );
        
        // Convert File to Blob if needed (this helps with some file types)
        let fileBlob;
        try {
          fileBlob = await fileToBlob(file);
          console.log(`Created blob for ${file.name}, size: ${fileBlob.size}`);
        } catch (error) {
          console.error(`Error converting file to blob:`, error);
          setError(`Error processing ${file.name}. Please try again.`);
          continue;
        }
        
        try {
          // Upload file
          const snapshot = await uploadBytes(fileStorageRef, fileBlob);
          console.log(`Uploaded ${file.name} successfully!`);
          
          // Get download URL
          const downloadURL = await getDownloadURL(snapshot.ref);
          console.log(`Got download URL for ${file.name}: ${downloadURL}`);
          
          // Create simplified file details object with only the required structure
          const fileDetails = {
            [`color${index}`]: fileData.printType === "color" ? "Color" : "Black",
            [`format${index}`]: fileData.format,
            [`finalamt${index}`]: fileData.finalAmount.toFixed(2),
            [`name${index}`]: file.name,
            [`pages${index}`]: fileData.totalPages.toString(),
            [`perpage${index}`]: fileData.perPagePrice.toFixed(2),
            [`perqtyamt${index}`]: fileData.amountPerQuantity.toFixed(2),
            [`qty${index}`]: fileData.quantity.toString(),
            [`ratio${index}`]: fileData.ratio,
            [`sheet${index}`]: fileData.paperType,
            [`uri${index}`]: downloadURL,
            [`userid${index}`]: userId
          };
          
          fileDetailsArray.push(fileDetails);
          setUploadProgress(prev => Math.min(prev + (100 / orderDetails.files.length), 100));
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          setError(`Failed to upload ${file.name}. ${error.message}`);
        }
      }
      
      if (fileDetailsArray.length === 0) {
        setError("Failed to upload any files. Please try again.");
        return null;
      }
      
      return fileDetailsArray;
    } catch (error) {
      console.error("Error in uploadFilesToFirebase:", error);
      setError(`Failed to upload files: ${error.message}`);
      return null;
    }
  };

  const saveOrderToRealtimeDB = async (orderId, fileDetailsArray) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setError("User not authenticated. Please login again.");
      return false;
    }
  
    try {
      // Base order data that will be common for all files
      const baseOrderData = {
        orderid0: orderId,
        notes: notes,
        uploadTime: Date.now(),
        username: username,
        orderd: true,
        paid: false,
        delivered: false,
        deliveryamt0: "Free",
        grandTotal0: orderDetails.totalCost.toFixed(2)
      };
  
      // Save each file data separately under its safe file name
      for (let i = 0; i < fileDetailsArray.length; i++) {
        const fileDetail = fileDetailsArray[i];
        if (!fileDetail || !fileDetail[`name${i}`]) continue;
  
        const fileNameParts = fileDetail[`name${i}`].split('.');
        const nameWithoutExtension = fileNameParts.slice(0, -1).join('.');
        const extension = fileNameParts[fileNameParts.length - 1];
        
        // Replace only the characters not allowed in Firebase Realtime Database keys
        const safeFileName = nameWithoutExtension.replace(/[.#$\[\]]/g, '_') + '_' + extension;
      
        // Get spiral binding value for the specific file
        const hasSpiral = orderDetails.files[i].spiralBinding === true;
  
        // Merge common and file-specific data
        const completeOrderData = {
          ...baseOrderData,
          color0: fileDetail[`color${i}`],
          format0: fileDetail[`format${i}`],
          finalamt0: fileDetail[`finalamt${i}`],
          name0: fileDetail[`name${i}`],
          pages0: fileDetail[`pages${i}`],
          perpage0: fileDetail[`perpage${i}`],
          perqtyamt0: fileDetail[`perqtyamt${i}`],
          qty0: fileDetail[`qty${i}`],
          ratio0: fileDetail[`ratio${i}`],
          sheet0: fileDetail[`sheet${i}`],
          uri0: fileDetail[`uri${i}`],
          userid0: fileDetail[`userid${i}`],
          spiral: hasSpiral // This now correctly uses the spiral binding value for each file
        };
  
        const orderRef = dbRef(database, `pdfs/${userId}/${orderId}/${safeFileName}`);
        await set(orderRef, completeOrderData);
        console.log(`Saved order for ${safeFileName} with spiral = ${hasSpiral}`);
      }
  
      return true;
    } catch (error) {
      console.error("Error saving order to Realtime Database:", error);
      setError("Failed to save order. Please try again.");
      return false;
    }
  };
  

  const handleConfirmOrder = async () => {
    // Reset any previous errors
    setError("");
    
    // Check if user is authenticated
    if (!auth.currentUser) {
      setError("Please login to complete your order.");
      return;
    }
    
    // Check if there are files to upload
    if (!orderDetails.files || orderDetails.files.length === 0) {
      setError("No files selected for printing.");
      return;
    }
    
    // Verify all files have valid file objects
    const missingFiles = orderDetails.files.filter(fileData => !fileData.file);
    if (missingFiles.length > 0) {
      setError(`${missingFiles.length} files are missing data. Please go back and try again.`);
      return;
    }
    
    // Check if total amount is greater than 50
    if (orderDetails.totalCost < 50) {
      setError("Minimum order amount should be more than ₹50");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    // Generate a unique order ID
    const orderId = "d" + Date.now().toString().substring(0, 9);
    
    try {
      console.log("Starting file upload process...");
      
      // Upload files to Firebase Storage
      const uploadedFileDetails = await uploadFilesToFirebase(orderId);
      
      if (!uploadedFileDetails) {
        throw new Error("File upload failed");
      }
      
      console.log("Files uploaded successfully, saving to database...");
      
      // Save order details to Realtime Database
      const saveResult = await saveOrderToRealtimeDB(orderId, uploadedFileDetails);
      
      if (!saveResult) {
        throw new Error("Failed to save order details");
      }
      
      console.log("Order saved to database successfully");
      
      // Store order information for order history or confirmation
      const orderInfo = {
        orderId: orderId,
        files: orderDetails.files.map(file => ({
          name: file.file.name,
          pages: file.totalPages,
          quantity: file.quantity,
          finalAmount: file.finalAmount,
          spiralBinding: file.spiralBinding
        })),
        totalCost: orderDetails.totalCost,
        notes: notes,
        orderDate: new Date().toISOString(),
        status: "pending"
      };
      
      // Save order details to localStorage for order history
      const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      orderHistory.push(orderInfo);
      localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
      
      // Navigate to payment page
      navigate('/payment', { state: { orderInfo }});
      
    } catch (error) {
      console.error("Error during order confirmation:", error);
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="confirm-order-container">
      <div className="header">
 
  <h1 className="title1">Confirm Order</h1>
</div>
      
      <div className="order-summary-section">
        <h2>Order Summary</h2>
        
        {/* File details list similar to the Android RecyclerView */}
        <div className="files-list">
          {orderDetails.files.map((fileData, index) => (
            <div key={index} className="file-item">
              <div className="file-name">
                {fileData.file ? fileData.file.name : "Unnamed File"}
                {!fileData.file && <span className="file-error"> (File data missing)</span>}
              </div>
              <div className="file-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Pages:</span>
                  <span className="detail-value">{fileData.totalPages}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Paper:</span>
                  <span className="detail-value">{fileData.paperType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Print:</span>
                  <span className="detail-value">{fileData.printType === "color" ? "Color" : "B&W"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Format:</span>
                  <span className="detail-value">{fileData.format}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Ratio:</span>
                  <span className="detail-value">{fileData.ratio}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Quantity:</span>
                  <span className="detail-value">{fileData.quantity}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Binding:</span>
                  <span className="detail-value">{fileData.spiralBinding ? "Yes" : "No"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Per Page:</span>
                  <span className="detail-value">₹{fileData.perPagePrice.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Amount per qty:</span>
                  <span className="detail-value">₹{fileData.amountPerQuantity.toFixed(2)}</span>
                </div>
                <div className="detail-item final-amount">
                  <span className="detail-label">Final Amount:</span>
                  <span className="detail-value">₹{fileData.finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Notes field similar to the Android implementation */}
        <div className="notes-section">
          <label htmlFor="notes">Additional Notes:</label>
          <textarea
            id="notes"
            value={notes}
            onChange={handleNotesChange}
            placeholder="Add any special instructions here..."
            rows={3}
          />
        </div>
      </div>
      
      {/* Price summary section similar to the Android layout */}
      <div className="price-summary">
        <div className="price-row">
          <span className="price-label">Subtotal:</span>
          <span className="price-value">₹{orderDetails.totalCost.toFixed(2)}</span>
        </div>
        <div className="price-row">
          <span className="price-label">Delivery Fee:</span>
          <span className="price-value">Free</span>
        </div>
        <div className="price-row total">
          <span className="price-label">Total:</span>
          <span className="price-value">₹{orderDetails.totalCost.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Error message display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {/* Upload progress indicator */}
      {isUploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <span>Uploading files: {Math.round(uploadProgress)}%</span>
        </div>
      )}
      
      {/* Confirm order button */}
      <button 
        className="confirm-order-button"
        onClick={handleConfirmOrder}
        disabled={isUploading || orderDetails.files.length === 0}
      >
        {isUploading ? "Uploading Files..." : "Confirm Order"}
      </button>
      
      {/* Minimum order warning */}
      {orderDetails.totalCost < 50 && (
        <div className="minimum-order-warning">
          Minimum order amount should be more than ₹50
        </div>
      )}
    </div>
  );
}

export default ConfirmOrder;