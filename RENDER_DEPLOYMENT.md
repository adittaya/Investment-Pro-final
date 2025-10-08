# Deployment Guide for Render

This guide will help you deploy the Investment-Pro-final project to Render.

## Prerequisites

- A Render account (sign up at https://render.com)
- The project code is already in a GitHub repository

## Deployment Steps

### 1. Prepare the Server for Render Deployment

First, make sure your `server.js` file is configured to work with Render's environment. Render expects your service to listen on the port specified by the `PORT` environment variable:

```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2. Create a Render Blueprint

Create a `render.yaml` file in your repository root with the following content:

```yaml
services:
- type: web
  name: investment-pro-backend
  runtime: node
  buildCommand: npm install
  startCommand: npm start
  envVars:
  - key: NODE_VERSION
    value: 18
  - key: SUPABASE_URL
    sync: false
  - key: SUPABASE_ACCES_KEY
    sync: false
  - key: SUPABASE_API_KEY
    sync: false
  - key: JWT_SECRET
    sync: false
```

### 3. Deploy to Render

1. Go to your Render dashboard (https://dashboard.render.com)
2. Click "New +" and select "Web Service"
3. Connect your GitHub account if prompted
4. Select the repository containing your Investment-Pro-final project
5. Choose your branch (usually main or master)
6. Configure the deployment:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start` or `node server.js`
   - Instance Type: Free or Starter (depending on your needs)
7. Add Environment Variables:
   - SUPABASE_URL
   - SUPABASE_ACCES_KEY
   - SUPABASE_API_KEY
   - JWT_SECRET
   - Any other required environment variables
8. Click "Create Web Service"

### 4. Set Environment Variables on Render

After deployment, you can add environment variables via the Render dashboard:

1. Go to your service in the Render dashboard
2. Navigate to "Environment" or "Environment Variables" section
3. Add each variable with its corresponding value:
   - SUPABASE_URL
   - SUPABASE_ACCES_KEY
   - SUPABASE_API_KEY
   - JWT_SECRET
   - RENDER_API_KEY (if needed)
   - NETLIFY_AUTH_TOKEN (if needed)
   - GITHUB_TOKEN (if needed)

## Important Security Notes

1. Never commit the actual .env file with sensitive credentials to your repository
2. Use the .env.example file (which you already have) to document required environment variables
3. Store actual credentials securely in Render's environment variable settings
4. The config.js file is already properly configured to use environment variables

## Verification

After deployment:

1. Check that your service is running in the Render dashboard
2. Visit your service URL to verify the application is working
3. Test API endpoints to ensure they can connect to Supabase using the environment variables
4. Check the logs in the Render dashboard if you encounter any issues

## Troubleshooting

If you encounter issues:

1. Check the logs in your Render dashboard for error messages
2. Verify all required environment variables are set correctly
3. Make sure your server.js correctly uses the PORT environment variable
4. Confirm that your Supabase credentials are valid