# Mutual Aid Delivery Route Optimizer

A web application to help optimize driving routes for volunteers doing deliveries for mutual aid organizations. Uses the [Mapbox Optimization API v1](https://docs.mapbox.com/api/navigation/optimization-v1/) with an angular sweep clustering algorithm to efficiently distribute stops across multiple drivers.

## Features

- **Set a pickup location (depot)** - Where all deliveries originate from  
- **Add multiple dropoff locations** - Addresses for each delivery with autocomplete suggestions
- **Specify number of drivers** - The app will distribute stops across drivers using angular clustering
- **Interactive map** - See all routes displayed with different colors for each driver, including markers and route lines
- **Printable directions** - Print turn-by-turn directions with route maps for each driver
- **External navigation** - Quick links to Google Maps and Apple Maps for each route
- **Static route maps** - Embedded route preview images in printouts using encoded polylines

## Getting Started

### 1. Token handling

The app automatically requests a short-lived Mapbox access token from a Cloudflare Worker; you do not need to obtain or paste a token yourself. The token is vended by the app at runtime and is stored in your browser's local storage for subsequent visits.

### 2. Open the App

Simply open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge). No server or build process required.

### 3. Set Up Your Deliveries

1. **Enter the pickup address** - Start typing and select from the autocomplete suggestions (biased to US addresses)
2. **Set the number of drivers** - How many volunteers are available (1-20)
3. **Add dropoff locations** - Enter each delivery address and click "Add" (autocomplete results are biased toward the pickup location)

### 4. Optimize Routes

Click "🗺️ Optimize Routes" to calculate the best routes. The app will:
- Assign stops to drivers using angular sweep clustering around the depot
- Request optimized routes for each driver from Mapbox Optimization API v1  
- Display routes on the map with colored lines and numbered markers
- Show a legend with distance, estimated time, and action buttons for each driver

### 5. Get Directions

For each driver's route, you can:
- Click **Google** to open the full route in Google Maps
- Click **Apple** to open the full route in Apple Maps  
- Click **Print** to print turn-by-turn directions with a static map preview
- Click **🖨️ Print All Directions** to print routes for all drivers at once

## How It Works

The app uses a two-stage approach to solve the Vehicle Routing Problem (VRP):

1. **Angular Sweep Clustering**: Dropoff locations are distributed across drivers by sorting them by angle from the depot and assigning them in round-robin fashion. This creates geographically logical zones for each driver.

2. **Per-Vehicle Optimization**: For each driver's assigned stops, the app uses [Mapbox Optimization API v1](https://docs.mapbox.com/api/navigation/optimization-v1/) to find the optimal visit order, starting and ending at the depot.

The result is a set of efficient routes that minimize driving time while respecting the constraint that all routes start and end at the pickup location.

## Limitations

- **US addresses only** - Geocoding is configured for US addresses and POIs
- **Optimization API v1** - Uses the older v1 API (not the newer v2 beta with capacity/time window support)
- **Simple clustering** - Uses angular sweep rather than sophisticated clustering algorithms
- **No route constraints** - No support for time windows, vehicle capacity, or driver-specific constraints

## Files

- `index.html` - Self-contained web application (no build required, no external dependencies beyond Mapbox CDN)
- `README.md` - This documentation

## Technologies Used

- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) - Interactive maps with custom markers and route visualization
- [Mapbox Geocoding API](https://docs.mapbox.com/api/search/geocoding/) - Address search with autocomplete and proximity bias
- [Mapbox Optimization API v1](https://docs.mapbox.com/api/navigation/optimization-v1/) - Route optimization (roundtrip mode disabled, fixed start/end at depot)
- [Mapbox Static Images API](https://docs.mapbox.com/api/maps/static-images/) - Route preview images in printouts using encoded polylines
- Douglas-Peucker algorithm - Geometry simplification for URL encoding

## License

MIT License - Feel free to use and modify for your mutual aid organization!
