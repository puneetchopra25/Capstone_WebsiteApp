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
// Initialize Input
const ComparisonInputPage = ({ setComparisonCalcValues, setComparisonInputValues,}) => {
  const [coordinates, setCoordinates] = useState({
    lat: 43.648,
    lng: -79.384,
  });
  const [target_demand_mw, setTarget_demand_mw] = useState([200, 200, 200, 200]);
  const [isLoading, setIsLoading] = useState(false);
  const [rate, setRate] = useState(5);
  const [analysis_period, setAnalysis_period] = useState(30);
  const [existing_capacity_mw, setExisting_capacity_mw] = useState(0);
  const [standby_lcoe_kwh, setStandby_lcoe_kwh] = useState(300);

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

    // Whats being send to backend
    console.log("Sending to backend:", {
    latitude: coordinates.lat,
    longitude: coordinates.lng,
    target_demand_mw: target_demand_mw,
    analysis_period: Number(analysis_period),
    discount_rate: Number(rate)/100,
    existing_capacity_mw: Number(existing_capacity_mw),
    standby_lcoe_kwh: Number(standby_lcoe_kwh)
    });
  
      const response = await axios.get(
        "http://localhost:8080/recommend",
        {
          params: {
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            target_demand_mw: target_demand_mw.join(","),
            existing_capacity_mw: Number(existing_capacity_mw),
            standby_lcoe_kwh: Number(standby_lcoe_kwh),
            discount_rate: Number(rate)/100,
            analysis_period: Number(analysis_period)
          },
          // prevents [] brackets in url
          paramsSerializer:{
            indexes:null
          },
          withCredentials: false,
        }
      );

      // Log Backend results
      console.log("Backend response data:", response.data);


      // Set backend results
      setComparisonCalcValues(response.data);

      // Set input values for result page
      setComparisonInputValues({
        target_demand_mw: target_demand_mw,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      });
    } catch (err) {
      console.error("SMR comparison error:", err);
    }

    setIsLoading(false);
  }, [
    coordinates,
    target_demand_mw,
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
            label="1st Quarter Demand (MW)"
            id="target_demand_mw"
            value={target_demand_mw[0]}
            type="number"
            min="1"
            step="1"
            onChange={(e) => {
              const new_demand = [...target_demand_mw];
              new_demand[0] = Number(e.target.value);
              setTarget_demand_mw(new_demand)
            }}
          />
          <InputWithLabel
            label="2nd Quarter Demand (MW)"
            id="target_demand_mw"
            value={target_demand_mw[1]}
            type="number"
            min="1"
            step="1"
            onChange={(e) => {
              const new_demand = [...target_demand_mw];
              new_demand[1] = Number(e.target.value);
              setTarget_demand_mw(new_demand)
            }}
          />
          <InputWithLabel
            label="3rd Quarter Demand (MW)"
            id="target_demand_mw"
            value={target_demand_mw[2]}
            type="number"
            min="1"
            step="1"
            onChange={(e) => {
              const new_demand = [...target_demand_mw];
              new_demand[2] = Number(e.target.value);
              setTarget_demand_mw(new_demand)
            }}
          />
          <InputWithLabel
            label="4th Quarter Demand (MW)"
            id="target_demand_mw"
            value={target_demand_mw[3]}
            type="number"
            min="1"
            step="1"
            onChange={(e) => {
              const new_demand = [...target_demand_mw];
              new_demand[3] = Number(e.target.value);
              setTarget_demand_mw(new_demand)
            }}
          />
        </section>

        {/* Financial Parameters */}
        <section className="mb-6">
          <SectionDivider />
          <SectionTitle title="Financial Parameters" />

          <InputWithLabel
            label="Discount Rate (%)"
            id="rate"
            value={rate}
            type="number"
            min="0"
            max="100"
            step={1}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 0 && val <= 100) setRate(e.target.value);
            }}
          />
          <InputWithLabel
            label="Years of Modelling"
            id="analysis_period"
            value={analysis_period}
            type="number"
            min="1"
            step={1}
            onChange={(e) => setAnalysis_period(e.target.value)}
          />
        </section>

        {/* Demand Section */}
        <section className="mb-6">
          <SectionDivider />
          <SectionTitle title="Standby Generation" />

          <InputWithLabel
            label="Spare Standby Capacity (MWh)"
            id="existing_capacity_mw"
            value={existing_capacity_mw}
            type="number"
            min="1"
            step="1"
            onChange={(e) => setExisting_capacity_mw(e.target.value)}
          />
          <InputWithLabel
            label="Standby Generation Cost ($/MWh)"
            id="standby_lcoe_kwh"
            value={standby_lcoe_kwh}
            type="number"
            min="1"
            step="1"
            onChange={(e) => setStandby_lcoe_kwh(e.target.value)}
          />
          
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
