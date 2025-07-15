#!/bin/bash

# Digital Asset Links Setup for Better TWA URL Bar Hiding
# This creates the proper verification files for your domain

set -e

echo "🔐 Setting up Digital Asset Links for Tank Adventure TWA"
echo "======================================================="

# Configuration
DOMAIN="hoanganh25991.github.io"
PACKAGE_NAME="com.tankadventure.app" # Adjust this to your actual package name
SHA256_FINGERPRINT=""                # Will be extracted from your keystore

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📋 This script will:${NC}"
echo "   • Extract SHA256 fingerprint from your keystore"
echo "   • Generate .well-known/assetlinks.json"
echo "   • Create proper verification for your TWA"
echo "   • Help minimize URL bar presence"
echo ""

# Check if keystore exists
if [ -f "$KEYSTORE_PATH" ]; then
    echo -e "${GREEN}✅ Keystore found at: $KEYSTORE_PATH${NC}"

    # Extract SHA256 fingerprint
    echo -e "${YELLOW}🔍 Extracting SHA256 fingerprint...${NC}"

    if command -v keytool &>/dev/null; then
        SHA256_FINGERPRINT=$(keytool -list -v -keystore "$KEYSTORE_PATH" -alias "$KEY_ALIAS" -storepass "$KEYSTORE_PASSWORD" -keypass "$KEY_ALIAS_PASSWORD" | grep "SHA256:" | head -1 | cut -d' ' -f3)

        if [ -n "$SHA256_FINGERPRINT" ]; then
            echo -e "${GREEN}✅ SHA256 Fingerprint: $SHA256_FINGERPRINT${NC}"
        else
            echo -e "${RED}❌ Could not extract SHA256 fingerprint${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ keytool not found. Please install Java JDK${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Keystore not found. Using placeholder fingerprint.${NC}"
    echo "   Please update the generated file with your actual SHA256 fingerprint."
    SHA256_FINGERPRINT="YOUR_SHA256_FINGERPRINT_HERE"
fi

# Create .well-known directory
mkdir -p .well-known

# Generate assetlinks.json
echo -e "${YELLOW}📝 Generating .well-known/assetlinks.json...${NC}"

cat >.well-known/assetlinks.json <<EOF
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "$PACKAGE_NAME",
      "sha256_cert_fingerprints": ["$SHA256_FINGERPRINT"]
    }
  },
  {
    "relation": ["delegate_permission/common.get_login_creds"],
    "target": {
      "namespace": "android_app", 
      "package_name": "$PACKAGE_NAME",
      "sha256_cert_fingerprints": ["$SHA256_FINGERPRINT"]
    }
  }
]
EOF

echo -e "${GREEN}✅ Created .well-known/assetlinks.json${NC}"

# Generate verification instructions
echo -e "${YELLOW}📋 Creating verification instructions...${NC}"

cat >digital-asset-links-instructions.md <<EOF
# Digital Asset Links Setup Instructions

## 1. Upload to GitHub Pages

Upload the \`.well-known/assetlinks.json\` file to your GitHub repository so it's accessible at:
\`https://$DOMAIN/.well-known/assetlinks.json\`

## 2. Verify Access

Test that the file is accessible:
\`\`\`bash
curl https://$DOMAIN/.well-known/assetlinks.json
\`\`\`

## 3. Update TWA Configuration

In your Bubblewrap \`twa-manifest.json\`, ensure these settings:

\`\`\`json
{
  "packageId": "$PACKAGE_NAME",
  "host": "$DOMAIN",
  "startUrl": "/tank-adventure/",
  "enableUrlBarHiding": true,
  "enableNotifications": false,
  "navigationColor": "#1a1a1a",
  "themeColor": "#1a1a1a",
  "backgroundColor": "#1a1a1a",
  "display": "fullscreen"
}
\`\`\`

## 4. Benefits

Digital Asset Links verification helps:
- Establish trust between your website and Android app
- Reduce URL bar prominence 
- Enable better deep linking
- Improve overall TWA experience

## 5. Verification

After deployment, verify your setup at:
https://developers.google.com/digital-asset-links/tools/generator

## 6. Update Your Package Name

Make sure to update the package name in:
1. This script: \`PACKAGE_NAME="$PACKAGE_NAME"\`
2. Your Bubblewrap configuration
3. The generated assetlinks.json file

## 7. SHA256 Fingerprint

Current fingerprint: \`$SHA256_FINGERPRINT\`

If this is a placeholder, extract the real one with:
\`\`\`bash
keytool -list -v -keystore path/to/your.keystore -alias your-alias
\`\`\`
EOF

echo -e "${GREEN}✅ Created digital-asset-links-instructions.md${NC}"

# Display next steps
echo ""
echo -e "${GREEN}🎉 Digital Asset Links setup complete!${NC}"
echo ""
echo -e "${YELLOW}📁 Generated files:${NC}"
echo "   • .well-known/assetlinks.json"
echo "   • digital-asset-links-instructions.md"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "   1. Commit and push .well-known/assetlinks.json to your repo"
echo "   2. Verify it's accessible at https://$DOMAIN/.well-known/assetlinks.json"
echo "   3. Rebuild your TWA with the updated configuration"
echo "   4. Test on Android device for improved URL bar behavior"
echo ""

if [ "$SHA256_FINGERPRINT" = "YOUR_SHA256_FINGERPRINT_HERE" ]; then
    echo -e "${YELLOW}⚠️  IMPORTANT: Update the placeholder SHA256 fingerprint!${NC}"
    echo ""
fi

echo -e "${GREEN}💡 This will help minimize the TWA URL bar and improve user experience!${NC}"
