import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import Rating from 'react-rating'
import { FaStar, FaRegStar } from 'react-icons/fa'

const Orders = ({ token }) => {

  const [orders, setOrders] = useState([])

  const fetchAllOrders = async () => {

    if (!token) {
      return null;
    }

    try {

      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }


  }

  const statusHandler = async ( event, orderId ) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status' , {orderId, status:event.target.value}, { headers: {token}})
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error)
      toast.error(response.data.message)
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [token])

  // Helper to calculate average rating from order.ratings array
  const getOrderAverageRating = (order) => {
    if (!order.ratings || !Array.isArray(order.ratings) || order.ratings.length === 0) return null
    const sum = order.ratings.reduce((acc, r) => acc + (typeof r.rating === 'number' ? r.rating : 0), 0)
    return sum / order.ratings.length
  }

  // Helper to get all reviews for this order (array of {productId, review})
  const getOrderReviews = (order) => {
    if (!order.ratings || !Array.isArray(order.ratings)) return []
    return order.ratings.filter(r => r.review && r.review.trim()).map(r => ({
      productId: r.productId,
      review: r.review
    }))
  }

  return (
    <div>
      <h3>Order Page</h3>
      <div>
        {
          orders.map((order, index) => {
            const avgRating = getOrderAverageRating(order)
            const reviews = getOrderReviews(order)
            return (
              <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={index}>
                <img className='w-12' src={assets.parcel_icon} alt="" />
                <div>
                  <div>
                    {order.items.map((item, index) => {
                      if (index === order.items.length - 1) {
                        return <p className='py-0.5' key={index}> {item.name} x {item.quantity} <span> {item.size} </span> </p>
                      }
                      else {
                        return <p className='py-0.5' key={index}> {item.name} x {item.quantity} <span> {item.size} </span> ,</p>
                      }
                    })}
                  </div>
                  <p className='mt-3 mb-2 font-medium'>{order.address.firstName + " " + order.address.lastName}</p>
                  <p className='mb-1 text-gray-500'>{order.email}</p>
                  <div>
                    <p>{order.address.street + ","}</p>
                    <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
                  </div>
                  <p>{order.address.phone}</p>
                </div>
                <div>
                  <p className='text-sm sm:text-[15px]'>Items : {order.items.length}</p>
                  <p className='mt-3'>Method : {order.paymentMethod}</p>
                  <p>
                    Payment : {
                      order.status === 'Delivered'
                        ? 'Received'
                        : (order.payment ? 'Done' : 'Pending')
                    }
                  </p>
                  <p>Date : {new Date(order.date).toLocaleDateString()}</p>
                  <div className='mt-2 flex items-center gap-2'>
                    <span className='font-medium flex items-center'>
                      User Rating:
                      {avgRating
                        ? (
                          <span className='flex flex-row items-center '>
                            <Rating
                              initialRating={avgRating}
                              emptySymbol={<FaRegStar className='text-yellow-400' size={15} />}
                              fullSymbol={<FaStar className='text-yellow-400' size={15} />}
                              readonly
                            />
                          </span>
                        )
                        : <span className='text-gray-400 ml-2'>No rating</span>
                      }
                    </span>
                  </div>
                  {/* Show review if any */}
                  {reviews.length > 0 ? (
                    <div className='mt-1'>
                      <span className='font-medium'>Review:</span>
                      <span className='ml-2 text-gray-700'>{reviews[0].review}</span>
                    </div>
                  ) : (
                    <div className='mt-1 text-gray-400'>
                      <span className='font-medium'>Review:</span> No review
                    </div>
                  )}
                </div>
                <p className='text-sm sm:text-[15px]'>{currency} {order.amount}</p>
                {
                  order.status === 'Delivered'
                    ? <span className='p-2 font-semibold'>{order.status}</span>
                    : (
                      <select onChange={(event)=>statusHandler(event,order._id)} value={order.status} className='p-2 font-semibold'>
                        <option value="Order Placed">Order Placed</option>
                        <option value="Packing">Packing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for delivery">Out for delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    )
                }
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default Orders