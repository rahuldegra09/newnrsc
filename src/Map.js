import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, GeoJSON, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ChartComponent from './LineChart.js';
import Time from './components/Time.js';
// eslint-disable-next-line
function MapWithHoverAndClickHandler() {
 
    const [indiaGeoJSON, setIndiaGeoJSON] = useState(null);
    // eslint-disable-next-line
    const [hoveredFeature, setHoveredFeature] = useState(null);
    const [clickedLatLng, setClickedLatLng] = useState(null);
    const [fetchedData, setFetchedData] = useState(null);
    const [placeName, setPlaceName] = useState(null);

    
   
    useEffect(() => {
       
        const fetchIndiaGeoJSON = async () => {
            try {
                const response = await fetch('/data/india6.geojson');
                const data = await response.json();
                setIndiaGeoJSON(data);
            } catch (error) {
                console.error('Error fetching India GeoJSON:', error);
            }
        };
              fetchIndiaGeoJSON();
         }, []);
     
    

   
    

    const handleFeatureHover = (event) => {
        const layer = event.target;
        layer.setStyle({
            weight: 3,
            color: 'blue',
            dashArray: '2',
            fillOpacity: 0.8
        });
        setHoveredFeature(layer.feature);
    };

    const handleFeatureHoverEnd = (event) => {
        const layer = event.target;
        layer.setStyle({
            weight: 5,
            color: 'green',
            dashArray: '6',
            fillOpacity: 0.9
        });
        setHoveredFeature(null);
    };

    const handleMapClick = async (event) => {
        const { lat, lng } = event.latlng;

        try {
            const response = await fetch(`https://backend-743j.onrender.com/api/data?lat=${lat}&lng=${lng}`);
            const data = await response.json();
            setClickedLatLng({ lat, lon: lng });
            setFetchedData(data);
            const reverseGeocodeResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const reverseGeocodeData = await reverseGeocodeResponse.json();
            setPlaceName(reverseGeocodeData.display_name);

            // Fetch place name using reverse geocoding
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
   
    

    const MapClickHandler = () => {
        useMapEvents({
            click(event) {
                handleMapClick(event);
            },
        });

        return null;
    };

    const onEachFeature = (feature, layer) => {
        layer.on({
            mouseover: handleFeatureHover,
            mouseout: handleFeatureHoverEnd
        });
    };
    const style = () => {
        const colors = ['blue', 'green', 'red', 'orange']; // Define your colors here
        const index = Math.floor(Math.random() * colors.length); // Randomly choose a color from the array
        return {
            fillColor: colors[index],
            weight: 1,
            color: 'black',
            dashArray: '2',
            fillOpacity: 0.1
        };
    };

    return (
        <div className='p-3 gap-2 md:flex grid'>
            <div className='p-3 relative  items-center sm:w-full md:w-[60%] h-fit sm: rounded shadow-lg shadow-cyan-700 bg-gray-800 '>
                <MapContainer scrollWheelZoom={false} center={[22.5937,82.9629]} zoom={4} style={{ height: '500px', width: '100%' }} >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                   

                    {indiaGeoJSON && <GeoJSON data={indiaGeoJSON} onEachFeature={onEachFeature} style={style}  />}
                    <MapClickHandler />
                    {fetchedData && (
                        <Popup className='' maxWidth={200} maxHeight={200}  closeOnEscapeKey closeOnClick   position={[clickedLatLng.lat, clickedLatLng.lon]}>
                            <div className=' rounded shadow-lg shadow-green-900 '>
                                <h2 className="text-lg font-bold">Clicked Coordinates</h2>
                                <p className=''>Latitude: {clickedLatLng.lat}, Longitude: {clickedLatLng.lon}</p>

                            </div>
                        </Popup>
                    )}
                </MapContainer>
                {/* {hoveredFeature && (
                    <div className="bg-blue-500  text-white p-4">
                        <h2 className="text-lg font-bold">Hovered Feature Properties</h2>
                        <pre>{JSON.stringify(hoveredFeature.properties, null, 2)}</pre>
                    </div>
                )} */}
                {fetchedData ? (
                    fetchedData.map((entry, index) => (
                        <div key={index} className='text-xs font-serif text-white px-2'>
                            <h2>Getting Data From Coordinates...</h2>
                            <div className='flex justify-between'>
                                <p>Coordinates: {entry.location.coordinates.join(',')}</p>
                                <p>Distance: {entry.dist.calculated}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='text-xs font-serif px-2 text-white flex justify-between'>
                        <p>Range Of Data Is From....</p>
                            <p>8 &lt;latitude&lt;37 ,68&lt;longitude&lt;97 </p>
                    </div>
                )}

            </div>
                
            <div className='shadow-lg shadow-red-700 md:w-[40%] sm:w-full flex flex-col'>
                <Time />
                
              <div className=' p-1 flex flex-grow '>
                {!fetchedData && (
                        <div className="pt-1 text-gray-300 gap-10 flex rounded shadow-orange-500 shadow-sm  w-full flex-col ">
                            <div className='flex  '>
                                <p className='font-serif'>Click On The Map To Get The Data OF Particula Palace:</p>
                                </div>
                            <div className="flex  items-center justify-center w-full  text-gray-500 dark:text-gray-100 dark:bg-gray-950">
                                <div>
                                    <h1 className="text-xl md:text-5xl font-bold flex items-center">L<svg stroke="currentColor" fill="currentColor" strokeWidth="0"
                                        viewBox="0 0 24 24" className="animate-spin" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM13.6695 15.9999H10.3295L8.95053 17.8969L9.5044 19.6031C10.2897 19.8607 11.1286 20 12 20C12.8714 20 13.7103 19.8607 14.4956 19.6031L15.0485 17.8969L13.6695 15.9999ZM5.29354 10.8719L4.00222 11.8095L4 12C4 13.7297 4.54894 15.3312 5.4821 16.6397L7.39254 16.6399L8.71453 14.8199L7.68654 11.6499L5.29354 10.8719ZM18.7055 10.8719L16.3125 11.6499L15.2845 14.8199L16.6065 16.6399L18.5179 16.6397C19.4511 15.3312 20 13.7297 20 12L19.997 11.81L18.7055 10.8719ZM12 9.536L9.656 11.238L10.552 14H13.447L14.343 11.238L12 9.536ZM14.2914 4.33299L12.9995 5.27293V7.78993L15.6935 9.74693L17.9325 9.01993L18.4867 7.3168C17.467 5.90685 15.9988 4.84254 14.2914 4.33299ZM9.70757 4.33329C8.00021 4.84307 6.53216 5.90762 5.51261 7.31778L6.06653 9.01993L8.30554 9.74693L10.9995 7.78993V5.27293L9.70757 4.33329Z">
                                        </path>
                                    </svg> ading . . .</h1>
                                </div>
                            </div>
                    </div>
                )}


                {fetchedData && (
                    <div className="bg-green-900 text-white p-1 w-full">
                            <h2 className='text-sm  font-serif'>Tempreture Data :  {placeName}</h2>
                            <div className='bg-pink-200 w-full flex '>
                                <ChartComponent fetchedData={fetchedData} />
                            </div>
                            
                    </div>
                    
                )}
                </div>
            </div>
        </div>

    );
}

export default MapWithHoverAndClickHandler;
