import netCDF4 as nc
import numpy as np
import os
import json

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

        # Loop through each NetCDF file in the sorted list
        for filename in nc_files:
            print(f'Processing file: {filename}')
            with nc.Dataset(os.path.join(directory, filename), 'r') as nc_file:
                year = int(filename[:4])
                # Try to read temperature data
                temperature_data_year_celsius = None
                try:
                    temperature_data_year = nc_file.variables['TMP_2m'][:]
                    temperature_data_year = np.ma.filled(temperature_data_year, np.nan)  # Fill masked values with NaN
                    temperature_data_year_celsius = kelvin_to_celsius(temperature_data_year)
                except KeyError:
                    pass
                
                # Try to read precipitation data
                precipitation_data_year_mm_per_year = None
                try:
                    precipitation_data_year = nc_file.variables['APCP_sfc'][:]
                    precipitation_data_year = np.ma.filled(precipitation_data_year, np.nan)  # Fill masked values with NaN
                    precipitation_data_year_mm_per_year = np.nansum(precipitation_data_year, axis=0)  # Sum daily precipitation to get annual precipitation
                except KeyError:
                    pass
                
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

                        if temperature_data_year_celsius is not None:
                            data_entry['temperature'] = float(np.nanmean(temperature_data_year_celsius[:, lat_idx, lon_idx]))
                        if precipitation_data_year_mm_per_year is not None:
                            total_precipitation = precipitation_data_year_mm_per_year[lat_idx, lon_idx]
                            num_days = np.sum(~np.isnan(precipitation_data_year[:, lat_idx, lon_idx]))
                            if num_days > 0:
                                data_entry['precipitation'] = float(total_precipitation / num_days * 365)
        
        # Export data to JSON file
        with open('2combined_climate_data.json', 'w') as json_file:
            json.dump(list(climate_data.values()), json_file, indent=4)
        
        print('2Data exported to combined_climate_data.json')
    except FileNotFoundError as fnf_error:
        print(f"File not found: {fnf_error}")
    except OSError as os_error:
        print(f"OS error: {os_error}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()
