import { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";

import { SectionDivider } from "../components/SectionDivider";
import { SectionTitle } from "../components/SectionTitle";
import { InputWithLabel } from "../components/InputWithLabel";
import { DisplayWithLabel } from "../components/DisplayWithLabel";
import { LoadingSpinnerMessage } from "../components/LoadingSpinnerMessage";

import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { MAPBOX_ACCESS_TOKEN } from "../utils/constants";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

export const MapComponent = ({ coordinates, setCoordinates }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // safety check
    if (!mapContainerRef.current || mapRef.current || !coordinates) return;

    // initialize map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [coordinates.lng, coordinates.lat],
      zoom: 6,
    });

    // Add geocoder search
    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_ACCESS_TOKEN,
      mapboxgl,
      placeholder: "Enter location",
    });

    mapRef.current.addControl(geocoder, "top-left");

    // Add initial marker
    markerRef.current = new mapboxgl.Marker()
      .setLngLat([coordinates.lng, coordinates.lat])
      .addTo(mapRef.current);

    // Click map and move marker
    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      markerRef.current.setLngLat([lng, lat]);
      setCoordinates({ lat, lng });
    });

    // search result and move marker
    geocoder.on("result", (e) => {
      const [lng, lat] = e.result.geometry.coordinates;
      markerRef.current.setLngLat([lng, lat]);
      mapRef.current.flyTo({ center: [lng, lat], zoom: 7 });
      setCoordinates({ lat, lng });
    });

    // clean up on unmount
    return () => {
      if (mapRef.current) mapRef.current.remove();
      mapRef.current = null;
    };
  }, [coordinates, setCoordinates]);

  return (
    <div
      ref={mapContainerRef}
      className="h-60 rounded-lg border-2 border-gray-700"
    />
  );
};

