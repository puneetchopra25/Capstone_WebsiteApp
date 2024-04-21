import math
import base64
from io import BytesIO
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.figure import Figure
def commercial_fgm_capex(system_capacity) -> int:
    return int((-0.259 * math.log(system_capacity) + 5.157) *  system_capacity)

def utility_fgm_capex(system_capacity) -> int:
    return int((-0.134 * math.log(system_capacity) + 3.335) * system_capacity)

def utility_one_axis_capex(system_capacity) -> int:
    return int((-0.108 * math.log(system_capacity) + 2.945) * system_capacity)

def commercial_fgm_om_cost(system_capacity) -> int:
    return int(17.49e-3 * system_capacity)


def utility_fgm_om_cost(system_capacity) -> int:
    return int(15.4e-3 * system_capacity)


def utility_one_axis_om_cost(system_capacity) -> int:
    return int(16.22e-3 * system_capacity)


def calculate_payback_period(cost_of_elec, capex, om_cost, annual_energy_kwh, interest):
    # Initialize cumulative cash flows
    
    cumulative_cash_flows = -capex
    
    # Initialize year counter
    year = 1
    
    # Loop until cumulative cash flows are greater than or equal to zero
    while cumulative_cash_flows < 0:
        # Calculate the net savings for the year
        annual_savings = annual_energy_kwh * cost_of_elec - om_cost
        # annual_savings = 1104445 * cost_of_elec - om_cost
        # Discount the annual savings for the current year
        discounted_savings = annual_savings / ((1 + interest) ** year)
        
        # Update cumulative cash flows
        cumulative_cash_flows += discounted_savings

        if year > 100:
            return -1
        
        # Increment the year counter
        year += 1
    
    return year - 1


def cashflow_plot(num_years, interest, capex, om_cost, annual_energy_kwh, cost_of_electricity):
    
    
    # years = range(num_years + 1)
    years = [0] + list(range(1, num_years + 1))
    cashflows = []
    print("capex",capex)

    sum = (-capex) / 1000
    cashflows.append(sum)

    for t in range(1, num_years + 1):
        sum += (-om_cost + (annual_energy_kwh * cost_of_electricity)) / ((1 + interest) ** t) / 1000
        cashflows.append(sum)

    fig = Figure(figsize=(11, 6), dpi=100)
    ax = fig.add_subplot(111)

    # Generate the years as x data
    # years = list(range(1, num_years + 1))

    # Create the bar plot
    ax.bar(years, cashflows, color='tab:orange', zorder=3,edgecolor="0.2")
    ax.set_xlabel('Year', fontsize=14)
    ax.set_ylabel('Present Value (Thousands $)', fontsize=14)
    ax.set_title(f'{num_years} Year Net Revenue Forecast', fontsize=16)
    ax.set_xticks(years)  # Set the ticks to be at years
    ax.grid(color='0.8', linestyle='dashed', zorder=0, alpha=0.5)

    # Adjust the subplot parameters
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




def om_cost_plot(num_years, interest, system_capacity, om_cost):
    num_years = int(num_years)
    # years = range(num_years + 1)
    years = [0] +list(range(1, num_years + 1))
    cashflows = [0]  # No OM cost in year 0

    for t in range(1, num_years + 1):
        om = om_cost / ((1 + interest) ** t) / 1000
        cashflows.append(-om)

    fig = Figure(figsize=(11, 6), dpi=100)
    ax = fig.add_subplot(111)

    # Generate the years as x data
    # years = list(range(1, num_years + 1))
    ax.bar(years, cashflows, color='tab:orange', zorder=3,edgecolor="0.2")
    ax.set_xlabel('Year', fontsize=14)
    ax.set_ylabel('Present Value (Thousands $)', fontsize=14)
    ax.set_title(f'Maintenance Costs', fontsize=16)
    ax.set_xticks(years)  # Set the ticks to be at years
    ax.grid(color='0.8', linestyle='dashed', zorder=0, alpha=0.5)

    # Adjust the subplot parameters
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
    


def generation_receipts(num_years, annual_energy_kwh, cost_of_electricity, interest):
    num_years = int(num_years)
    # years = range(num_years + 1)
    years = [0]+list(range(1, num_years + 1))
    cashflows = [0]

    year_0_elec_receipt = annual_energy_kwh * cost_of_electricity

    for t in range(1, num_years + 1):
        receipt = year_0_elec_receipt / ((1 + interest) ** t) / 1000
        cashflows.append(receipt)

    fig = Figure(figsize=(11, 6), dpi=100)
    ax = fig.add_subplot(111)

    # Generate the years as x data
    # years = list(range(1, num_years + 1))
    ax.bar(years, cashflows, color='tab:orange', zorder=3,edgecolor="0.2")
    ax.set_xlabel('Year', fontsize=14)
    ax.set_ylabel('Present Value (Thousands $)', fontsize=14)
    ax.set_title(f'Power Generation Revenue', fontsize=16)
    ax.set_xticks(years)  # Set the ticks to be at years
    ax.grid(color='0.8', linestyle='dashed', zorder=0, alpha=0.5)

    # Adjust the subplot parameters
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