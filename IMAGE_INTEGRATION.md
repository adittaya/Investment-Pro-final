# Image Integration Instructions

## Product Image
- **Source**: `/storage/emulated/O/Pictures/ prime-hydration-ice-pop-drink-500 ml.png`
- **Target Placement**: Used in the investment plans page (plans.html) for plan visual representation
- **Location in code**: Each plan card has an image tag that should reference this image

## QR Code Image  
- **Source**: `/storage/emulated/O/Pictures/Screenshots/Screenshot_20251007_153057.jpg`
- **Target Placement**: Used in the recharge page (recharge.html) for UPI payments
- **Location in code**: Recharge section shows this QR code for users to scan

## Implementation Notes
1. The web application currently references these images using the exact paths provided
2. When the application is run in a proper environment where these image files are accessible, they will be displayed
3. For the product image, it's used for all plans - you may want to have different images for each plan type
4. The QR code image is displayed to users when they choose to recharge their account

## File Access
Note that on Android systems, direct access to files in the /storage/emulated/ path often requires proper permissions. Make sure the web server has read access to these image files for them to display properly.