// Comparison Input Section
const ComparisonInputPage = ({ setComparisonCalcValues, setComparisonInputValues,}) => {
  const [coordinates, setCoordinates] = useState({
    lat: 50.671,
    lng: -120.332,
  });

  const [avgMWDemand, setAvgMWDemand] = useState("300");
  const [isLoading, setIsLoading] = useState(false);

  // Clear results when leaving page
  useEffect(() => {
    return () => {
      setComparisonCalcValues(null);
      setComparisonInputValues(null);
    };
  }, [setComparisonCalcValues, setComparisonInputValues]);

  const handleComparison = useCallback(async () => {
    setIsLoading(true);
    setComparisonCalcValues(null);
    setComparisonInputValues(null);

    try {
      const response = await axios.get(
        "http://localhost:8080/Comparison",
        {
          params: {
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            avg_mw_demand: avgMWDemand,
          },
          withCredentials: false,
        }
      );

      // Set backend results
      setComparisonCalcValues(response.data);

      // Set input values for result page
      setComparisonInputValues({
        avgMWDemand,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      });
    } catch (err) {
      console.error("SMR comparison error:", err);
    }

    setIsLoading(false);
  }, [
    coordinates,
    avgMWDemand,
    setComparisonCalcValues,
    setComparisonInputValues,
  ]);

  return (
    <div className="h-screen p-6 py-0 overflow-auto transition duration-500 ease-in-out bg-gray-200">
      {isLoading && <LoadingSpinnerMessage energy="Comparison" />}

      <div className="w-[420px] mx-auto text-gray-900">
        <div className="flex justify-center">
          <h1 className="text-2xl font-bold p-6">SMR Comparison Tool</h1>
        </div>

        {/* Location Section */}
        <section className="mb-6">
          <SectionTitle title="Location" />
          <div className="mb-4">
            <MapComponent
              coordinates={coordinates}
              setCoordinates={setCoordinates}
            />
          </div>
          <DisplayWithLabel
            label="Latitude (N)" value={coordinates.lat.toFixed(3)}/>
          <DisplayWithLabel
            label="Longitude (E)" value={coordinates.lng.toFixed(3)}/>
        </section>

        {/* Demand Section */}
        <section className="mb-6">
          <SectionDivider />
          <SectionTitle title="Electricity Demand" />

          <InputWithLabel
            label="January Monthly Demand (MW)"
            id="avgMWDemand"
            value={avgMWDemand}
            type="number"
            min="1"
            step="1"
            onChange={(e) => setAvgMWDemand(e.target.value)}
          />
          <InputWithLabel
            label="February Monthly Demand (MW)"
            id="avgMWDemand"
            value={avgMWDemand}
            type="number"
            min="1"
            step="1"
            onChange={(e) => setAvgMWDemand(e.target.value)}
          />
          <InputWithLabel
            label="March Monthly Demand (MW)"
            id="avgMWDemand"
            value={avgMWDemand}
            type="number"
            min="1"
            step="1"
            onChange={(e) => setAvgMWDemand(e.target.value)}
          />
          <InputWithLabel
            label="April Monthly Demand (MW)"
            id="avgMWDemand"
            value={avgMWDemand}
            type="number"
            min="1"
            step="1"
            onChange={(e) => setAvgMWDemand(e.target.value)}
          />
          <InputWithLabel
            label="May Monthly Demand (MW)"
            id="avgMWDemand"
            value={avgMWDemand}
            type="number"
            min="1"
            step="1"
            onChange={(e) => setAvgMWDemand(e.target.value)}
          />
          <InputWithLabel
            label="June Monthly Demand (MW)"
            id="avgMWDemand"
            value={avgMWDemand}
            type="number"
            min="1"
            step="1"
            onChange={(e) => setAvgMWDemand(e.target.value)}
          />
          <InputWithLabel
            label="July Monthly Demand (MW)"
            id="avgMWDemand"
            value={avgMWDemand}
            type="number"
            min="1"
            step="1"
            onChange={(e) => setAvgMWDemand(e.target.value)}
          />
          <InputWithLabel
            label="August Monthly Demand (MW)"
            id="avgMWDemand"
            value={avgMWDemand}
            type="number"
            min="1"
            step="1"
            onChange={(e) => setAvgMWDemand(e.target.value)}
          />
          <InputWithLabel
            label="September Monthly Demand (MW)"
            id="avgMWDemand"
            value={avgMWDemand}
            type="number"
            min="1"
            step="1"
            onChange={(e) => setAvgMWDemand(e.target.value)}
          />
          <InputWithLabel
            label="November Monthly Demand (MW)"
            id="avgMWDemand"
            value={avgMWDemand}
            type="number"
            min="1"
            step="1"
            onChange={(e) => setAvgMWDemand(e.target.value)}
          />
          <InputWithLabel
            label="December Monthly Demand (MW)"
            id="avgMWDemand"
            value={avgMWDemand}
            type="number"
            min="1"
            step="1"
            onChange={(e) => setAvgMWDemand(e.target.value)}
          />
        {/* Financial Parameters */}
        <section className="mb-6">
          <SectionDivider />
          <SectionTitle title="Financial Parameters" />

          <InputWithLabel
            label="Discount Rate (%)"
            id="discountRate"
            value={discountRate}
            type="number"
            min="0"
            max="100"
            step={1}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 0 && val <= 100) setDiscountRate(e.target.value);
            }}
          />

          <InputWithLabel
            label="Years of Modeling"
            id="yearsOfModeling"
            value={yearsOfModeling}
            type="number"
            min="1"
            step={1}
            onChange={(e) => setYearsOfModeling(e.target.value)}
          />
        </section>
        </section>
        <SectionDivider />

        <div className="sticky bottom-0 bg-gray-200 pt-3 pb-2 z-10">
          <button
            onClick={handleComparison}
            className="w-full py-2 px-4 my-3 rounded-3xl font-bold bg-blue-500 hover:bg-blue-400 text-white transition"
          >
            Compare
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonInputPage;
