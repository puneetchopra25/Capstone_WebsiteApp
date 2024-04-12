from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import requests
from wind_turbine import WindTurbine



app = Flask(__name__)
# cors = CORS(app, origins='*')
cors = CORS(app)
@app.route("/api/users", methods=['GET'])
def users():
    
    system_capacity = float(request.args.get('systemCapacity', 0))
    rotor_diameter = float(request.args.get('rotorDiameter', 0))
    year_of_data = int(request.args.get('year', '2007'))
    lat = float(request.args.get('latitude', 0))
    long = float(request.args.get('longitude', 0))
    rated_power_kw = system_capacity
    rotor_diameter_m = rotor_diameter
    air_density = 1.225
    measurement_height = 80
    shear_coefficient = 0.14
    number_of_turbines = 1
    
    
    wind_data_server_url = 'https://cpen491ha60.ngrok.dev/get_wind_data'
    wind_data_params = {
        'latitude': 45.2827,
        'longitude': -123.1207,
        'year': year_of_data,
        'height': 80
    }
    response = requests.get(wind_data_server_url, params=wind_data_params)
    
    if response.status_code == 200:
        wind_data = response.json()
        actual_wind_speeds = [entry['wind speed at 80m (m/s)'] for entry in wind_data]
        wind_speeds_over_5ms = [speed for speed in actual_wind_speeds if speed > 5]
    else:
        return jsonify({'error': 'Failed to fetch data from the wind data server'}), 500
    
    
    turbine = WindTurbine(rated_power_kw, rotor_diameter_m, air_density, measurement_height, shear_coefficient, number_of_turbines)
    annual_energy = turbine.calculate_annual_energy(wind_speeds_over_5ms)
    capacity_factor = turbine.calculate_capacity_factor(annual_energy)
    sim_energy_range, energy_range, energy_range_format = turbine.energy_range_production(actual_wind_speeds)
    weibull_pdf_wind = turbine.plot_weibull_pdf_of_wind_speeds(actual_wind_speeds)
    power_curve_plot = turbine.plot_power_curve(actual_wind_speeds)
    plot_range_wind = turbine.energy_range_plot(sim_energy_range,energy_range)
    monthly_energy_wind_plot = turbine.plot_monthly_energy(actual_wind_speeds, year_of_data)
    
    annual_energy_formatted = f"{annual_energy:,.2f}"
    
    return jsonify({
    "annual_energy": annual_energy_formatted,
    "capacity_factor": round(capacity_factor * 100, 2),
    "Energy_Range": energy_range_format,
    "weibull_pdf_wind_speed": weibull_pdf_wind,
    "power_curve": power_curve_plot,
    "wind_monthly_energy": monthly_energy_wind_plot,
    "range_plot_wind": plot_range_wind
    })

@app.route("/api/solar_energy", methods=['GET'])
def solar_energy():
    # Retrieve parameters from the query string
    latitude = float(request.args.get('latitude'))
    longitude = float(request.args.get('longitude'))
    analysisPeriod = request.args.get('analysisPeriod')#cosst
    interestRate = request.args.get('interestRate')#cost
    costOfEnergy = request.args.get('costOfEnergy')#cost
    systemCapacity = request.args.get('systemCapacity')
    tracking = request.args.get('tracking')
    
    cellPower = float(request.args.get('cellPower'))#where do i use this
    
    cellEfficiency = float(request.args.get('cellEfficiency'))
    tilt = request.args.get('tilt')
    inverterEfficiency = request.args.get('inverterEfficiency')
    electricalLosses = request.args.get('electricalLosses')
    
    
    if tracking == 'Fixed':
        tracking = 0
    elif tracking == '1-axis':
        tracking = 1
    else:
        tracking = 2
    axis = 1
    
    result = Energy_cacluation(DC_system_size, cellEfficiency, total_area, system_loss, tilt, latitude, longitude, tracking_type, inverterEfficiency, desired_power)
    
    
    
    return jsonify({
        'annual_energy_s': result.annual_energy_given_capacity,
        'device_no': result.area_required,
    })
if __name__ == "__main__":
    app.run(debug=True, port=8080)
