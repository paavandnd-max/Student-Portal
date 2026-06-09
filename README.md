# Student Portal with IBM App ID Integration

This is a Node.js Express application that demonstrates integration with IBM App ID for authentication.

## Prerequisites

- Node.js (v14 or higher)
- IBM Cloud account with App ID service instance

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure IBM App ID Service:**
   - Your App ID service is already configured with these credentials:
     - **Tenant ID:** 97e4cde6-b299-4b7b-88ca-208fbc289b56
     - **Client ID:** fb2bf308-591f-4024-8763-0dbcfc41dfbe
     - **Region:** au-syd
   - **Important:** Make sure to add this redirect URI in your App ID application settings:
     - `http://localhost:3000/appid_callback`
   - Go to IBM Cloud Console → App ID → Authentication Settings → Add redirect URIs

3. **Environment Variables:**
   - The `.env` file has been configured with your credentials.

## Testing the Integration

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Access the application:**
   - Open http://localhost:3000
   - Click "Login with IBM App ID"
   - You'll be redirected to IBM App ID for authentication
   - After successful login, you'll be redirected back to `/dashboard`

3. **Test Admin Access:**
   - Users with 'admin' in their email address will have access to `/admin`
   - Other users will see an access denied message

4. **Logout:**
   - Click the logout link to properly log out from both the app and App ID

## Troubleshooting

- **Redirect URI Mismatch:** Make sure `http://localhost:3000/appid_callback` is added to your App ID application's redirect URIs
- **Authentication Errors:** Check that your App ID service is active and the credentials are correct
- **CORS Issues:** Ensure your App ID application allows the correct origins

## Security Considerations

- The `.env` file contains sensitive credentials - never commit it to version control
- In production, use environment-specific credentials and proper secret management
- Consider implementing additional security measures like CSRF protection
- Regularly rotate your App ID API keys and secrets