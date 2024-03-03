const SolarEnergyPage = () => {
  return (
    <div className="p-6 h-screen bg-gray-100">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Location</h2>
        <div className="p-4 border rounded bg-white">
          {/* You might want to replace this with a map or other widget */}
        </div>
        <div className="mt-4">
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
            Latitude (°N)
          </label>
          <input type="text" id="latitude" className="mt-1 block w-full border-gray-500 rounded-md shadow-sm" />
        </div>
        <div className="mt-4">
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
            Longitude (°E)
          </label>
          <input type="text" id="longitude" className="mt-1 block w-full border-gray-500 rounded-md shadow-sm" />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">System Parameters</h2>
        <div className="p-4 border rounded">
          {/* You might want to replace this with a chart or other widget */}
        </div>
        <div className="mt-4">
          <label htmlFor="area" className="block text-sm font-medium text-gray-700">
            Available Area (m²)
          </label>
          <input type="text" id="area" className="mt-1 block w-full border-gray-500 rounded-md shadow-sm" />
        </div>
        <div className="mt-4">
          <label htmlFor="mounting" className="block text-sm font-medium text-gray-700">
            Mounting Type
          </label>
          <select id="mounting" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
            <option>Fixed Ground Mount</option>
            <option>Non-Fixed Ground Mount</option>
            {/* Add other mounting types here */}
          </select>
          <div className="mt-4">
          <label htmlFor="area" className="block text-sm font-medium text-gray-700">
            Efficiency(%)
          </label>
          <input type="text" id="area" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="mt-4">
          <label htmlFor="area" className="block text-sm font-medium text-gray-700">
            Module Area(m2)
          </label>
          <input type="text" id="area" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>

        </div>
        {/* ... other input fields ... */}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Financial Parameters</h2>
        {/* ... similar structure for financial parameters ... */}
      </div>
    </div>
  );
};


export default SolarEnergyPage