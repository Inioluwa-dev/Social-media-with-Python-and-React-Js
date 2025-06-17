// src/api/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8000/api", // Django API base URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Added to allow cookies (CSRF) to be sent/received
});

export default instance;
