import * as Location from "expo-location";

import { config } from "../config/environment";
import createApiClient from "../services/apiClient";

const apiClient = createApiClient(config.MAPBOX_BASE_URL);

export interface Place {
	id: string;
	name: string;
	category: string;
	coordinates: {
		latitude: number;
		longitude: number;
	};
	address: string;
	rating?: number;
	priceLevel?: number;
	photos?: string[];
	distance?: number;
}
export interface PlaceSearchOptions {
	category?: string;
	radius?: number;
	minRating?: number;
	limit?: number;
}
class NearbyPlacesService {
	private apiKey: string;
	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}
	async getCurrentLocation(): Promise<Location.LocationObject> {
		// Request permissions
		const { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			throw new Error("Location permission denied");
		}
		// Get current location with high accuracy
		const location = await Location.getCurrentPositionAsync({
			accuracy: Location.Accuracy.Balanced,
			timeInterval: 10000,
		});
		return location;
	}
	async searchNearbyPlaces(
		coordinates: { latitude: number; longitude: number },
		options: PlaceSearchOptions = {}
	): Promise<Place[]> {
		const { category = "restaurant", limit = 20 } = options;
		try {
			const response = await apiClient.get(
				`/geocoding/v5/mapbox.places/${category}.json`,
				{
					params: {
						proximity: `${coordinates.longitude},${coordinates.latitude}`,
						access_token: this.apiKey,
						limit,
						types: "poi",
					},
					timeout: 10000,
				}
			);
			return response.data.features
				.map((feature: any) => {
					const place: Place = {
						id: feature.id,
						name: feature.text,
						category: feature.properties.category || category,
						coordinates: {
							latitude: feature.center[1],
							longitude: feature.center[0],
						},
						address: feature.place_name,
					};
					// Calculate distance
					place.distance = this.calculateDistance(
						coordinates,
						place.coordinates
					);
					return place;
				})
				.sort((a: Place, b: Place) => (a.distance || 0) - (b.distance || 0));
		} catch (error) {
			console.error("Places search error:", error);
			throw new Error("Failed to search nearby places");
		}
	}
	async getPlaceDetails(placeId: string): Promise<Place | null> {
		try {
			const response = await apiClient.get(
				`/geocoding/v5/mapbox.places/place.json`,
				{
					params: {
						id: placeId,
						access_token: this.apiKey,
					},
				}
			);
			const feature = response.data.features[0];
			if (!feature) return null;
			return {
				id: feature.id,
				name: feature.text,
				category: feature.properties.category,
				coordinates: {
					latitude: feature.center[1],
					longitude: feature.center[0],
				},
				address: feature.place_name,
				rating: feature.properties.rating,
				priceLevel: feature.properties.price_level,
			};
		} catch (error) {
			console.error("Place details error:", error);
			return null;
		}
	}
	private calculateDistance(
		coord1: { latitude: number; longitude: number },
		coord2: { latitude: number; longitude: number }
	): number {
		const R = 6371000; // Earth's radius in meters
		const dLat = this.toRadians(coord2.latitude - coord1.latitude);
		const dLon = this.toRadians(coord2.longitude - coord1.longitude);

		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(this.toRadians(coord1.latitude)) *
				Math.cos(this.toRadians(coord2.latitude)) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c;
	}
	private toRadians(degrees: number): number {
		return degrees * (Math.PI / 180);
	}
}
export default NearbyPlacesService;
