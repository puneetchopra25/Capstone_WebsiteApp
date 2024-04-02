import { useState, useCallback, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { MapContainer, TileLayer, useMapEvents, Popup, Marker, useMap } from 'react-leaflet';
import 'leaflet-geosearch/dist/geosearch.css';
import axios from 'axios';



const SearchControl = ({ onLocationSelect }) => {
  const map = useMap();
  

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',
      autoComplete: true,
      autoCompleteDelay: 250,
      showMarker: true,
      showPopup: false,
      marker: {
        icon: new L.Icon.Default(),
        draggable: false,
      },
      popupFormat: ({ query, result }) => result.label,
      maxMarkers: 1,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: 'Enter address',
      keepResult: true
    });

    map.addControl(searchControl);

    // Event listener for select the result
    map.on('geosearch/showlocation', (e) => {
      onLocationSelect({ lat: e.location.y, lng: e.location.x });
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onLocationSelect]);

  return null;
};

const LocationPicker = ({ onLocationSelect, selectedLocation }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
  });

  return null; // Removed the Popup component
};

const MapComponent = ({ center, onLocationSelect, selectedLocation }) => {
  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={true} className="h-40 w-full rounded-lg border-2 border-gray-700">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationPicker onLocationSelect={onLocationSelect} />
      <SearchControl onLocationSelect={onLocationSelect} />
      {selectedLocation && (
        <Marker position={[selectedLocation.lat, selectedLocation.lng]}></Marker>
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
      className="mt-1 block w-2/3 p-2 border border-gray-700 rounded-md"
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const SectionTitle = ({ title }) => (
  <h2 className="text-xl font-semibold mb-4 shadow-sm p-3 rounded bg-gray-100">{title}</h2> // Shadow and background color for segmentation
);
const SectionDivider = () => (
  <div className="my-6 border-t-2 border-gray-700"></div> // Creates a horizontal line as a section divider
);

const DisplayWithLabel = ({ label, value }) => (
  <div className="flex items-center space-x-3 mb-2"> {/* Add some margin-bottom for spacing */}
    <label className="block text-sm font-medium w-1/3">{label}</label>
    <span className="block w-2/3 p-2 bg-gray-100 rounded-lg">{value}</span> {/* Changed to bg-gray-100 for a distinct look */}
  </div>
);
const YearSelector = ({ selectedYear, onSelectYear }) => {
  const years = Array.from({ length: 8 }, (_, index) => 2007 + index); // Generate years from 2007 to 2014

  return (
    <div className="flex items-center space-x-3 mb-4">
      <label htmlFor="year-selector" className="block text-sm font-medium w-1/3">Select Year:</label>
      <select
        id="year-selector"
        value={selectedYear}
        onChange={onSelectYear}
        className="mt-1 block w-2/3 p-2 border border-gray-700 rounded-md"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};
const WindEnergyPage = ({ setCalculatedValues }) => {

  const [location, setLocation] = useState({ lat: 50.671, lng: -120.332 });
  const [error, setError] = useState('');
  const [analysisPeriod, setAnalysisPeriod] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [costOfEnergy, setCostOfEnergy] = useState('');
  const [systemCapacity, setSystemCapacity] = useState('');
  const [rotorDiameter, setRotorDiameter] = useState('');
  const [selectedYear, setSelectedYear] = useState('2007');

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    // Perform actions when the year changes, such as fetching new data
  };
  
  useEffect(() => {
    return () => setCalculatedValues(null);
  }, [setCalculatedValues]);
   
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
  }, [systemCapacity, rotorDiameter,  setCalculatedValues]);

  return (
    <div className="h-screen bg-slate-200 p-6 overflow-auto transition duration-500 ease-in-out">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Wind Energy Calculator</h1>
          <button className="transition duration-500 ease-in-out"></button>
        </div>
        <section className="mb-6">
        
        <SectionTitle title="Location" />
          <div className="mb-4">
            <MapComponent center={[location.lat, location.lng]} onLocationSelect={handleLocationSelect} selectedLocation={location} />
          </div>
          <DisplayWithLabel label="Latitude (N)" value={location.lat.toFixed(3)} />
          <DisplayWithLabel label="Longitude (E)" value={location.lng.toFixed(3)} />
          <YearSelector selectedYear={selectedYear} onSelectYear={handleYearChange} />
        </section>
        <section className="mb-6">
        <SectionDivider />
        <SectionTitle title="Financial Parameters" />
          <div className="flex flex-col space-y-4">
            <InputWithLabel label="Analysis Period (yrs)" id="analysisPeriod" value={analysisPeriod} onChange={handleInputChange} />
            <InputWithLabel label="Interest (%)" id="interestRate" value={interestRate} onChange={handleInputChange} />
            <InputWithLabel label="Cost of energy ($/kWh)" id="costOfEnergy" value={costOfEnergy} onChange={handleInputChange} />
          </div>
        </section>
        <section className="mb-6">
        <SectionDivider />
        <SectionTitle title="Turbine Parameters" />
          <div className="flex flex-col space-y-4">
            <InputWithLabel label="Rated Output (kW)" id="systemCapacity" value={systemCapacity} onChange={handleInputChange} />
            <InputWithLabel label="Rotor Diameter (m)" id="rotorDiameter" value={rotorDiameter} onChange={handleInputChange} />
          </div>
        </section>
        <SectionDivider/>
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
