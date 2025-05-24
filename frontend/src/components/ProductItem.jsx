import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import {Link} from 'react-router-dom'
import Rating from 'react-rating'
import { FaStar, FaRegStar } from 'react-icons/fa'

const ProductItem = ({id,image,name,price, avgRating, ratingCount}) => {
    
    const {currency} = useContext(ShopContext);

  return (
    <Link onClick={()=>scrollTo(0,0)} className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
      <div className=' overflow-hidden'>
        <img className='hover:scale-110 transition ease-in-out' src={image[0]} alt="" />
      </div>
      <p className='pt-3 pb-1 text-sm'>{name}</p>
      <div className="flex items-center gap-1 mb-1">
        <Rating
          initialRating={avgRating || 0}
          emptySymbol={<FaRegStar className='text-yellow-400' size={14} />}
          fullSymbol={<FaStar className='text-yellow-400' size={14} />}
          readonly
        />
        <span className="text-xs text-gray-500">({ratingCount || 0})</span>
      </div>
      <p className=' text-sm font-medium'>{currency}{price}</p>
    </Link>
  )
}

export default ProductItem
