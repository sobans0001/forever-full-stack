import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState("")
  const [newSubCategory, setNewSubCategory] = useState({}) // {catId: {name:'', type:''}}
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState({ id: null, name: "", type: "", mode: "" }); // mode: 'category' or 'subcategory'

  // Fetch categories from backend
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await axios.get(backendUrl + '/api/category/list')
      if (res.data.success) setCategories(res.data.categories)
    } catch (e) {
      toast.error("Failed to load categories")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Add new category
  const handleAddCategory = async () => {
    const trimmed = newCategory.trim()
    if (!trimmed) return
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(backendUrl + '/api/category/add', { name: trimmed }, { headers: { token } })
      if (res.data.success) {
        setNewCategory("")
        fetchCategories()
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error("Failed to add category")
    }
  }

  // Delete category (show confirm)
  const handleDeleteCategory = (id) => {
    setConfirmDelete({ id, name: (categories.find(c => c._id === id)?.name || ""), type: "", mode: "category" });
  }

  // Delete subcategory (show confirm)
  const handleDeleteSubCategory = (catId, sub) => {
    setConfirmDelete({ id: catId, name: sub.name, type: sub.type, mode: "subcategory" });
  }

  // Confirm delete (category or subcategory)
  const confirmDeleteAction = async () => {
    try {
      const token = localStorage.getItem('token');
      if (confirmDelete.mode === "category") {
        const res = await axios.post(backendUrl + '/api/category/delete', { id: confirmDelete.id }, { headers: { token } });
        if (res.data.success) {
          fetchCategories();
        } else {
          toast.error(res.data.message);
        }
      } else if (confirmDelete.mode === "subcategory") {
        const res = await axios.post(
          backendUrl + '/api/category/delete-sub',
          { categoryId: confirmDelete.id, subCategory: { name: confirmDelete.name, type: confirmDelete.type } },
          { headers: { token } }
        );
        if (res.data.success) {
          fetchCategories();
        } else {
          toast.error(res.data.message);
        }
      }
      setConfirmDelete({ id: null, name: "", type: "", mode: "" });
    } catch (e) {
      toast.error("Failed to delete");
      setConfirmDelete({ id: null, name: "", type: "", mode: "" });
    }
  }

  // Add new subcategory
  const handleAddSubCategory = async (catId) => {
    const sub = newSubCategory[catId] || { name: "", type: "" }
    if (!sub.name.trim() || !sub.type.trim()) return
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        backendUrl + '/api/category/add-sub',
        { categoryId: catId, subCategory: { name: sub.name.trim(), type: sub.type.trim() } },
        { headers: { token } }
      )
      if (res.data.success) {
        setNewSubCategory({ ...newSubCategory, [catId]: { name: "", type: "" } })
        fetchCategories()
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error("Failed to add subcategory")
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Confirm Delete Modal */}
      {confirmDelete.id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90vw] border border-gray-300">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Confirm Deletion</h2>
            <p className="mb-4 text-gray-700">
              {confirmDelete.mode === "category"
                ? <>Are you sure you want to delete <span className="font-bold">{confirmDelete.name}</span> category?</>
                : <>Are you sure you want to delete subcategory <span className="font-bold">{confirmDelete.name}</span> ({confirmDelete.type})?</>
              }
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete({ id: null, name: "", type: "", mode: "" })}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAction}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6">Category Management</h2>
      <div className="mb-6">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            placeholder="Add new category"
            className="px-3 py-2 border rounded w-60"
          />
          <button
            type="button"
            className="px-4 py-2 bg-black text-white rounded"
            onClick={handleAddCategory}
            disabled={loading}
          >
            Add Category
          </button>
        </div>
      </div>
      <div>
        {categories.map((cat) => (
          <div key={cat._id} className="mb-6 border rounded p-4 bg-gray-50 relative">
            <button
              className="absolute top-2 right-2 text-lg text-gray-400 hover:text-red-600"
              title="Delete category"
              onClick={() => handleDeleteCategory(cat._id)}
            >
              &times;
            </button>
            <div className="font-semibold text-lg mb-2">{cat.name}</div>
            <div className="mb-2">
              <span className="font-medium">Subcategories:</span>
              <ul className="list-disc ml-6 mt-1">
                {(cat.subCategories || []).map((sub, i) => (
                  <li key={i} className="text-gray-700 flex items-center">
                    <span>{sub.name} <span className="text-xs text-gray-400 ml-1">({sub.type})</span></span>
                    <button
                      className="ml-2 text-xs text-gray-400 hover:text-red-600"
                      title="Delete subcategory"
                      onClick={() => handleDeleteSubCategory(cat._id, sub)}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newSubCategory[cat._id]?.name || ""}
                onChange={e => setNewSubCategory({
                  ...newSubCategory,
                  [cat._id]: { ...newSubCategory[cat._id], name: e.target.value }
                })}
                placeholder="Subcategory name"
                className="px-2 py-1 border rounded w-32"
              />
              <select
                value={newSubCategory[cat._id]?.type || ""}
                onChange={e => setNewSubCategory({
                  ...newSubCategory,
                  [cat._id]: { ...newSubCategory[cat._id], type: e.target.value }
                })}
                className="px-2 py-1 border rounded w-32"
              >
                <option value="">Select type</option>
                <option value="upper_body">Upper Body</option>
                <option value="lower_body">Lower Body</option>
                <option value="dresses">Dresses</option>
              </select>
              <button
                type="button"
                className="px-3 py-1 bg-black text-white text-xs rounded"
                onClick={() => handleAddSubCategory(cat._id)}
                disabled={loading}
              >
                Add Subcategory
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Categories
