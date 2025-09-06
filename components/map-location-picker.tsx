"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Search, Crosshair } from "lucide-react"

interface LocationData {
  latitude: number
  longitude: number
  address: string
  landmark?: string
}

interface MapLocationPickerProps {
  onLocationSelect: (location: LocationData) => void
}

export function MapLocationPicker({ onLocationSelect }: MapLocationPickerProps) {
  const [searchAddress, setSearchAddress] = useState("")
  const [landmark, setLandmark] = useState("")
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [mapError, setMapError] = useState("")

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    setIsLoadingLocation(true)
    setMapError("")

    if (!navigator.geolocation) {
      setMapError("Geolocation is not supported by this browser")
      setIsLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Reverse geocode to get address
          const address = await reverseGeocode(latitude, longitude)
          const locationData: LocationData = {
            latitude,
            longitude,
            address,
            landmark: landmark || undefined,
          }

          setCurrentLocation(locationData)
          onLocationSelect(locationData)
        } catch (error) {
          setMapError("Failed to get address for current location")
        } finally {
          setIsLoadingLocation(false)
        }
      },
      (error) => {
        setMapError("Failed to get current location: " + error.message)
        setIsLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  }, [landmark, onLocationSelect])

  // Reverse geocoding function (placeholder - in production use Google Maps API)
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // In production, use Google Maps Geocoding API
    // For now, return a formatted coordinate string
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  // Forward geocoding function (placeholder - in production use Google Maps API)
  const forwardGeocode = async (address: string): Promise<{ lat: number; lng: number }> => {
    // In production, use Google Maps Geocoding API
    // For now, return mock coordinates (NYC area)
    return {
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.006 + (Math.random() - 0.5) * 0.1,
    }
  }

  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) return

    setIsLoadingLocation(true)
    setMapError("")

    try {
      const coords = await forwardGeocode(searchAddress)
      const locationData: LocationData = {
        latitude: coords.lat,
        longitude: coords.lng,
        address: searchAddress,
        landmark: landmark || undefined,
      }

      setCurrentLocation(locationData)
      onLocationSelect(locationData)
    } catch (error) {
      setMapError("Failed to find address")
    } finally {
      setIsLoadingLocation(false)
    }
  }

  const handleLandmarkChange = (newLandmark: string) => {
    setLandmark(newLandmark)
    if (currentLocation) {
      const updatedLocation = {
        ...currentLocation,
        landmark: newLandmark || undefined,
      }
      setCurrentLocation(updatedLocation)
      onLocationSelect(updatedLocation)
    }
  }

  return (
    <div className="space-y-4">
      {/* Map Placeholder */}
      <Card>
        <CardContent className="p-6">
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Interactive Map</p>
              <p className="text-sm text-muted-foreground">Click to select location or use options below</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Input Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Address Search */}
        <div className="space-y-2">
          <Label>Search Address</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter street address"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddressSearch()}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAddressSearch}
              disabled={isLoadingLocation}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Current Location */}
        <div className="space-y-2">
          <Label>Use Current Location</Label>
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            className="w-full bg-transparent"
          >
            <Crosshair className="h-4 w-4 mr-2" />
            {isLoadingLocation ? "Getting Location..." : "Use My Location"}
          </Button>
        </div>
      </div>

      {/* Landmark */}
      <div className="space-y-2">
        <Label htmlFor="landmark">Nearby Landmark (Optional)</Label>
        <Input
          id="landmark"
          placeholder="e.g., Near City Hall, Opposite Park"
          value={landmark}
          onChange={(e) => handleLandmarkChange(e.target.value)}
        />
      </div>

      {/* Selected Location Display */}
      {currentLocation && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Selected Location</p>
                <p className="text-sm text-muted-foreground">{currentLocation.address}</p>
                {currentLocation.landmark && (
                  <p className="text-sm text-muted-foreground">Near: {currentLocation.landmark}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {mapError && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{mapError}</div>}

      {/* Google Maps Integration Note */}
      <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
        <p className="font-medium mb-1">Note:</p>
        <p>
          This is a simplified location picker. In production, this would integrate with Google Maps API for interactive
          map selection, accurate geocoding, and address validation.
        </p>
      </div>
    </div>
  )
}
