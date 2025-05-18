import { useState, useCallback, useEffect, useRef } from "react";

import axios from "axios";
import { Switch } from "@headlessui/react";

import { SectionDivider } from "../components/SectionDivider";
import { SectionTitle } from "../components/SectionTitle";
import { DisplayWithLabel } from "../components/DisplayWithLabel";
import { InputWithLabel } from "../components/InputWithLabel";
import { LoadingSpinnerMessage } from "../components/LoadingSpinnerMessage";
import { MAPBOX_ACCESS_TOKEN } from "../utils/constants";

// new map module
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const DropdownWithLabel = ({ label, id, selectedValue, onChange, options }) => {
  return (
    <div className="flex items-center space-x-3 ">
      <label htmlFor={id} className="block text-sm font-medium w-1/3">
        {label}
      </label>
      <select
        id={id}
        value={selectedValue}
        onChange={onChange}
        className="mt-1 block w-2/3 h-1/15 p-2 border border-gray-700 rounded-3xl text-center bg-blue-500 text-white"
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

// ------------------ Old Map Component (Leaflet) ------------------
// const SearchControl = ({ onLocationSelect }) => {
//   const map = useMap();

//   useEffect(() => {
//     const provider = new OpenStreetMapProvider();

//     const searchControl = new GeoSearchControl({
//       provider: provider,
//       style: "bar",
//       autoComplete: true,
//       autoCompleteDelay: 250,
//       showMarker: true,
//       showPopup: false,
//       marker: {
//         icon: new L.Icon.Default(),
//         draggable: false,
//       },
//       popupFormat: ({ query, result }) => result.label,
//       maxMarkers: 1,
//       retainZoomLevel: false,
//       animateZoom: true,
//       autoClose: true,
//       searchLabel: "Enter address",
//       keepResult: true,
//     });

//     map.addControl(searchControl);

//     // Event listener for select the result
//     map.on("geosearch/showlocation", (e) => {
//       onLocationSelect({ lat: e.location.y, lng: e.location.x });
//     });

//     return () => {
//       map.removeControl(searchControl);
//     };
//   }, [map, onLocationSelect]);

//   return null;
// };

// const LocationPicker = ({ onLocationSelect, selectedLocation }) => {
//   const map = useMapEvents({
//     click(e) {
//       // Check if there's already a selected location from the search bar
//       if (!selectedLocation) {
//         const { lat, lng } = e.latlng;
//         onLocationSelect({ lat, lng });
//       }
//     },
//   });

//   // No Popup component returned
//   return null;
// };

// const MapComponent = ({ center, onLocationSelect, selectedLocation }) => {
//   return (
//     <MapContainer
//       center={center}
//       zoom={13}
//       scrollWheelZoom={true}
//       className="h-40 w-full rounded-lg border-2 border-gray-700"
//     >
//       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//       <LocationPicker onLocationSelect={onLocationSelect} />
//       <SearchControl onLocationSelect={onLocationSelect} />
//       {selectedLocation && (
//         <Marker
//           position={[selectedLocation.lat, selectedLocation.lng]}
//         ></Marker>
//       )}
//     </MapContainer>
//   );
// };

const MapComponent = ({ solarCoordinates, setSolarCoordinates }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const solarMarkerRef = useRef(null);

  // Add a marker to the map
  const addMarker = (lngLat, color, markerRef) => {
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = new mapboxgl.Marker({ color })
      .setLngLat(lngLat)
      .addTo(mapRef.current);
  };

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      accessToken: MAPBOX_ACCESS_TOKEN,
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [solarCoordinates.lng, solarCoordinates.lat],
      zoom: 10,
    });

    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_ACCESS_TOKEN,
      mapboxgl: mapboxgl,
      placeholder: "Enter address",
    });
    mapRef.current.addControl(geocoder, "top-left");

    const navControl = new mapboxgl.NavigationControl({ showCompass: false });
    mapRef.current.addControl(navControl, "top-right");

    // Fly to new location when a search result is selected
    geocoder.on("result", (e) => {
      const newCoordinates = e.result.geometry.coordinates;
      mapRef.current.flyTo({ center: newCoordinates });
      setSolarCoordinates({ lng: newCoordinates[0], lat: newCoordinates[1] });
      addMarker(newCoordinates, "#FF8C00", solarMarkerRef);
    });

    mapRef.current.on("load", () => {
      // Add the initial solar marker
      addMarker(
        [solarCoordinates.lng, solarCoordinates.lat],
        "#FF8C00",
        solarMarkerRef
      );

      // Add click event to place the solar marker
      mapRef.current.on("click", (e) => {
        const newCoordinates = e.lngLat;
        setSolarCoordinates({
          lng: newCoordinates.lng,
          lat: newCoordinates.lat,
        });
        addMarker(newCoordinates, "#FF8C00", solarMarkerRef);
      });

      mapRef.current.getCanvas().style.cursor = "pointer";
    });

    return () => mapRef.current.remove();
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className="h-60 rounded-lg border-2 border-gray-700"
    />
  );
};

