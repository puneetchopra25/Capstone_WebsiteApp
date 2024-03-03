import { useState } from 'react';
const WindEnergyPage = () => {
  const [latitude, setLatitude] = useState('50.6761'); // default latitude
  const [longitude, setLongitude] = useState('-120.340836'); // default longitude

  const handleLatitudeChange = (event) => {
    setLatitude(event.target.value);
  };

  const handleLongitudeChange = (event) => {
    setLongitude(event.target.value);
  };

  const handleSimulate = () => {
    // Handle the simulation logic here
    console.log(`Simulating for Latitude: ${latitude}, Longitude: ${longitude}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-white p-2 justify-between">
      <div className="bg-blue-600 p-2 mb-8 rounded">
        <nav className="flex justify-around">
          <button className="px-3 py-1 bg-blue-700 rounded">Location</button>
          <button className="px-3 py-1 hover:bg-blue-700 rounded">System Model</button>
          <button className="px-3 py-1 hover:bg-blue-700 rounded">Financial Model</button>
        </nav>
      </div>      
      <div>
        <div className="mb-4">
          <label htmlFor="latitude" className="block text-sm font-medium text-black">
            Latitude
          </label>
          <div className="flex mt-1">
            <input
              type="text"
              id="latitude"
              value={latitude}
              onChange={handleLatitudeChange}
              className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring focus:border-blue-500 sm:text-sm"
              placeholder="Enter latitude"
            />
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-600 bg-gray-700 text-white text-sm">
              °N
            </span>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="longitude" className="block text-sm font-medium text-black">
            Longitude
          </label>
          <div className="flex mt-1">
            <input
              type="text"
              id="longitude"
              value={longitude}
              onChange={handleLongitudeChange}
              className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring focus:border-blue-500 sm:text-sm"
              placeholder="Enter longitude"
            />
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-600 bg-gray-700 text-white text-sm">
              °E
            </span>
          </div>
        </div>
      </div>
      <div>
        <button
          type="button"
          onClick={handleSimulate}
          className="w-full py-2 bg-blue-600 rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue-200 disabled:opacity-25 transition"
        >
          Simulate
        </button>
      </div>
    </div>
  );
};

export default WindEnergyPage;
