import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import {
  SectionDivider,
  SectionTitle,
  DisplayWithLabel,
  InputWithLabel,
  Popup,
} from "../components/CommonComponents";

// Default public token
mapboxgl.accessToken =
  "pk.eyJ1IjoibWJrLXViYyIsImEiOiJjbTJ3OG9rZHkwNDBvMnFwcGc2NGs4bDM4In0.yg9mzKihbe1zaJJnPWGQvA";

const MapComponent = ({
  coordinates,
  setCoordinates,
  setWarningMessage,
  setShowPopup,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Add Marker to the location
  const addMarker = (lngLat) => {
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = new mapboxgl.Marker({ color: "red" })
      .setLngLat(lngLat)
      .addTo(mapRef.current);
  };

  // Check if location is on a river
  const isRiverLocation = (coordinates) => {
    const riverFeatures = mapRef.current.queryRenderedFeatures(
      mapRef.current.project(coordinates),
      { layers: ["rivers-layer"] }
    );
    return riverFeatures.length > 0;
  };

  useEffect(() => {
    // Initialize the map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [coordinates.lng, coordinates.lat],
      zoom: 10,
    });

    // Add geocoder control
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: "Enter address",
      // flyTo: false,
    });
    mapRef.current.addControl(geocoder, "top-left");

    const navControl = new mapboxgl.NavigationControl({ showCompass: false });
    mapRef.current.addControl(navControl, "top-right");

    // Geocoder result handler
    geocoder.on("result", (e) => {
      const newCoordinates = e.result.geometry.coordinates;

      if (!isRiverLocation(newCoordinates)) {
        setWarningMessage("Please select a valid river location.");
        setShowPopup(true);
        return;
      }

      // Update map and marker for river location
      setCoordinates({ lng: newCoordinates[0], lat: newCoordinates[1] });
      addMarker(newCoordinates);
      mapRef.current.flyTo({ center: newCoordinates });
      setShowPopup(false);
    });

    // Map load and add river layer
    mapRef.current.on("load", () => {
      mapRef.current.addLayer({
        id: "rivers-layer",
        type: "line",
        source: "composite",
        "source-layer": "waterway",
        filter: ["==", "class", "river"],
        paint: { "line-color": "#0000FF", "line-width": 10 },
      });

      // Map river click handler
      mapRef.current.on("click", "rivers-layer", (e) => {
        const newCoordinates = e.lngLat;
        setCoordinates({ lng: newCoordinates.lng, lat: newCoordinates.lat });
        addMarker(newCoordinates);
        setShowPopup(false);
      });

      // Hover cursor styles for river layer
      mapRef.current.on("mouseenter", "rivers-layer", () => {
        mapRef.current.getCanvas().style.cursor = "pointer";
      });
      mapRef.current.on("mouseleave", "rivers-layer", () => {
        mapRef.current.getCanvas().style.cursor = "not-allowed";
      });
    });

    // Non-river click handler
    mapRef.current.on("click", (e) => {
      const features = mapRef.current.queryRenderedFeatures(e.point, {
        layers: ["rivers-layer"],
      });
      if (features.length === 0) {
        setWarningMessage("Please select a valid river location.");
        setShowPopup(true);
      }
    });

    return () => mapRef.current.remove(); // Cleanup on unmount
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className="h-60 rounded-lg border-2 border-gray-700"
    />
  );
};

const HydroEnergyPage = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [coordinates, setCoordinates] = useState({
    lng: -123.324311,
    lat: 49.914079,
  });

  // Handle the simulation logic - for now it just shows a loading spinner
  const handleSimulation = () => {
    setIsLoading(true);
    console.log("Simulation Clicked");
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
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
                coordinates={coordinates}
                setCoordinates={setCoordinates}
                setWarningMessage={setWarningMessage}
                setShowPopup={setShowPopup}
              />
              {showPopup && (
                <Popup
                  message={warningMessage}
                  onClose={() => setShowPopup(false)}
                />
              )}
            </div>
            <DisplayWithLabel
              label="Latitude (N)"
              value={coordinates.lat.toFixed(3)}
            />
            <DisplayWithLabel
              label="Longitude (E)"
              value={coordinates.lng.toFixed(3)}
            />
          </section>
          <section className="mb-6">
            <SectionDivider />
            <SectionTitle title="Hydro Parameters" />
            <div className="flex flex-col space-y-4">
              <InputWithLabel label="XXXX" />
              <InputWithLabel label="XXXX" />
            </div>
          </section>

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
