#!/bin/bash

# Tank Adventure Android AAB Build Script
# This script builds Android App Bundle using command line tools

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Tank Adventure Android AAB Builder${NC}"
echo "=========================================="

# Check if tools are installed
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v pwabuilder &> /dev/null; then
    echo -e "${RED}❌ PWABuilder CLI not found. Installing...${NC}"
    npm install -g pwabuilder
fi

if ! command -v bubblewrap &> /dev/null; then
    echo -e "${RED}❌ Bubblewrap CLI not found. Installing...${NC}"
    npm install -g @bubblewrap/cli
fi

echo -e "${GREEN}✅ Prerequisites checked${NC}"

# Configuration
PWA_URL="https://hoanganh25991.github.io/tank-adventure"
APP_NAME="Tank Adventure"
BUILD_DIR="./android-build"
OUTPUT_DIR="./aab-output"

# Create directories
mkdir -p "$BUILD_DIR"
mkdir -p "$OUTPUT_DIR"

echo -e "${YELLOW}Choose build method:${NC}"
echo "1) PWABuilder CLI (Recommended)"
echo "2) Bubblewrap CLI (Google's Official)"
echo "3) Both methods"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo -e "${GREEN}🔨 Building with PWABuilder CLI...${NC}"
        pwabuilder "$PWA_URL" \
          -p android \
          -d "$BUILD_DIR" \
          -s "$APP_NAME" \
          -l info
        
        echo -e "${GREEN}📦 Packaging the generated project...${NC}"
        cd "$BUILD_DIR"
        if [ -d "*/android" ]; then
            cd */android
            pwabuilder package . -p android
            cp *.aab "$OUTPUT_DIR/" 2>/dev/null || echo "No AAB files found"
        fi
        cd - > /dev/null
        ;;
    2)
        echo -e "${GREEN}🔨 Building with Bubblewrap CLI...${NC}"
        cd "$BUILD_DIR"
        
        # Check if already initialized
        if [ ! -f "twa-manifest.json" ]; then
            echo -e "${YELLOW}Initializing Bubblewrap...${NC}"
            bubblewrap init --manifest "$PWA_URL/manifest.json"
        fi
        
        echo -e "${GREEN}📦 Building AAB...${NC}"
        bubblewrap build --skipPwaValidation
        
        # Move AAB to output directory
        cp *.aab "$OUTPUT_DIR/" 2>/dev/null || echo "No AAB files found"
        cd - > /dev/null
        ;;
    3)
        echo -e "${GREEN}🔨 Building with both methods...${NC}"
        
        # PWABuilder first
        echo -e "${YELLOW}Method 1: PWABuilder CLI${NC}"
        pwabuilder "$PWA_URL" \
          -p android \
          -d "$BUILD_DIR/pwabuilder" \
          -s "$APP_NAME" \
          -l info
        
        # Bubblewrap second
        echo -e "${YELLOW}Method 2: Bubblewrap CLI${NC}"
        mkdir -p "$BUILD_DIR/bubblewrap"
        cd "$BUILD_DIR/bubblewrap"
        
        bubblewrap init --manifest "$PWA_URL/manifest.json"
        bubblewrap build --skipPwaValidation
        
        # Move AAB files
        cp *.aab "$OUTPUT_DIR/" 2>/dev/null || echo "No AAB files found from Bubblewrap"
        cd - > /dev/null
        
        # Try to package PWABuilder output
        cd "$BUILD_DIR/pwabuilder"
        if [ -d "*/android" ]; then
            cd */android
            pwabuilder package . -p android
            cp *.aab "$OUTPUT_DIR/" 2>/dev/null || echo "No AAB files found from PWABuilder"
        fi
        cd - > /dev/null
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ Build process completed!${NC}"
echo -e "${YELLOW}📁 Output directory: $OUTPUT_DIR${NC}"

# List generated files
if [ -d "$OUTPUT_DIR" ] && [ "$(ls -A $OUTPUT_DIR)" ]; then
    echo -e "${GREEN}Generated files:${NC}"
    ls -la "$OUTPUT_DIR"
else
    echo -e "${YELLOW}⚠️  No AAB files were generated. Check the build logs above.${NC}"
fi

echo -e "${GREEN}🎉 Done! Your AAB files are ready for Google Play Console.${NC}"