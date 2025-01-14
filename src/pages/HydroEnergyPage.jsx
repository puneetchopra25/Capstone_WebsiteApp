import React, { useEffect, useState, useRef, useCallback } from "react";
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
  InputWithLabelAndSwitch,
  Popup,
  LoadingSpinnerMessage,
  MAPBOX_ACCESS_TOKEN,
} from "../components/CommonComponents";

const MapComponent = ({
  setRiverCoordinates,
  setLandCoordinates,
  riverCoordinates,
  landCoordinates,
  setElevationDifference,
  setElevationWarningMessage,
  setWarningMessage,
  setShowPopup,
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

  // Function to calculate the distance between two coordinates
  const haversineDistance = (coord1, coord2) => {
    const toRadians = (degree) => (degree * Math.PI) / 180;
    const earthRadius = 6371; // Radius of the Earth in kilometers

    const dLat = toRadians(coord2.lat - coord1.lat);
    const dLng = toRadians(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(coord1.lat)) *
        Math.cos(toRadians(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distanceInKm = earthRadius * c; // Distance in kilometers
    const distanceInM = distanceInKm * 1000; // Distance in meters

    // Return distance with appropriate unit
    return distanceInKm >= 1
      ? `${distanceInKm.toFixed(3)} km` // Format for kilometers
      : `${distanceInM.toFixed(3)} m`; // Format for meters
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
      } else {
        setElevationWarningMessage(null);
      }
    }
  };

  // Function to reset the markers and line layer
  const resetMarkers = () => {
    if (riverMarkerRef.current) riverMarkerRef.current.remove();
    if (landMarkerRef.current) landMarkerRef.current.remove();
    setRiverCoordinates(null);
    setLandCoordinates(null);

    // Reset the line layer if it exists
    if (mapRef.current.getLayer("line-layer")) {
      mapRef.current.removeLayer("line-layer");
      mapRef.current.removeSource("line-source");
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

  const distance =
    riverCoordinates && landCoordinates
      ? haversineDistance(riverCoordinates, landCoordinates)
      : null;

  return (
    <div
      ref={mapContainerRef}
      className="h-60 rounded-lg border-2 border-gray-700"
    />
  );
};

const HydroEnergyPage = ({ setHydroCalcValues }) => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [elevationDifference, setElevationDifference] = useState(null);
  // const [riverCoordinates, setRiverCoordinates] = useState(null);
  // const [landCoordinates, setLandCoordinates] = useState(null);
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

  const [flowRate, setFlowRate] = useState(10);
  const [customFlowRate, setCustomFlowRate] = useState(false);
  const [elevationWarningMessage, setElevationWarningMessage] = useState(null);
  const [efficiency, setEfficiency] = useState(100);
  const [customEfficiency, setCustomEfficiency] = useState(false);

  // cost paramaters
  const [analysisPeriod, setAnalysisPeriod] = useState(40);
  const [interestRate, setInterestRate] = useState(0.07);
  const [priceOfEnergy, setCostOfEnergy] = useState(0.11);

  // Reset the calculated values when the component unmounts
  useEffect(() => {
    return () => setHydroCalcValues(null);
  }, [setHydroCalcValues]);

  // Handle checkbox toggle to control custom flow rate
  const handleCustomFlowRateToggle = () => {
    setCustomFlowRate((prev) => !prev);
    // if (customFlowRate) {
    //   setFlowRate(10); // Reset flow rate to default value
    // }
  };

  const handleCustomEfficiencyToggle = () => {
    setCustomEfficiency((prev) => {
      const newCustomEfficiency = !prev;
      if (!newCustomEfficiency) {
        // If custom efficiency is disabled, reset to initial efficiency (100)
        setEfficiency(100);
      }
      return newCustomEfficiency;
    });
  };
  // Handle the simulation logic - for now it just shows a loading spinner
  /*
  const handleSimulation = () => {
    setIsLoading(true);
    console.log("Simulation Clicked");
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
  };
*/

  const handleSimulation = useCallback(async () => {
    // Start the loading process
    setIsLoading(true);
    // reset hydro calculation values before new simulation
    setHydroCalcValues(null);

    try {
      // Make a request to the backend to simulate the hydro energy --- for now sending temp values
      const response = await axios.get("http://127.0.0.1:5000/ror", {
        params: {
          lat: -68.595832824707,
          long: 47.2580604553223,
          hydro_head: elevationDifference,
        },
      });

      // Handle the response accordingly
      setHydroCalcValues(response.data);
      console.log({ response: response.data });
    } catch (error) {
      console.error("Error during simulation:", error);
    }
    // Stop the loading process
    setIsLoading(false);
  }, [riverCoordinates, elevationDifference, setHydroCalcValues]);

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
                setWarningMessage={setWarningMessage}
                setShowPopup={setShowPopup}
                setElevationWarningMessage={setElevationWarningMessage}
              />
              {/* <MapComponent
                // coordinates={coordinates}
                // setCoordinates={setCoordinates}
                setWarningMessage={setWarningMessage}
                setShowPopup={setShowPopup}
              /> */}
              {showPopup && (
                <Popup
                  message={warningMessage}
                  onClose={() => setShowPopup(false)}
                />
              )}
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
          <section className="mb-6">
            <SectionDivider />
            <SectionTitle title="Hydro Parameters" />
            <div className="flex flex-col space-y-4">
              {/* Flow Rate section  */}
              <InputWithLabelAndSwitch
                label="Flow Rate (m³/s)"
                id="flowRate"
                customMessage="Please enter a custom flow rate value."
                historicalMessage="System will use historical flow rate based on the selected coordinates. Toggle to enable custom flow rate."
                value={flowRate}
                onChange={(e) => setFlowRate(e.target.value)}
                error={
                  flowRate && isNaN(flowRate)
                    ? "Please enter a valid number"
                    : null
                }
                isChecked={customFlowRate}
                onSwitchChange={handleCustomFlowRateToggle}
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
              <InputWithLabelAndSwitch
                label="Efficiency (%)"
                id="efficiency"
                customMessage="Please enter a custom efficiency value (in %)."
                historicalMessage="System will use the default efficiency of 100%. Toggle to enable custom efficiency."
                value={efficiency}
                onFlowChange={(e) => setEfficiency(e.target.value)}
                onChange={(e) => setEfficiency(e.target.value)}
                error={
                  efficiency && isNaN(efficiency)
                    ? "Please enter a valid number"
                    : null
                }
                isChecked={customEfficiency}
                onSwitchChange={handleCustomEfficiencyToggle}
              />

              {/* <InputWithLabel label="XXXX" /> */}
            </div>
          </section>
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
                label="Interest (%)"
                id="interestRate"
                value={interestRate}
                step={0.01}
                onChange={(e) => setInterestRate(e.target.value)}
              />
              <InputWithLabel
                label="Price of Electricity ($/kWh)"
                id="priceOfEnergy"
                value={priceOfEnergy}
                step={0.01}
                onChange={(e) => setCostOfEnergy(e.target.value)}
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
    </div>
  );
};

export default HydroEnergyPage;
