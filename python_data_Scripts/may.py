import netCDF4 as nc
import numpy as np
import os
import json
from datetime import datetime, timedelta

def kelvin_to_celsius(temp_kelvin):
    return temp_kelvin - 273.15  # Convert Kelvin to Celsius

def main():
    # Define the directory containing NetCDF files
    directory = '/Users/rahuldegra/Desktop/NRSC/new'
    
    # Initialize a dictionary to store climate data grouped by coordinates
    climate_data = {}

    try:
        # Get a list of NetCDF files in the directory
        nc_files = [file for file in os.listdir(directory) if file.endswith('.nc')]
        
        # Sort the list of files based on their year
        nc_files.sort()

        # Read latitude and longitude coordinates from the first NetCDF file
        first_file = nc_files[0]
        with nc.Dataset(os.path.join(directory, first_file), 'r') as nc_file:
            lats = nc_file.variables['latitude'][:]
            lons = nc_file.variables['longitude'][:]
            time_var = nc_file.variables['time']
            time_units = time_var.units
            calendar = time_var.calendar if 'calendar' in time_var.ncattrs() else 'standard'

        # Function to find May indices
        def get_may_indices(time_var, time_units, calendar):
            dates = nc.num2date(time_var[:], units=time_units, calendar=calendar)
            may_indices = [i for i, date in enumerate(dates) if date.month == 5]
            return may_indices

        # Loop through each NetCDF file in the sorted list
        for filename in nc_files:
            print(f'Processing file: {filename}')
            try:
                with nc.Dataset(os.path.join(directory, filename), 'r') as nc_file:
                    year = int(filename[:4])
                    time_var = nc_file.variables['time']
                    may_indices = get_may_indices(time_var, time_units, calendar)
                    
                    if not may_indices:
                        print(f"No May data in file {filename}")
                        continue

                    # Try to read temperature data for May
                    temperature_data_may_celsius = None
                    try:
                        temperature_data = nc_file.variables['TMP_2m'][may_indices, :, :]
                        temperature_data = np.ma.filled(temperature_data, np.nan)  # Fill masked values with NaN
                        temperature_data_may_celsius = kelvin_to_celsius(temperature_data)
                    except KeyError:
                        print(f"Temperature data not found in {filename}")

                    # Try to read precipitation data for May
                    precipitation_data_may_mm = None
                    try:
                        precipitation_data = nc_file.variables['APCP_sfc'][may_indices, :, :]
                        precipitation_data = np.ma.filled(precipitation_data, np.nan)  # Fill masked values with NaN
                        precipitation_data_may_mm = np.nansum(precipitation_data, axis=0)  # Sum daily precipitation to get May precipitation
                    except KeyError:
                        print(f"Precipitation data not found in {filename}")

                    # Store temperature and/or precipitation data grouped by coordinates and year
                    for lat_idx, lat in enumerate(lats):
                        for lon_idx, lon in enumerate(lons):
                            formatted_lat = "{:.20f}".format(lat)
                            formatted_lon = "{:.20f}".format(lon)
                            key = (formatted_lat, formatted_lon)
                            if key not in climate_data:
                                climate_data[key] = {'location': {'type': 'Point', 'coordinates': [float(formatted_lon), float(formatted_lat)]}, 'data': []}

                            # Find or create the data entry for the current year
                            data_entry = next((item for item in climate_data[key]['data'] if item['year'] == year), None)
                            if not data_entry:
                                data_entry = {'year': year, 'temperature': None, 'precipitation': None}
                                climate_data[key]['data'].append(data_entry)

                            if temperature_data_may_celsius is not None:
                                data_entry['temperature'] = float(np.nanmean(temperature_data_may_celsius[:, lat_idx, lon_idx]))
                            if precipitation_data_may_mm is not None:
                                data_entry['precipitation'] = float(precipitation_data_may_mm[lat_idx, lon_idx])
            except OSError as os_error:
                print(f"OS error with file {filename}: {os_error}")
            except Exception as e:
                print(f"An error occurred with file {filename}: {str(e)}")
        
        # Export data to JSON file
        with open('combined_climate_data.json', 'w') as json_file:
            json.dump(list(climate_data.values()), json_file, indent=4)
        
        print('Data exported to combined_climate_data.json')
    except FileNotFoundError as fnf_error:
        print(f"File not found: {fnf_error}")
    except OSError as os_error:
        print(f"OS error: {os_error}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()
