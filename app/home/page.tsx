'use client';

import React from 'react'
import Product from '../product/page'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'

function HomePage() {
  return (
   <>
    <div >
      <Navbar />
      <HeroSection />
      <Product />
    </div>
   </>
  )
}

export default HomePage