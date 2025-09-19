import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import {
	Button,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { Place } from "../services/nearbyPlacesService";

interface CameraModalProps {
	visible: boolean;
	onClose: () => void;
	place: Place | null;
}

export const CameraModal: React.FC<CameraModalProps> = ({
	visible,
	onClose,
	place,
}) => {
	const [facing, setFacing] = useState<CameraType>("back");
	const [permission, requestPermission] = useCameraPermissions();

	if (!permission) {
		// Camera permissions are still loading.
		return null;
	}

	if (!permission.granted) {
		// Camera permissions are not granted yet.
		return (
			<Modal visible={visible} transparent>
				<View style={styles.container}>
					<Text style={styles.message}>
						We need your permission to show the camera
					</Text>
					<Button onPress={requestPermission} title="Grant Permission" />
					<Button onPress={onClose} title="Close" />
				</View>
			</Modal>
		);
	}

	function toggleCameraFacing() {
		setFacing((current) => (current === "back" ? "front" : "back"));
	}

	return (
		<Modal visible={visible} animationType="slide">
			<View style={styles.container}>
				<Text style={styles.title}>
					{place ? `Take a photo at ${place.name}` : "Take a photo"}
				</Text>
				<CameraView style={styles.camera} facing={facing} />
				<View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
						<Text style={styles.text}>Flip Camera</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.button} onPress={onClose}>
						<Text style={styles.text}>Close</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		backgroundColor: "black",
	},
	message: {
		textAlign: "center",
		paddingBottom: 10,
		color: "white",
	},
	title: {
		color: "white",
		fontSize: 18,
		marginVertical: 16,
		textAlign: "center",
	},
	camera: {
		flex: 1,
	},
	buttonContainer: {
		flexDirection: "row",
		backgroundColor: "transparent",
		width: "100%",
		paddingHorizontal: 64,
		marginBottom: 32,
	},
	button: {
		flex: 1,
		alignItems: "center",
	},
	text: {
		fontSize: 18,
		fontWeight: "bold",
		color: "white",
	},
});
