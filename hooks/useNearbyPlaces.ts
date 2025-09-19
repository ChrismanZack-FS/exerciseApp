import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { config, validateConfig } from "../config/environment";
import NearbyPlacesService, {
	Place,
	PlaceSearchOptions,
} from "../services/nearbyPlacesService";
validateConfig(); // Replace with your key
export interface UseNearbyPlacesReturn {
	// Location state
	currentLocation: Location.LocationObject | null;
	locationLoading: boolean;
	locationError: string | null;

	// Places state
	places: Place[];
	placesLoading: boolean;
	placesError: string | null;

	// Actions
	refreshLocation: () => Promise<void>;
	searchPlaces: (options?: PlaceSearchOptions) => void;
	getPlaceDetails: (placeId: string) => Promise<Place | null>;
}
export const useNearbyPlaces = (): UseNearbyPlacesReturn => {
	const [currentLocation, setCurrentLocation] =
		useState<Location.LocationObject | null>(null);
	const [locationLoading, setLocationLoading] = useState(false);
	const [locationError, setLocationError] = useState<string | null>(null);
	const [searchOptions, setSearchOptions] = useState<PlaceSearchOptions>({});
	const token = config.MAPBOX_ACCESS_TOKEN;
	if (!token) {
		throw new Error("Missing MAPBOX_ACCESS_TOKEN in environment config");
	}
	const placesService = new NearbyPlacesService(token);
	// Query for places based on current location
	const {
		data: places = [],
		isLoading: placesLoading,
		error: placesError,
		refetch: refetchPlaces,
	} = useQuery<Place[]>({
		queryKey: ["nearby-places", currentLocation?.coords, searchOptions],
		queryFn: () => {
			if (!currentLocation?.coords) {
				throw new Error("Location required for places search");
			}

			return placesService.searchNearbyPlaces(
				{
					latitude: currentLocation.coords.latitude,
					longitude: currentLocation.coords.longitude,
				},
				searchOptions
			);
		},
		enabled: !!currentLocation?.coords,
		retry: 2,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
	const refreshLocation = useCallback(async () => {
		try {
			setLocationLoading(true);
			setLocationError(null);

			const location = await placesService.getCurrentLocation();
			setCurrentLocation(location);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Location unavailable";
			setLocationError(errorMessage);
			console.error("Location error:", error);
		} finally {
			setLocationLoading(false);
		}
	}, []);
	const searchPlaces = useCallback(
		(options: PlaceSearchOptions = {}) => {
			setSearchOptions(options);
			refetchPlaces();
		},
		[refetchPlaces]
	);
	const getPlaceDetails = useCallback(
		async (placeId: string): Promise<Place | null> => {
			try {
				return await placesService.getPlaceDetails(placeId);
			} catch (error) {
				console.error("Place details error:", error);
				return null;
			}
		},
		[]
	);
	// Initial location fetch
	useEffect(() => {
		refreshLocation();
	}, [refreshLocation]);
	return {
		currentLocation,
		locationLoading,
		locationError,
		places: places as Place[],
		placesLoading,
		placesError: placesError?.message || null,
		refreshLocation,
		searchPlaces,
		getPlaceDetails,
	};
};
