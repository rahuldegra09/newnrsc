import netCDF4 as nc
import numpy as np
import os
import json
import calendar

def kelvin_to_celsius(temp_kelvin):
    return temp_kelvin - 273.15  # Convert Kelvin to Celsius

def process_file(directory, filename, lats, lons, climate_data):
    filepath = os.path.join(directory, filename)
    with nc.Dataset(filepath, 'r') as nc_file:
        year = int(filename[:4])
        time_var = nc_file.variables['time']
        dates = nc.num2date(time_var[:], time_var.units)
        months = np.array([date.month for date in dates])
        temperature_data_year_celsius = None
        precipitation_data_year_mm_per_year = None

        try:
            temperature_data_year = nc_file.variables['TMP_2m'][:]
            temperature_data_year = np.ma.filled(temperature_data_year, np.nan)
            temperature_data_year_celsius = kelvin_to_celsius(temperature_data_year)
        except KeyError:
            print(f"Temperature data not found in file: {filename}")

        try:
            precipitation_data_year = nc_file.variables['APCP_sfc'][:]
            precipitation_data_year = np.ma.filled(precipitation_data_year, np.nan)
            precipitation_data_year_mm_per_year = precipitation_data_year  # 1 kg/m^2 = 1 mm of precipitation
        except KeyError:
            print(f"Precipitation data not found in file: {filename}")

        for lat_idx, lat in enumerate(lats):
            for lon_idx, lon in enumerate(lons):
                formatted_lat = f"{lat:.20f}"
                formatted_lon = f"{lon:.20f}"
                key = (formatted_lat, formatted_lon)

                if key not in climate_data:
                    climate_data[key] = {
                        'location': {
                            'type': 'Point',
                            'coordinates': [float(formatted_lon), float(formatted_lat)]
                        },
                        'data': []
                    }

                data_entry = next((item for item in climate_data[key]['data'] if item['year'] == year), None)
                if not data_entry:
                    data_entry = {
                        'year': year,
                        'temperature': None,
                        'precipitation': None,
                        'monthly_temperature': {},
                        'monthly_precipitation': {}
                    }
                    climate_data[key]['data'].append(data_entry)

                if temperature_data_year_celsius is not None:
                    data_entry['temperature'] = float(f"{np.nanmean(temperature_data_year_celsius[:, lat_idx, lon_idx]):.2f}")
                    for month in range(1, 13):
                        month_name = calendar.month_name[month]
                        monthly_temps = temperature_data_year_celsius[months == month, lat_idx, lon_idx]
                        if len(monthly_temps) > 0:
                            data_entry['monthly_temperature'][month_name] = float(f"{np.nanmean(monthly_temps):.2f}")

                if precipitation_data_year_mm_per_year is not None:
                    total_precipitation = np.nansum(precipitation_data_year_mm_per_year[:, lat_idx, lon_idx])
                    num_days = np.sum(~np.isnan(precipitation_data_year_mm_per_year[:, lat_idx, lon_idx]))
                    if num_days > 0:
                        data_entry['precipitation'] = float(f"{total_precipitation / num_days * 365:.2f}")
                    for month in range(1, 13):
                        month_name = calendar.month_name[month]
                        monthly_precip = precipitation_data_year_mm_per_year[months == month, lat_idx, lon_idx]
                        if len(monthly_precip) > 0:
                            data_entry['monthly_precipitation'][month_name] = float(f"{np.nansum(monthly_precip):.2f}")

def main():
    directory = '/Users/rahuldegra/Desktop/NRSC'
    climate_data = {}

    try:
        nc_files = [file for file in os.listdir(directory) if file.endswith('.nc')]
        nc_files.sort()

        first_file = nc_files[0]
        with nc.Dataset(os.path.join(directory, first_file), 'r') as nc_file:
            lats = nc_file.variables['latitude'][:]
            lons = nc_file.variables['longitude'][:]

        for filename in nc_files:
            print(f'Processing file: {filename}')
            process_file(directory, filename, lats, lons, climate_data)

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
