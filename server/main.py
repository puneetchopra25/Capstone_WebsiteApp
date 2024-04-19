from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import requests
from wind_turbine import WindTurbine
from solar_panels import SolarPanel
from solarcost import *

app = Flask(__name__)
# cors = CORS(app, origins='*')
# cors = CORS(app)
cors = CORS(app, resources={r"/api/*": {"origins": "http://localhost:5174"}})
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
        'latitude': lat,
        'longitude': long,
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
    # call for cost calculations
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
    latitude = float(request.args.get('latitude'))
    longitude = float(request.args.get('longitude'))
    total_area = float(request.args.get('totalarea', '0.0'))  # Default is 0.0
    systemCapacity = float(request.args.get('systemCapacity', '0'))  # Default is 0
    tracking = request.args.get('tracking', 'Fixed')
    cellPower = float(request.args.get('cellPower', '0'))
    cellEfficiency = float(request.args.get('cellEfficiency', '0'))
    tilt = float(request.args.get('tilt', '0'))
    inverterEfficiency = float(request.args.get('inverterEfficiency', '0.0'))
    electricalLosses = float(request.args.get('electricalLosses', '0.0'))
    groundcoverage = float(request.args.get('groundcoverage', '0.0'))
    systemCapacity = systemCapacity * 1000
    # analysisPeriod = float(request.args.get('analysisPeriod'))#cosst
    analysisPeriod = int(request.args.get('analysisPeriod', '0'))  # Default is '0'
    interestRate = float(request.args.get('interestRate'))#cost
    costOfEnergy = float(request.args.get('costOfEnergy'))#cost
    
    # solar_data_server_url = 'https://cpen491ha60.ngrok.dev/get_solar_data'
    # solar_data_params = {
    #     'latitude': latitude,
    #     'longitude': longitude,
    # }
    # response = requests.get(solar_data_server_url, params=solar_data_params)
    
    # if response.status_code == 200:
    #     solar_data = response.json()
    #     # can change to pd ?????
    # else:
    #     return jsonify({'error': 'Failed to fetch data from the wind data server'}), 500
    
    data_input = pd.read_csv(r"C:\Users\punee\Documents\4thYEAR\ELEC491\Cap\server\Kamloops_Solar_60-minutes.csv")
    
    #tracking check to convert it to a integer value
    if tracking == 'Fixed':
        tracking = 0
        
    elif tracking == '1-axis':
        tracking = 1
    else:
        tracking = 2
        
    panel = SolarPanel(cellPower, cellEfficiency, electricalLosses, tilt, latitude, longitude, tracking, inverterEfficiency, groundcoverage)
    
    response_data = {}    
    #check which of the area or system capacity was provided
    if total_area == 0:
        solar_energy_annual_capacity, number_devices, total_module_area, req_area = panel.Energy_Calculation_given_capacity(data_input, systemCapacity)
        capacity_factor_Solar = panel.get_capacity_factor_given_capacity(systemCapacity)
        monthly_plot_solar = panel.monthly_energy_plot()
        print("solar:",solar_energy_annual_capacity)
        
        if isinstance(capacity_factor_Solar, pd.Series) and not capacity_factor_Solar.empty:
            capacity_factor_Solar = capacity_factor_Solar.iloc[0]  # Extract first item if Series
        
        if isinstance(solar_energy_annual_capacity, pd.Series):
            solar_energy_annual_capacity = solar_energy_annual_capacity.item()
        
        if tracking == 0:   
            if systemCapacity < 2.14e6:
                initial_cost = commercial_fgm_capex(systemCapacity)
                maint_cost = commercial_fgm_om_cost(systemCapacity)
                payback_per = calculate_payback_period(costOfEnergy, initial_cost, maint_cost, solar_energy_annual_capacity/1000, interestRate )
                gen_Rev = int(costOfEnergy * solar_energy_annual_capacity/1000)
                #plot the cost stuff:
                
                cashflow = cashflow_plot(analysisPeriod, interestRate, initial_cost, maint_cost, solar_energy_annual_capacity/1000, costOfEnergy)
                omcostplot = om_cost_plot(analysisPeriod, interestRate, systemCapacity, maint_cost)
                receiptplot = generation_receipts(analysisPeriod, solar_energy_annual_capacity/1000, costOfEnergy, interestRate)
                
            else:
                initial_cost = utility_fgm_capex(systemCapacity)
                maint_cost = utility_fgm_om_cost(systemCapacity)
                payback_per = calculate_payback_period(costOfEnergy, initial_cost, maint_cost, solar_energy_annual_capacity/1000, interestRate )
                gen_Rev = int(costOfEnergy * solar_energy_annual_capacity/1000)
                #plot the cost stuff:
                
                cashflow = cashflow_plot(analysisPeriod, interestRate, initial_cost, maint_cost, solar_energy_annual_capacity/1000, costOfEnergy)
                omcostplot = om_cost_plot(analysisPeriod, interestRate, systemCapacity, maint_cost)
                receiptplot = generation_receipts(analysisPeriod, solar_energy_annual_capacity/1000, costOfEnergy, interestRate)
        elif tracking == 1:
            initial_cost = utility_one_axis_capex(systemCapacity)
            maint_cost = utility_one_axis_om_cost(systemCapacity)
            payback_per = calculate_payback_period(costOfEnergy, initial_cost, maint_cost, solar_energy_annual_capacity/1000, interestRate )
            gen_Rev = int(costOfEnergy * solar_energy_annual_capacity/1000)
            #plot the cost stuff:
            
            cashflow = cashflow_plot(analysisPeriod, interestRate, initial_cost, maint_cost, solar_energy_annual_capacity/1000, costOfEnergy)
            omcostplot = om_cost_plot(analysisPeriod, interestRate, systemCapacity, maint_cost)
            receiptplot = generation_receipts(analysisPeriod, solar_energy_annual_capacity/1000, costOfEnergy, interestRate)
        else:
            initial_cost = 'NA'
            maint_cost = 'NA'
            payback_per = 'NA'
            gen_Rev = 'NA'
            cashflow = None
            omcostplot = None
            receiptplot = None
            
        # payback_per = calculate_payback_period(costOfEnergy, initial_cost, maint_cost, solar_energy_annual_capacity/1000, interestRate )
        # gen_Rev = int(costOfEnergy * solar_energy_annual_capacity/1000)
        # #plot the cost stuff:
        
        # cashflow = cashflow_plot(analysisPeriod, interestRate, initial_cost, maint_cost, solar_energy_annual_capacity, costOfEnergy)
        # omcostplot = om_cost_plot(analysisPeriod, interestRate, systemCapacity, maint_cost)
        # receiptplot = generation_receipts(analysisPeriod, solar_energy_annual_capacity, costOfEnergy, interestRate)
        # finish plotting cost stuff
        
        capacity_factor_Solar_formatted = f"{capacity_factor_Solar/1000:,.2f}"   
        solar_energy_annual_capacity = f"{solar_energy_annual_capacity/1000:,.2f}"    
        initial_cost = f"{initial_cost:,.2f}"
        maint_cost = f"{maint_cost:,.2f}"
        gen_Rev = f"{gen_Rev:,.2f}"

        response_data.update({
            'annual_energy_s': solar_energy_annual_capacity,
            'capacity_factor_solar': capacity_factor_Solar_formatted,
            'device_no': number_devices,
            'total_module_area': total_module_area,
            'required_area': req_area,
            'monthly_plot_solar': monthly_plot_solar,
            'initial_cost': initial_cost,
            'main_cost': maint_cost,
            'payback_period': payback_per,
            'gen_Rev': gen_Rev,
            # 'cash_flowplot': cashflow,
            # 'om_costplot':omcostplot,
            # 'recieptplot':receiptplot,
            'cash_flowplot': cashflow if cashflow else 'NA',
            'om_costplot': omcostplot if omcostplot else 'NA',
            'recieptplot': receiptplot if receiptplot else 'NA',
        })
    else:
        solar_energy_annual_area, number_devices, total_module_area, sysCap = panel.Energy_Calculation_given_area(data_input, total_area)
        capacity_factor_Solar = panel.get_capacity_factor_given_area(total_area)
        monthly_plot_solar = panel.monthly_energy_plot()
        if isinstance(capacity_factor_Solar, pd.Series) and not capacity_factor_Solar.empty:
            capacity_factor_Solar = capacity_factor_Solar.iloc[0]  # Extract first item if Series
        capacity_factor_Solar_formatted = f"{capacity_factor_Solar/100000:,.2f}"
        if isinstance(solar_energy_annual_area, pd.Series):
            solar_energy_annual_area = solar_energy_annual_area.item()
        
        if tracking == 0:   
            if systemCapacity < 2.14e6:
                initial_cost = commercial_fgm_capex(sysCap)
                maint_cost = commercial_fgm_om_cost(sysCap)
                payback_per = calculate_payback_period(costOfEnergy, initial_cost, maint_cost, solar_energy_annual_area/1000, interestRate )
                gen_Rev = int(costOfEnergy * solar_energy_annual_area/1000)
                #plot the cost stuff:

                cashflow = cashflow_plot(analysisPeriod, interestRate, initial_cost, maint_cost, solar_energy_annual_area/1000, costOfEnergy)
                omcostplot = om_cost_plot(analysisPeriod, interestRate, sysCap, maint_cost)
                receiptplot = generation_receipts(analysisPeriod, solar_energy_annual_area/1000, costOfEnergy, interestRate)
            else:
                initial_cost = utility_fgm_capex(sysCap)
                maint_cost = utility_fgm_om_cost(sysCap)
                payback_per = calculate_payback_period(costOfEnergy, initial_cost, maint_cost, solar_energy_annual_area/1000, interestRate )
                gen_Rev = int(costOfEnergy * solar_energy_annual_area/1000)
                #plot the cost stuff:

                cashflow = cashflow_plot(analysisPeriod, interestRate, initial_cost, maint_cost, solar_energy_annual_area/1000, costOfEnergy)
                omcostplot = om_cost_plot(analysisPeriod, interestRate, sysCap, maint_cost)
                receiptplot = generation_receipts(analysisPeriod, solar_energy_annual_area/1000, costOfEnergy, interestRate)
        elif tracking == 1:
            initial_cost = utility_one_axis_capex(sysCap)
            maint_cost = utility_one_axis_om_cost(sysCap)
            payback_per = calculate_payback_period(costOfEnergy, initial_cost, maint_cost, solar_energy_annual_area/1000, interestRate )
            gen_Rev = int(costOfEnergy * solar_energy_annual_area/1000)
            #plot the cost stuff:

            cashflow = cashflow_plot(analysisPeriod, interestRate, initial_cost, maint_cost, solar_energy_annual_area/1000, costOfEnergy)
            omcostplot = om_cost_plot(analysisPeriod, interestRate, sysCap, maint_cost)
            receiptplot = generation_receipts(analysisPeriod, solar_energy_annual_area/1000, costOfEnergy, interestRate)
        else:
            initial_cost = 'NA'
            maint_cost = 'NA'
            payback_per = 'NA'
            gen_Rev = 'NA'
            cashflow = None
            omcostplot = None
            receiptplot = None
        # payback_per = calculate_payback_period(costOfEnergy, initial_cost, maint_cost, solar_energy_annual_area/1000, interestRate )
        # gen_Rev = int(costOfEnergy * solar_energy_annual_area/1000)
        # #plot the cost stuff:
        
        # cashflow = cashflow_plot(analysisPeriod, interestRate, initial_cost, maint_cost, solar_energy_annual_area, costOfEnergy)
        # omcostplot = om_cost_plot(analysisPeriod, interestRate, sysCap, maint_cost)
        # receiptplot = generation_receipts(analysisPeriod, solar_energy_annual_area, costOfEnergy, interestRate)
        # finish plotting cost stuff
        solar_energy_annual_area = f"{solar_energy_annual_area/1000:,.2f}"
        initial_cost = f"{initial_cost:,.2f}"
        maint_cost = f"{maint_cost:,.2f}"
        gen_Rev = f"{gen_Rev:,.2f}"
        response_data.update({
            'annual_energy_s': solar_energy_annual_area,
            'capacity_factor_solar': capacity_factor_Solar_formatted,
            'device_no': int(number_devices),
            'total_module_area': int(total_module_area),
            'system_capacity': int(sysCap/1000),
            'monthly_plot_solar': monthly_plot_solar,
            'initial_cost': initial_cost,
            'main_cost': maint_cost,
            'payback_period': payback_per,
            'gen_Rev': gen_Rev,
            # 'cash_flowplot': cashflow,
            # 'om_costplot':omcostplot,
            # 'recieptplot':receiptplot,
            'cash_flowplot': cashflow if cashflow else 'NA',
            'om_costplot': omcostplot if omcostplot else 'NA',
            'recieptplot': receiptplot if receiptplot else 'NA',
            
        })
    return jsonify(response_data)
if __name__ == "__main__":
    app.run(debug=True, port=8080)
