import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import VirtualTryOnPopup from '../components/VirtualTryOnPopup';
import { toast } from 'react-toastify';
import Rating from 'react-rating'
import { FaStar, FaRegStar } from 'react-icons/fa'

// Description component
const ProductDescription = ({ description }) => (
  <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
    <p>{description}</p>
    <p>
      E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with relevant information.
    </p>
  </div>
);

// Reviews component
const ProductReviews = ({ productId }) => {
  const { backendUrl } = useContext(ShopContext)
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch reviews for this product from backend
        const res = await fetch(`${backendUrl}/api/product/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        } else {
          setReviews([]);
        }
      } catch (err) {
        setReviews([]);
      }
    };
    fetchReviews();
  }, [backendUrl, productId]);

  return (
    <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500 bg-gray-50 rounded-md'>
      {reviews.length === 0 ? (
        <p className="italic text-gray-400">No reviews yet.</p>
      ) : (
        reviews.map((r, i) => (
          <div key={i} className="mb-4 p-4 bg-white rounded shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Rating
                initialRating={r.rating || 0}
                emptySymbol={<FaRegStar className='text-yellow-400' size={16} />}
                fullSymbol={<FaStar className='text-yellow-400' size={16} />}
                readonly
              />
              <span className="font-semibold text-gray-700">{r.userName || "User"}</span>
              <span className="text-xs text-gray-400 ml-2">
                {r.date ? new Date(r.date).toLocaleDateString() : ""}
              </span>
            </div>
            <div className="pl-1 text-gray-700">{r.review}</div>
          </div>
        ))
      )}
    </div>
  );
};

const Product = () => {

  const { productId } = useParams();
  const { products, currency, addToCart, cartItems } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('')
  const [size,setSize] = useState('')
  const [showPopup, setShowPopup] = useState(false);
  const [subCategoryType, setSubCategoryType] = useState(""); // <-- for type

  // Tab state: 'description' or 'reviews'
  const [activeTab, setActiveTab] = useState('description');

  const fetchProductData = async () => {

    products.map((item) => {
      if (item._id === productId) {
        setProductData(item)
        setImage(item.image[0])
        return null;
      }
    })

  }

  useEffect(() => {
    fetchProductData();
  }, [productId,products])

 useEffect(() => {
  const fetchType = async () => {
    if (!productData || !productData.category || !productData.subCategory) {
      setSubCategoryType("");
      return;
    }
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/category/sub-type?category=${encodeURIComponent(productData.category)}&subCategory=${encodeURIComponent(productData.subCategory)}`
      );
      const data = await res.json();
      if (data.success) setSubCategoryType(data.type || "");
      else setSubCategoryType("");
    } catch (err) {
      console.error("Failed to fetch type:", err);
      setSubCategoryType("");
    }
  };
  fetchType();
}, [productData]);


  const handleTryNow = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  // Track previous quantity for this product/size
  const [prevQty, setPrevQty] = useState(0);

  useEffect(() => {
    if (!productData || !size) return;
    const qty = cartItems?.[productData._id]?.[size] || 0;
    if (qty > prevQty) {
      toast.success("Added to cart");
    }
    setPrevQty(qty);
  }, [cartItems, productData, size]);

  const handleAddToCart = () => {
    addToCart(productData._id, size);
    // toast is now handled in useEffect
  };

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/*----------- Product Data-------------- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/*---------- Product Images------------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
              {
                productData.image.map((item,index)=>(
                  <img onClick={()=>setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt="" />
                ))
              }
          </div>
          <div className='w-full sm:w-[80%] relative group'>
              <img className='w-full h-auto group-hover:opacity-70 transition-opacity duration-300' src={image} alt="" />
              <button 
                onClick={handleTryNow} 
                className='hidden group-hover:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black text-white px-6 py-2 text-sm rounded-md shadow-lg'>
                TRY NOW
              </button>
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className='flex items-center gap-2 mt-2'>
            <Rating
              initialRating={productData.avgRating || 0}
              emptySymbol={<FaRegStar className='text-yellow-400' size={18} />}
              fullSymbol={<FaStar className='text-yellow-400' size={18} />}
              readonly
            />
            <p className='pl-2'>
              ({productData.ratingCount || 0})
              {productData.avgRating ? ` |  ${productData.avgRating.toFixed(1)}` : ''}
            </p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
              <p>Select Size</p>
              <div className='flex gap-2'>
                {productData.sizes.map((item,index)=>(
                  <button onClick={()=>setSize(item)} className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`} key={index}>{item}</button>
                ))}
              </div>
          </div>
          <div className='flex gap-4'>
            <button onClick={handleAddToCart} className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>ADD TO CART</button>
            <button onClick={handleTryNow} className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>TRY NOW</button>
          </div>
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
              <p>100% Original product.</p>
              <p>Cash on delivery is available on this product.</p>
              <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* ---------- Popup Window for Virtual Try-On ---------- */}
      {showPopup && (
        <VirtualTryOnPopup
          closePopup={closePopup}
          garmentImage={productData.image[0]}
          category={subCategoryType}
          description={productData.name}
          productId={productData._id}
        />
      )}

      {/* ---------- Description & Review Section ------------- */}
      <div className='mt-20'>
        <div className='flex'>
          <button
            className={`border px-5 py-3 text-sm focus:outline-none ${activeTab === 'description' ? 'font-bold bg-gray-100' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={`border px-5 py-3 text-sm focus:outline-none ${activeTab === 'reviews' ? 'font-bold bg-gray-100' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>
        {activeTab === 'description' && (
          <ProductDescription description={productData.description} />
        )}
        {activeTab === 'reviews' && (
          <ProductReviews productId={productData._id} />
        )}
      </div>

      {/* --------- display related products ---------- */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />

    </div>
  ) : <div className=' opacity-0'></div>
}

export default Product
