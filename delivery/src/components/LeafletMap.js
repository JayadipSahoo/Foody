import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const LeafletMap = ({ 
  deliveryLocation, 
  onLocationUpdate,
  style
}) => {
  const webViewRef = useRef(null);

  // Update map when location changes
  useEffect(() => {
    if (webViewRef.current && deliveryLocation) {
      updateMapMarker(deliveryLocation);
    }
  }, [deliveryLocation]);

  // Update map marker
  const updateMapMarker = (coords) => {
    if (webViewRef.current && coords) {
      const message = {
        type: 'updateLocation',
        latitude: coords.latitude,
        longitude: coords.longitude
      };
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  };

  // Handle messages from WebView
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapReady' && deliveryLocation) {
        updateMapMarker(deliveryLocation);
      }
    } catch (e) {
      console.error('Error processing WebView message:', e);
    }
  };

  // Generate HTML for the map
  const getMapHTML = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
        <style>
            body, html {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
            #map {
                width: 100%;
                height: 100%;
                background: #f8f8f8;
            }
            .delivery-marker {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                z-index: 1000;
            }
            #status {
                position: absolute;
                bottom: 10px;
                left: 10px;
                background: rgba(255,255,255,0.9);
                z-index: 1000;
                padding: 8px;
                font-size: 12px;
                border-radius: 5px;
                box-shadow: 0 1px 5px rgba(0,0,0,0.2);
                max-width: 300px;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <div id="status"></div>
        
        <script>
            // IIIT Bhubaneswar coordinates (fallback only)
            const IIIT_LAT = 20.29413;
            const IIIT_LNG = 85.74424;
            
            // Map variables
            let map = null;
            let marker = null;
            let isMapInitialized = false;
            
            function initMap(coords) {
                if (isMapInitialized) return true;
                
                try {
                    console.log('Initializing map...');
                    
                    // Always prioritize actual coordinates
                    const lat = coords?.latitude || IIIT_LAT;
                    const lng = coords?.longitude || IIIT_LNG;
                    
                    // Create the map centered on location
                    map = L.map('map', {
                        center: [lat, lng],
                        zoom: 17,
                        zoomControl: true,
                        attributionControl: false
                    });
                    
                    // Add tile layer (road map)
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '© OpenStreetMap'
                    }).addTo(map);
                    
                    // Create the delivery icon
                    const deliveryIcon = L.divIcon({
                        className: 'delivery-marker',
                        html: '📍',
                        iconSize: [40, 40],
                        iconAnchor: [20, 40]
                    });
                    
                    // Add marker at current location
                    marker = L.marker([lat, lng], {
                        icon: deliveryIcon,
                        zIndexOffset: 1000
                    }).addTo(map);
                    
                    // Mark IIIT location for reference (less prominent)
                    const iiitMarker = L.circle([IIIT_LAT, IIIT_LNG], {
                        radius: 50,
                        color: '#3498db',
                        fillColor: '#3498db',
                        fillOpacity: 0.05,
                        weight: 1
                    }).addTo(map);
                    
                    // Add tooltip to IIIT location
                    iiitMarker.bindTooltip("IIIT Bhubaneswar", {
                        permanent: false,
                        direction: 'top',
                        className: 'iiit-tooltip'
                    });
                    
                    // Mark map as initialized
                    isMapInitialized = true;
                    
                    // Notify React Native that map is ready
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'mapReady'
                    }));
                    
                    console.log('Map initialized');
                    
                    // Show coordinates in status
                    document.getElementById('status').innerHTML = 'Current location: ' + 
                        lat.toFixed(5) + ', ' + lng.toFixed(5);
                    
                    return true;
                } catch (error) {
                    console.error('Error initializing map:', error);
                    document.getElementById('status').innerHTML = 'Error: ' + error.message;
                    return false;
                }
            }
            
            // Update marker position
            function updateMarkerPosition(coords) {
                if (!isMapInitialized) {
                    initMap(coords);
                    return;
                }
                
                if (!coords || !coords.latitude || !coords.longitude) {
                    console.error('Invalid coordinates:', coords);
                    return;
                }
                
                try {
                    // Update marker position
                    marker.setLatLng([coords.latitude, coords.longitude]);
                    
                    // Update map center
                    map.setView([coords.latitude, coords.longitude], map.getZoom());
                    
                    // Update status display
                    document.getElementById('status').innerHTML = 'Current location: ' + 
                        coords.latitude.toFixed(5) + ', ' + coords.longitude.toFixed(5);
                } catch (error) {
                    console.error('Error updating marker:', error);
                }
            }
            
            // Initialize map on page load
            document.addEventListener('DOMContentLoaded', function() {
                console.log('Document loaded');
                
                // Wait for coordinates from React Native
                // Only use IIIT location as fallback after timeout
                setTimeout(function() {
                    if (!isMapInitialized) {
                        console.log('No coordinates received, using fallback location');
                        initMap({latitude: IIIT_LAT, longitude: IIIT_LNG});
                    }
                }, 2000);
            });
            
            // Handle messages from React Native
            window.addEventListener('message', function(event) {
                try {
                    const data = JSON.parse(event.data);
                    console.log('Received message:', data);
                    
                    if (data.type === 'updateLocation') {
                        // Update marker position
                        updateMarkerPosition(data);
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            });
        </script>
    </body>
    </html>
    `;
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: getMapHTML() }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleWebViewMessage}
        onError={(error) => console.error('WebView error:', error)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  }
});

export default LeafletMap; 