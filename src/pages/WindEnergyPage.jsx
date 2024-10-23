/* eslint-disable no-unused-vars */
import { useState, useCallback, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  useMap,
} from "react-leaflet";
import "leaflet-geosearch/dist/geosearch.css";
import axios from "axios";
import {
  SectionDivider,
  SectionTitle,
  DisplayWithLabel,
  InputWithLabel,
} from "../components/CommonComponents";

const SearchControl = ({ onLocationSelect }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider: provider,
      style: "bar",
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
      searchLabel: "Enter address",
      keepResult: true,
    });

    map.addControl(searchControl);

    // Event listener for select the result
    map.on("geosearch/showlocation", (e) => {
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
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={true}
      className="h-40 w-full rounded-lg border-2 border-gray-700"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationPicker onLocationSelect={onLocationSelect} />
      <SearchControl onLocationSelect={onLocationSelect} />
      {selectedLocation && (
        <Marker
          position={[selectedLocation.lat, selectedLocation.lng]}
        ></Marker>
      )}
    </MapContainer>
  );
};

const YearSelector = ({ selectedYear, onSelectYear }) => {
  const years = Array.from({ length: 8 }, (_, index) => 2007 + index); // Generate years from 2007 to 2014

  return (
    <div className="flex items-center space-x-3 justify-center">
      <label
        htmlFor="year-selector"
        className="block text-sm font-medium w-1/3"
      >
        Select Year:
      </label>
      <select
        id="year-selector"
        value={selectedYear}
        onChange={onSelectYear}
        className="mt-3\1 w-2/3 h-1/15 p-2 border border-gray-700 rounded-3xl flex text-center bg-blue-500 text-white"
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

// Turbine models with their respective rated output and rotor diameter
const turbineModels = [
  { id: 0, name: "Nordex N60-1300", ratedOutput: 1300, rotorDiameter: 60 },
  { id: 1, name: "GE 1.5sle", ratedOutput: 1500, rotorDiameter: 77 },
  { id: 2, name: "Vestas V82-1.65", ratedOutput: 1650, rotorDiameter: 82 },
  { id: 3, name: "Leitwind LTW80 1.8MW", ratedOutput: 1800, rotorDiameter: 80 },
  { id: 4, name: "Gamesa G97 2.0MW", ratedOutput: 2000, rotorDiameter: 97 },
];

const TurbineSelector = ({ onSelectTurbine, selectedTurbineIndex }) => (
  <div className="flex items-center space-x-3 justify-center mb-4">
    <label
      htmlFor="turbine-selector"
      className="block text-sm font-medium w-1/3"
    >
      Select Turbine:
    </label>
    <select
      id="turbine-selector"
      onChange={onSelectTurbine}
      value={selectedTurbineIndex}
      className="mt-1 w-2/3 p-2 border border-gray-700 rounded-3xl text-center bg-blue-500 text-white"
    >
      {turbineModels.map((turbine) => (
        <option key={turbine.id} value={turbine.id}>
          {turbine.name}
        </option>
      ))}
    </select>
  </div>
);
const WindEnergyPage = ({ setCalculatedValues }) => {
  const [location, setLocation] = useState({ lat: 50.671, lng: -120.332 });
  const [error, setError] = useState("");
  const [analysisPeriod, setAnalysisPeriod] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [costOfEnergy, setCostOfEnergy] = useState("");
  const [systemCapacity, setSystemCapacity] = useState("");
  const [rotorDiameter, setRotorDiameter] = useState("");
  const [selectedYear, setSelectedYear] = useState("2007");
  const [numberOfSimulations, setNumberOfSimulations] = useState(100);

  // const [selectedTurbineIndex, setSelectedTurbineIndex] = useState(0);
  // const [turbineDetails, setTurbineDetails] = useState({
  //   systemCapacity: turbineModels[0].ratedOutput, // Default to the first model in the list
  //   rotorDiameter: turbineModels[0].rotorDiameter,
  // });

  // Selected turbine details for simulation
  const [selectedTurbineDetails, setSelectedTurbineDetails] = useState({
    index: 0,
    name: turbineModels[0].name,
    systemCapacity: turbineModels[0].ratedOutput,
    rotorDiameter: turbineModels[0].rotorDiameter,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => setCalculatedValues(null);
  }, [setCalculatedValues]);

  const handleLocationSelect = useCallback((newLocation) => {
    setLocation(newLocation);
    setError("");
  }, []);

  const handleInputChange = useCallback((e) => {
    const { id, value } = e.target;
    if (id === "lat" || id === "lng") {
      if (value.trim() !== "") {
        setLocation((prev) => ({ ...prev, [id]: parseFloat(value) }));
      }
    } else {
      switch (id) {
        case "analysisPeriod":
          setAnalysisPeriod(value);
          break;
        case "interestRate":
          setInterestRate(value);
          break;
        case "costOfEnergy":
          setCostOfEnergy(value);
          break;
        case "systemCapacity":
          setSystemCapacity(value);
          break;
        case "rotorDiameter":
          setRotorDiameter(value);
          break;
        default:
          break;
      }
    }
  }, []);

  const handleSliderChange = (e) => {
    setNumberOfSimulations(e.target.value);
  };

  // Handle the simulation logic
  const handleSimulation = useCallback(async () => {
    setIsLoading(true);
    setCalculatedValues(null); // Reset previous results before starting the new simulation
    try {
      const response = await axios.get(
        `https://server-fluor-10.onrender.com/api/users`,
        {
          params: {
            systemCapacity: selectedTurbineDetails.systemCapacity,
            rotorDiameter: selectedTurbineDetails.rotorDiameter,
            year: selectedYear,
            latitude: location.lat,
            longitude: location.lng,
            numberOfSimulations,
          },
        }
      );
      setCalculatedValues(response.data);
    } catch (error) {
      console.error("Error fetching simulation data:", error);
      // Consider setting an error state here to inform the user
    } finally {
      setIsLoading(false);
    }
  }, [selectedTurbineDetails, selectedYear, location, numberOfSimulations]);

  // Handle the turbine selection change event and update the turbine details
  const handleTurbineChange = (e) => {
    // get the index and the selected turbine model
    const index = e.target.value;
    const selectedTurbine = turbineModels[index];

    // setSelectedTurbineIndex(index);
    // setTurbineDetails({
    //   systemCapacity: selectedTurbine.ratedOutput,
    //   rotorDiameter: selectedTurbine.rotorDiameter,
    // });
    setSelectedTurbineDetails({
      index: index,
      name: selectedTurbine.name,
      systemCapacity: selectedTurbine.ratedOutput,
      rotorDiameter: selectedTurbine.rotorDiameter,
    });
  };

  // Handle the turbine details change event - rated output and rotor diameter
  const handleTurbineDetailChange = (e) => {
    const { id, value } = e.target;
    setSelectedTurbineDetails((prevDetails) => ({
      ...prevDetails,
      [id]: value,
    }));
  };

  return (
    <div className="h-screen bg-gray-200 px-6 py-0 overflow-auto transition duration-500 ease-in-out">
      {isLoading && (
        <div
          className="fixed top-1/2 left-0 right-0 z-50"
          style={{ transform: "translateY(-50%)" }}
        >
          <div className="flex items-center justify-center">
            <div
              className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-600"
              style={{ borderTopColor: "transparent" }}
            ></div>
          </div>
        </div>
      )}
      <div
        className={`max-w-md mx-auto text-gray-900 ${
          isLoading ? "opacity-50" : ""
        }`}
      >
        <div className="max-w-md mx-auto text-gray-900">
          <div className="flex justify-center">
            <h1 className="text-2xl font-bold p-6">Wind Energy Calculator</h1>
          </div>
          <section className="mb-6">
            <SectionTitle title="Location" />
            <div className="mb-4">
              <MapComponent
                center={[location.lat, location.lng]}
                onLocationSelect={handleLocationSelect}
                selectedLocation={location}
              />
            </div>
            <DisplayWithLabel
              label="Latitude (N)"
              value={location.lat.toFixed(3)}
            />
            <DisplayWithLabel
              label="Longitude (E)"
              value={location.lng.toFixed(3)}
            />
          </section>
          <section className="mb-6">
            {/* <SectionDivider /> */}
            {/* <SectionTitle title="Financial Parameters" />
            <div className="flex flex-col space-y-4">
              
              <InputWithLabel label="Analysis Period (yrs)" id="analysisPeriod" value={analysisPeriod} onChange={handleInputChange} />
              <InputWithLabel label="Interest (%)" id="interestRate" value={interestRate} onChange={handleInputChange} />
              <InputWithLabel label="Cost of energy ($/kWh)" id="costOfEnergy" value={costOfEnergy} onChange={handleInputChange} />
            </div> */}
          </section>
          <section className="mb-6">
            <SectionDivider />
            <SectionTitle title="Turbine Parameters" />
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <label
                  htmlFor="num-simulations"
                  className="block text-sm font-medium w-1/3"
                >
                  Number of simulations
                </label>
                <div className="flex items-center w-full">
                  <input
                    type="range"
                    id="num-simulations"
                    min="100"
                    max="999"
                    value={numberOfSimulations}
                    onChange={handleSliderChange}
                    className="mt-1 block w-full h-2 bg-gray-600 rounded-full cursor-pointer ml-9"
                  />
                  <span className="ml-3 text-sm font-medium">
                    {numberOfSimulations}
                  </span>
                </div>
              </div>
              <YearSelector
                selectedYear={selectedYear}
                onSelectYear={(e) => setSelectedYear(e.target.value)}
              />
              <TurbineSelector
                onSelectTurbine={handleTurbineChange}
                selectedTurbineIndex={selectedTurbineDetails.index}
              />

              {/* <DisplayWithLabel label="Rated Output (kW)" value={turbineModels[selectedTurbineIndex].ratedOutput} />
              <DisplayWithLabel label="Rotor Diameter (m)" value={turbineModels[selectedTurbineIndex].rotorDiameter} /> */}
              <InputWithLabel
                label="Rated Output (kW)"
                id="systemCapacity"
                value={selectedTurbineDetails.systemCapacity}
                onChange={handleTurbineDetailChange}
              />
              <InputWithLabel
                label="Rotor Diameter (m)"
                id="rotorDiameter"
                value={selectedTurbineDetails.rotorDiameter}
                onChange={handleTurbineDetailChange}
              />
            </div>
          </section>

          {/* <button
            onClick={handleSimulation}
            className="w-full py-2 px-4 rounded-3xl font-bold mt-6 bg-blue-500 hover:bg-blue-400 transition duration-500 ease-in-out text-white"
            disabled={!!error}
          >
            Simulate
          </button> */}
          <div className="sticky bottom-0 bg-gray-200 pt-3 pb-2 z-10">
            <button
              onClick={handleSimulation}
              className="w-full py-2 px-4 my-3 rounded-3xl font-bold bg-blue-500 hover:bg-blue-400 transition duration-500 ease-in-out text-white"
              disabled={!!error}
            >
              Simulate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WindEnergyPage;
