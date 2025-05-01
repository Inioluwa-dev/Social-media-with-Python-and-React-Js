// src/api/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8000/api", // Django API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
