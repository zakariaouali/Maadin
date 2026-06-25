# Cloudinary Setup

## 1. Create a free account
Go to https://cloudinary.com → Sign up free (no credit card needed)

## 2. Get your credentials
From the Cloudinary Console dashboard, copy:
- Cloud name
- API Key  
- API Secret

## 3. Set backend .env
Open `backend/.env` and replace the placeholder line:

```
CLOUDINARY_URL=cloudinary://YOUR_API_KEY:YOUR_API_SECRET@YOUR_CLOUD_NAME
```

Example:
```
CLOUDINARY_URL=cloudinary://123456789012345:AbCdEfGhIjKlMnOpQrStUvWxYz@mystore
```

## 4. Restart Laravel
```bash
php artisan config:clear
php artisan serve
```

## 5. Test
Upload a product image via the seller dashboard.
The `image_path` stored in the database should now be a full
`https://res.cloudinary.com/...` URL instead of a local path.

## Production
When you deploy, set the same `CLOUDINARY_URL` env var on your VPS
(in your `.env` file or server environment). No other changes needed.
Images are stored on Cloudinary's CDN, not on your server.
