import { useEffect, useState, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import axios from "axios";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import {
  SectionDivider,
  SectionTitle,
  DisplayWithLabel,
  InputWithLabel,
  LoadingSpinnerMessage,
  TurbineSelector,
  RangeInputWithLabel,
  LabelWithMessage,
} from "../components/CommonComponents";
import { MAPBOX_ACCESS_TOKEN } from "../utils/constants";

const MapComponent = ({
  setRiverCoordinates,
  setLandCoordinates,
  riverCoordinates,
  landCoordinates,
  setElevationDifference,
  setElevationWarningMessage,
  setSimulateButtonDisabled,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const riverMarkerRef = useRef(null);
  const landMarkerRef = useRef(null);

  // Function to add a marker to the map
  const addMarker = (lngLat, color, markerRef) => {
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = new mapboxgl.Marker({ color })
      .setLngLat(lngLat)
      .addTo(mapRef.current);
  };

  // Function to calculate the elevation gain - head
  const calculateElevationDifference = () => {
    if (riverCoordinates && landCoordinates) {
      const riverElevation = mapRef.current.queryTerrainElevation([
        riverCoordinates.lng,
        riverCoordinates.lat,
      ]);
      const landElevation = mapRef.current.queryTerrainElevation([
        landCoordinates.lng,
        landCoordinates.lat,
      ]);

      const difference = riverElevation - landElevation;
      setElevationDifference(difference);

      if (difference < 0) {
        setElevationWarningMessage(
          "Warning: Plant location must be at a lower elevation than intake location."
        );
        setSimulateButtonDisabled(true);
      } else {
        setElevationWarningMessage(null);
        setSimulateButtonDisabled(false);
      }
    }
  };

  // Function to update the line layer on the map
  const updateLineLayer = () => {
    if (mapRef.current && riverCoordinates && landCoordinates) {
      const lineCoordinates = [
        [riverCoordinates.lng, riverCoordinates.lat],
        [landCoordinates.lng, landCoordinates.lat],
      ];

      // Check if the line source exists
      const lineSource = mapRef.current.getSource("line-source");

      if (lineSource) {
        // If the source exists, update its data
        lineSource.setData({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: lineCoordinates,
          },
        });
      } else {
        // If the source doesn't exist, add the line source and layer
        mapRef.current.addSource("line-source", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: lineCoordinates,
            },
          },
        });

        mapRef.current.addLayer({
          id: "line-layer",
          type: "line",
          source: "line-source",
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#FF0000",
            "line-width": 5,
          },
        });
      }
    }
  };

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      accessToken: MAPBOX_ACCESS_TOKEN,
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      // center: [-123.31544804187265, 49.93716452275511], // Initial coordinates for map
      center: [-123.362306, 49.931211], // Initial coordinates for map center
      zoom: 11,
    });

    // Add geocoder and navigation controls to the map
    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_ACCESS_TOKEN,
      mapboxgl: mapboxgl,
      placeholder: "Enter address",
      flyTo: false,
    });
    mapRef.current.addControl(geocoder, "top-left");

    const navControl = new mapboxgl.NavigationControl({ showCompass: false });
    mapRef.current.addControl(navControl, "top-right");

    geocoder.on("result", (e) => {
      const newCoordinates = e.result.geometry.coordinates;
      mapRef.current.flyTo({ center: newCoordinates });
    });

    mapRef.current.on("load", () => {
      // Add initial markers for river and land coordinates
      addMarker(riverCoordinates, "#87CEFA", riverMarkerRef);
      addMarker(landCoordinates, "green", landMarkerRef);

      // Add a layer for rivers
      mapRef.current.addLayer({
        id: "rivers-layer",
        type: "line",
        source: "composite",
        "source-layer": "waterway",
        filter: ["==", "class", "river"],
        paint: { "line-color": "#0000FF", "line-width": 10 },
      });

      mapRef.current.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.terrain-rgb",
        tileSize: 512,
        maxzoom: 14,
      });

      mapRef.current.setTerrain({ source: "mapbox-dem", exaggeration: 1 });

      // Add event listeners for clicks on river layer
      mapRef.current.on("click", (e) => {
        const features = mapRef.current.queryRenderedFeatures(e.point, {
          layers: ["rivers-layer"],
        });

        if (features.length !== 0) {
          const newCoordinates = e.lngLat;
          setRiverCoordinates({
            lng: newCoordinates.lng,
            lat: newCoordinates.lat,
          });
          addMarker(newCoordinates, "#87CEFA", riverMarkerRef);
        }
      });

      // Add event listeners for clicks on land layer
      mapRef.current.on("click", (e) => {
        const features = mapRef.current.queryRenderedFeatures(e.point, {
          layers: ["rivers-layer", "waterway", "water"],
        });

        if (features.length === 0) {
          const newCoordinates = e.lngLat;
          setLandCoordinates({
            lng: newCoordinates.lng,
            lat: newCoordinates.lat,
          });
          addMarker(newCoordinates, "green", landMarkerRef);
        }
      });

      mapRef.current.getCanvas().style.cursor = "pointer";

      // update the line layer on map load
      updateLineLayer();

      // Calculate the elevation difference on map load and mapbox-dem load
      mapRef.current.on("data", (e) => {
        if (e.sourceId === "mapbox-dem" && e.isSourceLoaded) {
          calculateElevationDifference();
        }
      });
    });

    return () => mapRef.current.remove();
  }, []);

  // Update the line layer and calculate the elevation difference when coordinates change
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      updateLineLayer();
      calculateElevationDifference();
    }
  }, [riverCoordinates, landCoordinates]);

  return (
    <div
      ref={mapContainerRef}
      className="h-60 rounded-lg border-2 border-gray-700"
    />
  );
};

