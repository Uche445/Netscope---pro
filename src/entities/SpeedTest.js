// frontend/src/entities/SpeedTest.js

// Define your backend API URL.
// In development, this might be your local backend (e.g., http://localhost:5000).
// In production (after deployment), Netlify will inject REACT_APP_API_URL.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://netspeed-backend.onrender.com'; // Default to local for dev

export class SpeedTest {
  constructor(data) {
    this.id = data._id; // MongoDB's default ID field
    this.download_speed = data.download_speed;
    this.upload_speed = data.upload_speed;
    this.ping = data.ping;
    this.jitter = data.jitter;
    this.server_location = data.server_location;
    this.server_host = data.server_host;
    this.test_duration = data.test_duration;
    this.connection_type = data.connection_type;
    this.isp = data.isp;
    this.ip_address = data.ip_address;
    this.user_agent = data.user_agent;
    this.vpn_status = data.vpn_status;
    this.vpn_provider = data.vpn_provider;
    this.created_date = data.created_date; // Use the timestamp from the backend
  }

  // Method to create (save) a new speed test result
  static async create(testData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/speedtests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save speed test result');
      }

      const data = await response.json();
      return new SpeedTest(data.test); // Return the created test object
    } catch (error) {
      console.error("Error saving speed test:", error);
      throw error;
    }
  }

  // Method to list speed test results
  // The backend currently sorts by -created_date and limits to 10
  static async list(sortBy = '-created_date', limit = 10) {
    try {
      // Backend already handles sorting and limiting, so no need to pass params for now
      const response = await fetch(`${API_BASE_URL}/api/speedtests`);

      if (!response.ok) {
        throw new Error('Failed to fetch speed tests');
      }

      const data = await response.json();
      return data.map(testData => new SpeedTest(testData));
    } catch (error) {
      console.error("Error fetching speed tests:", error);
      return []; // Return empty array on error
    }
  }
}

// Export as default if your SpeedTestPage imports it as `import SpeedTestEntity from "../entities/SpeedTest";`
export default SpeedTest;
