import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import datetime as dt
from suntime import Sun
import pytz
from timezonefinder import TimezoneFinder
import googlemaps

#determine which set of data we are using, 10 mins, 30min and 1 hour interval
#default is 1 hour
#solar efficiency could be changed due to external source
Solar_Efficiency = 0.2
#fixed axis is 0, single axis is 1
Axis = 1
tilt = 0
latitude = 50.69
longitude = -120.34
tracking = 2
inverter_efficency = 1
DC_system_size = 4 #DC system size in KW
system_loss = 0.15
total_area = 60 #m^2
desired_power = 1000*100 #kw
def determine_file():
    #Read corresponding files
    data = pd.read_csv(r"C:\Users\punee\Documents\4thYEAR\ELEC491\Cap\server\Kamloops_Solar_60-minutes.csv")
   
    return data

def set_up(DC_system_size,system_loss,tilt,latitude,longitude,tracking,inverter_efficency):
    data = determine_file()
    df = pd.DataFrame(data)

    # initialize some parameters
    DHI = df['DHI']
    DNI = df['DNI']
    Year = df['Year']
    Month = df['Month']
    Day = df['Day']
    Hour = df['Hour']
    Minute = df['Minute']

    #initalize structure
    num_day = [[]]*(len(Day))
    date_num = [[]]*(len(Day))
    sun_rise = [[]]*(len(Day))
    sun_set = [[]]*(len(Day))
    time = [[]]*(len(Day))
    time_diff = [[]]*(len(Day))
    time_diff_day = [[]]*(len(Day))
    hour_angel = [[]]*(len(Day))

    #set timezone for suntime packages
    sun = Sun(latitude,longitude)
    tf = TimezoneFinder()
    tz = tf.timezone_at(lng =longitude,lat = latitude)
    #Find the timezone for the given area
    timezone = pytz.timezone(tz)

    # assign some numbers and calculation
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
   

    # adjust optimal latitude angel
    if (latitude <= 23.5):
        latitude_angel = latitude
    elif (latitude <= 45):
        latitude_angel = 23.5 +(latitude - 23.5)*0.5
    else:
        latitude_angel = 34.25 +(latitude-45)*0.3

    # adjust the datatype for hourangel and etc
    hour_angel = pd.DataFrame(np.abs(hour_angel)).T
    num_day = pd.DataFrame(num_day).T
    angel = 23.45*np.sin(2*np.pi*((284+num_day)/365))

    #compute the equation for different tracking types
    #adjust the value of 0.4 GCR
    if (tracking == 0):
        Energy = pd.DataFrame(0.95*(DNI+DHI)*np.cos(2*np.pi*(latitude_angel-angel-tilt)/360)*np.sin(2*np.pi*hour_angel/360)).T
        irradiation = pd.DataFrame((DNI+DHI)*np.cos(2*np.pi*(latitude_angel-angel-tilt)/360)*np.sin(2*np.pi*hour_angel/360)).T
    elif (tracking == 1):
        Energy = pd.DataFrame(0.88*(DNI+DHI)*np.cos(2*np.pi*(latitude_angel-angel-tilt)/360)).T 
        irradiation = pd.DataFrame((DNI+DHI)*np.cos(2*np.pi*(latitude_angel-angel-tilt)/360)).T 
    elif (tracking == 2):
        Energy = pd.DataFrame(0.85*(DNI+DHI))
        irradiation = pd.DataFrame((DNI+DHI))
    #return the energy as well as solar irradiation after computation
    return Energy*inverter_efficency*DC_system_size*(1-system_loss)/1000 , irradiation

#set up the data format
class Output:
  def __init__(Result, Annual_Energy_per_device, annual_energy_given_area,annual_energy_given_capacity,area_required,power_list,irradiation):
    Result.Annual_Energy_per_device = Annual_Energy_per_device
    Result.annual_energy_given_area = annual_energy_given_area
    Result.annual_energy_given_capacity = annual_energy_given_capacity
    Result.area_required = area_required
    Result.power_list = power_list
    Result.irradiation = irradiation

