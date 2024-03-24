import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMapEvents, Popup, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

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

const MapComponent = ({ center, onLocationSelect, selectedLocation }) => {
  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={true} className="h-40 w-full rounded-lg">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationPicker onLocationSelect={onLocationSelect} selectedLocation={selectedLocation} />
      {selectedLocation && (
        <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
          <Popup>
            <div>
              <h2>Selected Location</h2>
              <p>Latitude: {selectedLocation.lat.toFixed(4)}, Longitude: {selectedLocation.lng.toFixed(4)}</p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

const InputWithLabel = ({ label, id, value, onChange, error }) => (
  <div className="flex items-center space-x-3">
    <label htmlFor={id} className="block text-sm font-medium w-1/3">{label}</label>
    <input
      type="text"
      id={id}
      value={value}
      onChange={onChange}
      className="mt-1 block w-2/3 p-2 border border-gray-300 rounded-lg"
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const WindEnergyPage = ({ setCalculatedValues }) => {
  const [location, setLocation] = useState({ lat: 50.671, lng: -120.332 });
  const [error, setError] = useState('');
  const [analysisPeriod, setAnalysisPeriod] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [costOfEnergy, setCostOfEnergy] = useState('');
  const [systemCapacity, setSystemCapacity] = useState('');
  const [rotorDiameter, setRotorDiameter] = useState('');
  
   
  const handleLocationSelect = useCallback(newLocation => {
    setLocation(newLocation);
    setError('');
  }, []);

  const handleInputChange = useCallback(e => {
    const { id, value } = e.target;
    if (id === 'lat' || id === 'lng') {
      if (value.trim() !== '') {
        setLocation(prev => ({ ...prev, [id]: parseFloat(value) }));
      }
    } else {
      switch (id) {
        case 'analysisPeriod':
          setAnalysisPeriod(value);
          break;
        case 'interestRate':
          setInterestRate(value);
          break;
        case 'costOfEnergy':
          setCostOfEnergy(value);
          break;
        case 'systemCapacity':
          setSystemCapacity(value);
          break;
        case 'rotorDiameter':
          setRotorDiameter(value);
          break;
        default:
          break;
      }
    }
  }, []);

  const handleSimulation = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/users?systemCapacity=${systemCapacity}&rotorDiameter=${rotorDiameter}`);
      setCalculatedValues(response.data);
    } catch (error) {
      console.error('Error fetching simulation data:', error);
    }
  }, [systemCapacity, rotorDiameter]);

  return (
    <div className="h-screen p-6 overflow-auto transition duration-500 ease-in-out">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Wind Energy Calculator</h1>
          <button className="transition duration-500 ease-in-out"></button>
        </div>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Location</h2>
          <MapComponent center={[location.lat, location.lng]} onLocationSelect={handleLocationSelect} selectedLocation={location} />
          <InputWithLabel label="Latitude (N)" id="lat" value={location.lat.toString()} onChange={handleInputChange} error={error} />
          <InputWithLabel label="Longitude (E)" id="lng" value={location.lng.toString()} onChange={handleInputChange} error={error} />
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Financial Parameters</h2>
          <div className="flex flex-col space-y-4">
            <InputWithLabel label="Analysis Period (yrs)" id="analysisPeriod" value={analysisPeriod} onChange={handleInputChange} />
            <InputWithLabel label="Interest (%)" id="interestRate" value={interestRate} onChange={handleInputChange} />
            <InputWithLabel label="Cost of energy ($/kWh)" id="costOfEnergy" value={costOfEnergy} onChange={handleInputChange} />
          </div>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Farm Parameters</h2>
          <div className="flex flex-col space-y-4">
            <InputWithLabel label="System Capacity (kW)" id="systemCapacity" value={systemCapacity} onChange={handleInputChange} />
            <InputWithLabel label="Rotor Diameter (m)" id="rotorDiameter" value={rotorDiameter} onChange={handleInputChange} />
          </div>
        </section>
        <button
          onClick={handleSimulation}
          className="w-full py-2 px-4 rounded-lg font-bold mt-6 bg-blue-500 hover:bg-blue-400 transition duration-500 ease-in-out text-white"
          disabled={!!error}
        >
          Simulate
        </button>
      </div>
    </div>
  );
};

export default WindEnergyPage;
