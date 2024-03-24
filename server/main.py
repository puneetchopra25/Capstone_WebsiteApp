from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd

app = Flask(__name__)
cors = CORS(app, origins='*')

@app.route("/api/users", methods=['GET'])
def users():
    
    class WindTurbine:
        def __init__(self, rated_power_kw, rotor_diameter_m, air_density, measurement_height, shear_coefficient, number_of_turbines):
            self.rated_power_kw = rated_power_kw
            self.rotor_diameter_m = rotor_diameter_m
            self.air_density = air_density
            self.shear_coefficient = shear_coefficient
            self.measurement_height = measurement_height  # Typical anemometer height
            self.hub_height = rotor_diameter_m * 0.5 # Assuming hub height is half the rotor diameter for simplicity
            self.number_of_turbines = number_of_turbines  
            self.power_curve = self.generate_power_curve()
            
        def adjust_wind_speed_for_shear(self, wind_speed):
            # Adjusts wind speed to the turbine's hub height using the shear coefficient
            return wind_speed * (self.hub_height / self.measurement_height) ** self.shear_coefficient

        def generate_power_curve(self):
            cut_in_speed = 3  # m/s
            rated_speed = 12  # m/s, assumed for simplicity
            cut_out_speed = 25  # m/s
            Cp = 0.4  # Power coefficient
            A = np.pi * (self.rotor_diameter_m / 2) ** 2
            
            # Wind speeds for the power curve
            wind_speeds = np.linspace(0, 30, num=100)  # Include zero and extend beyond cut-out
            
            # Initialize power outputs
            power_outputs = np.zeros_like(wind_speeds)
            
            # Calculate power output in each region
            for i, v in enumerate(wind_speeds):
                if cut_in_speed <= v < rated_speed:
                    # Cubic increase in power
                    P = 0.5 * self.air_density * A * v**3 * Cp / 1000  # Convert to kW
                    power_outputs[i] = min(P, self.rated_power_kw)  # Limit power to rated power
                elif rated_speed <= v < cut_out_speed:
                    # Constant rated power
                    power_outputs[i] = self.rated_power_kw
                # Else, power remains zero (already initialized as zero)
            
            return np.array(list(zip(wind_speeds, power_outputs)))

        def interpolate_power_output(self, wind_speed):
            """
            Interpolates turbine output from the generated power curve based on the input wind speed.
            """
            wind_speeds = self.power_curve[:, 0]
            outputs = self.power_curve[:, 1]
            
            if wind_speed <= wind_speeds[0] or wind_speed >= wind_speeds[-1]:
                return 0
            else:
                idx_above = np.searchsorted(wind_speeds, wind_speed, side='right')
                idx_below = idx_above - 1
                
                x0, y0 = wind_speeds[idx_below], outputs[idx_below]
                x1, y1 = wind_speeds[idx_above], outputs[idx_above]
                
                return y0 + (wind_speed - x0) * (y1 - y0) / (x1 - x0)

        def adjust_for_air_density(self, turbine_output):
            """
            Adjusts the turbine output based on air density.
            """
            return turbine_output * (self.air_density / 1.225)  # Standard air density at sea level

        def calculate_annual_energy(self, wind_speeds):
            """
            Calculates the total annual energy output from an array of wind speeds for all turbines.
            """
            annual_energy_kWh_per_turbine = 0
            for wind_speed in wind_speeds:
                turbine_output = self.interpolate_power_output(wind_speed)
                adjusted_output = self.adjust_for_air_density(turbine_output)
                annual_energy_kWh_per_turbine += adjusted_output * (5 / 60)  # Convert kW to kWh for 5-minute interval
        
            # Multiply by the number of turbines to get total energy
            total_annual_energy_kWh = annual_energy_kWh_per_turbine * self.number_of_turbines
            return total_annual_energy_kWh

        def calculate_capacity_factor(self, total_annual_energy_kWh):
            """
            Calculates the capacity factor of the wind farm based on the total annual energy output.
            """
            # Maximum possible energy for one turbine
            max_possible_energy_per_turbine = self.rated_power_kw * 24 * 365  # kWh in a non-leap year
            
            # Total maximum possible energy for all turbines
            total_max_possible_energy = max_possible_energy_per_turbine * self.number_of_turbines
            
            # Calculate capacity factor for the entire farm
            capacity_factor = total_annual_energy_kWh / total_max_possible_energy
            return capacity_factor

    system_capacity = float(request.args.get('systemCapacity', 0))
    rotor_diameter = float(request.args.get('rotorDiameter', 0))
    rated_power_kw = system_capacity
    rotor_diameter_m = rotor_diameter
    air_density = 1.225
    measurement_height = 100
    shear_coefficient = 0.14
    number_of_turbines = 10
    turbine = WindTurbine(rated_power_kw, rotor_diameter_m, air_density, measurement_height, shear_coefficient, number_of_turbines)

    # Calls the data in the csv files : to be later used to call from a server 
    wind_data = pd.read_csv(r"C:\Users\punee\Documents\4thYEAR\ELEC491\Cap\server\WIND-Toolkit_lat39.74_lon-104.99_2008_5min.csv", skiprows=1)
    actual_wind_speeds = wind_data['wind speed at 100m (m/s)'].values
    wind_speeds_over_5ms = actual_wind_speeds[actual_wind_speeds > 5]

    # Calculate the annual energy output
    annual_energy = turbine.calculate_annual_energy(wind_speeds_over_5ms)
    # Calculate the capacity factor
    capacity_factor = turbine.calculate_capacity_factor(annual_energy)

    return jsonify({
    "annual_energy": round(annual_energy, 4),
    "capacity_factor": round(capacity_factor * 100, 4)
    })

if __name__ == "__main__":
    app.run(debug=True, port=8080)
