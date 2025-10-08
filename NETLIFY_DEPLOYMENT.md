# Netlify Deployment Guide for Investment-Pro Frontend

This guide will help you deploy the frontend of the Investment-Pro application to Netlify.

## Overview

The frontend of this application is located in the `pages/` directory and consists of multiple HTML pages with inline JavaScript and external CSS/JS resources loaded from CDNs.

**Important:** The frontend has been updated to work with your deployed backend at `https://investment-pro-backend-fe0b.onrender.com`. All API calls now use the configured backend URL.

## Deployment Steps

### 1. Prepare for Netlify Deployment

1. The frontend is served from the `pages/` directory
2. All HTML pages reference the backend API at your Render URL: `https://investment-pro-backend-fe0b.onrender.com`
3. The application is already configured to work with external resources

### 2. Deploy to Netlify using Netlify CLI (Recommended)

1. Install the Netlify CLI globally:
```bash
npm install -g netlify-cli
```

2. Navigate to the project root:
```bash
cd /path/to/Investment-Pro-final
```

3. Initialize and deploy:
```bash
netlify init
netlify deploy
```

### 3. Deploy to Netlify via Drag-and-Drop

1. Go to https://app.netlify.com/drop
2. Drag the entire `pages/` folder contents to the upload area
3. Or zip the contents of the `pages/` folder and upload the zip file

### 4. Deploy to Netlify via GitHub Integration

1. In your Netlify dashboard, click "New site from Git"
2. Connect to your GitHub account
3. Select the `adittaya/Investment-Pro-final` repository
4. Configure the build settings:
   - Build Command: `echo "Frontend only deployment"`
   - Publish directory: `pages`
   - NO build command is needed since this is static HTML

### 5. Environment Configuration

For the frontend deployment, you may need to set environment variables for API URLs using Netlify's build settings:

- Go to your site's dashboard in Netlify
- Navigate to "Site settings" → "Build & deploy" → "Environment"
- Add the following variable:
  - `VITE_API_BASE_URL`: `https://investment-pro-backend-fe0b.onrender.com`

### 6. Update API Calls (if needed)

If the frontend HTML files reference the API endpoint, make sure they point to your deployed backend:

```javascript
// In your HTML inline scripts, make sure API calls point to the correct backend
const API_BASE_URL = 'https://investment-pro-backend-fe0b.onrender.com';
```

### 7. Post-Deployment Configuration

1. Set up custom domain (optional)
2. Configure HTTPS (automatically handled by Netlify)
3. Set up redirects if needed in the `_redirects` file:
```
/* /index.html 200
```

## Important Notes

- The frontend uses external resources (CDNs) for Tailwind CSS, Font Awesome, etc., which are already configured
- API calls are made to your backend service deployed on Render
- No build process is required for this static HTML frontend
- All pages in the `pages/` directory will be served publicly

## Troubleshooting

If you encounter any issues:
1. Check that your backend API at `https://investment-pro-backend-fe0b.onrender.com` is accessible
2. Verify that CORS settings allow requests from your Netlify domain
3. Check browser dev tools for any API errors

Your frontend should now be accessible via the URL provided by Netlify after successful deployment.