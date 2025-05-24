import React, { useState } from 'react'
import {assets} from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import Cropper from 'react-easy-crop'

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

function getCroppedImg(imageSrc, crop, fileName) {
  // Utility to crop image using canvas
  return new Promise((resolve) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
      canvas.toBlob((blob) => {
        blob.name = fileName;
        resolve(blob);
      }, 'image/jpeg');
    };
  });
}

const Add = ({token}) => {

  const [image1,setImage1] = useState(false)
  const [image2,setImage2] = useState(false)
  const [image3,setImage3] = useState(false)
  const [image4,setImage4] = useState(false)

   const [name, setName] = useState("");
   const [description, setDescription] = useState("");
   const [price, setPrice] = useState("");
   const [category, setCategory] = useState("");
   const [subCategory, setSubCategory] = useState("");
   const [bestseller, setBestseller] = useState(false);
   const [sizes, setSizes] = useState([]);

   // For cropping
   const [cropIdx, setCropIdx] = useState(null);
   const [cropImage, setCropImage] = useState(null);
   const [crop, setCrop] = useState({ x: 0, y: 0 });
   const [zoom, setZoom] = useState(1);
   const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

   const [categoryList, setCategoryList] = useState([]);
   const [subCategoryMap, setSubCategoryMap] = useState({}); // {categoryName: [subcat1, subcat2, ...]}

   // Fetch category and subcategory names from backend
   React.useEffect(() => {
     const fetchCategories = async () => {
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
           // Set default values if not set
           if (!category && cats.length > 0) {
             setCategory(cats[0].name);
             // Set subcategory for first category if available
             if ((cats[0].subCategories || []).length > 0) {
               setSubCategory(cats[0].subCategories[0].name);
             } else {
               setSubCategory("");
             }
           }
         }
       } catch (e) {
         // fallback to defaults if error
       }
     };
     fetchCategories();
     // eslint-disable-next-line
   }, []);

   // When category changes, update subCategory to first available
   React.useEffect(() => {
     if (category && subCategoryMap[category]) {
       if (!subCategoryMap[category].includes(subCategory)) {
         setSubCategory(subCategoryMap[category][0] || "");
       }
     }
   }, [category, subCategoryMap]);

   const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      
      const formData = new FormData()

      formData.append("name",name)
      formData.append("description",description)
      formData.append("price",price)
      formData.append("category",category)
      formData.append("subCategory",subCategory)
      formData.append("bestseller",bestseller)
      formData.append("sizes",JSON.stringify(sizes))

      image1 && formData.append("image1",image1)
      image2 && formData.append("image2",image2)
      image3 && formData.append("image3",image3)
      image4 && formData.append("image4",image4)

      const response = await axios.post(backendUrl + "/api/product/add",formData,{headers:{token}})

      if (response.data.success) {
        toast.success(response.data.message)
        setName('')
        setDescription('')
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
        setPrice('')
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
   }

   const handleImageChange = (setter, idx) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image size should be less than 2MB');
      return;
    }
    // Show cropper
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result);
      setCropIdx(idx);
    };
    reader.readAsDataURL(file);
    // Save original file for cropping
    setter(file);
  };

  const handleCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    let file, setter;
    if (cropIdx === 0) { file = image1; setter = setImage1; }
    if (cropIdx === 1) { file = image2; setter = setImage2; }
    if (cropIdx === 2) { file = image3; setter = setImage3; }
    if (cropIdx === 3) { file = image4; setter = setImage4; }
    const cropped = await getCroppedImg(cropImage, croppedAreaPixels, file.name);
    setter(new File([cropped], file.name, { type: 'image/jpeg' }));
    setCropImage(null);
    setCropIdx(null);
  };

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
        {/* Cropper Modal */}
        {cropImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="relative w-72 h-72">
                <Cropper
                  image={cropImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </div>
              <div className="flex gap-2 mt-4 justify-end">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => { setCropImage(null); setCropIdx(null); }}>Cancel</button>
                <button type="button" className="px-4 py-2 bg-black text-white rounded" onClick={handleCropSave}>Crop & Save</button>
              </div>
            </div>
          </div>
        )}
        <div>
          <p className='mb-2'>Upload Image</p>

          <div className='flex gap-2'>
            <label htmlFor="image1">
              <img className='w-20' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
              <input onChange={handleImageChange(setImage1, 0)} type="file" id="image1" hidden/>
            </label>
            <label htmlFor="image2">
              <img className='w-20' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
              <input onChange={handleImageChange(setImage2, 1)} type="file" id="image2" hidden/>
            </label>
            <label htmlFor="image3">
              <img className='w-20' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
              <input onChange={handleImageChange(setImage3, 2)} type="file" id="image3" hidden/>
            </label>
            <label htmlFor="image4">
              <img className='w-20' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
              <input onChange={handleImageChange(setImage4, 3)} type="file" id="image4" hidden/>
            </label>
          </div>
        </div>

        <div className='w-full'>
          <p className='mb-2'>Product name</p>
          <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type here' required/>
        </div>

        <div className='w-full'>
          <p className='mb-2'>Product description</p>
          <textarea onChange={(e)=>setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Write content here' required/>
        </div>

        <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

            <div>
              <p className='mb-2'>Product category</p>
              <select value={category} onChange={(e) => {
                setCategory(e.target.value);
                // Reset subcategory if category changes
                const subs = subCategoryMap[e.target.value] || [];
                setSubCategory(subs.length > 0 ? subs[0] : "");
              }} className='w-full px-3 py-2'>
                  {categoryList.length === 0
                    ? <option value="">No categories</option>
                    : categoryList.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))
                  }
              </select>
            </div>

            <div>
              <p className='mb-2'>Sub category</p>
              <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className='w-full px-3 py-2'>
                  {(subCategoryMap[category] || []).length === 0
                    ? <option value="">No subcategories</option>
                    : subCategoryMap[category].map((sub, idx) => (
                        <option key={idx} value={sub}>{sub}</option>
                      ))
                  }
              </select>
            </div>
            
            <div>
              <p className='mb-2'>Product Price</p>
              <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='25' />
            </div>

        </div>

        <div>
          <p className='mb-2'>Product Sizes</p>
          <div className='flex gap-3'>
            <div onClick={()=>setSizes(prev => prev.includes("S") ? prev.filter( item => item !== "S") : [...prev,"S"])}>
              <p className={`${sizes.includes("S") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>S</p>
            </div>
            
            <div onClick={()=>setSizes(prev => prev.includes("M") ? prev.filter( item => item !== "M") : [...prev,"M"])}>
              <p className={`${sizes.includes("M") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>M</p>
            </div>

            <div onClick={()=>setSizes(prev => prev.includes("L") ? prev.filter( item => item !== "L") : [...prev,"L"])}>
              <p className={`${sizes.includes("L") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>L</p>
            </div>

            <div onClick={()=>setSizes(prev => prev.includes("XL") ? prev.filter( item => item !== "XL") : [...prev,"XL"])}>
              <p className={`${sizes.includes("XL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>XL</p>
            </div>

            <div onClick={()=>setSizes(prev => prev.includes("XXL") ? prev.filter( item => item !== "XXL") : [...prev,"XXL"])}>
              <p className={`${sizes.includes("XXL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>XXL</p>
            </div>
          </div>
        </div>

        <div className='flex gap-2 mt-2'>
          <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' />
          <label className='cursor-pointer' htmlFor="bestseller">Add to bestseller</label>
        </div>

        <button type="submit" className='w-28 py-3 mt-4 bg-black text-white'>ADD</button>

    </form>
  )
}

export default Add