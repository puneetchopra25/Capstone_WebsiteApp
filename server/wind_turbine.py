import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
from matplotlib import pyplot as plt
import seaborn as sns
from scipy.stats import gaussian_kde
from scipy.stats import weibull_min
from scipy.interpolate import CubicSpline
import base64
from io import BytesIO
from calendar import monthrange, isleap

class WindTurbine:
    def __init__(self, rated_power_kw, rotor_diameter_m, air_density, measurement_height, shear_coefficient, number_of_turbines):
        self.rated_power_kw = rated_power_kw
        self.rotor_diameter_m = rotor_diameter_m
        self.air_density = air_density
        self.shear_coefficient = shear_coefficient
        self.measurement_height = measurement_height
        self.hub_height = rotor_diameter_m * 0.5
        self.number_of_turbines = number_of_turbines  
        self.power_curve = self.generate_power_curve()
        
    # def adjust_wind_speed_for_shear(self, wind_speed):
    #     # return wind_speed * (self.hub_height / self.measurement_height) ** self.shear_coefficient
    #     return wind_speed ** self.shear_coefficient

    def generate_power_curve(self):
        cut_in_speed = 3
        rated_speed = 12
        cut_out_speed = 25
        Cp = 0.4
        A = np.pi * (self.rotor_diameter_m / 2) ** 2
        
        wind_speeds = np.linspace(0, 30, num=100)
        power_outputs = np.zeros_like(wind_speeds)
        
        for i, v in enumerate(wind_speeds):
            if cut_in_speed <= v < rated_speed:
                P = 0.5 * self.air_density * A * v**3 * Cp / 1000
                power_outputs[i] = min(P, self.rated_power_kw)
            elif rated_speed <= v < cut_out_speed:
                power_outputs[i] = self.rated_power_kw
                
        return np.array(list(zip(wind_speeds, power_outputs)))

    def plot_power_curve(self, wind_speeds):
        cut_in_speed = 3
        rated_speed = 12
        cut_out_speed = 25
        Cp = 0.4
        A = np.pi * (self.rotor_diameter_m / 2) ** 2
        
        wind_speeds = np.linspace(0, 30, num=100)
        power_outputs = np.zeros_like(wind_speeds)
        
        for i, v in enumerate(wind_speeds):
            if cut_in_speed <= v < rated_speed:
                P = 0.5 * self.air_density * A * v**3 * Cp / 1000
                power_outputs[i] = min(P, self.rated_power_kw)
            elif rated_speed <= v < cut_out_speed:
                power_outputs[i] = self.rated_power_kw
        
        plt.figure(figsize=(8, 4))
        plt.plot(wind_speeds, power_outputs, '-b', label='Power Curve')
        plt.xlabel('Wind Speed (m/s)')
        plt.ylabel('Power Output (kW)')
        plt.title('Wind Turbine Power Curve with Shear Coefficient Adjustment')
        plt.legend()
        plt.grid(False)
        # plt.show()
        buf = BytesIO()
        plt.savefig(buf, format='png')
        plt.close()
        # Encode the image in base64 and decode to string
        data = base64.b64encode(buf.getbuffer()).decode("ascii")
        return f"data:image/png;base64,{data}"
        
    def interpolate_power_output(self, wind_speed):
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
        return turbine_output * (self.air_density / 1.225)

    def calculate_annual_energy(self, wind_speeds):
        annual_energy_kWh_per_turbine = 0
        for wind_speed in wind_speeds:
            turbine_output = self.interpolate_power_output(wind_speed)
            adjusted_output = self.adjust_for_air_density(turbine_output)
            annual_energy_kWh_per_turbine += adjusted_output * (5 / 60)
    
        total_annual_energy_kWh = annual_energy_kWh_per_turbine
        return total_annual_energy_kWh

    def calculate_capacity_factor(self, total_annual_energy_kWh):
        max_possible_energy_per_turbine = self.rated_power_kw * 24 * 365
        total_max_possible_energy = max_possible_energy_per_turbine * self.number_of_turbines
        capacity_factor = total_annual_energy_kWh / total_max_possible_energy
        return capacity_factor
    
    
        
        #check thsi later 
    def plot_power_pdf(self, wind_speeds):
        """Plots the PDF of power output based on wind speeds."""
        power_outputs = np.array([self.interpolate_power_output(speed) for speed in wind_speeds])
        sns.kdeplot(power_outputs, bw_method=0.2)
        plt.xlabel('Power Output (kW)')
        plt.ylabel('Probability Density')
        plt.title('PDF of Power Output')
        plt.grid(True)
        # plt.show()

    # weibull pdf of the wind speeds
    def fit_weibull_parameters(self, wind_speeds):
        """
        Fits the Weibull distribution to the wind speed data and returns the shape and scale parameters.
        """
        shape, loc, scale = weibull_min.fit(wind_speeds, floc=0)
        return shape, scale
    
    def plot_weibull_pdf_of_wind_speeds(self, wind_speeds):
        """
        Plots the Weibull PDF of the wind speeds using fitted Weibull parameters.
        """
        # Fit Weibull parameters to the wind speed data
        shape, scale = self.fit_weibull_parameters(wind_speeds)
        
        # Generate wind speeds for plotting
        wind_speeds_plot = np.linspace(np.min(wind_speeds), np.max(wind_speeds), 1000)
        
        # Calculate the Weibull PDF values
        pdf_values = weibull_min.pdf(wind_speeds_plot, shape, scale=scale)
        
        # Plot the Weibull PDF
        plt.figure(figsize=(8, 4))
        plt.plot(wind_speeds_plot, pdf_values, label='Weibull PDF')
        plt.hist(wind_speeds, bins=30, density=True, alpha=0.5, label='Actual Wind Speeds', edgecolor='k')
        plt.xlabel('Wind Speed (m/s)')
        plt.ylabel('Probability Density')
        plt.title('Weibull PDF of Wind Speeds')
        plt.legend()
        plt.grid(False)
        # plt.show()
        
        buf = BytesIO()
        plt.savefig(buf, format='png')
        plt.close()
        data = base64.b64encode(buf.getbuffer()).decode("ascii")
        return f"data:image/png;base64,{data}"
    #remove
    def generate_power_outputs(self, wind_speeds):
        """
        Generates power outputs from wind speeds using the turbine's power curve.
        """
        return np.array([self.interpolate_power_output(speed) for speed in wind_speeds])
    #remove
    def plot_power_output_distribution(self, wind_speeds):
        """
        Plots the estimated distribution (PDF) of power outputs using kernel density estimation.
        """
        power_outputs = self.generate_power_outputs(wind_speeds)
        
        plt.figure(figsize=(10, 6))
        sns.kdeplot(power_outputs, bw_adjust=0.5, fill=True)
        plt.xlabel('Power Output (kW)')
        plt.ylabel('Density')
        plt.title('Estimated Distribution of Power Outputs')
        plt.grid(True)
        plt.show()
    
    # TODO: CDF of wind speeds and power outputs

    def generate_power_outputs(self, wind_speeds):
        """
        Generates power outputs from wind speeds using the turbine's power curve.
        """
        return np.array([self.interpolate_power_output(speed) for speed in wind_speeds])

    def plot_cdf(self, data, label):
        """
        Plots the CDF of the given data.
        """
        # Sort the data in ascending order
        data_sorted = np.sort(data)
        cdf = np.arange(1, len(data) + 1) / len(data)
        plt.figure(figsize=(10, 6))
        plt.plot(data_sorted, cdf, marker='.', linestyle='none')
        plt.xlabel(label)
        plt.ylabel('CDF')
        plt.title(f'CDF of {label}')
        plt.grid(True)
        plt.show()
        
        
    def energy_range_production(self, windspeeds):
        num_simulations = 5
        simulated_annual_energy_outputs = []

        for _ in range(num_simulations):
            shape, scale = self.fit_weibull_parameters(windspeeds)
            simulated_wind_speeds = weibull_min.rvs(shape, scale=scale, size=len(windspeeds))
            simulated_annual_energy = self.calculate_annual_energy(simulated_wind_speeds)#fix this shit
            simulated_annual_energy_outputs.append(simulated_annual_energy)
            
        simulated_annual_energy_outputs = np.array(simulated_annual_energy_outputs)
        mean_simulated_annual_energy = np.mean(simulated_annual_energy_outputs)
        conf_interval = np.percentile(simulated_annual_energy_outputs, [2.5, 97.5])
        
        conf_interval_formatted = f"{conf_interval[0]:,.2f} - {conf_interval[1]:,.2f} kWh"
        
        simulated_annual_energy_outputs_list = simulated_annual_energy_outputs.tolist()
        conf_interval = conf_interval.tolist()
        
        return simulated_annual_energy_outputs, conf_interval, conf_interval_formatted
        # print(f"Mean Simulated Annual Energy Output: {mean_simulated_annual_energy:.2f} kWh")
    
    def plot_monthly_energy(self, wind_speeds, year):
        monthly_energies = []
        samples_per_day = 288  # 12 samples per hour * 24 hours
        start_index = 0

        for month in range(1, 13):  # From January to December
            days_in_month = monthrange(year, month)[1]
            end_index = start_index + (samples_per_day * days_in_month)
            
            # Extract wind speeds for the current month
            month_speeds = wind_speeds[start_index:end_index]
            month_energy = self.calculate_annual_energy(month_speeds)
            monthly_energies.append(month_energy)
            # Update the start index for the next month
            start_index = end_index
            
        plt.figure(figsize=(8, 4))
        months = range(1, 13)  # 1 to 12 for January to December
        plt.bar(months, monthly_energies, color='skyblue')
        plt.xlabel('Month')
        plt.ylabel('Energy Produced (kWh)')
        plt.title('Monthly Energy Production')
        plt.xticks(months, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
        buf = BytesIO()
        plt.savefig(buf, format='png')
        plt.close()
        # Encode the image in base64 and decode to string
        data = base64.b64encode(buf.getbuffer()).decode("ascii")
        return f"data:image/png;base64,{data}"
    
    
    #wind range plot:
    def energy_range_plot(self, simulated_annual_energy_outputs, conf_interval):
        
        plt.figure(figsize=(8, 4))
        plt.hist(simulated_annual_energy_outputs, bins=50, alpha=0.7, color='blue', edgecolor='black')
        # plt.axvline(mean_simulated_annual_energy, color='red', linestyle='dashed', linewidth=2)
        plt.axvline(conf_interval[0], color='green', linestyle='dashed', linewidth=2)
        plt.axvline(conf_interval[1], color='green', linestyle='dashed', linewidth=2)
        plt.title('Distribution of Simulated Annual Energy Outputs')
        plt.xlabel('Annual Energy (kWh)')
        plt.ylabel('Frequency')
        buf = BytesIO()
        plt.savefig(buf, format='png')
        plt.close()
        # Encode the image in base64 and decode to string
        data = base64.b64encode(buf.getbuffer()).decode("ascii")
        return f"data:image/png;base64,{data}"
    
        