// Frontend configuration
// For Netlify deployment, use relative paths to call the same domain 
// (Netlify will proxy API requests to your backend)
// For local development, uncomment the localhost line
// For other deployments, update the API_BASE_URL accordingly
const CONFIG = {
    API_BASE_URL: ''  // Empty string means relative path to the same domain
};

// For local development, uncomment the following line:
// const CONFIG = { API_BASE_URL: 'http://localhost:3000' };

// Alternative: try to detect environment automatically
// const CONFIG = {
//     API_BASE_URL: window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''
// };