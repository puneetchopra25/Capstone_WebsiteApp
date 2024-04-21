import numpy as np
import matplotlib.pyplot as plt
from matplotlib.figure import Figure
import pandas as pd
from datetime import datetime, timedelta
import datetime as dt

from suntime import Sun
import pytz
from timezonefinder import TimezoneFinder
import googlemaps
import base64
from io import BytesIO
#imports complete

"""
logical flow of the class:
1. setup function
2. energy calculation function
3. plots
First Steps:
1. init function to have all the variables in it.(DONE)
2. define the setup function to use for energy calc.
"""
class SolarPanel:
    
    def __init__(self,cell_power,solar_efficiency,system_loss,tilt,latitude,longitude,tracking,inverter_efficiency, gcr):
        self.cell_power = cell_power
        self.solar_efficiency = solar_efficiency
        # self.total_area = total_area
        self.system_loss = float(system_loss)
        self.tilt = tilt
        self.latitude = latitude
        self.longitude = longitude
        self.tracking = tracking
        self.inverter_efficiency = inverter_efficiency
        # self.system_capacity = system_capacity
        self.gcr = gcr
        
    def calculate_sun_angels(self, data_input):
    # this function would calculate the hour angel that would be used in fixed solar panel calculation
        # data = read_file(data_input)
        df = pd.DataFrame(data_input)
        #initalize some parameters
        
        Year = df['Year']
        Month = df['Month']
        Day = df['Day']
        Hour = df['Hour']
        Minute = df['Minute']

        #initalize structure
        num_day,date_num,sun_rise,sun_set,time,time_diff,time_diff_day,hour_angel = [[]]*len(Day),[[]]*len(Day),[[]]*len(Day),[[]]*len(Day),[[]]*len(Day),[[]]*len(Day),[[]]*len(Day),[[]]*len(Day)

        #set timezone for suntime packages
        sun = Sun(self.latitude,self.longitude)
        tf = TimezoneFinder()
        tz = tf.timezone_at(lng =self.longitude,lat = self.latitude)
        #Find the timezone for the given area
        timezone = pytz.timezone(tz)

        for a in range(0,len(Day),1):
            #set up parameters for energy calculation
            num_day[a] = pd.Timestamp(Year[a],Month[a],Day[a]).day_of_year
            date_num = dt.datetime(Year[a],Month[a],Day[a])
            #Find sunrise sunset time of a given day
            sun_rise[a] = 60*sun.get_sunrise_time(date_num,timezone).hour +sun.get_sunrise_time(date_num,timezone).minute
            sun_set[a] = 60*sun.get_sunset_time(date_num,timezone).hour +sun.get_sunset_time(date_num,timezone).minute
            time[a] = 60*Hour[a] + Minute[a]
            #Find the hour angel used for calculation
            time_diff[a] = time[a] - sun_rise[a]
            time_diff_day[a] = sun_set[a] - sun_rise[a]
            hour_angel[a] = 180*time_diff[a]/time_diff_day[a]
            
        hour_angel = pd.DataFrame(np.abs(hour_angel)).T
        num_day = pd.DataFrame(num_day).T
        angel = 23.45*np.sin(2*np.pi*((284+num_day)/365))
        
        return hour_angel,angel
    
    
    def calculate_optimal_tilt_angel(self):
        if (self.latitude <= 23.5):
            latitude_angel = self.latitude
        elif (self.latitude <= 45):
            latitude_angel = 23.5 +(self.latitude - 23.5)*0.5
        else:
            latitude_angel = 34.25 +(self.latitude-45)*0.3
        
        return latitude_angel
    
    def calculate_power(self, data_input):
        # df = pd.DataFrame(data_input)

        # initialize some parameters
        DHI = data_input['DHI']
        DNI = data_input['DNI']
        #find the corresponding solar angels and optimal tilt angel with previous functions
        
        hour_angel,angel = self.calculate_sun_angels(data_input)
        latitude_angel = self.calculate_optimal_tilt_angel()

        #calculate the energy ouput based on different tracking types
        #we give an factoring coefficent based on 0.4 Ground coverage ratio.
        if (self.tracking == 0):
            Energy = pd.DataFrame(0.95*(DNI+DHI)*np.cos(2*np.pi*(latitude_angel-angel-self.tilt)/360)*np.sin(2*np.pi*hour_angel/360)).T
            irradiation = pd.DataFrame((DNI+DHI)*np.cos(2*np.pi*(latitude_angel-angel-self.tilt)/360)*np.sin(2*np.pi*hour_angel/360)).T
            print("enerrgy_0",Energy)
        elif (self.tracking == 1):
            Energy = pd.DataFrame(0.88*(DNI+DHI)*np.cos(2*np.pi*(latitude_angel-angel-self.tilt)/360)).T 
            irradiation = pd.DataFrame((DNI+DHI)*np.cos(2*np.pi*(latitude_angel-angel-self.tilt)/360)).T 
            print("enerrgy_1",Energy)
        elif (self.tracking == 2):
            Energy = pd.DataFrame(0.85*(DNI+DHI))
            irradiation = pd.DataFrame((DNI+DHI))
            print("enerrgy_2",Energy)
        #return the energy as well as solar irradiation after computation
        
        return (Energy * self.inverter_efficiency * self.cell_power * (1 - self.system_loss) / 1000), irradiation.abs()
    # def calculate_power(self, data_input):
    #     # Limit data to first 8760 entries (number of hours in a year)
    #     data_input = data_input[:8760]

    #     # Initialize lists for storing computed values
    #     energy_list = []
    #     irradiation_list = []

    #     # Process each entry
    #     for entry in (data_input):
    #         DHI = entry.get('DHI')
    #         DNI = entry.get('DNI')

    #         # Use placeholders for solar angle functions
    #         hour_angle, angle = self.calculate_sun_angles(data_input)  # Calculate for each entry
    #         latitude_angle = self.calculate_optimal_tilt_angel()

    #         if self.tracking == 0:
    #             energy = 0.95 * (DNI + DHI) * np.cos(2 * np.pi * (latitude_angle - angle[0] - self.tilt) / 360) * np.sin(2 * np.pi * hour_angle[0] / 360)
    #             irradiation = (DNI + DHI) * np.cos(2 * np.pi * (latitude_angle - angle[0] - self.tilt) / 360) * np.sin(2 * np.pi * hour_angle[0] / 360)
    #         elif self.tracking == 1:
    #             energy = 0.88 * (DNI + DHI) * np.cos(2 * np.pi * (latitude_angle - angle[0] - self.tilt) / 360)
    #             irradiation = (DNI + DHI) * np.cos(2 * np.pi * (latitude_angle - angle[0] - self.tilt) / 360)
    #         elif self.tracking == 2:
    #             energy = 0.85 * (DNI + DHI)
    #             irradiation = (DNI + DHI)

    #         # Adjust based on system parameters and append to lists
    #         adjusted_energy = energy * self.inverter_efficiency * self.cell_power * (1 - self.system_loss) / 1000
    #         energy_list.append(adjusted_energy)
    #         irradiation_list.append(irradiation)

    #     return energy_list, irradiation_list
    
    def Energy_Calculation_given_area(self, data_input, tot_Area):
        
        Area_per_device = (self.cell_power / 1000) / self.solar_efficiency
        
        number_of_device = tot_Area / (Area_per_device / self.gcr)
        system_capacity = number_of_device * self.cell_power
        
        total_module_area = number_of_device * Area_per_device
        area_required = total_module_area / self.gcr 
        
        power_list,irradiation = self.calculate_power(data_input)
        self.power_list = np.array(power_list)
        annual_Energy_per_device = np.sum(power_list)
        
        annual_energy_given_area = annual_Energy_per_device * number_of_device 
        
        self.annual_energy_given_area = annual_energy_given_area
        return self.annual_energy_given_area, number_of_device, total_module_area, system_capacity
    
    def Energy_Calculation_given_capacity(self, data_input, system_cap):
        
        Area_per_device = (self.cell_power / 1000) / self.solar_efficiency
        
    
        number_of_device = system_cap // self.cell_power
        
        total_module_area = number_of_device * Area_per_device
        area_required = total_module_area / self.gcr 
        
        power_list,irradiation = self.calculate_power(data_input)
        self.power_list = np.array(power_list)
        annual_Energy_per_device = np.sum(power_list)
        
        annual_energy_given_capacity = number_of_device * annual_Energy_per_device
        
        self.annual_energy_given_capacity = annual_energy_given_capacity
        return self.annual_energy_given_capacity, number_of_device, total_module_area, area_required
    
    def get_capacity_factor_given_capacity(self, system_cap):
        # Using the instance variable `annual_energy_given_capacity`
        # Make sure `Energy_Calculation` has been called before this method
        if hasattr(self, 'annual_energy_given_capacity'):
            return 100 * (self.annual_energy_given_capacity * 1000 / (system_cap * 8760))
        else:
            return None
    def get_capacity_factor_given_area(self, tot_Area):
        # Using the instance variable `annual_energy_given_capacity`
        # Make sure `Energy_Calculation` has been called before this method
        if hasattr(self, 'annual_energy_given_area'):
            return 100 * (self.annual_energy_given_area * 1000 / (tot_Area * 8760))
        else:
            return None
    
    
    #now plot this
    def monthly_energy_plot(self, num_devices):
        # Plot the monthly energy graph
        
        num_hours_per_month = [744,672, 744, 720, 744, 720, 744, 744, 720,744, 720, 744] #peice wise multiplication
        monthly_energy = []
        i = 0
        for hours_per_month in num_hours_per_month:
            monthly_energy.append(np.sum(self.power_list[i:(hours_per_month+i)]) * num_devices * 1e-3)
            
            i += hours_per_month
        print(monthly_energy)
        fig = Figure(figsize=(11, 6), dpi=100)
        ax = fig.add_subplot(111)
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        ax.bar(range(1, 13), monthly_energy, color='tab:blue', zorder=3, edgecolor="0.2")
        ax.set_xlabel('Month', fontsize=14)
        ax.set_ylabel('kWh',fontsize=14)
        ax.set_title('Monthly AC Energy',fontsize=16)
        ax.set_xticks(range(1, 13))
        ax.set_xticklabels(months, ha='right')  # Align right to prevent cutting

        ax.grid(color='0.8', linestyle='dashed', zorder=0, alpha=0.5)
        
        # Adjust the subplot parameters to give the x-axis labels some breathing room
        fig.subplots_adjust(left=0.1, right=0.95, bottom=0.2, top=0.9)
        
        # Save the figure to a BytesIO object
        buf = BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight')  # Ensure the 'tight' bounding box is used
        buf.seek(0)

        # Clean up the figure to free memory
        fig.clf()

        # Encode the image in base64
        data = base64.b64encode(buf.getbuffer()).decode("ascii")
        return f"data:image/png;base64,{data}"
        
    def inst_power_plot(self, energy_result, irradiation_result, month, week):
        # Setup the equation
        df = pd.DataFrame(self.set_up()[0])
        Month = df.columns.str.extract(r'(\d+)')[0].astype(int)  # Assuming month is in the column name
        Day = df.columns.str.extract(r'(\d+)')[1].astype(int)  # Assuming day is in the column name
        Hour = df.columns.str.extract(r'(\d+)')[2].astype(int)  # Assuming hour is in the column name

        Time_in_day = np.arange(24)
        power = [0]*24
        solar_ira = [0]*24
        num_day = 0
        # Calculate the data for graphing
        # If week = 0 do a monthly summation
        if week == 0:
            for a in range(len(Month)):
                if Month[a] == month:
                    power[Hour[a]] += energy_result[a]
                    solar_ira[Hour[a]] += irradiation_result[a]
                    if Day[a] > num_day:
                        num_day = Day[a]
            power = [p / num_day for p in power]
            solar_ira = [s / num_day for s in solar_ira]
        # If month = 1, 2, 3, 4, 5 do a weekly summation
        else:
            for a in range(len(Month)):
                if Month[a] == month:
                    week_num = (Day[a]-1) // 7 + 1
                    if week_num == week:
                        power[Hour[a]] += energy_result[a]
                        solar_ira[Hour[a]] += irradiation_result[a]
                        num_day += 1
            power = [p / (num_day / 24) for p in power]
            solar_ira = [s / (num_day / 24) for s in solar_ira]

        # Plot the monthly/weekly power
        fig, ax1 = plt.subplots()
        ax1.set_xlabel('Time in a Day (Hour)')
        ax1.set_ylabel('Power (kW)')
        plot1 = ax1.plot(Time_in_day, power, 'Red')
        ax1.tick_params(axis='y')
        ax1.set_ylim([0, max(power) * 1.5])

        # Plot the solar irradiation
        ax2 = ax1.twinx()
        ax2.set_ylabel('Solar Irradiation (W/m^2)')
        plot2 = ax2.plot(Time_in_day, solar_ira)
        ax2.tick_params(axis='y')
        ax2.set_ylim([0, max(solar_ira)])

        fig.legend(['Power Produced', 'Solar Irradiation'], loc='upper right')
        plt.title('Hourly Power and Solar Irradiation')
        plt.show()