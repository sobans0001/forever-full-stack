import React from 'react'
import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'

const Verify = () => {
    // This page is now unused, so just redirect to /orders
    const { navigate } = useContext(ShopContext)
    React.useEffect(() => {
        navigate('/orders')
    }, [])
    return <div></div>
}

export default Verify