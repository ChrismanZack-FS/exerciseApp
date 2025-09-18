import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Place } from "../services/nearbyPlacesService";

interface PlaceCardProps {
	place: Place;
	onPress: () => void;
	onTakePhoto: () => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
	place,
	onPress,
	onTakePhoto,
}) => (
	<TouchableOpacity style={styles.card} onPress={onPress}>
		<View>
			<Text style={styles.name}>{place.name}</Text>
			<Text style={styles.address}>{place.address}</Text>
			{place.distance !== undefined && (
				<Text style={styles.distance}>{place.distance.toFixed(0)} m away</Text>
			)}
			<TouchableOpacity style={styles.photoButton} onPress={onTakePhoto}>
				<Text style={styles.photoButtonText}>Take Photo</Text>
			</TouchableOpacity>
		</View>
	</TouchableOpacity>
);

const styles = StyleSheet.create({
	card: {
		backgroundColor: "white",
		padding: 16,
		borderRadius: 10,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	name: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
	},
	address: {
		fontSize: 14,
		color: "#666",
		marginBottom: 4,
	},
	distance: {
		fontSize: 12,
		color: "#888",
		marginBottom: 8,
	},
	photoButton: {
		backgroundColor: "#007AFF",
		padding: 8,
		borderRadius: 6,
		alignSelf: "flex-start",
	},
	photoButtonText: {
		color: "white",
		fontWeight: "500",
	},
});