def Energy_cacluation(DC_system_size,Solar_Efficiency,total_area,system_loss,tilt,latitude,longitude,tracking,inverter_efficency,desired_power):
    #The area that one modulate device would need 6.25times for GCR of 0.4
    Area_per_device = 6.25*DC_system_size/Solar_Efficiency
    #Find number of device that a given area would have
    number_of_device = total_area/Area_per_device
    #read the power and solar irradiation 
    power_list,irradiation = set_up(DC_system_size,system_loss,tilt,latitude,longitude,tracking,inverter_efficency)
    # find the annual power of a specifc device by summing the instaneous power
    annual_Energy_per_device = pd.Series.sum(power_list).iat[0] 
    #total annual power given a specifc area
    annual_energy_given_area = annual_Energy_per_device*number_of_device 
    # the area required if they need a certain instaneous capacity
    area_required = (desired_power/DC_system_size)*Area_per_device 
    # Find number of device given a specific capacity
    number_of_device_given_capacity = (desired_power/DC_system_size)
    # Find annual energy given capcaity
    annual_energy_given_capacity = number_of_device_given_capacity*annual_Energy_per_device


    Result = Output(annual_Energy_per_device, annual_energy_given_area,annual_energy_given_capacity,area_required,power_list,irradiation)
    
    return Result


def Monthly_Energy_plot(result):
    #plot the monthy energy graph
    data = determine_file()
    df = pd.DataFrame(data)
    Month = df['Month']

    Monthly_Power = [0]*12
    #summing the power for a specifc month
    for a in range(0,len(Month),1):
        Monthly_Power[Month[a]-1] += result[0][a]
    #Define the X axis
    Month_number = ['Jan','Feb','Mar','Apr','May','Jun','July','Aug','Sep','Oct','Nov','Dec']
    #plotting
    plt.bar(Month_number,Monthly_Power)
    plt.ylabel('Total Power (kwh)')
    plt.show()

def Inst_Power_Plot(result,irradiation,month,week):
    #setup the equation
    data = determine_file()
    df = pd.DataFrame(data)
    Month = df['Month']
    Day = df['Day']
    Hour = df['Hour']
    Time_in_day = np.arange(24)
    power = [[0]]*24
    solar_ira = [[0]]*24
    num_day = 0
    #calculate the data for graphing
    # if week = 0 do a monthy summation
    if (week == 0):
        for a in range(0,len(Month),1):
            if(Month[a] == month):
                power[Hour[a]] += result[0][a]
                solar_ira[Hour[a]] += irradiation[0][a]
                if(Day[a]>num_day):
                    num_day = Day[a]
        power = power/(num_day) 
        solar_ira = solar_ira/(num_day)      
    # if month = 1,2,3,4,5 do a weekly summation
    else:
        for a in range(0,len(Month),1):
            if(Month[a] == month):
                week_num = int((Day[a]-1)/7)+1
                if(week_num == week):
                    power[Hour[a]] += result[0][a]
                    solar_ira[Hour[a]] += irradiation[0][a]
                    num_day += 1
        power = power/np.array(num_day/24)
        solar_ira = solar_ira/np.array(num_day/24)
    #plot the monthly/ weekly power
    fig, ax1 = plt.subplots() 
    ax = plt.gca()
    ax1.set_xlabel('Time in a Day (Hour)') 
    ax1.set_ylabel('Power (kW)') 
    plot1 = ax1.plot(Time_in_day, power,'Red')
    ax1.tick_params(axis ='y',) 
    ax.set_ylim([0, np.max(power)*1.5])
    #plot the solar irradiation
    ax2 = ax1.twinx() 
    ax2.set_ylabel('Solar Irradiation (W/m^2)') 
    plot2 = ax2.plot(Time_in_day,solar_ira) 
    ax2.tick_params(axis ='y')
    ax2.set_ylim([0, np.max(solar_ira)])
    fig.legend(['Power Produced','Solar Irradiation'])
    plt.show()
    

# result = Energy_cacluation(DC_system_size,Solar_Efficiency,total_area,system_loss,0,latitude,longitude,0,inverter_efficency,desired_power)    

    
    
    
    