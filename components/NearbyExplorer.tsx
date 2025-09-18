import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { useNearbyPlaces } from "../hooks/useNearbyPlaces";
import { Place } from "../services/nearbyPlacesService";
import { CameraModal } from "./CameraModal";
import { PlaceCard } from "./PlaceCard";
import { PlaceDetailsModal } from "./PlaceDetailsModal";
export const NearbyExplorer: React.FC = () => {
	const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
	const [showPlaceDetails, setShowPlaceDetails] = useState(false);
	const [showCamera, setShowCamera] = useState(false);
	const [mapRegion, setMapRegion] = useState<Region | null>(null);
	const [viewMode, setViewMode] = useState<"map" | "list">("map");

	const mapRef = useRef<MapView>(null);
	const {
		currentLocation,
		locationLoading,
		locationError,
		places,
		placesLoading,
		placesError,
		refreshLocation,
		searchPlaces,
		getPlaceDetails,
	} = useNearbyPlaces();
	// Update map region when location changes
	React.useEffect(() => {
		if (currentLocation?.coords && !mapRegion) {
			const region: Region = {
				latitude: currentLocation.coords.latitude,
				longitude: currentLocation.coords.longitude,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01,
			};
			setMapRegion(region);
		}
	}, [currentLocation, mapRegion]);
	const handlePlacePress = async (place: Place) => {
		setSelectedPlace(place);

		// Get detailed information
		const details = await getPlaceDetails(place.id);
		if (details) {
			setSelectedPlace(details);
		}

		setShowPlaceDetails(true);
	};
	const handleMapMarkerPress = (place: Place) => {
		handlePlacePress(place);
	};
	const centerOnUser = () => {
		if (currentLocation?.coords && mapRef.current) {
			mapRef.current.animateToRegion({
				latitude: currentLocation.coords.latitude,
				longitude: currentLocation.coords.longitude,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01,
			});
		}
	};
	const handleCategoryFilter = (category: string) => {
		searchPlaces({ category, radius: 1000, limit: 20 });
	};
	const handleTakePhoto = () => {
		setShowCamera(true);
	};
	const renderPlaceCard = ({ item }: { item: Place }) => (
		<PlaceCard
			place={item}
			onPress={() => handlePlacePress(item)}
			onTakePhoto={() => {
				setSelectedPlace(item);
				handleTakePhoto();
			}}
		/>
	);
	if (locationError) {
		return (
			<View style={styles.errorContainer}>
				<Ionicons name="location-outline" size={48} color="#FF3B30" />
				<Text style={styles.errorTitle}>Location Required</Text>
				<Text style={styles.errorMessage}>{locationError}</Text>
				<TouchableOpacity style={styles.retryButton} onPress={refreshLocation}>
					<Text style={styles.retryButtonText}>Try Again</Text>
				</TouchableOpacity>
			</View>
		);
	}
	if (locationLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#007AFF" />
				<Text style={styles.loadingText}>Finding your location...</Text>
			</View>
		);
	}
	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.title}>Nearby Explorer</Text>
				<View style={styles.headerControls}>
					<TouchableOpacity
						style={[
							styles.viewModeButton,
							viewMode === "map" && styles.viewModeButtonActive,
						]}
						onPress={() => setViewMode("map")}
					>
						<Ionicons
							name="map"
							size={20}
							color={viewMode === "map" ? "white" : "#007AFF"}
						/>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.viewModeButton,
							viewMode === "list" && styles.viewModeButtonActive,
						]}
						onPress={() => setViewMode("list")}
					>
						<Ionicons
							name="list"
							size={20}
							color={viewMode === "list" ? "white" : "#007AFF"}
						/>
					</TouchableOpacity>
				</View>
			</View>
			{/* Category Filter */}
			<View style={styles.categoryFilter}>
				{["restaurant", "cafe", "shop", "attraction"].map((category) => (
					<TouchableOpacity
						key={category}
						style={styles.categoryButton}
						onPress={() => handleCategoryFilter(category)}
					>
						<Text style={styles.categoryButtonText}>
							{category.charAt(0).toUpperCase() + category.slice(1)}s
						</Text>
					</TouchableOpacity>
				))}
			</View>
			{/* Content */}
			<View style={styles.content}>
				{viewMode === "map" ? (
					<View style={styles.mapContainer}>
						{mapRegion && currentLocation && (
							<MapView
								ref={mapRef}
								style={styles.map}
								initialRegion={mapRegion}
								showsUserLocation={Platform.OS !== "web"}
								showsMyLocationButton={false}
							>
								{/* User location marker for web */}
								{Platform.OS === "web" && currentLocation.coords && (
									<Marker
										coordinate={{
											latitude: currentLocation.coords.latitude,
											longitude: currentLocation.coords.longitude,
										}}
										title="Your Location"
										pinColor="blue"
									/>
								)}
								{/* Place markers */}
								{places.map((place) => (
									<Marker
										key={place.id}
										coordinate={place.coordinates}
										title={place.name}
										description={place.address}
										onPress={() => handleMapMarkerPress(place)}
									/>
								))}
							</MapView>
						)}
						{/* Map controls */}
						<TouchableOpacity
							style={styles.centerButton}
							onPress={centerOnUser}
						>
							<Ionicons name="locate" size={24} color="white" />
						</TouchableOpacity>
					</View>
				) : (
					<FlatList
						data={places}
						renderItem={renderPlaceCard}
						keyExtractor={(item) => item.id}
						contentContainerStyle={styles.listContainer}
						refreshing={placesLoading}
						onRefresh={() => searchPlaces()}
						showsVerticalScrollIndicator={false}
					/>
				)}
				{/* Loading overlay */}
				{placesLoading && (
					<View style={styles.loadingOverlay}>
						<ActivityIndicator size="large" color="#007AFF" />
						<Text style={styles.loadingText}>Finding nearby places...</Text>
					</View>
				)}
			</View>
			{/* Modals */}
			<PlaceDetailsModal
				visible={showPlaceDetails}
				place={selectedPlace}
				onClose={() => setShowPlaceDetails(false)}
				onTakePhoto={handleTakePhoto}
			/>
			<CameraModal
				visible={showCamera}
				onClose={() => setShowCamera(false)}
				place={selectedPlace}
			/>
		</View>
	);
};
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 20,
		backgroundColor: "white",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
	},
	headerControls: {
		flexDirection: "row",
		gap: 10,
	},
	viewModeButton: {
		padding: 8,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#007AFF",
	},
	viewModeButtonActive: {
		backgroundColor: "#007AFF",
	},
	categoryFilter: {
		flexDirection: "row",
		padding: 15,
		backgroundColor: "white",
		gap: 10,
	},
	categoryButton: {
		paddingHorizontal: 15,
		paddingVertical: 8,
		backgroundColor: "#f0f0f0",
		borderRadius: 20,
	},
	categoryButtonText: {
		fontSize: 14,
		color: "#333",
	},
	content: {
		flex: 1,
		position: "relative",
	},
	mapContainer: {
		flex: 1,
	},
	map: {
		flex: 1,
	},
	centerButton: {
		position: "absolute",
		bottom: 20,
		right: 20,
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: "#007AFF",
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
	listContainer: {
		padding: 15,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f5f5f5",
	},
	loadingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(255, 255, 255, 0.9)",
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 10,
		fontSize: 16,
		color: "#666",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#f5f5f5",
	},
	errorTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#FF3B30",
		marginTop: 15,
		marginBottom: 10,
	},
	errorMessage: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		marginBottom: 20,
	},
	retryButton: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 8,
	},
	retryButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "500",
	},
});
