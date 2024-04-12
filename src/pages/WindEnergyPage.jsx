/* eslint-disable no-unused-vars */
import { useState, useCallback, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { MapContainer, TileLayer, useMapEvents, Marker, useMap } from 'react-leaflet';
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
  const map = useMapEvents({
    click(e) {
      // Check if there's already a selected location from the search bar
      if (!selectedLocation) {
        const { lat, lng } = e.latlng;
        onLocationSelect({ lat, lng });
      }
    },
  });

  // No Popup component returned
  return null;
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
      className="mt-1 block w-2/3 p-2 border border-gray-700 rounded-3xl text-center"
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const SectionTitle = ({ title }) => (
  <h2 className="text-xl font-semibold mb-4 shadow-sm p-3 rounded bg-gray-300 text-black">{title}</h2> // Shadow and background color for segmentation
);
const SectionDivider = () => (
  <div className="my-6 border-t-2 border-gray-700"></div> // Creates a horizontal line as a section divider
);

const DisplayWithLabel = ({ label, value }) => (
  <div className="flex items-center space-x-3 mb-4"> {/* Add some margin-bottom for spacing */}
    <label className="block text-sm font-medium w-1/3">{label}</label>
    <span className="w-2/3 p-2 bg-gray-100 rounded-3xl flex items-center justify-center text-black">{value}</span> {/* Changed to bg-gray-100 for a distinct look */}
  </div>
);
const YearSelector = ({ selectedYear, onSelectYear }) => {
  const years = Array.from({ length: 8 }, (_, index) => 2007 + index); // Generate years from 2007 to 2014

  return (
    <div className="flex items-center space-x-3 justify-center">
      <label htmlFor="year-selector" className="block text-sm font-medium w-1/3">Select Year:</label>
      <select
        id="year-selector"
        value={selectedYear}
        onChange={onSelectYear}
        className="mt-1 w-2/3 p-2 border border-gray-700 rounded-3xl flex text-center bg-blue-500 text-white"
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
const turbineModels = [
  { name: 'Nordex N60-1300', ratedOutput: 1300, rotorDiameter: 60 },
  { name: 'GE 1.5sle', ratedOutput: 1500, rotorDiameter: 77 },
  { name: 'Vestas V82-1.65', ratedOutput: 1650, rotorDiameter: 82 },
  { name: 'Leitwind LTW80 1.8MW', ratedOutput: 1800, rotorDiameter: 80 },
  { name: 'Gamesa G97 2.0MW', ratedOutput: 2000, rotorDiameter: 97 },
];

const TurbineSelector = ({ onSelectTurbine }) => (
  <div className="flex items-center space-x-3 justify-center mb-4">
    <label htmlFor="turbine-selector" className="block text-sm font-medium w-1/3">Select Turbine:</label>
    <select
      id="turbine-selector"
      onChange={onSelectTurbine}
      className="mt-1 w-2/3 p-2 border border-gray-700 rounded-3xl text-center bg-blue-500 text-white"
    >
      {turbineModels.map((turbine, index) => (
        <option key={index} value={index}>
          {turbine.name}
        </option>
      ))}
    </select>
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
  const [selectedYear, setSelectedYear] = useState('2007');
  const [selectedTurbineIndex, setSelectedTurbineIndex] = useState(0);
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulation = useCallback(async () => {
    setIsLoading(true);
    try {
      const selectedTurbine = turbineModels[selectedTurbineIndex];
      const response = await axios.get(`http://localhost:8080/api/users`, {
        params: {
          systemCapacity: selectedTurbine.ratedOutput, // Use ratedOutput from the selected turbine
          rotorDiameter: selectedTurbine.rotorDiameter, // Use rotorDiameter from the selected turbine
          year: selectedYear,
          latitude: location.lat, // from the MapComponent's location state
          longitude: location.lng
        }
      });
      setCalculatedValues(response.data);
    } catch (error) {
      console.error('Error fetching simulation data:', error);
    }
      setIsLoading(false);
  }, [selectedTurbineIndex, selectedYear, location, setCalculatedValues]);

  const handleTurbineChange = (e) => {
    const index = e.target.value;
    setSelectedTurbineIndex(index);
    setSystemCapacity(turbineModels[index].ratedOutput);
    setRotorDiameter(turbineModels[index].rotorDiameter);
  };
  return (
    <div className="h-screen bg-gray-200 p-6 overflow-auto transition duration-500 ease-in-out">
        {isLoading && (
          <div className="fixed top-1/2 left-0 right-0 z-50" style={{ transform: 'translateY(-50%)' }}>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-600" style={{ borderTopColor: 'transparent' }}></div>
            </div>
          </div>


        )}
      <div className={`max-w-md mx-auto text-gray-900 ${isLoading ? 'opacity-50' : ''}`}>
        <div className="max-w-md mx-auto text-gray-900">
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
              <YearSelector selectedYear={selectedYear} onSelectYear={handleYearChange} />
              <TurbineSelector onSelectTurbine={handleTurbineChange} />
              {/* <InputWithLabel label="Rated Output (kW)" id="systemCapacity" value={systemCapacity} onChange={handleInputChange} />
              <InputWithLabel label="Rotor Diameter (m)" id="rotorDiameter" value={rotorDiameter} onChange={handleInputChange} /> */}
              <DisplayWithLabel label="Rated Output (kW)" value={turbineModels[selectedTurbineIndex].ratedOutput} />
              <DisplayWithLabel label="Rotor Diameter (m)" value={turbineModels[selectedTurbineIndex].rotorDiameter} />
            </div>
          </section>
          
          <button
            onClick={handleSimulation}
            className="w-full py-2 px-4 rounded-3xl font-bold mt-6 bg-blue-500 hover:bg-blue-400 transition duration-500 ease-in-out text-white"
            disabled={!!error}
          >
            Simulate
          </button>
        </div>
      </div>
    </div>
  );
};

export default WindEnergyPage;
