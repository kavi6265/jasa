import React, { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase"; // Import auth from firebase
import "../css/Xerox.css";

function Xerox() {
  const [files, setFiles] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPreview, setShowPreview] = useState({}); // Track which preview is open
  const navigate = useNavigate();

  // Check authentication status when component mounts
  useEffect(() => {
    // Use Firebase auth state to determine if user is logged in
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setIsLoggedIn(!!currentUser);
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  // Function to toggle preview modal
  const togglePreview = (fileIndex, ratioType) => {
    const key = `${fileIndex}-${ratioType}`;
    setShowPreview(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Function to close all previews when clicking outside
  const closeAllPreviews = () => {
    setShowPreview({});
  };

  const handleAuthenticatedFileUpload = (e) => {
    if (e) e.preventDefault();
    
    if (!isLoggedIn) {
      sessionStorage.setItem('redirectAfterLogin', '/xerox');
      sessionStorage.setItem('loginMessage', 'Please log in to use our Xerox service');
      navigate('/login');
      return;
    }
    
    // If logged in, trigger the file input click
    document.getElementById('file-upload-input').click();
  };

  const handleFileUpload = async (event) => {
    // Make sure the user is logged in
    if (!isLoggedIn) {
      sessionStorage.setItem('redirectAfterLogin', '/xerox');
      sessionStorage.setItem('loginMessage', 'Please log in to use our Xerox service');
      navigate('/login');
      return;
    }

    const uploadedFiles = Array.from(event.target.files);
    
    // Log the files being uploaded for debugging
    console.log("Files being uploaded:", uploadedFiles);
    
    const newFiles = await Promise.all(
      uploadedFiles.map(async (file) => {
        let totalPages = 1;

        if (file.type === "application/pdf") {
          try {
            const reader = new FileReader();
            const pdfBytes = await new Promise((resolve, reject) => {
              reader.onload = () => resolve(reader.result);
              reader.onerror = (error) => reject(error);
              reader.readAsArrayBuffer(file);
            });
            
            const pdfDoc = await PDFDocument.load(pdfBytes);
            totalPages = pdfDoc.getPageCount();
            console.log(`PDF ${file.name} has ${totalPages} pages`);
          } catch (error) {
            console.error(`Error reading PDF ${file.name}:`, error);
            totalPages = 1; // Default to 1 if we can't read the PDF
          }
        }

        // Calculate initial pricing when adding files
        const perPagePrice = 1.30;
        const amountPerQuantity = perPagePrice * totalPages;
        
        // Create a new file data object with all necessary fields
        return {
          file: file, // Store the actual File object
          fileName: file.name, // Also store name separately in case File object gets lost
          fileType: file.type, 
          fileSize: file.size,
          paperType: "A4",
          printType: "black-white",
          ratio: "1:1",
          format: "Front Only",
          quantity: 1,
          spiralBinding: false,
          totalPages,
          perPagePrice,
          amountPerQuantity,
          finalAmount: amountPerQuantity
        };
      })
    );
    
    // Add new files to state
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    // Reset the file input value so the same file can be added again if needed
    event.target.value = "";
  };

  // Calculate prices without modifying state
  useEffect(() => {
    if (files.length === 0) return;
    
    let totalAmount = 0;
    
    files.forEach(fileData => {
      // Calculate per page price
      let perpage = 0;
      
      if (fileData.paperType === "A4") {
        if (fileData.printType === "color") {
          perpage = 10.0;
        } else {
          if (fileData.format === "Front Only" && fileData.ratio === "1:1") {
            perpage = 1.30;
          }
          if (fileData.format === "Front & Back" && fileData.ratio === "1:2") {
            perpage = 0.75;
          }
          if (fileData.format === "Front & Back" && fileData.ratio === "1:1") {
            perpage = 0.75;
          }
          if (fileData.format === "Front Only" && fileData.ratio === "1:2") {
            perpage = 1.30;
          }
        }
      } else {
        // For Bonafide/OHP paper
        perpage = 15.0;
      }
      
      // Calculate amount per quantity
      let amtperqty = perpage * fileData.totalPages;
      
      // Apply 1:2 ratio discount if applicable
      if (fileData.ratio === "1:2") {
        amtperqty = amtperqty / 2;
      }
      
      // Calculate final amount
      let finalamount = amtperqty * fileData.quantity;
      
      // Add spiral binding cost if selected
      if (fileData.spiralBinding) {
        finalamount += 20.0 * fileData.quantity;
      }
      
      totalAmount += finalamount;
    });
    
    // Only update the total cost, not the files
    setTotalCost(totalAmount);
  }, [files]); // Keep files as dependency

  // Create a separate function to recalculate a file when its properties change
  const handleChange = (index, field, value) => {
    const updatedFiles = [...files];
    updatedFiles[index][field] = value;
    
    // Recalculate this specific file's pricing
    const file = updatedFiles[index];
    
    // Calculate per page price
    let perpage = 0;
    
    if (file.paperType === "A4") {
      if (file.printType === "color") {
        perpage = 10.0;
      } else {
        if (file.format === "Front Only" && file.ratio === "1:1") {
          perpage = 1.30;
        }
        if (file.format === "Front & Back" && file.ratio === "1:2") {
          perpage = 0.75;
        }
        if (file.format === "Front & Back" && file.ratio === "1:1") {
          perpage = 0.75;
        }
        if (file.format === "Front Only" && file.ratio === "1:2") {
          perpage = 1.30;
        }
      }
    } else {
      // For Bonafide/OHP paper
      perpage = 15.0;
    }
    
    file.perPagePrice = perpage;
    
    // Calculate amount per quantity
    let amtperqty = perpage * file.totalPages;
    
    // Apply 1:2 ratio discount if applicable
    if (file.ratio === "1:2") {
      amtperqty = amtperqty / 2;
    }
    
    file.amountPerQuantity = amtperqty;
    
    // Calculate final amount
    let finalamount = amtperqty * file.quantity;
    
    // Add spiral binding cost if selected
    if (file.spiralBinding) {
      finalamount += 20.0 * file.quantity;
    }
    
    file.finalAmount = finalamount;
    
    setFiles(updatedFiles);
  };

  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const handleCheckout = () => {
    // Check authentication before proceeding to checkout
    if (!isLoggedIn) {
      sessionStorage.setItem('redirectAfterLogin', '/xerox');
      sessionStorage.setItem('loginMessage', 'Please log in to complete your order');
      navigate('/login');
      return;
    }
    
    // Create a copy of files without the File objects
    const serializableFiles = files.map(fileData => {
      // Create a new object with all properties except 'file'
      const { fileName, fileType, fileSize, paperType, printType, ratio, format, quantity, 
              spiralBinding, totalPages, perPagePrice, amountPerQuantity, finalAmount } = fileData;
      
      return {
        fileName,
        fileType, 
        fileSize,
        paperType,
        printType,
        ratio,
        format,
        quantity,
        spiralBinding,
        totalPages,
        perPagePrice,
        amountPerQuantity,
        finalAmount
      };
    });
    
    // Store files in sessionStorage (better for larger data)
    sessionStorage.setItem('serializableFiles', JSON.stringify(serializableFiles));
    sessionStorage.setItem('totalCost', totalCost.toString());
    
    // Create a temporary object to hold File objects
    const fileObjects = {};
    files.forEach((fileData, index) => {
      // Store each File object with an index key
      fileObjects[index] = fileData.file;
    });
    
    // IMPORTANT: Store files in FileStorage object (global)
    window.FileStorage = fileObjects;
    
    // Navigate to confirmation page
    navigate('/confirm-order');
  };

  // Component to render preview modal
  const PreviewModal = ({ isOpen, onClose, ratioType, fileIndex }) => {
    if (!isOpen) return null;

    const getPreviewContent = () => {
      if (ratioType === "1:1") {
        return (
          <div className="preview-content">
            <h3>1:1 Ratio (Single Side Printing)</h3>
            <div className="preview-image-container">
              <img 
                src="/onebyone.png" 
                alt="1:1 Ratio - Single Side Printing" 
                className="ratio-preview-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="image-fallback" style={{ display: 'none' }}>
                <div className="fallback-text">📄 Single Side Printing</div>
                <div className="fallback-description">Image not available</div>
              </div>
            </div>
            <p className="preview-description">
              Each page of your document is printed on one side of the paper. 
              For a 2-page document, you'll get 2 sheets of paper.
            </p>
            <div className="pricing-info">
              <strong>A4 B&W: ₹1.30 per page</strong>
            </div>
          </div>
        );
      } else {
        return (
          <div className="preview-content">
            <h3>1:2 Ratio (Double Side Printing)</h3>
            <div className="preview-image-container">
              <img 
                src="/onebytwo.png" 
                alt="1:2 Ratio - Double Side Printing" 
                className="ratio-preview-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="image-fallback" style={{ display: 'none' }}>
                <div className="fallback-text">📄 Double Side Printing</div>
                <div className="fallback-description">Image not available</div>
              </div>
            </div>
            <p className="preview-description">
              Two pages of your document are printed on both sides of one sheet. 
              For a 2-page document, you'll get 1 sheet of paper (front & back).
            </p>
            <div className="pricing-info">
              <strong>A4 B&W: ₹0.75 per page (50% savings!)</strong>
            </div>
          </div>
        );
      }
    };

    return (
      <div className="preview-modal-overlay" onClick={onClose}>
        <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
          <button className="preview-close-btn" onClick={onClose}>×</button>
          {getPreviewContent()}
        </div>
      </div>
    );
  };

  // Empty state UI when no files are selected
  const renderEmptyState = () => (
    <div className="empty-statexerox">
      <div className="empty-state-iconxerox">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      </div>
      <h2 className="empty-state-titlexerox">Ready to print your documents?</h2>
      <p className="empty-state-textxerox">
        Upload your PDFs or images and customize your printing options.
        We offer various paper types, color options, and binding services.
      </p>
      <div className="features-gridxerox">
        <div className="featurexerox">
          <div className="feature-iconxerox">📄</div>
          <div className="feature-textxerox">Multiple paper types</div>
        </div>
        <div className="featurexerox">
          <div className="feature-iconxerox">🖨️</div>
          <div className="feature-textxerox">B&W or color printing</div>
        </div>
        <div className="featurexerox">
          <div className="feature-iconxerox">📎</div>
          <div className="feature-textxerox">Spiral binding</div>
        </div>
        <div className="featurexerox">
          <div className="feature-iconxerox">💰</div>
          <div className="feature-textxerox">Affordable pricing</div>
        </div>
      </div>
      <div className="pricing-summaryxerox">
        <h3 className="pricing-headingxerox" style={{
          textAlign:"center",
          display:"flex",
          justifyContent:"center",
          alignItems:"center",
          
        }}>Price List</h3>
        <div className="price-listxerox">
          <div className="price-list-itemxerox">
            <span className="price-item-labelxerox">A4 B&W (Single Side)</span>
            <span className="price-item-valuexerox">₹1.30 per page</span>
          </div>
          <div className="price-list-itemxerox">
            <span className="price-item-labelxerox">A4 B&W (Double Side)</span>
            <span className="price-item-valuexerox">₹0.75 per page</span>
          </div>
          <div className="price-list-itemxerox">
            <span className="price-item-labelxerox">A4 Color</span>
            <span className="price-item-valuexerox">₹10.00 per page</span>
          </div>
          <div className="price-list-itemxerox">
            <span className="price-item-labelxerox">Bonafide/OHP Paper</span>
            <span className="price-item-valuexerox">₹15.00 per page</span>
          </div>
          <div className="price-list-itemxerox">
            <span className="price-item-labelxerox">Spiral Binding</span>
            <span className="price-item-valuexerox">₹20.00 per copy</span>
          </div>
        </div>
      </div>
      <button 
        className="file-upload-buttonxerox"
        onClick={(e) => handleAuthenticatedFileUpload(e)}
      >
        <span className="upload-button-textxerox">Upload Files to Begin</span>
      </button>
      <input
        id="file-upload-input"
        type="file"
        accept=".pdf,.jpg,.png"
        multiple
        onChange={handleFileUpload}
        className="file-upload-inputxerox"
        style={{ display: 'none' }}
      />
    </div>
  );

  return (
    <div className="xerox-containerxerox">
      <h1 className="xerox-titlexerox">Xerox Printing Service</h1>

      {files.length === 0 ? (
        // Show empty state when no files are uploaded
        renderEmptyState()
      ) : (
        // Show file upload button when files exist
        <div>
          <button 
            className="file-uploadxerox"
            onClick={(e) => handleAuthenticatedFileUpload(e)}
          >
            <span className="file-labelxerox">Click to upload more files</span>
          </button>
          <input
            id="file-upload-input"
            type="file"
            accept=".pdf,.jpg,.png"
            multiple
            onChange={handleFileUpload}
            className="file-upload-inputxerox"
            style={{ display: 'none' }}
          />
        </div>
      )}

      {files.map((fileData, index) => (
        <div key={index} className="file-containerxerox">
          <div className="file-headerxerox">
            <h3 className="file-header-titlexerox">{fileData.file.name} ({fileData.totalPages} pages)</h3>
            <button 
              className="remove-file-buttonxerox"
              onClick={() => removeFile(index)}
            >
              ✕
            </button>
          </div>

          <div className="options-gridxerox">
            <div className="select-containerxerox">
              <label className="select-labelxerox">Paper Type</label>
              <select
                className="select-inputxerox"
                value={fileData.paperType}
                onChange={(e) => handleChange(index, "paperType", e.target.value)}
              >
                <option value="A4">A4 Paper</option>
                <option value="Bonafide">Bonafide Paper</option>
              </select>
            </div>

            <div className="select-containerxerox">
              <label className="select-labelxerox">Color</label>
              <select
                className="select-inputxerox"
                value={fileData.printType}
                onChange={(e) => handleChange(index, "printType", e.target.value)}
              >
                <option value="black-white">Black & White</option>
                <option value="color">Gradient/Color</option>
              </select>
            </div>

            <div className="select-containerxerox">
              <label className="select-labelxerox">Format</label>
              <select
                className="select-inputxerox"
                value={fileData.format}
                onChange={(e) => handleChange(index, "format", e.target.value)}
              >
                <option value="Front Only">Front Only</option>
                <option value="Front & Back">Front & Back</option>
              </select>
            </div>

            <div className="select-containerxerox">
              <label className="select-labelxerox">Print Ratio</label>
              <div className="ratio-select-with-preview">
                <select
                  className="select-inputxerox"
                  value={fileData.ratio}
                  onChange={(e) => handleChange(index, "ratio", e.target.value)}
                >
                  <option value="1:1">1:1 (Single Side)</option>
                  <option value="1:2">1:2 (Double Side)</option>
                </select>
                <div className="ratio-preview-buttons">
                  <button
                    type="button"
                    className="preview-eye-btn"
                    onClick={() => togglePreview(index, "1:1")}
                    title="Preview 1:1 ratio"
                  >
                    👁️
                  </button>
                  <button
                    type="button"
                    className="preview-eye-btn"
                    onClick={() => togglePreview(index, "1:2")}
                    title="Preview 1:2 ratio"
                  >
                    👁️
                  </button>
                </div>
              </div>
            </div>

            <div className="select-containerxerox">
              <label className="select-labelxerox">Quantity</label>
              <input
                type="number"
                className="select-inputxerox"
                min="1"
                value={fileData.quantity}
                onChange={(e) => handleChange(index, "quantity", parseInt(e.target.value))}
              />
            </div>

            <div className="checkbox-containerxerox">
              <input
                type="checkbox"
                className="checkbox-inputxerox"
                checked={fileData.spiralBinding}
                onChange={() => handleChange(index, "spiralBinding", !fileData.spiralBinding)}
              />
              <label className="checkbox-labelxerox">Include Spiral Binding (₹20)</label>
            </div>
          </div>

          <div className="price-infoxerox">
            <div className="price-itemxerox">
              <span className="price-labelxerox">Price per page:</span>
              <span className="price-valuexerox">₹{fileData.perPagePrice.toFixed(2)}</span>
            </div>
            <div className="price-itemxerox">
              <span className="price-labelxerox">Amount per copy:</span>
              <span className="price-valuexerox">₹{fileData.amountPerQuantity.toFixed(2)}</span>
            </div>
            <div className="price-itemxerox totalxerox">
              <span className="price-labelxerox">Final amount:</span>
              <span className="price-valuexerox">₹{fileData.finalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Preview Modals for this file */}
          <PreviewModal
            isOpen={showPreview[`${index}-1:1`]}
            onClose={() => togglePreview(index, "1:1")}
            ratioType="1:1"
            fileIndex={index}
          />
          <PreviewModal
            isOpen={showPreview[`${index}-1:2`]}
            onClose={() => togglePreview(index, "1:2")}
            ratioType="1:2"
            fileIndex={index}
          />
        </div>
      ))}

      {files.length > 0 && (
        <div className="checkout-sectionxerox">
          <div className="grand-total-containerxerox">
            <div className="grand-totalxerox">
              <span className="grand-total-labelxerox">Grand Total:</span>
              <span className="grand-total-valuexerox">₹{totalCost.toFixed(2)}</span>
            </div>
          </div>
          
          <button 
            className="checkout-buttonxerox"
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      )}

      {/* Global backdrop for closing all previews */}
      {Object.values(showPreview).some(Boolean) && (
        <div 
          className="global-backdrop" 
          onClick={closeAllPreviews}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'none' // Hidden by default, handled by individual modals
          }}
        />
      )}

      <style jsx>{`
        .ratio-select-with-preview {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        .ratio-preview-buttons {
          display: flex;
          gap: 4px;
        }

        .preview-eye-btn {
          background: none;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 4px 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
          height: 28px;
          width: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-eye-btn:hover {
          background-color: #f0f0f0;
          border-color: #999;
        }

        .preview-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .preview-modal {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .preview-close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .preview-close-btn:hover {
          background-color: #f0f0f0;
          color: #333;
        }

        .preview-content h3 {
          margin: 0 0 16px 0;
          color: #333;
          font-size: 20px;
        }

        .preview-image-container {
          margin: 16px 0;
          display: flex;
          justify-content: center;
        }

        .ratio-preview-image {
          max-width: 100%;
          max-height: 300px;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .image-fallback {
          text-align: center;
          padding: 40px 20px;
          background: #f5f5f5;
          border-radius: 8px;
          border: 2px dashed #ddd;
        }

        .fallback-text {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .fallback-description {
          color: #666;
          font-size: 14px;
        }

        .preview-description {
          margin: 16px 0;
          color: #666;
          line-height: 1.5;
          text-align: center;
        }

        .pricing-info {
          background: #e8f5e8;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          color: #2d5a2d;
          margin-top: 16px;
        }

        @media (max-width: 768px) {
          .ratio-select-with-preview {
            flex-direction: column;
            align-items: stretch;
          }
          
          .ratio-preview-buttons {
            justify-content: center;
            margin-top: 8px;
          }
          
          .preview-modal {
            margin: 10px;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default Xerox;