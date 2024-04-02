from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd

from wind_turbine import WindTurbine

app = Flask(__name__)
cors = CORS(app, origins='*')

@app.route("/api/users", methods=['GET'])
def users():
    
    system_capacity = float(request.args.get('systemCapacity', 0))
    rotor_diameter = float(request.args.get('rotorDiameter', 0))
    rated_power_kw = system_capacity
    rotor_diameter_m = rotor_diameter
    air_density = 1.225
    measurement_height = 100
    shear_coefficient = 0.14
    number_of_turbines = 1
    
    
    turbine = WindTurbine(rated_power_kw, rotor_diameter_m, air_density, measurement_height, shear_coefficient, number_of_turbines)

    wind_data = pd.read_csv(r"C:\Users\punee\Documents\4thYEAR\ELEC491\Cap\server\WIND-Toolkit_lat39.74_lon-104.99_2008_5min.csv", skiprows=1)
    actual_wind_speeds = wind_data['wind speed at 100m (m/s)'].values
    wind_speeds_over_5ms = actual_wind_speeds[actual_wind_speeds > 5]

    annual_energy = turbine.calculate_annual_energy(wind_speeds_over_5ms)
    capacity_factor = turbine.calculate_capacity_factor(annual_energy)
    sim_energy_range, energy_range, energy_range_format = turbine.energy_range_production(actual_wind_speeds)
    weibull_pdf_wind = turbine.plot_weibull_pdf_of_wind_speeds(actual_wind_speeds)
    power_curve_plot = turbine.plot_power_curve(actual_wind_speeds)
    plot_range_wind = turbine.energy_range_plot(sim_energy_range,energy_range)
    
    year_of_data = 2008 # Example year
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

if __name__ == "__main__":
    app.run(debug=True, port=8080)
