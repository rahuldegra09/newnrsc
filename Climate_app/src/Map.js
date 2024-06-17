import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, GeoJSON, Popup,  } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ChartComponent from './LineChart.js';
import Time from './components/Time.js';
import AveragedChart from './AveragedChart.js';
import stateNameMapping from './constants/state.js'
function MapWithHoverAndClickHandler() {
    const [indiaGeoJSON, setIndiaGeoJSON] = useState(null);
    const [hoveredFeature, setHoveredFeature] = useState(null);
    const [clickedLatLng, setClickedLatLng] = useState(null);
    const [fetchedData, setFetchedData] = useState(null);
    const [placeName, setPlaceName] = useState(null);
    const [hoverPosition, setHoverPosition] = useState(null);
    const [interactionType, setInteractionType] = useState(null); // 'hover' or 'click'
    const [averagedData, setAveragedData] = useState(null);
    const [error, setError] = useState(null);
    const [state ,setstate]=useState(null);
    const [zoomLevel, setZoomLevel] = useState("4"); // State to track the zoom level

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
        const handleZoomEnd = (event) => {
            setZoomLevel(event.target._zoom); // Update zoom level state
            console.log(zoomLevel);
        };
        
        fetchIndiaGeoJSON();
    }, []);
   
    const handleFeatureHover = (event) => {
        const layer = event.target;
        layer.setStyle({
            weight: 2,
            color: 'blue',
            dashArray: '2',
            fillOpacity: 0.4,
        });
        setInteractionType('hover'); // Set interaction type to hover
        setHoveredFeature(layer.feature);
        setHoverPosition(event.latlng);
    };
    const handleZoomEnd = (event) => {
        setZoomLevel(event.target._zoom); // Update zoom level state
    };
    

    const handleFeatureHoverEnd = (event) => {
        const layer = event.target;
        layer.setStyle({
            weight: 2,
            color: 'green',
            dashArray: '3',
            fillOpacity: 0.2,
        });
        setHoveredFeature(null);
        setHoverPosition(null);
        setInteractionType(null); // Reset interaction type
        
    };

    const coordinatesdata = async (event) => {
        const { lat, lng } = event.latlng;

        try {
            const response = await fetch(`http://localhost:3001/api/data?lat=${lat}&lng=${lng}`);
            const data = await response.json();
            setClickedLatLng({ lat, lon: lng });
            setFetchedData(data);
            console.log("data fetched");
            setInteractionType('click'); // Set interaction type to click
            const reverseGeocodeResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const reverseGeocodeData = await reverseGeocodeResponse.json();
            setPlaceName(reverseGeocodeData.display_name);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const getFirstPolygonCoordinates = (feature) => {
        const { type, coordinates } = feature.geometry;

        if (type === 'Polygon') {
            return coordinates; // Return the coordinates as-is for a single polygon
        } else if (type === 'MultiPolygon') {
            return coordinates[0]; // Return the first polygon's coordinates
        }

        return [];
    };

    const handleFeatureClick = async (event) => {
        const layer = event.target;

        const firstPolygonCoordinates = getFirstPolygonCoordinates(layer.feature);

        

        // GeoJSON Polygon format
        const geoJSON = {
            type: "Polygon",
            coordinates: firstPolygonCoordinates,
        };

        try {
            setError('wait you data is fetching')
            const response = await fetch('http://localhost:3001/api/state-dat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ coordinates: geoJSON }),
            });
            const data = await response.json();
            console.log('Fetched Data:', data); // Log the response data here

            if (Array.isArray(data) && data.length > 0) {
                // Process the fetched data to calculate yearly averages
                const yearlyData = {};

                data.forEach(entry => {
                    entry.data.forEach(({ year, temperature, precipitation }) => {
                        if (!yearlyData[year]) {
                            yearlyData[year] = { temperature: [], precipitation: [] };
                        }
                        yearlyData[year].temperature.push(temperature);
                        yearlyData[year].precipitation.push(precipitation);
                    });
                });

                const averagedData = Object.keys(yearlyData).map(year => {
                    const temps = yearlyData[year].temperature;
                    const precs = yearlyData[year].precipitation;

                    const avgTemp = temps.reduce((sum, val) => sum + val, 0) / temps.length;
                    const avgPrec = precs.reduce((sum, val) => sum + val, 0) / precs.length;

                    return { year: parseInt(year), temperature: avgTemp, precipitation: avgPrec };
                });

                console.log('Averaged Data:', averagedData);
                setAveragedData(averagedData);
                const stateName = stateNameMapping[layer.feature.properties.id] || 'Unknown State';
                setstate(stateName);
                setError('');
            } else {
                setError('No data available for the selected area.');
                setAveragedData(null);
                setstate(null);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setstate(null);
            
        }
    };

    const MapClickHandler = () => {
        useMapEvents({
            click(event) {
                if (zoomLevel > 4) {
                    coordinatesdata(event);
                }
            },
            zoomend(event) {
                handleZoomEnd(event); // Handle zoom end event
                console.log(zoomLevel);
            },
        });

        return null;
    };

    const onEachFeature = (feature, layer) => {
        layer.on({
            mouseover: handleFeatureHover,
            mouseout: handleFeatureHoverEnd,
            click: handleFeatureClick, // Add click event listener
        });
    };

    const style = () => {
        const colors = ['blue', 'green', 'red', 'orange'];
        const index = Math.floor(Math.random() * colors.length);
        return {
            fillColor: colors[index],
            weight: 1,
            color: 'black',
            dashArray: '2',
            fillOpacity: 0.3,
        };
    };

    return (
        <div className='p-3 gap-2  md:flex grid'>
            <div className='p-4  relative items-center sm:w-full md:w-[50%] h-fit rounded shadow-lg shadow-red-700'>
                <MapContainer center={[22.5937, 82.9629]} zoom={4} style={{ height: '500px', width: '100%' }}>
                    <TileLayer
                        url="https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg"
                    />
                    {indiaGeoJSON && <GeoJSON data={indiaGeoJSON} onEachFeature={onEachFeature} style={style}  />}
                    <MapClickHandler />
                    {clickedLatLng && fetchedData && (
                        <Popup position={[clickedLatLng.lat, clickedLatLng.lon]} maxWidth={200} maxHeight={200} closeOnEscapeKey closeOnClick>
                            <div className='rounded shadow-lg'>
                                <h2 className="text-lg font-bold">Clicked Coordinates</h2>
                                <p className=''>(Lat: {clickedLatLng.lat}, Log: {clickedLatLng.lon})</p>
                            </div>
                        </Popup>
                    )}
                    {hoveredFeature && hoverPosition && hoveredFeature.properties && (
                        <Popup position={hoverPosition} closeButton={false}>
                            <div className='bg-red-500 rounded-full p-2'>
                                <h3 className='text-white font-serif text-xl font-bold'>{stateNameMapping[hoveredFeature.properties.id] || 'Unknown State'}</h3>
                            </div>
                        </Popup>
                    )}
                </MapContainer>
                {fetchedData && (
                    fetchedData.map((entry, index) => (
                        <div key={index} className='text-xs font-serif text-white px-2'>
                            <h2>Getting Data From Coordinates...</h2>
                            <div className='flex justify-between'>
                                <p>Coordinates: {entry.location.coordinates.join(',')}</p>
                                <p>Distance: {entry.dist.calculated}</p>
                            </div>
                        </div>
                    ))
                )}
                

            </div>
            <div className='shadow-lg shadow-green-500  md:w-[50%] sm:w-full flex flex-col'>
                <Time />
                <div className='p-1  '>
                    {!fetchedData && !averagedData &&(
                        <div className="pt-1 text-gray-300    gap-10 rounded shadow-sm shadow-amber-400 w-full flex flex-col ">
                            <div className='flex'>
                                <p className='font-serif'>Click On The Map To Get The Data Of Particular Place:</p>
                            </div>
                            <div className="flex items-center justify-center w-full text-gray-500 ">
                                {error ? (
                                    <h1 className="text-xl md:text-5xl font-bold flex items-center">
                                        {error}
                                    </h1>
                                ) : (
                                    <h1 className="text-xl md:text-5xl font-bold flex items-center">
                                       your data will be shown here
                                       (scroll mouse and then click to get data )
                                    </h1>
                                )}
                            </div>
                        </div>
                    )}
                    <div className=''>
                        {fetchedData && zoomLevel > 4 && (
                        <div className="bg-green-900 text-white p-1 w-full">
                            <h2 className='text-sm font-serif font-bold'>Temp. & Prep. Data For : {placeName}</h2>
                            <div className='bg-purple-200 w-full '>
                                    <ChartComponent fetchedData={fetchedData} />
                            </div>
                        </div>
                    )}
                        {averagedData && zoomLevel <= 4 && (
                        <div className="bg-green-900 text-white p-1 w-full">
                                <h2 className=' flex gap-2 text-sm font-serif'>Averaged Data Of <p className='font-bold underline font-serif'>{state}</p></h2>
                            <div className='bg-purple-200 w-full'>
                                <AveragedChart averagedData={averagedData} />
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MapWithHoverAndClickHandler;
