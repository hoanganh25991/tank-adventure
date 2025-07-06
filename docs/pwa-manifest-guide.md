# PWA Manifest Configuration Guide

## Overview
This document explains the PWA (Progressive Web App) manifest configuration for Tank Adventure, specifically addressing PWA builder warnings about optional members.

## Recently Added Optional Members

### 1. launch_handler
```json
"launch_handler": {
  "client_mode": "focus-existing"
}
```

**Purpose**: Controls how the PWA is launched when the user activates it.

**Options**:
- `"focus-existing"` - If the app is already open, focus the existing window instead of opening a new one
- `"navigate-new"` - Always open a new window/tab
- `"navigate-existing"` - Navigate the existing window to the start URL

**Why `focus-existing` for Tank Adventure**:
- Prevents multiple game instances running simultaneously
- Maintains game state and progress
- Better user experience for single-player games
- Reduces resource usage on mobile devices

### 2. iarc_rating_id
```json
"iarc_rating_id": "e84b072d-71de-4725-bb24-fa8bb1e50000"
```

**Purpose**: Specifies the age rating for the application using the International Age Rating Coalition (IARC) system.

**Current Rating**: The provided ID represents a placeholder rating suitable for action games with mild combat.

**To Get a Real Rating**:
1. Visit the IARC rating website
2. Complete the questionnaire about Tank Adventure's content:
   - Combat/violence level: Mild (cartoon tank battles)
   - Language: None
   - Gambling: None
   - User-generated content: None
   - Location sharing: None
3. Receive your unique rating ID
4. Replace the placeholder ID in the manifest

## IARC Rating Process for Tank Adventure

### Content Classification
- **Violence**: Mild cartoon violence (tank battles, explosions)
- **Target Audience**: General audience, suitable for ages 7+
- **Content Descriptors**: Fantasy violence, mild combat

### Rating Questionnaire Key Points
- No realistic violence or gore
- No inappropriate language
- No gambling mechanics
- No user-generated content sharing
- No location-based features
- No in-app purchases or monetization

## Benefits of These Additions

### launch_handler Benefits
- **Better UX**: Prevents confusion from multiple game instances
- **Performance**: Reduces memory usage on mobile devices
- **State Management**: Maintains game progress consistency
- **PWA Store Compliance**: Meets PWA best practices

### iarc_rating_id Benefits
- **App Store Visibility**: Required for some app stores
- **Age Appropriate**: Helps users identify suitable content
- **Regulatory Compliance**: Meets regional rating requirements
- **Professional Appearance**: Shows attention to publishing standards

## Testing the Changes

### Verify Launch Handler
1. Install the PWA on a mobile device
2. Open the app
3. Try to open it again from the home screen
4. Verify it focuses the existing instance instead of creating a new one

### Verify Rating Display
1. Check if the rating appears in browser PWA install prompts
2. Verify rating shows correctly in PWA stores
3. Test on different devices and browsers

## Future Considerations

### Additional Optional Members
Consider adding these other optional members for enhanced PWA functionality:

```json
{
  "file_handlers": [...],      // For file association
  "protocol_handlers": [...],  // For protocol handling
  "share_target": {...},       // For sharing API
  "shortcuts": [...],          // App shortcuts (already added)
  "categories": [...],         // App categories (already added)
  "screenshots": [...]         // App screenshots (already added)
}
```

### Rating Updates
- Review IARC rating annually
- Update if game content changes significantly
- Consider regional rating differences

## Troubleshooting

### Common Issues
1. **Launch Handler Not Working**:
   - Verify browser supports the feature
   - Check PWA is properly installed
   - Clear browser cache and reinstall

2. **Rating Not Displaying**:
   - Verify the rating ID is valid
   - Check if the rating service is accessible
   - Ensure manifest is properly cached

### Browser Support
- **launch_handler**: Chrome 102+, Edge 102+
- **iarc_rating_id**: Supported by most modern browsers and PWA stores

## References
- [PWA Launch Handler Specification](https://wicg.github.io/web-app-launch/)
- [IARC Rating System](https://www.globalratings.com/)
- [Web App Manifest MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/Manifest)