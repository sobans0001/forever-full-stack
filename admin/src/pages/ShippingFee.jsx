import React, { useEffect, useState } from 'react'
import { backendUrl } from '../App'
import axios from 'axios'
import { toast } from 'react-toastify'

const ShippingFee = () => {
  const [fee, setFee] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchFee = async () => {
      try {
        const res = await axios.get(backendUrl + '/api/shipping-fee')
        if (res.data.success) setFee(res.data.fee)
      } catch {
        toast.error('Failed to fetch shipping fee')
      }
    }
    fetchFee()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post(backendUrl + '/api/shipping-fee', { fee: Number(fee) })
      if (res.data.success) {
        toast.success('Shipping fee updated')
        setFee(res.data.fee)
      } else {
        toast.error(res.data.message)
      }
    } catch {
      toast.error('Failed to update shipping fee')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Update Shipping Fee</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="font-medium">
          Shipping Fee:
          <input
            type="number"
            value={fee}
            onChange={e => setFee(e.target.value)}
            className="ml-2 border px-2 py-1 rounded"
            min="0"
            required
            disabled={loading}
          />
        </label>
        <button type="submit" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800" disabled={loading}>
          Update
        </button>
      </form>
    </div>
  )
}

export default ShippingFee
