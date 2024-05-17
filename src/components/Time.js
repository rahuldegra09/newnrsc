import React,{useState} from 'react'

const Time = () => {
    const [showText, setShowText] = useState(false);
    const [showTemperatureText, setShowTemperatureText] = useState(false);
    const [featuresText,setFeaturesText]=useState(false);

    const toggleText = () => {
        setShowText(prevShowText => !prevShowText); // Toggle the value of showText
    };

    const toggleTemperatureText = () => {
        setShowTemperatureText(prevShowTemperatureText => !prevShowTemperatureText); // Toggle the value of showTemperatureText
    };
    const featuretexttoggle=()=>{
        setFeaturesText(prevShowText=>!prevShowText);
        };


  return (
      <div className=' '>
          <div className=' w-full '>
              <img src="world.webp" alt='world' width={100} height={100} className='h-12 md:h-20 w-full object-cover rounded-t-lg'></img>
          </div>
          <div className='bg-zinc-700 p-3  rounded-b-lg'>
              <p className='text-white text-xs font-thin'>An interactive visual window into our planet's changing climate, based on the most recent measurements and climate model predictions (read the research) </p>
              <div>
              <div className='flex justify-between  p-2'>
                  <div className='flex gap-1'>
                      <img alt='timep' src='time.png' width={30} height={30} className='h-6'></img>
                      <p className='text-red-200 font-serif items-center flex text-xs'>Climate Periods</p>
                  </div>
                  <button className='' onClick={toggleText}>
                      {showText ? (
                          <svg className='h-5' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 21">
                              {/* Your up arrow SVG */}
                              <path d="M12 7.29l-5.3 5.3-1.42-1.42L12 4.44l6.72 6.72-1.42 1.42z"></path>
                          </svg>
                      ) : (
                          <svg className='h-5' xmlns="http://www.w3.org/2000/svg" viewBox="0 2 24 24">
                              {/* Your down arrow SVG */}
                              <path d="M22.782 13.8 17 19.582 11.218 13.8a1 1 0 0 0-1.414 1.414L16.29 21.7a.992.992 0 0 0 .71.292.997.997 0 0 0 .71-.292l6.486-6.486a1 1 0 0 0-1.414-1.414z"></path>
                          </svg>
                      )}
                  </button>
              </div>

              <div className="">
                  {showText && (
                          <div className="mt-2 px-4 text-white transition-opacity duration-500 opacity-50 animate-fade-in">
                          <p className="text-xs font-serif">This application allows exploring climate data for approximately 30-year periods:</p>
                          <ul className="text-[10px] p-1 list-disc pl-4">
                              <li>1979–1990, 1991–2000,2001-2023 historical periods</li>
                              <li>2024–2070,and 2071–2099 in the future</li>
                          </ul>
                      </div>
                  )}
              </div>
              </div>
              <div>
                  <div className='flex justify-between  p-2'>
                      <div className='flex gap-1'>
                          <img alt='therma' src='therma.png' width={30} height={30} className='h-6'></img>
                          <h3 className='text-red-500 font-serif items-center flex text-xs'>Temp<p className='text-sky-500'>erature</p></h3>
                      </div>
                      <button className='' onClick={toggleTemperatureText}>
                          {showTemperatureText ?  (
                              <svg className='h-5' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 21">
                                  {/* Your up arrow SVG */}
                                  <path d="M12 7.29l-5.3 5.3-1.42-1.42L12 4.44l6.72 6.72-1.42 1.42z"></path>
                              </svg>
                          ) : (
                              <svg className='h-5' xmlns="http://www.w3.org/2000/svg" viewBox="0 2 24 24">
                                  {/* Your down arrow SVG */}
                                  <path d="M22.782 13.8 17 19.582 11.218 13.8a1 1 0 0 0-1.414 1.414L16.29 21.7a.992.992 0 0 0 .71.292.997.997 0 0 0 .71-.292l6.486-6.486a1 1 0 0 0-1.414-1.414z"></path>
                              </svg>
                          )}
                      </button>
                  </div>

                  <div className="">
                      {showTemperatureText && (
                          <div className="mt-2 px-4 text-white transition-opacity duration-500 opacity-50 animate-fade-in">
                              <p className="text-xs font-serif">This application allows exploring climate data for approximately 30-year periods:</p>
                              <ul className="text-[10px] p-1 list-disc pl-4">
                                  <li>Real-time temperature data visualization</li>
                                  <li>Geographic mapping of temperature variations across India</li>
                                  <li>Graphical representation of temperature trends over time</li>
                                  <li>Integration with satellite data for comprehensive temperature monitoring</li>
                                  <li>Customizable temperature charts and graphs for user-specific analysis.</li>
                                  <li>Interactive features such as zooming, filtering, and tooltip displays for enhanced data exploration.</li>
                              </ul>
                          </div>
                      )}
                  </div>
              </div>
              <div>
                  <div className='flex justify-between  p-2'>
                      <div className='flex gap-1'>
                          <img alt='feature' src='feature.png' width={30} height={30} className='h-6'></img>
                          <h3 className='text-yellow-500 font-serif items-center flex text-xs'>Feat<p className='text-blue-400'>ures</p></h3>
                      </div>
                      <button className='' onClick={featuretexttoggle}>
                          {featuresText ? (
                              <svg className='h-5' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 21">
                                  {/* Your up arrow SVG */}
                                  <path d="M12 7.29l-5.3 5.3-1.42-1.42L12 4.44l6.72 6.72-1.42 1.42z"></path>
                              </svg>
                          ) : (
                              <svg className='h-5' xmlns="http://www.w3.org/2000/svg" viewBox="0 2 24 24">
                                  {/* Your down arrow SVG */}
                                  <path d="M22.782 13.8 17 19.582 11.218 13.8a1 1 0 0 0-1.414 1.414L16.29 21.7a.992.992 0 0 0 .71.292.997.997 0 0 0 .71-.292l6.486-6.486a1 1 0 0 0-1.414-1.414z"></path>
                              </svg>
                          )}
                      </button>
                  </div>

                  <div className="">
                      {featuresText && (
                          <div className="mt-2 px-4 text-white transition-opacity duration-500 opacity-50 animate-fade-in">
                              <p className="text-xs font-serif">This application allows exploring climate data for approximately 30-year periods:</p>
                              <ul className="text-[10px] p-1 list-disc pl-4">
                                  <li>Interactive maps: Visually explore global maps of past, present and future climate zones according to the most commonly used  climate classification . Zoom in, pan out, and explore details down to 1 km.</li>
                                  <li>Compare past, present and future climate zones</li>
                                  <li>Involves extracting and processing temperature data.</li>
                                  <li>Focus on presenting data in an interactive and visually engaging manner.</li>
                                  <li>Aim to provide insights and facilitate decision-making.</li>
                                  <li>Comprehensive solution to communicate temperature patterns and trends.</li>
                                  <li>Granular level analysis for better understanding.</li>
                                  <li>Empowering users to utilize environmental information effectively.</li>
                              </ul>
                          </div>
                      )}
                  </div>
              </div>
              


          </div>


      </div>
  )
}

export default Time