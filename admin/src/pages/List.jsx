import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets' // <-- add this import

const List = ({ token }) => {

  const [list, setList] = useState([])
  const [categoryList, setCategoryList] = useState([]);
  const [subCategoryMap, setSubCategoryMap] = useState({}); // {categoryName: [subcat1, subcat2, ...]}
  // Confirmation modal state
  const [confirmId, setConfirmId] = useState(null)
  const [confirmName, setConfirmName] = useState('')
  // Edit modal state
  const [editModal, setEditModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [editImages, setEditImages] = useState([null, null, null, null])

  const fetchList = async () => {
    try {

      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products.reverse());
      }
      else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Fetch category and subcategory names from backend
  useEffect(() => {
    const fetchCatSubcat = async () => {
      try {
        const res = await axios.get(backendUrl + '/api/category/list');
        if (res.data.success) {
          const cats = res.data.categories || [];
          setCategoryList(cats.map(c => c.name));
          // Build map: { categoryName: [subcatName, ...] }
          const map = {};
          cats.forEach(cat => {
            map[cat.name] = (cat.subCategories || []).map(sub => sub.name);
          });
          setSubCategoryMap(map);
        }
      } catch (e) {
        // ignore error
      }
    };
    fetchCatSubcat();
    fetchList();
  }, []);

  // Show confirmation modal
  const handleDeleteClick = (id, name) => {
    setConfirmId(id)
    setConfirmName(name)
  }

  // Hide confirmation modal
  const handleCancel = () => {
    setConfirmId(null)
    setConfirmName('')
  }

  // Confirm deletion
  const handleConfirm = async () => {
    if (!confirmId) return
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id: confirmId }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
    setConfirmId(null)
    setConfirmName('')
  }

  // Open edit modal
  const handleEditClick = (product) => {
    setEditProduct({
      ...product,
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      bestseller: !!product.bestseller
    })
    setEditImages([
      product.image[0] || null,
      product.image[1] || null,
      product.image[2] || null,
      product.image[3] || null
    ])
    setEditModal(true)
  }

  // Handle edit image change
  const handleEditImageChange = (idx, file) => {
    setEditImages(prev => {
      const arr = [...prev]
      arr[idx] = file
      return arr
    })
  }

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditProduct(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  // Handle edit sizes
  const handleEditSizeToggle = (size) => {
    setEditProduct(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }))
  }

  // Submit edit
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append("id", editProduct._id)
      formData.append("name", editProduct.name)
      formData.append("description", editProduct.description)
      formData.append("price", editProduct.price)
      formData.append("category", editProduct.category)
      formData.append("subCategory", editProduct.subCategory)
      formData.append("bestseller", editProduct.bestseller)
      formData.append("sizes", JSON.stringify(editProduct.sizes))
      editImages.forEach((img, idx) => {
        if (img && img instanceof File) {
          formData.append(`image${idx+1}`, img)
        }
      })
      const response = await axios.post(backendUrl + '/api/product/edit', formData, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        setEditModal(false)
        setEditProduct(null)
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <>
      {/* Edit Modal */}
      {editModal && editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[95vw] border border-gray-300 flex flex-col gap-3"
          >
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Edit Product</h2>
            <div className="flex gap-2">
              {[0,1,2,3].map(idx => (
                <label key={idx} htmlFor={`edit-image${idx+1}`}>
                  <img
                    className="w-16 h-16 object-cover border"
                    src={
                      editImages[idx]
                        ? (editImages[idx] instanceof File
                          ? URL.createObjectURL(editImages[idx])
                          : editImages[idx])
                        : assets.upload_area // <-- show placeholder if no image
                    }
                    alt=""
                  />
                  <input
                    type="file"
                    id={`edit-image${idx+1}`}
                    hidden
                    onChange={e => handleEditImageChange(idx, e.target.files[0])}
                  />
                </label>
              ))}
            </div>
            <input
              name="name"
              value={editProduct.name}
              onChange={handleEditChange}
              className="w-full px-3 py-2"
              type="text"
              placeholder="Product name"
              required
            />
            <textarea
              name="description"
              value={editProduct.description}
              onChange={handleEditChange}
              className="w-full px-3 py-2"
              placeholder="Product description"
              required
            />
            <div className="flex gap-2">
              <select
                name="category"
                value={editProduct.category}
                onChange={handleEditChange}
                className="px-3 py-2"
              >
                {categoryList.length === 0
                  ? <option value="">No categories</option>
                  : categoryList.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))
                }
              </select>
              <select
                name="subCategory"
                value={editProduct.subCategory}
                onChange={handleEditChange}
                className="px-3 py-2"
              >
                {(subCategoryMap[editProduct.category] || []).length === 0
                  ? <option value="">No subcategories</option>
                  : subCategoryMap[editProduct.category].map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))
                }
              </select>
              <input
                name="price"
                value={editProduct.price}
                onChange={handleEditChange}
                className="px-3 py-2 w-24"
                type="number"
                placeholder="Price"
                required
              />
            </div>
            <div className="flex gap-2">
              {["S","M","L","XL","XXL"].map(size => (
                <div key={size} onClick={() => handleEditSizeToggle(size)}>
                  <p className={`${editProduct.sizes.includes(size) ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>{size}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="checkbox"
                id="edit-bestseller"
                name="bestseller"
                checked={editProduct.bestseller}
                onChange={handleEditChange}
              />
              <label className="cursor-pointer" htmlFor="edit-bestseller">Add to bestseller</label>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setEditModal(false)}
                className="w-28 py-3 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-28 py-3 bg-black text-white rounded"
              >
                SAVE
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90vw] border border-gray-300">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Confirm Deletion</h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete <span className="font-bold">{confirmName}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <p className='mb-2'>All Products List</p>
      <div className='flex flex-col gap-2'>

        {/* ------- List Table Title ---------- */}

        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Action</b>
        </div>

        {/* ------ Product List ------ */}

        {
          list.map((item, index) => (
            <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
              <img className='w-12' src={item.image[0]} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              <div className="flex gap-2 justify-end md:justify-center">
                <button
                  onClick={() => handleEditClick(item)}
                  className='px-4 py-1 rounded bg-black text-white hover:bg-gray-800 select-none'
                  title="Edit"
                  type="button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(item._id, item.name)}
                  className='px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700 select-none'
                  title="Delete"
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        }

      </div>
    </>
  )
}

export default List