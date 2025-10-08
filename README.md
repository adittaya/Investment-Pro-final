# InvestPro - Investment Platform

Welcome to InvestPro, a comprehensive investment platform with daily profits, referral system, and UPI integration.

## Features

- **User Authentication**: Mobile number-based registration and login
- **Investment Plans**: 10 different plans with varying returns
- **Daily Profit**: Automatic daily income calculation
- **Withdrawal System**: Bank and UPI withdrawal options
- **Recharge System**: UPI QR code integration for adding funds
- **Referral Program**: 3-level commission system (32%, 2%, 1%)
- **Team Module**: Track your referral network
- **Admin Panel**: Complete control over all platform features
- **Trust Elements**: Fake withdrawal feed and trust badges

## Admin Credentials

- **Username**: admin
- **Phone Number**: 9999999999
- **Default Password**: admin123 (should be changed after first login)
- **Referral Code**: ADMIN001

## Investment Plans

| Plan | Price | Daily Income | Duration | Return | Profit |
|------|-------|--------------|----------|--------|--------|
| Starter Plan | ₹490 | ₹80 | 9 days | ₹720 | ₹230 |
| Smart Saver | ₹750 | ₹85 | 14 days | ₹1,190 | ₹440 |
| Bronze Booster | ₹1,000 | ₹100 | 15 days | ₹1,500 | ₹500 |
| Silver Growth | ₹1,500 | ₹115 | 20 days | ₹2,300 | ₹800 |
| Gold Income | ₹2,000 | ₹135 | 23 days | ₹3,105 | ₹1,105 |
| Platinum Plan | ₹2,500 | ₹160 | 24 days | ₹3,840 | ₹1,340 |
| Elite Earning | ₹3,000 | ₹180 | 25 days | ₹4,500 | ₹1,500 |
| VIP Profiter | ₹3,500 | ₹200 | 27 days | ₹5,400 | ₹1,900 |
| Executive Growth | ₹4,000 | ₹220 | 28 days | ₹6,160 | ₹2,160 |
| Royal Investor | ₹5,000 | ₹250 | 30 days | ₹7,500 | ₹2,500 |

## UPI Information

- **UPI ID**: 7047571829@yespop

## API Endpoints

- `/api/auth/register` - User registration
- `/api/auth/login` - User login
- `/api/products/purchase` - Purchase investment plan
- `/api/products/daily-profit` - Calculate daily profit (admin only)
- `/api/withdrawals/request` - Request withdrawal
- `/api/recharge/request` - Request recharge
- `/api/referral/verify-referral` - Verify referral code

## Local Testing

The platform has been tested with the following results:
- ✅ Registration works correctly
- ✅ Login works correctly (both user and admin)
- ✅ Product purchase works with validation
- ✅ Recharge requests work
- ✅ Withdrawal requests work
- ✅ Referral system works
- ✅ Admin functions work properly

## Environment Variables

The application uses the following Supabase configuration:

- SUPABASE_URL: https://wmzykidfnmocxzmgbbph.supabase.co
- SUPABASE_ACCES_KEY: sbp_v0_9f3fdf651cd2bf10bfbca97d7793949891158924
- SUPABASE_API_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtenlraWRmbm1vY3h6bWdiYnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDcyMzQsImV4cCI6MjA3NTQ4MzIzNH0.mWM5wD7k8bIxwiCmg9zU0rJGgZq7W3Zhs2CbyOJK9E4
- JWT_SECRET: 8BM0zTHKSd71eXHWTMr5Xwipl5UxQpa136JEjgbNwCzzyHv2niZWfPIiiBrWz/fn6bzPax67GiSy13tZyyZtcA==

## Deployment

The website is currently running at `http://localhost:3000`

To start the server:
```bash
npm start
```

To run in development mode:
```bash
npm run dev
```

## Security Notes

- User passwords are hashed using bcryptjs
- JWT tokens are used for authentication
- All API requests require proper authentication
- Minimum withdrawal amount is ₹100
- Only one withdrawal per 24 hours per user
- Users can only buy each product once per month

## Important Notice

This is a demo platform created for educational purposes. It is not a real investment service. Always be cautious with real financial investments.

## Deployment

### Backend Deployment to Render

This application can be deployed to Render with the following steps:

1. Create a Render account at https://render.com
2. Connect your GitHub repository
3. Create a new Web Service using this repository
4. Use these build settings:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Set the required environment variables in Render's dashboard:
   - SUPABASE_URL
   - SUPABASE_ACCES_KEY
   - SUPABASE_API_KEY
   - JWT_SECRET
6. Deploy the service

For detailed deployment instructions, see RENDER_DEPLOYMENT.md

### Frontend Deployment to Netlify

To deploy the frontend to Netlify:

1. Go to https://app.netlify.com and create an account
2. Click "New site from Git" and connect your GitHub repository
3. Select your repository (adittaya/Investment-Pro-final)
4. Configure the build settings:
   - Build Command: `echo "Frontend only deployment"` (or leave empty)
   - Publish directory: `pages`
   - Branch to deploy: `main`
5. Deploy the site

Alternatively, you can:
- Use the Netlify CLI: `netlify deploy`
- Drag and drop the `pages/` directory contents to https://app.netlify.com/drop

For detailed Netlify deployment instructions, see NETLIFY_DEPLOYMENT.md

### Environment Variables

The application requires the following environment variables:

**Backend (Render):**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ACCES_KEY` - Your Supabase access key
- `SUPABASE_API_KEY` - Your Supabase API key
- `JWT_SECRET` - Secret for JSON Web Token signing
- `PORT` - Port number (automatically set by Render)

**Frontend (Netlify) - if needed:**
- `VITE_API_BASE_URL` - Your backend API URL (https://investment-pro-backend-fe0b.onrender.com)

See `.env.example` for reference format.