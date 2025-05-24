import React, { useEffect, useState, useRef } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import Login from './components/Login'
import Categories from './pages/Categories'
import ShippingFee from './pages/ShippingFee'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = 'Rs '

const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'');
  const timeoutRef = useRef(null);

  // Session timeout logic
  useEffect(() => {
    if (!token) return;

    const logout = () => {
      setToken('');
      localStorage.removeItem('token');
    };

    const resetTimeout = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(logout, 300000); // 5 minutes
    };

    // List of events to listen for user activity
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];

    events.forEach(event =>
      window.addEventListener(event, resetTimeout)
    );

    resetTimeout();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event =>
        window.removeEventListener(event, resetTimeout)
      );
    };
  }, [token]);

  useEffect(()=>{
    localStorage.setItem('token',token)
  },[token])

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      {token === ""
        ? <Login setToken={setToken} />
        : <>
          <Navbar setToken={setToken} />
          <hr />
          <div className='flex w-full'>
            <Sidebar />
            <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
              <Routes>
                <Route path='/add' element={<Add token={token} />} />
                <Route path='/list' element={<List token={token} />} />
                <Route path='/orders' element={<Orders token={token} />} />
                <Route path='/categories' element={<Categories />} />
                <Route path='/shipping-fee' element={<ShippingFee />} />
              </Routes>
            </div>
          </div>
        </>
      }
    </div>
  )
}

export default App