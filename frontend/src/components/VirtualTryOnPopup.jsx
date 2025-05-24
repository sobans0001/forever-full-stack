import React, { useState, useRef, useContext, useEffect } from 'react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-gray-700 inline-block mr-2" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
  </svg>
);

const Check = () => (
  <svg className="inline-block h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
  </svg>
);

const VirtualTryOnPopup = ({ closePopup, garmentImage, category, description, productId }) => {
  const [userImage, setUserImage] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState(null);
  const [status, setStatus] = useState('idle');
  const [showUploadError, setShowUploadError] = useState(false);
  const [uploadedUserImageUrl, setUploadedUserImageUrl] = useState(null);
  const [tryonImageUrl, setTryonImageUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultExists, setResultExists] = useState(false); // <-- new state
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);
  const { token, navigate } = useContext(ShopContext);

  // Helper to decode JWT and get userId
  function getUserIdFromToken(token) {
    try {
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  }

  // Always check DB for try-on result on open
  useEffect(() => {
    if (!token || !productId) return;
    const userId = getUserIdFromToken(token);
    if (!userId) return;
    (async () => {
      try {
        const res = await axios.post(
          import.meta.env.VITE_BACKEND_URL + '/api/vtonresult/get',
          { userId, productId }
        );
        if (res.data && res.data.success && res.data.result && res.data.result.vtn_link) {
          setTryonImageUrl(res.data.result.vtn_link);
          setStatus('done');
          setResultExists(true);
        } else {
          setTryonImageUrl(null);
          setStatus('idle');
          setResultExists(false);
        }
      } catch {
        setTryonImageUrl(null);
        setStatus('idle');
        setResultExists(false);
      }
    })();
    // eslint-disable-next-line
  }, [token, productId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setUserImage(file);
    if (file) {
      setUserImagePreview(URL.createObjectURL(file));
      setShowUploadError(false);
    } else {
      setUserImagePreview(null);
    }
  };

  const handleRemoveUserImage = (e) => {
    e.stopPropagation();
    setUserImage(null);
    setUserImagePreview(null);
    setUploadedUserImageUrl(null);
    setTryonImageUrl(null);
    setStatus('idle'); // Reset process status when image is removed
    setErrorMsg('');
    setShowUploadError(false);
    // Prevent file dialog from opening after removing image
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.blur();
    }
  };

  // Upload user image to backend and get URL
  const uploadUserImage = async () => {
    const formData = new FormData();
    formData.append('image', userImage);
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_URL + '/api/virtualtryon/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    if (res.data.success) {
      setUploadedUserImageUrl(res.data.url);
      return res.data.url;
    } else {
      throw new Error('Upload failed');
    }
  };

  const handleTryOn = async () => {
    if (resultExists) {
      setErrorMsg('You have already generated a try-on result for this product. Please remove it to try again.');
      return;
    }
    if (!userImage) {
      setShowUploadError(true);
      return;
    }
    setShowUploadError(false);
    setStatus('uploading');
    setTryonImageUrl(null);
    setErrorMsg('');
    try {
      // 1. Upload user image, get URL
      const userImgUrl = await uploadUserImage();
      setStatus('processing');
      // 2. Call backend try-on API (this will save to vtonresult in backend)
      const userId = getUserIdFromToken(token);
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL + '/api/virtualtryon/tryon',
        {
          userImageUrl: userImgUrl,
          garmentImageUrl: garmentImage,
          category: category, 
          garment_des: description,
          userId,
          productId
        }
      );
      if (res.data && res.data.success && res.data.tryonUrl) {
        setTryonImageUrl(res.data.tryonUrl);
        setStatus('done');
        setResultExists(true);
      } else if (res.data && res.data.message) {
        setStatus('idle');
        setErrorMsg(res.data.message);
      } else {
        setStatus('idle');
        setErrorMsg('Unexpected response from server.');
      }
    } catch (err) {
      setStatus('idle');
      setErrorMsg(
        err?.response?.data?.message ||
        err?.message ||
        'Try-on error'
      );
    }
  };

  // Delete try-on result for this user/product
  const handleDeleteResult = async () => {
    setDeleting(true);
    setErrorMsg('');
    try {
      const userId = getUserIdFromToken(token);
      await axios.post(
        import.meta.env.VITE_BACKEND_URL + '/api/vtonresult/delete',
        { userId, productId }
      );
      setTryonImageUrl(null);
      setStatus('idle');
      setResultExists(false);
      setUserImage(null);
      setUserImagePreview(null);
      setUploadedUserImageUrl(null);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Failed to delete try-on result.');
    }
    setDeleting(false);
  };

  // Helper for step status
  const getStepIcon = (step) => {
    if (status === step) return <Spinner />;
    if (
      (step === 'uploading' && ['processing', 'done'].includes(status)) ||
      (step === 'processing' && status === 'done')
    ) {
      return <Check />;
    }
    return <span className="inline-block w-5" />;
  };

  // Only show steps after Try On is clicked (status !== 'idle')
  const showSteps = status !== 'idle';

  // Prevent try-on if not logged in
  if (!token) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative flex flex-col items-center">
          <button
            onClick={closePopup}
            className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-black"
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-xl font-bold mb-4 text-center">Virtual Try-On</h2>
          <div className="text-red-600 font-semibold mb-4 text-center">
            Please login to use the Virtual Try-On feature.
          </div>
          <button
            className="w-32 py-3 mt-2 bg-black text-white rounded hover:bg-gray-800 transition font-bold"
            onClick={() => {
              closePopup();
              navigate('/login');
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        {/* Close button */}
        <button
          onClick={closePopup}
          className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-black"
          aria-label="Close"
        >
          &times;
        </button>
        {status === 'done' && tryonImageUrl ? (
          <div className="flex flex-col items-center">
            {/* Add cross for delete in top right */}
            <button
              onClick={handleDeleteResult}
              disabled={deleting}
              className="absolute top-3 right-12 text-xl text-red-500 hover:text-red-700"
              title="Delete Result"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">This is How You Look Like</h2>
            <img
              src={tryonImageUrl}
              alt="Try-On Result"
              className="w-64 h-64 object-contain border mb-5 rounded"
              style={{ background: "#f3f3f3" }}
            />
            <a
              href={tryonImageUrl}
              download="virtual-tryon-result.jpg"
              className="w-40 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition font-bold text-center block"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Result
            </a>
            <div className="mt-4 text-sm text-gray-600">
              You have already generated a try-on result for this product.
            </div>
            <button
              onClick={handleDeleteResult}
              disabled={deleting}
              className="mt-4 w-40 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-bold text-center"
            >
              {deleting ? 'Deleting...' : 'Delete Result'}
            </button>
            {errorMsg && (
              <div className="text-red-600 font-semibold mt-2">{errorMsg}</div>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-4">Virtual Try-On</h2>
            {/* Garment and User images side by side, garment left, user right */}
            <div className="flex flex-row gap-8 mb-4 justify-center items-end">
              {/* Garment image preview */}
              <div className="flex flex-col items-center">
                <img
                  src={garmentImage}
                  alt="Garment"
                  className="rounded border w-32 h-32 object-cover"
                />
                <span className="text-sm mt-2 font-bold text-gray-700">Garment</span>
              </div>
              {/* User image upload */}
              <div className="flex flex-col items-center relative">
                <div className="relative flex flex-col items-center">
                  <label htmlFor="userImageUpload" className="cursor-pointer">
                    <img
                      className="w-32 h-32 object-cover border rounded"
                      src={
                        !userImagePreview
                          ? '/src/assets/upload_area.png'
                          : userImagePreview
                      }
                      alt=""
                    />
                    <input
                      type="file"
                      id="userImageUpload"
                      accept="image/*"
                      hidden
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      disabled={resultExists}
                    />
                  </label>
                  {/* Cross to remove user image - OUTSIDE the image */}
                  {userImagePreview && !resultExists && (
                    <button
                      type="button"
                      onClick={handleRemoveUserImage}
                      tabIndex={-1}
                      className="absolute -top-3 right-0 bg-white rounded-full text-gray-500 hover:text-black text-lg w-6 h-6 flex items-center justify-center shadow"
                      aria-label="Remove"
                    >
                      &times;
                    </button>
                  )}
                </div>
                <span className="text-sm mt-2 font-bold text-gray-700">Your Image</span>
              </div>
            </div>
            {/* Show upload error if Try On is clicked without uploading image */}
            {showUploadError && (
              <div className="text-red-600 font-semibold mb-2">
                Please upload your image first.
              </div>
            )}
            {/* Show backend error if any */}
            {errorMsg && (
              <div className="text-red-600 font-semibold mb-2">
                {errorMsg}
              </div>
            )}
            {/* Steps with spinner/check, only after Try On is clicked */}
            {showSteps && (
              <div className="flex flex-col items-start mb-2 min-h-[72px]">
                {status !== 'idle' && (
                  <span className="flex items-center text-gray-700 font-medium mb-1">
                    {getStepIcon('uploading')}
                    Uploading image...
                  </span>
                )}
                {(status === 'processing' || status === 'done') && (
                  <span className="flex items-center text-gray-700 font-medium mb-1">
                    {getStepIcon('processing')}
                    Processing image...
                  </span>
                )}
                {status === 'done' && (
                  <span className="flex items-center text-green-600 font-bold">
                    <Check />
                    Done!
                  </span>
                )}
              </div>
            )}
            {/* Try On button */}
            <div className="flex flex-col items-center justify-center">
              <button
                onClick={handleTryOn}
                disabled={status === 'uploading' || status === 'processing' || resultExists}
                className="w-32 py-3 mt-2 bg-black text-white rounded hover:bg-gray-800 transition font-bold"
              >
                {resultExists
                  ? 'Already Generated'
                  : status === 'uploading'
                  ? 'Uploading...'
                  : status === 'processing'
                  ? 'Processing...'
                  : status === 'done'
                  ? 'Done'
                  : 'Try On'}
              </button>
              {resultExists && (
                <div className="mt-2 text-xs text-gray-500 text-center">
                  You have already generated a try-on result for this product.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VirtualTryOnPopup;
