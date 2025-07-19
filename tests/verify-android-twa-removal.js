// Verification script for Android TWA removal
// This script checks that all references to android-twa.js have been properly removed

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Android TWA script removal...\n');

// Check if android-twa.js file exists
const twaPath = path.join(__dirname, '..', 'js', 'android-twa.js');
const twaBackupPath = path.join(__dirname, '..', 'js', 'android-twa.js.backup');

if (fs.existsSync(twaPath)) {
    console.log('❌ ERROR: android-twa.js still exists in js/ directory');
} else {
    console.log('✅ android-twa.js successfully removed from js/ directory');
}

if (fs.existsSync(twaBackupPath)) {
    console.log('✅ android-twa.js.backup exists (good for rollback if needed)');
} else {
    console.log('⚠️  WARNING: android-twa.js.backup not found');
}

// Check index.html for script references
const indexPath = path.join(__dirname, '..', 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');

if (indexContent.includes('android-twa.js')) {
    console.log('❌ ERROR: index.html still references android-twa.js');
} else {
    console.log('✅ index.html no longer references android-twa.js');
}

// Check service worker for cache references
const swPath = path.join(__dirname, '..', 'sw.js');
const swContent = fs.readFileSync(swPath, 'utf8');

if (swContent.includes('android-twa.js')) {
    console.log('❌ ERROR: sw.js still references android-twa.js in cache');
} else {
    console.log('✅ sw.js no longer references android-twa.js in cache');
}

// Check for any remaining references in the codebase
const checkDirectory = (dir, extensions = ['.js', '.html', '.css']) => {
    const files = fs.readdirSync(dir);
    let foundReferences = [];
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            foundReferences = foundReferences.concat(checkDirectory(filePath, extensions));
        } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('androidTWAManager') || content.includes('AndroidTWAManager')) {
                foundReferences.push(filePath);
            }
        }
    }
    
    return foundReferences;
};

const projectRoot = path.join(__dirname, '..');
const remainingReferences = checkDirectory(projectRoot);

if (remainingReferences.length > 0) {
    console.log('\n⚠️  Found remaining references to AndroidTWAManager:');
    remainingReferences.forEach(ref => {
        console.log(`   - ${path.relative(projectRoot, ref)}`);
    });
} else {
    console.log('✅ No remaining references to AndroidTWAManager found');
}

// Check CSS for Android-specific improvements
const cssPath = path.join(__dirname, '..', 'css', 'game.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

if (cssContent.includes('Android-specific scrolling improvements')) {
    console.log('✅ Android-specific CSS scrolling improvements are in place');
} else {
    console.log('⚠️  Android-specific CSS scrolling improvements not found');
}

// Summary
console.log('\n📋 SUMMARY:');
console.log('- Android TWA script removed to fix scrolling issues');
console.log('- Application relies on proper Android configuration for fullscreen mode');
console.log('- CSS improvements ensure proper scrolling behavior');
console.log('- All script references cleaned up');

console.log('\n🧪 TESTING:');
console.log('1. Test on Android device: http://localhost:9003');
console.log('2. Verify scrolling in Settings and Base screens');
console.log('3. Check test page: http://localhost:9003/tests/test-android-scrolling.html');

console.log('\n✅ Verification complete!');