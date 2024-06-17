import netCDF4 as nc
import numpy as np
import pandas as pd
import os

def kelvin_to_celsius(temp_kelvin):
    return temp_kelvin - 273.15  # Convert Kelvin to Celsius

def extract_and_export_temperature(nc_file_path, lat, lon):
    try:
        # Open the NetCDF file
        with nc.Dataset(nc_file_path, 'r') as nc_file:
            # Get latitude and longitude variables
            lats = nc_file.variables['latitude'][:]
            lons = nc_file.variables['longitude'][:]
            
            # Find the nearest indices for the given latitude and longitude
            lat_idx = (np.abs(lats - lat)).argmin()
            lon_idx = (np.abs(lons - lon)).argmin()
            
            # Extract temperature data
            temperature_data_kelvin = nc_file.variables['TMP_2m'][:, lat_idx, lon_idx]
            temperature_data_kelvin = np.ma.filled(temperature_data_kelvin, np.nan)  # Fill masked values with NaN
            temperature_data_celsius = kelvin_to_celsius(temperature_data_kelvin)
            
            # Extract time data
            time_var = nc_file.variables['time']
            times = nc.num2date(time_var[:], units=time_var.units)
            
            # Create a DataFrame with time and temperature data
            df = pd.DataFrame({
                'Time': times,
                'Temperature (Celsius)': temperature_data_celsius
            })
            
            # Define the output Excel file path
            output_excel_path = '1990 extracted_temperature_data.xlsx'
            
            # Export to Excel
            df.to_excel(output_excel_path, index=False)
            
            print(f'Temperature data exported to {output_excel_path}')
    except FileNotFoundError as fnf_error:
        print(f"File not found: {fnf_error}")
    except OSError as os_error:
        print(f"OS error: {os_error}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

def main():
    # Define the directory containing NetCDF files
    directory = '/Users/rahuldegra/Desktop/NRSC/new'
    
    # Get user input for latitude and longitude
    lat = float(input("Enter the latitude: "))
    lon = float(input("Enter the longitude: "))
    
    # Process the first NetCDF file (or you can modify this to process any specific file)
    nc_files = [file for file in os.listdir(directory) if file.endswith('.nc')]
    if not nc_files:
        print("No NetCDF files found in the directory.")
        return

    first_file = os.path.join(directory, nc_files[0])
    extract_and_export_temperature(first_file, lat, lon)

if __name__ == "__main__":
    main()
