import { useState, useCallback, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { MapContainer, TileLayer, useMapEvents, Marker, useMap } from 'react-leaflet';
import 'leaflet-geosearch/dist/geosearch.css';
import axios from 'axios';

const DropdownWithLabel = ({ label, id, selectedValue, onChange, options }) => {
    return (
      <div className="flex items-center space-x-3 ">
        <label htmlFor={id} className="block text-sm font-medium w-1/3">{label}</label>
        <select
          id={id}
          value={selectedValue}
          onChange={onChange}
          className="mt-1 block w-2/3 p-2 border border-gray-700 rounded-3xl text-center bg-blue-500 text-white"
        >
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  };


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
const SolarEnergyPage = ({setSolarCalcValues}) => {
    
    const [location, setLocation] = useState({ lat: 50.671, lng: -120.332 });
    const [error, setError] = useState('');
    const [analysisPeriod, setAnalysisPeriod] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [costOfEnergy, setCostOfEnergy] = useState('');
    const [systemCapacity, setSystemCapacity] = useState('');
    const [tracking, setTracking] = useState('Fixed');
    const [cellPower, setCellPower] = useState('');
    const [cellEfficiency, setCellEfficiency] = useState('');
    const [tilt, setTilt] = useState('');
    const [inverterEfficiency, setInverterEfficiency] = useState('');
    const [electricalLosses, setElectricalLosses] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        return () => setSolarCalcValues(null);
      }, [setSolarCalcValues]);

    const handleSimulation = useCallback(async () => {
        // Start the loading process
        setIsLoading(true);
        // Construct your request payload with the farm parameters
        try {
            // Here you would replace the URL with the endpoint where your backend expects the farm parameters
            const response = await axios.get('http://localhost:8080/api/solar_energy', {
                params: {
                    latitude: location.lat,
                    longitude: location.lng,
                    analysisPeriod,
                    interestRate,
                    costOfEnergy,
                    systemCapacity,
                    tracking,
                    cellPower,
                    cellEfficiency,
                    tilt,
                    inverterEfficiency,
                    electricalLosses,
                }
            }
                
            );
            // Handle the response accordingly
            setSolarCalcValues(response.data);
        } catch (error) {
            console.error('Error during simulation:', error);
            // Handle error accordingly
        } finally {
            // Stop the loading process
            setIsLoading(false);
        }
    }, [
        location,
        analysisPeriod,
        interestRate,
        costOfEnergy,
        systemCapacity,
        tracking,
        cellPower,
        cellEfficiency,
        tilt,
        inverterEfficiency,
        electricalLosses,
        setSolarCalcValues
    ]);

    const handleTrackingChange = (e) => {
        setTracking(e.target.value);
      };

    const handleLocationSelect = useCallback(newLocation => {
        setLocation(newLocation);
        setError('');
      }, [])

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
              case 'cellPower':
                setCellPower(value);
                break;
            case 'cellEfficiency':
                setCellEfficiency(value);
                break;
            case 'tilt':
                setTilt(value);
                break;
            case 'inverterEfficiency':
                setInverterEfficiency(value);
                break;
            case 'electricalLosses':
                setElectricalLosses(value);
                break;
            default:
              break;
          }
        }
      }, []);

    
    
    return (
        <div className="h-screen p-6 overflow-auto transition duration-500 ease-in-out bg-gray-200">
            <div className="max-w-md mx-auto text-gray-900">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-semibold">Solar Energy Calculator</h1>
                    <button className="transition duration-500 ease-in-out">
                    </button>
                </div>

                <section className="mb-6">
        
                    <SectionTitle title="Location" />
                    <div className="mb-4">
                        <MapComponent center={[location.lat, location.lng]} onLocationSelect={handleLocationSelect} selectedLocation={location} />
                    </div>
                    <DisplayWithLabel label="Latitude (N)" value={location.lat.toFixed(3)} />
                    <DisplayWithLabel label="Longitude (E)" value={location.lng.toFixed(3)} />
          
                </section>
                {/* Financial Parameters Section */}
                <section className="mb-6">
                    <SectionDivider />
                    <SectionTitle title="Financial Parameters" />
                    <div className="flex flex-col space-y-4">
                        <InputWithLabel label="Analysis Period (yrs)" id="analysisPeriod" value={analysisPeriod} onChange={handleInputChange} />
                        <InputWithLabel label="Interest (%)" id="interestRate" value={interestRate} onChange={handleInputChange} />
                        <InputWithLabel label="Cost of energy ($/kWh)" id="costOfEnergy" value={costOfEnergy} onChange={handleInputChange} />
                    </div>
                </section>
                {/* Farm Parameters Section */}
                <section className="mb-6">
                    <SectionDivider />
                    <SectionTitle title="System Parameters"/>
                    <div className="flex flex-col space-y-4">
                        <DropdownWithLabel
                            label="Tracking"
                            id="tracking"
                            selectedValue={tracking}
                            onChange={handleTrackingChange}
                            options={['Fixed', '1-axis', '2-axis']}
                        />
                        <InputWithLabel 
                            label="System Capacity (kW)" 
                            id="systemCapacity" 
                            value={systemCapacity} 
                            onChange={e => setSystemCapacity(e.target.value)} 
                        />

                        <InputWithLabel 
                            label="Cell Power (kW)" 
                            id="cellPower" 
                            value={cellPower} 
                            onChange={e => setCellPower(e.target.value)} 
                        />

                        <InputWithLabel 
                            label="Cell Efficiency (%)" 
                            id="cellEfficiency" 
                            value={cellEfficiency} 
                            onChange={e => setCellEfficiency(e.target.value)} 
                        />

                        <InputWithLabel 
                            label="Tilt (°)" 
                            id="tilt" 
                            value={tilt} 
                            onChange={e => setTilt(e.target.value)} 
                        />

                        <InputWithLabel 
                            label="Inverter Efficiency (%)" 
                            id="inverterEfficiency" 
                            value={inverterEfficiency} 
                            onChange={e => setInverterEfficiency(e.target.value)} 
                        />

                        <InputWithLabel 
                            label="Electrical Losses (%)" 
                            id="electricalLosses" 
                            value={electricalLosses} 
                            onChange={e => setElectricalLosses(e.target.value)} 
                        />
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
    );
};

export default SolarEnergyPage;