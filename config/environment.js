import Constants from "expo-constants";
// Environment-specific configuration
const ENV = {
	development: {
		MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
		MAPBOX_BASE_URL: "https://api.mapbox.com",
		SOCIAL_API_BASE_URL: "http://localhost:3000/api",
		DEBUG_API_CALLS: true,
	},
	staging: {
		MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
		MAPBOX_BASE_URL: "https://api.mapbox.com",
		SOCIAL_API_BASE_URL: "https://staging-api.example.com/api",
		DEBUG_API_CALLS: false,
	},
	production: {
		MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
		MAPBOX_BASE_URL: "https://api.mapbox.com",
		SOCIAL_API_BASE_URL: "https://api.example.com/api",
		DEBUG_API_CALLS: false,
	},
};
// Get current environment
const getEnvironment = () => {
	if (__DEV__) return "development";

	const releaseChannel = Constants.expoConfig?.extra?.releaseChannel;
	if (releaseChannel === "staging") return "staging";

	return "production";
};
// Export configuration for current environment
export const config = ENV[getEnvironment()];
// Validation helper
export const validateConfig = () => {
	const requiredKeys = ["MAPBOX_ACCESS_TOKEN", "MAPBOX_BASE_URL"];
	const missingKeys = requiredKeys.filter((key) => !config[key]);

	if (missingKeys.length > 0) {
		console.error("❌ Missing required configuration keys:", missingKeys);
		throw new Error(`Missing configuration: ${missingKeys.join(", ")}`);
	}
	console.log("✅ Configuration validation passed");
};
