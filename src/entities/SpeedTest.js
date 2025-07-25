// src/entities/SpeedTest.js

class SpeedTestEntity {
    static async list(sortBy = "-created_date", limit = 10) {
        try {
            const history = JSON.parse(localStorage.getItem("speedTestHistory") || "[]");
            const sortedHistory = history.sort((a, b) => {
                if (sortBy === "-created_date") {
                    return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
                }
                return 0;
            });
            return sortedHistory.slice(0, limit);
        } catch (error) {
            console.error("Error loading test history from localStorage:", error);
            return [];
        }
    }

    static async create(testData) {
        try {
            const history = JSON.parse(localStorage.getItem("speedTestHistory") || "[]");
            const newEntry = {
                id: Date.now(), // Simple unique ID
                created_date: new Date().toISOString(), // Use ISO string for consistent sorting
                ...testData,
            };
            const updatedHistory = [newEntry, ...history];
            localStorage.setItem("speedTestHistory", JSON.stringify(updatedHistory.slice(0, 50)));
            console.log("Test results saved to localStorage:", newEntry);
        } catch (error) {
            console.error("Error saving test results to localStorage:", error);
        }
    }
}

export default SpeedTestEntity; // This line is crucial for importing it as 'SpeedTest' elsewhere