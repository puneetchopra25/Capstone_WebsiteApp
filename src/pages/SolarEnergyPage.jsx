import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap, Popup, Marker} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const LocationPicker = ({ onLocationSelect, selectedLocation }) => {
  const map = useMapEvents({
      click(e) {
          const { lat, lng } = e.latlng;
          onLocationSelect({ lat, lng });
      },
  });

  return selectedLocation ? (
      <Popup position={selectedLocation}>
          <div>
              <p>Selected Location:</p>
              <p>Latitude: {selectedLocation.lat.toFixed(3)}</p>
              <p>Longitude: {selectedLocation.lng.toFixed(3)}</p>
          </div>
      </Popup>
  ) : null;
};

const UpdateMapView = ({ center }) => {
    const map = useMap();
    map.flyTo(center, map.getZoom());

    return null;
};

const MapComponent = ({ center, onLocationSelect, selectedLocation }) => {
  return (
      <MapContainer center={center} zoom={13} scrollWheelZoom={true} className="h-40 w-full rounded-lg">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationPicker onLocationSelect={onLocationSelect} />
          <UpdateMapView center={center} />
          {selectedLocation && (
              <>
                  <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                      <Popup>
                          <div>
                              <h2>Selected Location</h2>
                              <p>Latitude: {selectedLocation.lat.toFixed(4)}, Longitude: {selectedLocation.lng.toFixed(4)}</p>
                          </div>
                      </Popup>
                  </Marker>
              </>
          )}
      </MapContainer>
  );
};



const InputWithLabel = ({ label, id, value, onChange, darkMode, error }) => (
    <>
        <div className={`flex items-center space-x-3 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            <label htmlFor={id} className="block text-sm font-medium w-1/3">
                {label}
            </label>
            <input
                type="text"
                id={id}
                value={value}
                onChange={onChange}
                className={`mt-1 block w-2/3 p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}
            />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </>
);

const SolarEnergyPage = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [location, setLocation] = useState({ lat: 50.671, lng: -120.332 });
    const [error, setError] = useState('');

    const toggleDarkMode = useCallback(() => {
        setDarkMode(!darkMode);
    }, [darkMode]);

    const handleLocationSelect = useCallback(newLocation => {
        setLocation(newLocation);
        setError(''); // Clear any existing errors
    }, []);

    const handleInputChange = useCallback(e => {
        const { id, value } = e.target;
        setLocation(prev => ({ ...prev, [id]: parseFloat(value) }));
    }, []);

    return (
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} ${darkMode ? 'text-white' : 'text-gray-900'} h-screen p-6 overflow-auto transition duration-500 ease-in-out`}>
            <div className="max-w-md mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-semibold">Solar Energy Calculator</h1>
                    <button onClick={toggleDarkMode} className={`p-2 rounded-full ${darkMode ? 'bg-white' : 'bg-gray-900'} ${darkMode ? 'text-gray-900' : 'text-white'} transition duration-500 ease-in-out`}>
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </div>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Location</h2>
                    <MapComponent center={[location.lat, location.lng]} onLocationSelect={handleLocationSelect} selectedLocation={location} />

                    <InputWithLabel label="Latitude (°N)" id="lat" value={location.lat.toString()} onChange={handleInputChange} darkMode={darkMode} error={error} />
                    <InputWithLabel label="Longitude (°E)" id="lng" value={location.lng.toString()} onChange={handleInputChange} darkMode={darkMode} error={error} />
                </section>

                {/* Financial Parameters Section */}
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Financial Parameters</h2>
                    <div className="flex flex-col space-y-4">
                        <InputWithLabel label="Analysis Period (yrs)" id="analysisPeriod" value="" onChange={() => {}} darkMode={darkMode} />
                        <InputWithLabel label="Interest (%)" id="interestRate" value="" onChange={() => {}} darkMode={darkMode} />
                        <InputWithLabel label="Cost of energy ($/kWh)" id="costOfEnergy" value="" onChange={() => {}} darkMode={darkMode} />
                    </div>
                </section>
                {/* Farm Parameters Section */}
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Farm Parameters</h2>
                    <div className="flex flex-col space-y-4">
                        <InputWithLabel label="System Capacity (kW)" id="systemCapacity" value="" onChange={() => {}} darkMode={darkMode} />
                        <InputWithLabel label="Film Type" id="filmType" value="" onChange={() => {}} darkMode={darkMode} />
                        <InputWithLabel label="Azimuth (°)" id="azimuth" value="" onChange={() => {}} darkMode={darkMode} />
                        <InputWithLabel label="Tilt (°)" id="tilt" value="" onChange={() => {}} darkMode={darkMode} />
                        <InputWithLabel label="Losses (%)" id="losses" value="" onChange={() => {}} darkMode={darkMode} />
                    </div>
                </section>

                <button
                    className={`w-full py-2 px-4 rounded-lg font-bold mt-6 ${darkMode ? 'bg-blue-500 hover:bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition duration-500 ease-in-out`}
                    disabled={!!error}
                >
                    Simulate
                </button>
            </div>
        </div>
    );
};

export default SolarEnergyPage;
