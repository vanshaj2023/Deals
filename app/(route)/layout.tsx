import React from 'react'
import { ReactNode } from 'react';

const Routelayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className='p-5 sm:px-10 md:px-20 lg:px-40 xl:px-60 2xl:px-80'>
      {children}
    </div>
  )
}

export default Routelayout;
