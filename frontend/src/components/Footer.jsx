import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  // Scroll to top on link click
  const handleScrollTop = () => window.scrollTo({ top: 0, behavior: 'instant' });

  return (
    <footer className="bg-white border-t">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm max-w-7xl mx-auto px-4">
        {/* Logo and About */}
        <div>
          <img src={assets.logo} className="mb-5 w-32" alt="Forever Logo" />
          <p className="w-full md:w-2/3 text-gray-600">
            Forever is your trusted online destination for quality fashion and lifestyle products. Discover, explore, and shop from our curated collections with confidence and ease.
          </p>
          {/* Social Icons */}
          <div className="flex gap-4 mt-5">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg className="w-5 h-5 text-gray-500 hover:text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12"></path></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg className="w-5 h-5 text-gray-500 hover:text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 11.1 9.03c0 .34.04.67.1.99C7.72 9.86 4.77 8.13 2.77 5.6c-.37.63-.58 1.36-.58 2.14 0 1.48.75 2.78 1.89 3.54-.7-.02-1.36-.21-1.94-.53v.05c0 2.07 1.47 3.8 3.42 4.19-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.12 2.94 3.99 2.97A8.6 8.6 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.37-.01-.56A8.7 8.7 0 0 0 24 4.59a8.48 8.48 0 0 1-2.54.7z"></path></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg className="w-5 h-5 text-gray-500 hover:text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.5.75a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path></svg>
            </a>
          </div>
        </div>

        {/* Company Links */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>
              <Link to="/" className="hover:text-black transition" onClick={handleScrollTop}>Home</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-black transition" onClick={handleScrollTop}>About us</Link>
            </li>
            <li>
              <Link to="/collection" className="hover:text-black transition" onClick={handleScrollTop}>Collection</Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="hover:text-black transition" onClick={handleScrollTop}>Privacy Policy</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>
              <a href="tel:+923123456789" className="hover:text-black transition">+923123456789</a>
            </li>
            <li>
              <a href="mailto:contact@foreveryou.com" className="hover:text-black transition">contact@foreveryou.com</a>
            </li>
            <li className="mt-2">
              <span className="block">Mon - Fri: 9:00am - 6:00pm</span>
            </li>
          </ul>
        </div>
      </div>

      <div>
        <hr />
        <p className="py-5 text-xs text-center text-gray-500">
          &copy; 2024 forever.com - All Rights Reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
