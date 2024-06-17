import json

# Load the GeoJSON file containing state boundaries
with open('/Users/rahuldegra/Desktop/isro/india6.geojson', 'r') as f:
    geojson_data = json.load(f)

# Mapping of state boundaries to state names (example)
state_mapping = {
    "state_boundary_coordinates_1": "State Name 1",
    "state_boundary_coordinates_2": "State Name 2",
    # Add mappings for all state boundaries
}

# Function to check if a point is within a polygon
def point_inside_polygon(point, polygon):
    # Implementation of point inside polygon algorithm
    # You can use libraries like Shapely for this task
    pass

# Iterate over each feature in the GeoJSON
for feature in geojson_data['features']:
    state_name = None
    # Iterate over the state mappings
    for state_boundary, name in state_mapping.items():
        # Check if the feature's boundary is within the state boundary
        if point_inside_polygon(feature['geometry'], state_boundary):
            state_name = name
            # Break the loop once a match is found
            break
    # Add state name to the properties of the feature
    feature['properties']['name'] = state_name

# Save the updated GeoJSON with state names
with open('updated_geojson_file.geojson', 'w') as f:
    json.dump(geojson_data, f)
