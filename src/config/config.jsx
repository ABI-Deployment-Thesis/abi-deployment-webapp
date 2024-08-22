// src/config/config.js

const ACCESS_CONTROL_BASE_URL = "http://127.0.0.1:3001";
const MODEL_MANAGEMENT_BASE_URL = "http://127.0.0.1:3002";
const MODEL_RUNNER_BASE_URL = "http://127.0.0.1:3003";

const API_ENDPOINTS = {
  SIGNIN: `${ACCESS_CONTROL_BASE_URL}/signin`,
  MODELS: `${MODEL_MANAGEMENT_BASE_URL}/models`,
  MODEL_RUNS: `${MODEL_RUNNER_BASE_URL}/model-runs`
};

export { API_ENDPOINTS };
