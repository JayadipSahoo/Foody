import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
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

  // Update map marker with direction
  const updateMapMarker = (coords) => {
    if (webViewRef.current && coords) {
      const message = {
        type: 'updateLocation',
        latitude: coords.latitude,
        longitude: coords.longitude,
        heading: coords.heading || 0
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
        <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;">
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
                                    .delivery-marker {                display: flex;                align-items: center;                justify-content: center;                z-index: 1000;                overflow: visible;            }
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
        <div id="status">Loading map...</div>
        
        <script>
            // Map variables
            let map = null;
            let marker = null;
            let isMapInitialized = false;
            
            function initMap(coords) {
                if (isMapInitialized) return true;
                
                try {
                    console.log('Initializing map...');
                    
                    // Default coordinates (will be updated with actual location)
                    const lat = coords?.latitude || 20.2942148;
                    const lng = coords?.longitude || 85.7442971;
                    
                    // Create the map centered on location
                    map = L.map('map', {
                        center: [lat, lng],
                        zoom: 17,
                        zoomControl: true,
                        attributionControl: false
                    });
                    
                    // Add OpenStreetMap tile layer (more compatible)
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '© OpenStreetMap'
                    }).addTo(map);
                    
                    // Always add a marker - either at provided coordinates or default location
                    // Use default marker (no custom icon)
                    marker = L.marker([lat, lng]).addTo(map);
                    
                    // Add a big red circle that's easier to see
                    L.circle([lat, lng], {
                        radius: 50,
                        color: 'red',
                        fillColor: 'red',
                        fillOpacity: 0.3,
                        weight: 3
                    }).addTo(map);
                    
                    // Add another marker with default icon as backup
                    L.marker([lat, lng]).addTo(map);
                    
                    document.getElementById('status').innerHTML = 'Current location: ' + 
                        lat.toFixed(5) + ', ' + lng.toFixed(5);
                    
                    // Mark map as initialized
                    isMapInitialized = true;
                    
                    // Force multiple map refreshes to ensure everything renders properly
                    setTimeout(() => {
                        if (map) {
                            map.invalidateSize();
                            console.log('Map refreshed (1st attempt)');
                            
                            // Add a popup that will definitely be visible
                            L.popup()
                                .setLatLng([lat, lng])
                                .setContent('<b>Your Location:</b><br>' + lat.toFixed(5) + ', ' + lng.toFixed(5))
                                .openOn(map);
                            
                            // Try again after a longer delay
                            setTimeout(() => {
                                map.invalidateSize();
                                console.log('Map refreshed (2nd attempt)');
                            }, 1000);
                        }
                    }, 300);
                    
                    // Notify React Native that map is ready
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'mapReady'
                    }));
                    
                    console.log('Map initialized successfully');
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
                    if (marker) {
                        // Update existing marker position
                        marker.setLatLng([coords.latitude, coords.longitude]);
                        
                        // Add another red circle at the location for visibility
                        L.circle([coords.latitude, coords.longitude], {
                            radius: 50,
                            color: 'red',
                            fillColor: 'red',
                            fillOpacity: 0.3,
                            weight: 3
                        }).addTo(map);
                    } else {
                        // Create new marker if it doesn't exist - use default marker
                        marker = L.marker([coords.latitude, coords.longitude]).addTo(map);
                    }
                    
                    // Update map center with animation
                    map.setView([coords.latitude, coords.longitude], 17, {
                        animate: true,
                        duration: 0.5
                    });
                    
                    // Update status display
                    document.getElementById('status').innerHTML = 'Current location: ' + 
                        coords.latitude.toFixed(5) + ', ' + coords.longitude.toFixed(5);
                    
                    console.log('Marker updated to:', coords.latitude, coords.longitude);
                } catch (error) {
                    console.error('Error updating marker:', error);
                }
            }
            
            // Initialize map on page load
            document.addEventListener('DOMContentLoaded', function() {
                console.log('Document loaded, initializing map');
                // Initialize with default location
                initMap();
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
        mixedContentMode="always"
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
        onMessage={handleWebViewMessage}
        onError={(error) => console.error('WebView error:', error)}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
        startInLoadingState={true}
        androidHardwareAccelerationDisabled={false}
        androidLayerType="hardware"
        cacheEnabled={true}
        onLoadEnd={() => {
          console.log('WebView fully loaded');
          // Force a marker update when WebView is fully loaded
          if (deliveryLocation) {
            setTimeout(() => {
              updateMapMarker(deliveryLocation);
            }, 500);
          }
        }}
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
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  }
});

export default LeafletMap; 