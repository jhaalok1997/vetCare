// import axios from "axios"

// // Create axios instance with default configuration
// const apiClient = axios.create({
//     baseURL: "/api",
//     headers: {
//         "Content-Type": "application/json",
//     },
//     withCredentials: true,
// })

// // Response interceptor for error handling
// apiClient.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         // Handle common errors
//         if (error.response?.status === 401) {
//             // Unauthorized - could redirect to login
//             console.error("Unauthorized access")
//         }
//         return Promise.reject(error)
//     }
// )

// export default apiClient
