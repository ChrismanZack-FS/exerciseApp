import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Place } from "../services/nearbyPlacesService";

interface PlaceDetailsModalProps {
	visible: boolean;
	place: Place | null;
	onClose: () => void;
	onTakePhoto: () => void;
}

export const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({
	visible,
	place,
	onClose,
	onTakePhoto,
}) => (
	<Modal visible={visible} transparent>
		<View style={styles.overlay}>
			<View style={styles.modal}>
				{place ? (
					<>
						<Text style={styles.name}>{place.name}</Text>
						<Text style={styles.address}>{place.address}</Text>
						{place.distance !== undefined && (
							<Text style={styles.distance}>
								{place.distance.toFixed(0)} m away
							</Text>
						)}
						<TouchableOpacity style={styles.photoButton} onPress={onTakePhoto}>
							<Text style={styles.photoButtonText}>Take Photo</Text>
						</TouchableOpacity>
					</>
				) : (
					<Text>No place selected.</Text>
				)}
				<TouchableOpacity style={styles.closeButton} onPress={onClose}>
					<Text style={styles.closeButtonText}>Close</Text>
				</TouchableOpacity>
			</View>
		</View>
	</Modal>
);

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.3)",
		justifyContent: "center",
		alignItems: "center",
	},
	modal: {
		backgroundColor: "white",
		padding: 24,
		borderRadius: 12,
		width: "80%",
		alignItems: "center",
	},
	name: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 8,
	},
	address: {
		fontSize: 16,
		color: "#666",
		marginBottom: 8,
	},
	distance: {
		fontSize: 14,
		color: "#888",
		marginBottom: 16,
	},
	photoButton: {
		backgroundColor: "#007AFF",
		padding: 10,
		borderRadius: 8,
		marginBottom: 16,
	},
	photoButtonText: {
		color: "white",
		fontWeight: "500",
	},
	closeButton: {
		backgroundColor: "#ccc",
		padding: 8,
		borderRadius: 6,
	},
	closeButtonText: {
		color: "#333",
		fontWeight: "500",
	},
});
