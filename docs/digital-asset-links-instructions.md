# Digital Asset Links Setup Instructions

## 1. Upload to GitHub Pages

Upload the `.well-known/assetlinks.json` file to your GitHub repository so it's accessible at:
`https://hoanganh25991.github.io/.well-known/assetlinks.json`

## 2. Verify Access

Test that the file is accessible:
```bash
curl https://hoanganh25991.github.io/.well-known/assetlinks.json
```

## 3. Update TWA Configuration

In your Bubblewrap `twa-manifest.json`, ensure these settings:

```json
{
  "packageId": "io.github.hoanganh25991.twa",
  "host": "hoanganh25991.github.io",
  "startUrl": "/tank-adventure/",
  "enableUrlBarHiding": true,
  "enableNotifications": false,
  "navigationColor": "#1a1a1a",
  "themeColor": "#1a1a1a",
  "backgroundColor": "#1a1a1a",
  "display": "fullscreen"
}
```

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
1. This script: `PACKAGE_NAME="io.github.hoanganh25991.twa"`
2. Your Bubblewrap configuration
3. The generated assetlinks.json file

## 7. SHA256 Fingerprint

Current fingerprint: `C0:A2:E4:D0:FC:D5:15:C4:7D:2F:66:AD:33:39:95:28:80:8C:97:C0:30:73:A2:85:D3:77:6C:F1:ED:2E:FF:12`

If this is a placeholder, extract the real one with:
```bash
keytool -list -v -keystore path/to/your.keystore -alias your-alias
```
