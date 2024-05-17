import React from 'react'

const Navbar = () => {
  return (
      <nav className="p-1 bg-slate-800 ">
      <div className='grid grid-cols-4 gap-2 '>
            <div className=' flex  justify-start items-center'>
                <img src="isro.png" alt="Start Logo" width={80} height={80}  />
            </div>

            <div className='flex flex-col items-center justify-center text-white text-[10px] md:text-2xl col-span-2'>
              <h1>Explore Historical Temperature Trends</h1>
              <h1>National Remote Sensing Center</h1>
              <h1>Government of India.</h1>
            </div>
            <div className=' flex justify-end  items-center'>
                  <img src="ss.jpg" alt="Start Logo" width={50} height={50} />
            </div>

        </div>
      </nav>
  )
}

export default Navbar