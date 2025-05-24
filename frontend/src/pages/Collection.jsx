import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import axios from 'axios';

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relavent');
  const [categoriesList, setCategoriesList] = useState([]);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/category/list`);
        if (res.data?.success && Array.isArray(res.data.categories)) {
          setCategoriesList(res.data.categories);
        } else {
          setCategoriesList([]);
        }
      } catch (e) {
        setCategoriesList([]);
      }
    };
    fetchCategories();
  }, []);

  const toggleCategory = (e) => {
    const value = e.target.value;
    let updatedCategories;

    if (category.includes(value)) {
      updatedCategories = category.filter(item => item !== value);
    } else {
      updatedCategories = [...category, value];
    }

    setCategory(updatedCategories);
    if (!updatedCategories.includes(value)) {
      setSubCategory([]); // clear subcategories when deselecting a category
    }
  };

  const toggleSubCategory = (e) => {
    const value = e.target.value;
    if (subCategory.includes(value)) {
      setSubCategory(prev => prev.filter(item => item !== value));
    } else {
      setSubCategory(prev => [...prev, value]);
    }
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory));
    }

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let sortedCopy = filterProducts.slice();

    switch (sortType) {
      case 'low-high':
        setFilterProducts(sortedCopy.sort((a, b) => a.price - b.price));
        break;
      case 'high-low':
        setFilterProducts(sortedCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  const getFilteredSubCategories = () => {
    let subcats = [];

    if (category.length > 0) {
      categoriesList.forEach(cat => {
        if (category.includes(cat.name)) {
          subcats = subcats.concat(cat.subCategories || []);
        }
      });
    }

    // Unique by name and type
    return subcats.filter(
      (v, i, arr) => arr.findIndex(x => x.name === v.name && x.type === v.type) === i
    );
  };

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/* Filter Panel */}
      <div className='min-w-60'>
        <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>
          FILTERS
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
        </p>

        {/* Category Filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {categoriesList.map((cat, i) => (
              <label key={i} className='flex gap-2'>
                <input
                  className='w-3'
                  type="checkbox"
                  value={cat.name}
                  onChange={toggleCategory}
                  checked={category.includes(cat.name)}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        {/* SubCategory Filter (only show if any category is selected) */}
        {category.length > 0 && (
          <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
            <p className='mb-3 text-sm font-medium'>TYPE</p>
            <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
              {getFilteredSubCategories().map((sub, i) => (
                <label className='flex gap-2' key={i}>
                  <input
                    className='w-3'
                    type="checkbox"
                    value={sub.name}
                    onChange={toggleSubCategory}
                    checked={subCategory.includes(sub.name)}
                  />
                  {sub.name}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Side - Product List */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          <select onChange={(e) => setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2'>
            <option value="relavent">Sort by: Relavent</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {filterProducts.map((item, index) => (
            <ProductItem
              key={index}
              name={item.name}
              id={item._id}
              price={item.price}
              image={item.image}
              avgRating={item.avgRating}
              ratingCount={item.ratingCount}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
