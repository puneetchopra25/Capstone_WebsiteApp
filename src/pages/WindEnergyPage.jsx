import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet';
import { useMapEvent } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Geocode from 'react-geocode';

const LocationPicker = ({ selectedLocation }) => {
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

const MapComponent = ({ center, selectedLocation, setSelectedLocation }) => {
  const map = useMapEvent('click', (e) => {
    setSelectedLocation(e.latlng);
  });

  return (
    <MapContainer center={center} zoom={15} scrollWheelZoom={true} className="h-40 w-full rounded-lg">
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationPicker selectedLocation={selectedLocation} />
      {selectedLocation && <Marker position={[selectedLocation.lat, selectedLocation.lng]} />}
    </MapContainer>
  );
};

const InputWithLabel = ({ label, value }) => (
  <div className="flex items-center space-x-3">
    <label className="block text-sm font-medium w-1/3">{label}</label>
    <div className="mt-1 block w-2/3 p-2 border border-gray-300 rounded-lg">{value}</div>
  </div>
);

const WindEnergyPage = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleAddressChange = useCallback((e) => {
    setAddress(e.target.value);
  }, []);

  const handleAddressSubmit = useCallback(async () => {
    try {
      const response = await Geocode.fromAddress(address);
      const { lat, lng } = response.results[0].geometry.location;
      setSelectedLocation({ lat, lng });
      setError('');
    } catch (err) {
      setError('Address not found');
    }
  }, [address]);

  return (
    <div className="h-screen p-6 overflow-auto transition duration-500 ease-in-out">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Wind Energy Calculator</h1>
          <button className="transition duration-500 ease-in-out"></button>
        </div>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Location</h2>
          <MapComponent
            center={[selectedLocation?.lat || 50.671, selectedLocation?.lng || -120.332]}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
          />
          <div className="flex flex-col space-y-4">
            <InputWithLabel label="Latitude (N)" value={selectedLocation ? selectedLocation.lat.toFixed(3) : ''} />
            <InputWithLabel label="Longitude (E)" value={selectedLocation ? selectedLocation.lng.toFixed(3) : ''} />
            <div className="flex items-center space-x-3">
              <label className="block text-sm font-medium w-1/3">Address</label>
              <input
                type="text"
                value={address}
                onChange={handleAddressChange}
                className="mt-1 block w-2/3 p-2 border border-gray-300 rounded-lg"
              />
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            <button
              onClick={handleAddressSubmit}
              className="w-full py-2 px-4 rounded-lg font-bold mt-6 bg-blue-500 hover:bg-blue-400 transition duration-500 ease-in-out text-white"
            >
              Submit Address
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WindEnergyPage;