// Turbine models for the dropdown selector
const turbineModels = [
  { id: 0, code: "FRC", name: "Francis Turbine", efficiency: 93 },
  { id: 1, code: "PLT", name: "Pelton Turbine", efficiency: 88 },
  { id: 2, code: "KPL", name: "Kaplan Turbine", efficiency: 94 },
];

// Hydro Energy Page Component
const HydroEnergyPage = ({ setHydroCalcValues, setHydroInputValues }) => {
  const [simulateButtonDisabled, setSimulateButtonDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [elevationDifference, setElevationDifference] = useState(null);
  const [riverCoordinates, setRiverCoordinates] = useState({
    // lng: -123.31499038595129,
    // lat: 49.93712452275511,

    // *** change below coordinates to test with different latitude and Longitude ***

    lng: -123.382306,
    lat: 49.935694,
  });
  const [landCoordinates, setLandCoordinates] = useState({
    // lng: -123.31644804187265,
    // lat: 49.937073777558595,

    // *** change below coordinates to test with different latitude and Longitude ***

    lng: -123.324889,
    lat: 49.914,
  });

  const [elevationWarningMessage, setElevationWarningMessage] = useState(null);
  const [efficiency, setEfficiency] = useState(turbineModels[0].efficiency);
  const [selectedTurbineDetails, setSelectedTurbineDetails] = useState({
    id: turbineModels[0].id,
    code: turbineModels[0].code,
    name: turbineModels[0].name,
    efficiency: turbineModels[0].efficiency,
  });

  // Financial paramaters
  const [analysisPeriod, setAnalysisPeriod] = useState(8);
  const [discountRate, setDiscountRate] = useState(60);

  // Reset the calculated values when the component unmounts
  useEffect(() => {
    return () => setHydroCalcValues(null);
  }, [setHydroCalcValues]);

  // Handle the turbine change
  const handleTurbineChange = (e) => {
    // get the index of the selected turbine
    const index = e.target.value;
    const selectedTurbineDetails = turbineModels[index];
    setSelectedTurbineDetails({
      id: selectedTurbineDetails.id,
      code: selectedTurbineDetails.code,
      name: selectedTurbineDetails.name,
      efficiency: selectedTurbineDetails.efficiency,
    });
    setEfficiency(selectedTurbineDetails.efficiency);
  };

  // Handle turbine selection based on elevation
  useEffect(() => {
    if (elevationDifference !== null) {
      // delay the turbine selection to ensure the elevation difference is loaded
      const timeoutId = setTimeout(() => {
        let selectedTurbine;
        // if elevation difference is between 30 and 300, select Francis
        if (elevationDifference <= 300 && elevationDifference >= 30) {
          selectedTurbine = turbineModels[0];
        }
        // if elevation difference is less than 30, select Kaplan
        else if (elevationDifference <= 30) {
          selectedTurbine = turbineModels[2];
        }
        // if elevation difference is greater than 300, select Pelton
        else {
          selectedTurbine = turbineModels[1];
        }

        setSelectedTurbineDetails({
          id: selectedTurbine.id,
          code: selectedTurbine.code,
          name: selectedTurbine.name,
          efficiency: selectedTurbine.efficiency,
        });
        setEfficiency(selectedTurbine.efficiency);
      }, 200);

      // Cleanup timeout on unmount or when elevationDifference changes
      return () => clearTimeout(timeoutId);
    }
  }, [elevationDifference]);

  const handleSimulation = useCallback(async () => {
    // Start the loading process
    setIsLoading(true);
    // diable simulate button when loading
    setSimulateButtonDisabled(true);
    // reset hydro calculation values before new simulation
    setHydroCalcValues(null);
    // -68.595832824707
    //47.2580604553223
    try {
      // Make a request to the backend to simulate the hydro energy
      const response = await axios.get("http://127.0.0.1:5000/ror", {
        params: {
          hydro_head: elevationDifference,
          period: analysisPeriod,
          discount_rate: discountRate,
          d_penstock: 10,
          v_penstock: 1.2,
          turbine: selectedTurbineDetails.code,
          lat: riverCoordinates.lat,
          long: riverCoordinates.lng,
          head_loss: 0.05,
          eco_flow: 0.1,
        },
      });

      // Handle the response accordingly
      setHydroCalcValues({
        // cost values
        annual_cost: response.data["annual_cost"],
        levelized_cost: response.data["levelized_cost"],
        lifetime_cost: response.data["life_time_cost"],
        total_investment: response.data["total_investment"],
        annual_npv_cost: response.data["annual_npv_cost"],
        // energy values
        monthly_energy_mwh: response.data["monthly_energy_mwh"],
        annual_energy_mwh: response.data["annual_energy_mwh"],
        capacity_mw: response.data["capacity_mw"],
        intake_flowrate: response.data["intake_flowrate"],
        river_flowrate: response.data["river_flowrate"],
        hydro_head: elevationDifference,
        efficiency: efficiency,
        // site information
        site_link: response.data["site_link"],
        site_no: response.data["site_no"],
      });
      setHydroInputValues({
        intakeCoordinates: riverCoordinates,
        powerHouseCoordinates: landCoordinates,
        turbine: selectedTurbineDetails.name,
        density: 1000,
        gravity: 9.81,
        analysisPeriod: analysisPeriod,
        discountRate: discountRate,
      });
    } catch (error) {
      console.error("Error during simulation:", error);
    }
    // Stop the loading process
    setIsLoading(false);
    setSimulateButtonDisabled(false);
  }, [
    setHydroCalcValues,
    elevationDifference,
    analysisPeriod,
    discountRate,
    selectedTurbineDetails.code,
    selectedTurbineDetails.name,
    riverCoordinates,
    efficiency,
    setHydroInputValues,
    landCoordinates,
  ]);

  // Add useEffect to validate discount rate when it changes
  useEffect(() => {
    if (discountRate < 0 || discountRate > 100) {
      setSimulateButtonDisabled(true);
    } else {
      setSimulateButtonDisabled(false);
    }
  }, [discountRate]);

  return (
    <div className="h-screen bg-gray-200 px-6 py-0 overflow-auto transition duration-500 ease-in-out">
      {isLoading && <LoadingSpinnerMessage energy="Hydro Energy" />}

      <div
        className={`w-[420px] mx-auto text-gray-900 ${
          isLoading ? "opacity-50" : ""
        }`}
      >
        <div className="w-[420px] mx-auto text-gray-900">
          <div className="flex justify-center">
            <h1 className="text-2xl font-bold p-6">Hydro Energy Calculator</h1>
          </div>
          <section className="mb-6 ">
            <SectionTitle title="Location" />
            <div className="mb-4 ">
              <MapComponent
                setRiverCoordinates={setRiverCoordinates}
                setLandCoordinates={setLandCoordinates}
                riverCoordinates={riverCoordinates}
                landCoordinates={landCoordinates}
                setElevationDifference={setElevationDifference}
                setElevationWarningMessage={setElevationWarningMessage}
                setSimulateButtonDisabled={setSimulateButtonDisabled}
              />
              {/* <MapComponent
                // coordinates={coordinates}
                // setCoordinates={setCoordinates}
                setWarningMessage={setWarningMessage}
                setShowPopup={setShowPopup}
              /> */}
            </div>
            {elevationWarningMessage && (
              <div className="bg-red-100 rounded-2xl border-red-950 text-red-800 px-4 py-2 rounded relative mb-4">
                <span className="block sm:inline">
                  {elevationWarningMessage}
                </span>
              </div>
            )}

            <SectionTitle title="Intake (River) Coordinates" />
            <DisplayWithLabel
              label="Latitude (N)"
              value={riverCoordinates?.lat?.toFixed(3)}
            />
            <DisplayWithLabel
              label="Longitude (E)"
              value={riverCoordinates?.lng?.toFixed(3)}
            />
            <SectionTitle title="Power House (Land) Coordinates" />
            <DisplayWithLabel
              label="Latitude (N)"
              value={landCoordinates?.lat?.toFixed(3)}
            />
            <DisplayWithLabel
              label="Longitude (E)"
              value={landCoordinates?.lng?.toFixed(3)}
            />
          </section>
          {/* Hydro Parameters section */}
          <section className="mb-6">
            <SectionDivider />
            <SectionTitle title="Hydro Parameters" />
            <div className="flex flex-col space-y-4">
              {/* Turbine selector */}
              <TurbineSelector
                turbineModels={turbineModels}
                onSelectTurbine={handleTurbineChange}
                selectedTurbineDetailsIndex={selectedTurbineDetails.id}
              />

              {/* Flow Rate section  */}
              <LabelWithMessage
                label="Flow Rate (m³/s)"
                message="System will use historical flow rate based on the selected coordinates."
              />

              {/* Elevation difference (Head) section */}
              <DisplayWithLabel
                label="Head (m)"
                value={elevationDifference?.toFixed(3)}
              />
              {/*Density of water section*/}
              <DisplayWithLabel label="Density (kg/m³)" value="1000" />
              {/*Gravity section*/}
              <DisplayWithLabel label="Gravity (m/s²)" value="9.81" />
              {/*Efficiency section*/}
              <RangeInputWithLabel
                label="Efficiency (%)"
                id="efficiency"
                value={efficiency}
                onChange={(e) => setEfficiency(e.target.value)}
                min={0}
                max={100}
              />
            </div>
          </section>
          {/* Financial Parameters section */}
          <section className="mb-6">
            <SectionDivider />
            <SectionTitle title="Financial Parameters" />
            <div className="flex flex-col space-y-4">
              <InputWithLabel
                label="Analysis period (years)"
                id="analysisPeriod"
                value={analysisPeriod}
                step={1}
                onChange={(e) => setAnalysisPeriod(e.target.value)}
              />
              <InputWithLabel
                label="Discount Rate (%)"
                id="discountRate"
                value={discountRate}
                step={1}
                min={0}
                max={100}
                onChange={(e) => setDiscountRate(e.target.value)}
                error={
                  discountRate &&
                  (discountRate < 0 || discountRate > 100
                    ? "Discount rate must be between 0 and 100"
                    : null)
                }
              />
            </div>
          </section>

          <SectionDivider />

          <div className="sticky bottom-0 bg-gray-200 pt-3 pb-2 z-10">
            <button
              onClick={handleSimulation}
              className={`w-full py-2 px-4 my-3 rounded-3xl font-bold ${
                simulateButtonDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-400"
              } transition duration-500 ease-in-out text-white`}
              disabled={simulateButtonDisabled}
            >
              Simulate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HydroEnergyPage;
