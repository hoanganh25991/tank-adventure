# Background Music Integration

## Overview
The Tank Adventure game now supports background music that plays during battles. The music automatically starts when a battle begins and stops when the battle ends.

## Implementation Details

### Files Modified
1. **js/sound-manager.js** - Enhanced with background music support
2. **js/game-engine.js** - Integrated music playback with battle lifecycle

### Music File Location
- **Path**: `assets/audio/stress-relief.mp3`
- **Format**: MP3 audio file
- **Usage**: Looping background music during battles

### Features
- ✅ **Auto-play**: Music starts automatically when battle begins
- ✅ **Looping**: Music loops continuously during battle
- ✅ **Auto-stop**: Music stops when battle ends
- ✅ **Pause/Resume**: Music pauses/resumes with game pause/resume
- ✅ **Volume Control**: Separate volume control for music (default: 30%)
- ✅ **Error Handling**: Graceful fallback if music file is missing

## SoundManager API

### Background Music Methods
```javascript
// Load background music file
await soundManager.loadBackgroundMusic(url)

// Play background music
soundManager.playBackgroundMusic(trackName)

// Stop background music
soundManager.stopBackgroundMusic()

// Pause background music
soundManager.pauseBackgroundMusic()

// Resume background music
soundManager.resumeBackgroundMusic()

// Set music volume (0.0 - 1.0)
soundManager.setMusicVolume(volume)
```

### Integration Points

#### Game Engine Integration
```javascript
// Battle start
startBattle(battleType) {
    // ... battle setup code ...
    this.soundManager.playBackgroundMusic('battle');
}

// Battle end
endBattle(victory) {
    this.soundManager.stopBackgroundMusic();
    // ... battle cleanup code ...
}

// Game pause
pauseGame() {
    this.soundManager.pauseBackgroundMusic();
    // ... pause logic ...
}

// Game resume
resumeGame() {
    this.soundManager.resumeBackgroundMusic();
    // ... resume logic ...
}
```

## Music File Requirements

### Recommended Specifications
- **Format**: MP3 (widely supported)
- **Quality**: 128-192 kbps (balance between quality and file size)
- **Length**: 2-5 minutes (will loop automatically)
- **Style**: Ambient, relaxing, no lyrics
- **Volume**: Pre-normalized to avoid sudden volume changes

### Adding Your Music File
1. Place your MP3 file at: `assets/audio/stress-relief.mp3`
2. Ensure the file is web-accessible
3. Test using the test page: `tests/test-background-music.html`

## Testing

### Test Page
Use `tests/test-background-music.html` to test the background music integration:

1. **File Check**: Verifies if the music file exists
2. **Sound Manager**: Test loading and playback controls
3. **Battle Simulation**: Test integration with battle lifecycle

### Manual Testing Steps
1. Start the game server: `node server.js`
2. Open test page: `http://localhost:9003/tests/test-background-music.html`
3. Click "Load Music" to load the audio file
4. Test playback controls (Play, Pause, Resume, Stop)
5. Test battle simulation buttons
6. Adjust volume slider to test volume control

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Chromium (desktop & mobile)
- ✅ Firefox (desktop & mobile)
- ✅ Safari (desktop & mobile)
- ✅ Edge (desktop & mobile)

### Audio Policy Notes
- Modern browsers require user interaction before playing audio
- The game handles this by starting music only after user starts a battle
- No audio will play until the user interacts with the game

## Troubleshooting

### Common Issues

#### Music Not Playing
1. Check if file exists at `assets/audio/stress-relief.mp3`
2. Verify file format is MP3
3. Check browser console for error messages
4. Ensure user has interacted with the game (clicked a button)

#### Music Not Looping
- The `loop` property is set automatically in `loadBackgroundMusic()`
- If not looping, check if the audio file is corrupted

#### Volume Issues
- Music volume is separate from sound effects volume
- Default music volume is 30% (`musicVolume: 0.3`)
- Use `setMusicVolume()` to adjust

### Debug Information
The sound manager logs all music operations to the browser console:
- `🎵 Background music started: battle`
- `🎵 Background music stopped`
- `🎵 Background music paused`
- `🎵 Background music resumed`

## Future Enhancements

### Potential Improvements
- [ ] Multiple music tracks for different battle types
- [ ] Fade in/out transitions
- [ ] Dynamic music based on battle intensity
- [ ] Menu background music
- [ ] Music preferences in settings
- [ ] Web Audio API integration for better control

### Adding Multiple Tracks
To add support for multiple music tracks:

1. Extend `loadBackgroundMusic()` to accept multiple files
2. Modify `playBackgroundMusic()` to switch between tracks
3. Add track selection logic in game engine

## Performance Considerations

### Memory Usage
- Only one music track is loaded at a time
- Audio file is cached by the browser
- No significant memory impact for typical MP3 files

### Network Usage
- Music file is downloaded once when `loadBackgroundMusic()` is called
- Subsequent plays use cached version
- Consider file size for mobile users

### CPU Usage
- HTML5 Audio API handles playback efficiently
- Minimal CPU impact during playback
- Looping is handled natively by the browser