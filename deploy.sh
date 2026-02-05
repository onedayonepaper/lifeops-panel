#!/bin/bash
set -e

cd /root/lifeops-panel/frontend
echo "Building frontend..."
npm run build
echo "Deploying to /var/www/lifeops/..."
sudo rm -rf /var/www/lifeops/assets
sudo cp -r dist/* /var/www/lifeops/
echo "Done! Deployed successfully."
