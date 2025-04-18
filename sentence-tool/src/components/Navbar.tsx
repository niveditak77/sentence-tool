import React from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import './Homepage.css';

const Navbar: React.FC = () => {
  return (
    <div className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <nav className="flex justify-between items-center px-6 py-4">
        <div className="w-1/3 md:w-1/4"></div>

        <div className="w-1/3 flex justify-center md:ml-6">
        <h1 className="text-xl font-semibold text-gray-800 font-inter navbar-title">
  Sentence Construction
</h1>

        </div>

        <div className="w-1/3 flex justify-end">
          <BsThreeDotsVertical size={24} className="cursor-pointer text-gray-700" />
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
