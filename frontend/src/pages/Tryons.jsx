import React, { useEffect, useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Rating from 'react-rating';
import { FaStar, FaRegStar } from 'react-icons/fa';

const Tryons = () => {
  const { token, backendUrl, products, currency } = useContext(ShopContext);
  const [tryons, setTryons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Decode JWT and get userId
  function getUserIdFromToken(token) {
    try {
      if (!token) return null;
      const base64 = token.split('.')[1];
      const payload = JSON.parse(atob(base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=')));
      return payload.id;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const fetchTryons = async () => {
      setLoading(true);
      const userId = getUserIdFromToken(token);
      if (!userId) {
        setTryons([]);
        setLoading(false);
        return;
      }
      try {
        const res = await axios.post(`${backendUrl}/api/vtonresult/get-user`, { userId });
        if (res.data?.success && Array.isArray(res.data.results)) {
          setTryons(res.data.results);
        } else {
          setTryons([]);
        }
      } catch {
        setTryons([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchTryons();
  }, [token, backendUrl]);

  // Helper to get product info by id
  const getProductInfo = (productId) => {
    if (!products || !Array.isArray(products)) return {};
    return products.find(p => p._id === productId) || {};
  };

  // Delete handler with confirmation
  const handleDelete = async (item) => {
    setConfirmDeleteId(item._id);
  };

  const confirmDelete = async (item) => {
    setDeleting(true);
    try {
      const userId = getUserIdFromToken(token);
      await axios.post(`${backendUrl}/api/vtonresult/delete`, {
        userId,
        productId: item.productId,
      });
      setTryons((prev) => prev.filter((t) => t._id !== item._id));
      setConfirmDeleteId(null);
    } catch {
      // Optionally show error
    }
    setDeleting(false);
  };

  return (
    <div className="border-t pt-10 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">My TryOns</h2>
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : tryons.length === 0 ? (
        <div className="text-center text-gray-500">No result found.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {tryons.map((item, idx) => {
            const product = getProductInfo(item.productId);
            return (
              <div
                key={item._id || idx}
                className="flex flex-col sm:flex-row items-center justify-between border rounded-lg p-4 bg-white shadow relative"
              >
                {/* Delete cross */}
                <button
                  onClick={() => handleDelete(item)}
                  className="absolute top-3 right-3 text-xl text-red-500 hover:text-red-700"
                  title="Delete TryOn"
                  disabled={deleting}
                >
                  &times;
                </button>
                {/* Left: Product info */}
                <div className="flex items-center gap-4 w-full sm:w-1/2 mb-4 sm:mb-0">
                  <Link to={`/product/${item.productId}`}>
                    <img
                      src={product.image && product.image[0] ? product.image[0] : '/no-image.png'}
                      alt={product.name || 'Product'}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </Link>
                  <div>
                    <Link
                      to={`/product/${item.productId}`}
                      className="font-semibold text-gray-800 hover:underline text-base"
                    >
                      {product.name || 'Product'}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium">{currency}{product.price}</span>
                      <Rating
                        initialRating={product.avgRating || 0}
                        emptySymbol={<FaRegStar className='text-yellow-400' size={14} />}
                        fullSymbol={<FaStar className='text-yellow-400' size={14} />}
                        readonly
                      />
                      <span className="text-xs text-gray-500">({product.ratingCount || 0})</span>
                    </div>
                  </div>
                </div>
                {/* Right: TryOn result */}
                <div className="flex flex-col items-center w-full sm:w-1/2">
                  <img
                    src={item.vtn_link}
                    alt={product.name || 'TryOn'}
                    className="w-36 h-36 object-contain mb-2 rounded border"
                  />
                  <a
                    href={item.vtn_link}
                    download={`tryon-${item.productId}.jpg`}
                    className="px-4 py-2 bg-black text-white rounded text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                </div>
                {/* Confirmation dialog */}
                {confirmDeleteId === item._id && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-80 flex flex-col items-center">
                      <p className="mb-4 text-center text-gray-700">Are you sure you want to delete this try-on result?</p>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-4 py-2 rounded bg-gray-300"
                          disabled={deleting}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => confirmDelete(item)}
                          className="px-4 py-2 rounded bg-red-600 text-white"
                          disabled={deleting}
                        >
                          {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Tryons;
