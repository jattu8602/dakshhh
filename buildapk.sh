#!/bin/bash

echo "===== Building Daksh APK from PWA ====="
echo ""

# Step 1: Check if the web app is running
echo "Step 1: Checking if web app is running..."
if ! curl -s http://localhost:3000 > /dev/null; then
  echo "Web app is not running. Starting development server..."
  npm run dev &
  DEV_PID=$!
  echo "Waiting for server to start..."
  sleep 10
else
  echo "Web app is already running."
  DEV_PID=""
fi

# Step 2: Generate icons (assuming user already visited the generator page)
echo ""
echo "Step 2: Make sure you have generated icons by visiting http://localhost:3000/icons/generate-icons.html"
echo "Have you already generated and saved all icons to public/icons/ directory? (y/n)"
read -r icons_generated

if [ "$icons_generated" != "y" ]; then
  echo "Please generate icons first by visiting http://localhost:3000/icons/generate-icons.html"
  echo "Save all generated icons to the public/icons/ directory, then run this script again."

  if [ -n "$DEV_PID" ]; then
    echo "Stopping development server..."
    kill $DEV_PID
  fi

  exit 1
fi

# Step 3: Build the production version
echo ""
echo "Step 3: Building production version of the web app..."
npm run build

# Step 4: Start a temporary production server to verify everything is working
echo ""
echo "Step 4: Starting a temporary production server..."
npx serve out &
SERVE_PID=$!
echo "Temporary server running at http://localhost:3000"
sleep 5

# Step 5: Create APK using PWA2APK
echo ""
echo "Step 5: To create an APK file, follow these steps:"
echo "1. Visit https://pwa2apk.com/"
echo "2. Enter your hosted PWA URL (or use http://localhost:3000 temporarily for testing)"
echo "3. Configure your app details:"
echo "   - App Name: Daksh"
echo "   - Package Name: io.daksh.app"
echo "   - Version Name: 1.0.0"
echo "   - Version Code: 1"
echo "4. Upload your app icon (use the icon-512x512.png from your public/icons folder)"
echo "5. Generate and download your APK"
echo ""
echo "Would you like to open the PWA2APK website now? (y/n)"
read -r open_website

if [ "$open_website" = "y" ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open "https://pwa2apk.com/"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "https://pwa2apk.com/"
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    start "https://pwa2apk.com/"
  fi
fi

# Step 6: Cleanup
echo ""
echo "Step 6: Cleaning up..."
if [ -n "$SERVE_PID" ]; then
  echo "Stopping temporary server..."
  kill $SERVE_PID
fi

if [ -n "$DEV_PID" ]; then
  echo "Stopping development server..."
  kill $DEV_PID
fi

echo ""
echo "===== Build process complete ====="
echo "Your APK will be available for download from the PWA2APK service."
echo "For permanent deployment, please deploy your web app to a hosting service like Vercel or Netlify."
echo "Then use the deployed URL with PWA2APK to create your final APK."