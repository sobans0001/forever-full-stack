import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'
import Rating from 'react-rating'
import { FaStar, FaRegStar } from 'react-icons/fa'

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext)
  const [orderData, setorderData] = useState([])
  const [ratings, setRatings] = useState({}) // {orderId_productId: rating}
  const [rated, setRated] = useState({}) // {orderId_productId: true}
  const [thankYou, setThankYou] = useState({}) // {orderId_productId: true}
  const [userId, setUserId] = useState(null)
  const [reviews, setReviews] = useState({}) // {orderId_productId: reviewText}
  const [reviewed, setReviewed] = useState({}) // {orderId_productId: true}
  const [reviewInput, setReviewInput] = useState({}) // {orderId_productId: inputText}

  useEffect(() => {
    // Fetch userId from token/profile
    const fetchUserId = async () => {
      if (!token) return
      try {
        const res = await axios.post(
          backendUrl + '/api/user/profile',
          {},
          { headers: { token } }
        )
        if (res.data.success) setUserId(res.data.user._id)
      } catch {}
    }
    fetchUserId()
  }, [token])

  const loadOrderData = async () => {
    try {
      if (!token) return

      const response = await axios.post(
        backendUrl + '/api/order/userorders',
        {},
        { headers: { token } }
      )

      if (response.data.success) {
        let allOrdersItem = []
        let userRatings = {}
        let userReviews = {}
        let reviewedMap = {}
        response.data.orders.forEach((order) => {
          // Save ratings and reviews for this order
          if (order.ratings && Array.isArray(order.ratings)) {
            order.ratings.forEach((r) => {
              if (r.userId === userId) {
                userRatings[`${order._id}_${r.productId}`] = r.rating
                if (r.review) {
                  userReviews[`${order._id}_${r.productId}`] = r.review
                  reviewedMap[`${order._id}_${r.productId}`] = true
                }
              }
            })
          }
          order.items.forEach((item) => {
            item['status'] = order.status
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            item['orderId'] = order._id // add orderId for rating/review
            allOrdersItem.push(item)
          })
        })
        setorderData(allOrdersItem.reverse())
        setRatings(userRatings)
        // Mark as rated for those already rated
        let ratedMap = {}
        Object.keys(userRatings).forEach((key) => {
          ratedMap[key] = true
        })
        setRated(ratedMap)
        setReviews(userReviews)
        setReviewed(reviewedMap)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  useEffect(() => {
    loadOrderData()
    // eslint-disable-next-line
  }, [token, userId])

  const handleRating = async (rate, productId, orderId) => {
    const key = `${orderId}_${productId}`
    if (rated[key]) return
    setRatings((prev) => ({ ...prev, [key]: rate }))
    setRated((prev) => ({ ...prev, [key]: true }))
    setThankYou((prev) => ({ ...prev, [key]: true }))
    setTimeout(() => {
      setThankYou((prev) => {
        const updated = { ...prev }
        delete updated[key]
        return updated
      })
    }, 3000)
    try {
      await axios.post(
        backendUrl + '/api/product/rate',
        { productId, rating: rate, orderId, userId },
        { headers: { token } }
      )
    } catch (err) {
      // Optionally show error
    }
  }

  const handleReviewInput = (e, productId, orderId) => {
    const key = `${orderId}_${productId}`
    setReviewInput((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleSaveReview = async (productId, orderId) => {
    const key = `${orderId}_${productId}`
    const reviewText = reviewInput[key]?.trim()
    if (!reviewText) return
    try {
      await axios.post(
        backendUrl + '/api/product/review',
        { productId, orderId, userId, review: reviewText },
        { headers: { token } }
      )
      setReviews((prev) => ({ ...prev, [key]: reviewText }))
      setReviewed((prev) => ({ ...prev, [key]: true }))
    } catch (err) {
      // Optionally show error
    }
  }

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      <div>
        {orderData.map((item, index) => {
          const key = `${item.orderId}_${item._id}`
          return (
            <div
              key={index}
              className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'
            >
              <div className='flex items-start gap-6 text-sm'>
                <img className='w-16 sm:w-20' src={item.image[0]} alt='' />
                <div>
                  <p className='sm:text-base font-medium'>{item.name}</p>
                  <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                    <p>
                      {currency}
                      {item.price}
                    </p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className='mt-1'>
                    Date:{' '}
                    <span className='text-gray-400'>
                      {new Date(item.date).toDateString()}
                    </span>
                  </p>
                  <p className='mt-1'>
                    Payment:{' '}
                    <span className='text-gray-400'>{item.paymentMethod}</span>
                  </p>

                  {/* Rating & Review Component for Delivered Items */}
                  {item.status === 'Delivered' && (
                    <div className='mt-2 flex flex-col gap-2'>
                      <div className='flex items-center gap-2'>
                        <span className='text-gray-600'>Rate this item:</span>
                        <Rating
                          initialRating={ratings[key] || 0}
                          emptySymbol={
                            <FaRegStar className='text-yellow-400' size={20} />
                          }
                          fullSymbol={<FaStar className='text-yellow-400' size={20} />}
                          onClick={(rate) =>
                            handleRating(rate, item._id, item.orderId)
                          }
                          readonly={!!rated[key]}
                        />
                        {rated[key] && thankYou[key] && (
                          <span className='text-green-600 ml-2 text-xs'>
                            Thank you!
                          </span>
                        )}
                      </div>
                      {/* Review input and display */}
                      <div className='flex items-center gap-2'>
                        <span className='text-gray-600'>Review:</span>
                        {reviewed[key] ? (
                          <span className='text-gray-800 ml-1'>{reviews[key]}</span>
                        ) : (
                          <>
                            <input
                              type='text'
                              className='border px-2 py-1 rounded text-sm'
                              placeholder='Write your review'
                              value={reviewInput[key] || ''}
                              onChange={(e) =>
                                handleReviewInput(e, item._id, item.orderId)
                              }
                              disabled={!!reviewed[key]}
                              style={{ minWidth: 120, maxWidth: 220 }}
                            />
                            <button
                              className='bg-black text-white px-3 py-1 rounded text-xs'
                              onClick={() => handleSaveReview(item._id, item.orderId)}
                              disabled={
                                !!reviewed[key] ||
                                !(reviewInput[key] && reviewInput[key].trim())
                              }
                            >
                              Save
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className='md:w-1/2 flex justify-between'>
                <div className='flex items-center gap-2'>
                  <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                  <p className='text-sm md:text-base'>{item.status}</p>
                </div>
                <button
                  onClick={loadOrderData}
                  className='border px-4 py-2 text-sm font-medium rounded-sm'
                >
                  Track Order
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Orders
