import { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";

import { SectionDivider } from "../components/SectionDivider";
import { SectionTitle } from "../components/SectionTitle";
import { InputWithLabel } from "../components/InputWithLabel";
import { DisplayWithLabel } from "../components/DisplayWithLabel";
import { LoadingSpinnerMessage } from "../components/LoadingSpinnerMessage";

/*
// need mapbox api access token
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { MAPBOX_ACCESS_TOKEN } from "../utils/constants";
*/

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

    // click map → move marker
    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      markerRef.current.setLngLat([lng, lat]);
      setCoordinates({ lat, lng });
    });

    // search result → move marker
    geocoder.on("result", (e) => {
      const [lng, lat] = e.result.geometry.coordinates;
      markerRef.current.setLngLat([lng, lat]);
      mapRef.current.flyTo({ center: [lng, lat] });
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


const SMREnergyPage = ({ setSMRCalcValues, setSMRInputValues }) => {
  const [coordinates, setCoordinates] = useState({ lat: 50.671, lng: -120.332 });
  const [isLoading, setIsLoading] = useState(false);

  const [discountRate, setDiscountRate] = useState("5");
  const [yearsOfModeling, setYearsOfModeling] = useState("25");
  const [modelName, setModelName] = useState("NUSCALE POWER MODULE");
  const [numUnits, setNumUnits] = useState("1");

  // Clear SMR results when page unmounts
  useEffect(() => {
    return () => {
      setSMRCalcValues(null);
      setSMRInputValues(null);
    };
  }, [setSMRCalcValues, setSMRInputValues]);

  const handleSimulation = useCallback(async () => {
    setIsLoading(true);
    setSMRCalcValues(null);
    setSMRInputValues(null);

    try {
      const response = await axios.get(
        "http://localhost:8080/smr",
        {
          params: {
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            rate: discountRate,
            years: yearsOfModeling,
            model: modelName,
            num_units: numUnits,
          },
          withCredentials: false
        }
      );

      // Set backend results
      setSMRCalcValues(response.data);

      // Set input values for results page
      setSMRInputValues({
        modelName,
        numUnits,
        discountRate,
        yearsOfModeling,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      });

    } catch (err) {
      console.error("SMR simulation error:", err);
    }

    setIsLoading(false);
  }, [
    coordinates,
    discountRate,
    yearsOfModeling,
    modelName,
    numUnits,
    setSMRCalcValues,
    setSMRInputValues
  ]);

  return (
    <div className="h-screen p-6 py-0 overflow-auto transition duration-500 ease-in-out bg-gray-200">
      {isLoading && <LoadingSpinnerMessage energy="SMR" />}

      <div className="w-[420px] mx-auto text-gray-900">
        <div className="flex justify-center">
          <h1 className="text-2xl font-bold p-6">SMR Energy Calculator</h1>
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
          <DisplayWithLabel label="Latitude (N)" value={coordinates.lat.toFixed(3)} />
          <DisplayWithLabel label="Longitude (E)" value={coordinates.lng.toFixed(3)} />
        </section>

        {/* SMR Parameters */}
        <section className="mb-6">
          <SectionDivider />
          <SectionTitle title="SMR Parameters" />

          <div className="flex items-center space-x-3 mb-4">
            <label className="block text-sm font-medium w-1/3">
              Select SMR:
            </label>
            <select
              className="mt-1 block w-2/3 p-2 border border-gray-700 rounded-3xl text-center bg-blue-500 text-white"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            >
              <option value="NUSCALE POWER MODULE">NuScale Power Module</option>
              <option value="HOLTEC">Holtec SMR-300</option>
              <option value="HITACHI">GE-Hitachi BWRX-300</option>
              {/* Add more SMR types here */}
            </select>
          </div>

          <InputWithLabel
            label="Number of Units"
            id="numUnits"
            value={numUnits}
            type="number"
            min="1"
            step={1}
            onChange={(e) => setNumUnits(e.target.value)}
          />
        </section>

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

        <SectionDivider />

        <div className="sticky bottom-0 bg-gray-200 pt-3 pb-2 z-10">
          <button
            onClick={handleSimulation}
            className="w-full py-2 px-4 my-3 rounded-3xl font-bold bg-blue-500 hover:bg-blue-400 text-white transition"
          >
            Simulate
          </button>
        </div>
      </div>
    </div>
  );
};

export default SMREnergyPage;
