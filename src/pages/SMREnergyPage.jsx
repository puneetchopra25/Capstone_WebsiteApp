import { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";

import { SectionDivider } from "../components/SectionDivider";
import { SectionTitle } from "../components/SectionTitle";
import { InputWithLabel } from "../components/InputWithLabel";
import { DisplayWithLabel } from "../components/DisplayWithLabel";
import { LoadingSpinnerMessage } from "../components/LoadingSpinnerMessage";
import { ErrorDisplayMessage } from "../components/ErrorDisplayMessage";

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

    // Map cursor click
    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      markerRef.current.setLngLat([lng, lat]);
      setCoordinates({ lat, lng });
    });

    // Map search location
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
  const [apiError, setApiError] = useState(null);

  const [discount_rate, setDiscount_rate] = useState("5");
  const [years_of_modelling, setYears_of_modelling] = useState("25");
  const [model_name, setModel_name] = useState("NUSCALE POWER MODULE");
  const [num_units, setNum_units] = useState("1");

  // Clear SMR results when page unmounts
  useEffect(() => {
    return () => {
      setSMRCalcValues(null);
      setSMRInputValues(null);
    };
  }, [setSMRCalcValues, setSMRInputValues]);

  const handleInputChange = (setter) => (e) => {
    setApiError(null);
    setter(e.target.value);
  };

  const handleSimulation = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    setSMRCalcValues(null);
    setSMRInputValues(null);

    try {
       
        // Fail Test: Queue Full
        // throw { response: { status: 429 } };

        // Fail Test: Timeout
        // throw { code: "ECONNABORTED" };

        // Whats being send to backend
        console.log("Sending to backend:", {
          model_name: model_name,
          num_units: Number(num_units),
          lat: coordinates.lat,
          long: coordinates.lng,
          years_of_modelling: Number(years_of_modelling),
          discount_rate: Number(discount_rate)/100,
        });

      const response = await axios.get(
        "/api/smr",
        {
          params: {
            lat: coordinates.lat,
            long: coordinates.lng,
            discount_rate: Number(discount_rate)/100,
            years_of_modelling: Number(years_of_modelling),
            model_name: model_name,
            num_units: Number(num_units),
          },
          withCredentials: false,
          timeout: 10000
        }
      );

      // Log Backend results
      console.log("Backend response data:", response.data[0], "Type:", Array.isArray(response.data[0]));


      // Set backend results
      setSMRCalcValues(response.data[0]);

      // Set input values for results page
      setSMRInputValues({
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        model_name: model_name,
        num_units: num_units,
        discount_rate: discount_rate,
        years_of_modelling: years_of_modelling,

      });

      // Error Message
    } catch (err) {
        console.error("SMR simulation error:", err);

        let message = "The simulation server is currently unavailable.";

        if (err.response?.data?.message) {
          message = err.response.data.message; 
        }
        else if (err.code === "ECONNABORTED") {
          message = "The simulation timed out. Please try again later.";
        }
        setApiError(message);
      }

    setIsLoading(false);
  }, [
    coordinates,
    model_name,
    num_units,
    discount_rate,
    years_of_modelling,
    setSMRCalcValues,
    setSMRInputValues
  ]);

  return (
    <div className="h-screen p-6 py-0 overflow-auto transition duration-500 ease-in-out bg-gray-200">
      {isLoading && <LoadingSpinnerMessage energy="SMR" />}
      {apiError && <ErrorDisplayMessage message={apiError} />}

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
              value={model_name}
              onChange={(e) => {
                setApiError(null);
                setModel_name(e.target.value)
              }}
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
            value={num_units}
            type="number"
            min="1"
            step={1}
            onChange={(e) => {
              setApiError(null);
              setNum_units(e.target.value)
            }}
          />
        </section>

        {/* Financial Parameters */}
        <section className="mb-6">
          <SectionDivider />
          <SectionTitle title="Financial Parameters" />

          <InputWithLabel
            label="Discount Rate (%)"
            id="discount_rate"
            value={discount_rate}
            type="number"
            min="0"
            max="100"
            step={1}
            onChange={(e) => {
              setApiError(null);
              const val = Number(e.target.value);
              if (val >= 0 && val <= 100) setDiscount_rate(e.target.value);
            }}
          />

          <InputWithLabel
            label="Years of Modelling"
            id="years_of_modelling"
            value={years_of_modelling}
            type="number"
            min="1"
            step={1}
            onChange={(e) => {
              setApiError(null);
              setYears_of_modelling(e.target.value)
            }}
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
