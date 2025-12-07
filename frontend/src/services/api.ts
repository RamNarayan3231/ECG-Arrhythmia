import {
  ECGPrediction,
  TestSamplesResponse,
  BatchPredictionResponse,
} from "../types";

/**
 * Decide which base URL to use for the API.
 *
 * - Local dev (React dev server on :3000 or :5173) → backend on http://127.0.0.1:8000
 * - Local when served by FastAPI on :8000        → same origin
 * - Production (Render)                          → same origin (https://ecg-arrhythmia.onrender.com)
 */
const getApiUrl = (): string => {
  const { hostname, origin, port } = window.location;

  // Local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    // If frontend is already being served by FastAPI on :8000
    if (port === "8000") {
      return origin; // http://127.0.0.1:8000
    }

    // If running React dev server (3000, 5173, etc.), talk to backend on :8000
    return "http://127.0.0.1:8000";
  }

  // Production (Render) – use the same origin as the page
  return origin; // e.g. https://ecg-arrhythmia.onrender.com
};



const API_BASE = getApiUrl();



export const api = {
  getTestSamples: async (count: number = 5): Promise<TestSamplesResponse> => {
    const response = await fetch(`${API_BASE}/test-samples?count=${count}`);
    if (!response.ok) {
      console.error("getTestSamples error:", response.status, response.statusText);
      throw new Error("Failed to fetch test samples");
    }
    return response.json();
  },

  predictCSV: async (file: File): Promise<BatchPredictionResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/batch-predict-csv`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("predictCSV error:", response.status, response.statusText);
      throw new Error("Failed to predict");
    }
    return response.json();
  },

  predict: async (signal: number[]): Promise<ECGPrediction> => {
    const response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signal }),
    });

    if (!response.ok) {
      console.error("predict error:", response.status, response.statusText);
      throw new Error("Failed to predict");
    }
    return response.json();
  },

  uploadECGFile: async (formData: FormData) => {
    const response = await fetch(`${API_BASE}/upload-csv`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("uploadECGFile error:", response.status, response.statusText);
      throw new Error("Failed to upload ECG file");
    }

    const data = await response.json();

    return {
      predicted_class: data.predicted_class || "Unknown",
      confidence: data.confidence || 0,
      is_uncertain: data.is_uncertain ?? false,
      Normal: data.Normal ?? 0,
      Supraventricular: data.Supraventricular ?? 0,
      Ventricular: data.Ventricular ?? 0,
      Fusion: data.Fusion ?? 0,
      Unknown: data.Unknown ?? 0,
      signal_raw: data.signal_raw || [],
      signal_normalized: data.signal_normalized || [],
      threshold: data.threshold ?? 0,
    };
  },
};

export const uploadECGFile = api.uploadECGFile;
