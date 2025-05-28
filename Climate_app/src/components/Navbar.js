import React from 'react'

const Navbar = () => {
  return (
      <nav className="p-1 bg-white ">
      <div className='grid grid-cols-3 gap-2 '>
        <div className='justify-center flex '>
                <img src="isro.png" alt="Start Logo" width={80} height={80}  />
            </div>

            <div className='flex flex-col items-center justify-center text-black text-[10px] md:text-2xl '>
              <h1>Explore Historical Climate Trends</h1>
              <h1>Climate Insights.</h1>
            </div>
        <div className=' flex justify-center '>
                  <img src="ss.jpg" alt="Start Logo" width={50} height={50} />
            </div>

        </div>
      </nav>
  )
}

export default Navbar