const SolarEnergyPage = ({
  setSolarCalcValues,
  systemCapacityOrArea,
  setSystemCapacityOrArea,
}) => {
  const [location, setLocation] = useState({ lat: 50.671, lng: -120.332 });
  const [error, setError] = useState("");
  // const [systemCapacityOrArea, setSystemCapacityOrArea] = useState(false);
  const [analysisPeriod, setAnalysisPeriod] = useState("25");
  const [interestRate, setInterestRate] = useState("0.07");
  const [costOfEnergy, setCostOfEnergy] = useState("0.15");
  const [systemCapacity, setSystemCapacity] = useState("1000");
  const [tracking, setTracking] = useState("Fixed");
  const [cellPower, setCellPower] = useState("660");
  const [cellEfficiency, setCellEfficiency] = useState("0.2");
  const [tilt, setTilt] = useState("20");
  const [inverterEfficiency, setInverterEfficiency] = useState("0.96");
  const [electricalLosses, setElectricalLosses] = useState("0.14");
  const [totalarea, setTotalarea] = useState("10000");
  const [isLoading, setIsLoading] = useState(false);
  const [groundcoverage, setGroundcoverage] = useState("0.4");
  // console.log('systemCapacityOrArea:', systemCapacityOrArea);
  useEffect(() => {
    return () => setSolarCalcValues(null);
  }, [setSolarCalcValues]);
  useEffect(() => {
    // Here you could perform actions like validation or even triggering a simulation.
    // For example, if you want to clear certain fields when the toggle changes:
    if (systemCapacityOrArea) {
      // Clear the systemCapacity because we are defining the total area.
      setSystemCapacity("1000");
    } else {
      // Clear the total area because we are defining the system capacity.
      setTotalarea("10000");
    }

    // Note: Be cautious with triggering simulations directly within useEffect
    // without user confirmation or clear user intention, as it might lead to unexpected behavior.
  }, [systemCapacityOrArea]);
  const handleSimulation = useCallback(async () => {
    // Start the loading process
    setIsLoading(true);
    // reset solar calculation values before new simulation
    setSolarCalcValues(null);

    try {
      // Here you would replace the URL with the endpoint where your backend expects the farm parameters
      const response = await axios.get(
        "https://server-fluor-10.onrender.com/api/solar_energy",
        {
          params: {
            latitude: location.lat,
            longitude: location.lng,
            analysisPeriod,
            interestRate,
            costOfEnergy,
            tracking,
            cellPower,
            cellEfficiency,
            tilt,
            inverterEfficiency,
            electricalLosses,
            groundcoverage,
            // Use the prop for determining which parameter to send:
            ...(systemCapacityOrArea ? { totalarea } : { systemCapacity }),
          },
        }
      );

      // Handle the response accordingly
      setSolarCalcValues(response.data);
      // console.log({ solar: response.data });
    } catch (error) {
      console.error("Error during simulation:", error);
      setError(error.message);
      // Handle error accordingly
    }
    // Stop the loading process
    setIsLoading(false);
  }, [
    location,
    analysisPeriod,
    interestRate,
    costOfEnergy,
    systemCapacity, // This now might come from the prop
    tracking,
    cellPower,
    cellEfficiency,
    tilt,
    inverterEfficiency,
    electricalLosses,
    totalarea, // This now might come from the prop
    groundcoverage,
    setSolarCalcValues,
    systemCapacityOrArea, // Make sure this is added to the dependency array
  ]);

  const handleTrackingChange = (e) => {
    setTracking(e.target.value);
  };

  // const handleLocationSelect = useCallback((newLocation) => {
  //   setLocation(newLocation);
  //   setError("");
  // }, []);

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
        case "cellPower":
          setCellPower(value);
          break;
        case "cellEfficiency":
          setCellEfficiency(value);
          break;
        case "tilt":
          setTilt(value);
          break;
        case "inverterEfficiency":
          setInverterEfficiency(value);
          break;
        case "electricalLosses":
          setElectricalLosses(value);
          break;
        case "totalarea":
          setTotalarea(value);
          break;
        case "groundcoverage":
          setGroundcoverage(value);
          break;
        default:
          break;
      }
    }
  }, []);

  // console.log("Current Toggle State:", systemCapacityOrArea);

  const toggleSystemCapacityOrArea = () => {
    // console.log(
    //   "Toggling from:",
    //   systemCapacityOrArea,
    //   "to:",
    //   !systemCapacityOrArea
    // );
    setSystemCapacityOrArea(!systemCapacityOrArea); // This should toggle the state
  };

  return (
    <div className="h-screen p-6 py-0 overflow-auto transition duration-500 ease-in-out bg-gray-200">
      {isLoading && <LoadingSpinnerMessage energy="Solar Energy" />}

      <div className="w-[420px] mx-auto text-gray-900">
        <div className="flex justify-center">
          <h1 className="text-2xl font-bold p-6">Solar Energy Calculator</h1>
        </div>

        <section className="mb-6">
          <SectionTitle title="Location" />
          <div className="mb-4">
            {/* <MapComponent
              center={[location.lat, location.lng]}
              onLocationSelect={handleLocationSelect}
              selectedLocation={location}
            /> */}
            <MapComponent
              solarCoordinates={location}
              setSolarCoordinates={setLocation}
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
        {/* Financial Parameters Section */}
        <section className="mb-6">
          <SectionDivider />
          <SectionTitle title="Cost Parameters" />
          <div className="flex flex-col space-y-4">
            <InputWithLabel
              label="Analysis Period (years)"
              id="analysisPeriod"
              step={1}
              value={analysisPeriod}
              onChange={handleInputChange}
            />
            <InputWithLabel
              label="Interest (%)"
              id="interestRate"
              step={0.01}
              value={interestRate}
              onChange={handleInputChange}
            />
            <InputWithLabel
              label="Cost of Electricity ($/kWh)"
              id="costOfEnergy"
              step={0.01}
              value={costOfEnergy}
              onChange={handleInputChange}
            />
          </div>
        </section>
        {/* Farm Parameters Section */}
        <section className="mb-6">
          <SectionDivider />
          <SectionTitle title="System Parameters" />

          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">Define size by area</span>

            <Switch
              checked={systemCapacityOrArea}
              onChange={toggleSystemCapacityOrArea} // This should update the state
              className={`${
                systemCapacityOrArea ? "bg-blue-600" : "bg-gray-400"
              }
                                    relative inline-flex items-center h-6 rounded-full w-11`}
            >
              <span
                aria-hidden="true"
                className={`${
                  systemCapacityOrArea ? "translate-x-6" : "translate-x-1"
                }
                                      inline-block w-4 h-4 transform bg-white rounded-full`}
              />
            </Switch>
          </div>

          {systemCapacityOrArea ? (
            <InputWithLabel
              label="Total Area (sq. m)"
              id="totalarea"
              value={totalarea}
              step={1}
              onChange={(e) => setTotalarea(e.target.value)}
            />
          ) : (
            <InputWithLabel
              label="System Capacity (kWdc)"
              id="systemCapacity"
              value={systemCapacity}
              step={1}
              onChange={(e) => setSystemCapacity(e.target.value)}
            />
          )}
          <div className="flex flex-col space-y-4 mt-4">
            <DropdownWithLabel
              label="Tracking"
              id="tracking"
              selectedValue={tracking}
              onChange={handleTrackingChange}
              options={["Fixed", "1-axis", "2-axis"]}
            />

            <InputWithLabel
              label="Cell Power (W)"
              id="cellPower"
              step={1}
              value={cellPower}
              onChange={(e) => setCellPower(e.target.value)}
            />

            <InputWithLabel
              label="Cell Efficiency (%)"
              id="cellEfficiency"
              value={cellEfficiency}
              step={0.1}
              onChange={(e) => setCellEfficiency(e.target.value)}
            />

            <InputWithLabel
              label="Tilt (°)"
              id="tilt"
              value={tilt}
              step={1}
              onChange={(e) => setTilt(e.target.value)}
            />

            <InputWithLabel
              label="Inverter Efficiency (%)"
              id="inverterEfficiency"
              value={inverterEfficiency}
              step={0.01}
              onChange={(e) => setInverterEfficiency(e.target.value)}
            />

            <InputWithLabel
              label="Electrical Losses (%)"
              id="electricalLosses"
              value={electricalLosses}
              step={0.01}
              onChange={(e) => setElectricalLosses(e.target.value)}
            />
            <InputWithLabel
              label="Ground Coverage Ratio (%)"
              id="groundcoverage"
              value={groundcoverage}
              step={0.1}
              onChange={(e) => setGroundcoverage(e.target.value)}
            />
          </div>
        </section>
        <SectionDivider />

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
  );
};

export default SolarEnergyPage;
