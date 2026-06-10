import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

const CustomerLayout: React.FC = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
  </>
);

export default CustomerLayout;
