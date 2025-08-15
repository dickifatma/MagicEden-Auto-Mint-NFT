// request.js
const axios = require("axios");

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
  "Content-Type": "application/json",
};

async function request(method, url, data = null, options = {}) {
  try {
    const { headers = {}, ...restOptions } = options;
    const config = {
      method,
      url,
      headers: { ...DEFAULT_HEADERS, ...headers },
      ...restOptions,
    };
    if (data) config.data = data;

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`[${method.toUpperCase()}] Request error:`, error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
}

function get(url, options) {
  return request("get", url, null, options);
}

function post(url, data, options) {
  return request("post", url, data, options);
}

module.exports = { get, post };
