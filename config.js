// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ACCES_KEY = process.env.SUPABASE_ACCES_KEY || 'YOUR_SUPABASE_ACCESS_KEY';
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY || 'YOUR_SUPABASE_API_KEY';

// JWT Secret - Important: In production, this MUST be set via environment variable
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn('⚠️  WARNING: Using default JWT secret. This is insecure for production!');
  console.warn('⚠️  Please set the JWT_SECRET environment variable.');
  return 'investment_platform_secret_key_for_dev_only_256bits_long_enough_for_dev'; // Longer secret for better security
})();

// Render API Key
const RENDER_API_KEY = process.env.RENDER_API_KEY || 'YOUR_RENDER_API_KEY';

// Netlify Auth Token
const NETLIFY_AUTH_TOKEN = process.env.NETLIFY_AUTH_TOKEN || 'YOUR_NETLIFY_AUTH_TOKEN';

// GitHub Token
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN';

module.exports = {
  SUPABASE_URL,
  SUPABASE_ACCES_KEY,
  SUPABASE_API_KEY,
  JWT_SECRET,
  RENDER_API_KEY,
  NETLIFY_AUTH_TOKEN,
  GITHUB_TOKEN
};