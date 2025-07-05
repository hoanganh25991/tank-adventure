#!/usr/bin/env node

/**
 * Tank Adventure PWA Manifest Validator
 * Validates the manifest.json file for PWA compliance
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateManifest() {
    const manifestPath = path.join(__dirname, '..', 'manifest.json');
    
    log('\n🎮 Tank Adventure PWA Manifest Validator', 'blue');
    log('=' .repeat(50), 'blue');
    
    // Check if manifest file exists
    if (!fs.existsSync(manifestPath)) {
        log('❌ manifest.json file not found!', 'red');
        process.exit(1);
    }
    
    let manifest;
    try {
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        manifest = JSON.parse(manifestContent);
        log('✅ Manifest file loaded successfully', 'green');
    } catch (error) {
        log(`❌ Error parsing manifest.json: ${error.message}`, 'red');
        process.exit(1);
    }
    
    let score = 0;
    let totalChecks = 0;
    
    // Required fields validation
    const requiredFields = [
        { field: 'name', description: 'App name' },
        { field: 'short_name', description: 'Short app name' },
        { field: 'start_url', description: 'Start URL' },
        { field: 'display', description: 'Display mode' },
        { field: 'background_color', description: 'Background color' },
        { field: 'theme_color', description: 'Theme color' }
    ];
    
    log('\n📋 Required Fields Check:', 'bold');
    requiredFields.forEach(({ field, description }) => {
        totalChecks++;
        if (manifest[field]) {
            log(`✅ ${description}: ${manifest[field]}`, 'green');
            score++;
        } else {
            log(`❌ Missing ${description} (${field})`, 'red');
        }
    });
    
    // Enhanced fields validation
    log('\n🚀 Enhanced PWA Fields Check:', 'bold');
    
    // App ID
    totalChecks++;
    if (manifest.id) {
        log(`✅ App ID: ${manifest.id}`, 'green');
        score++;
    } else {
        log('❌ Missing App ID field', 'red');
    }
    
    // Icons
    totalChecks++;
    if (manifest.icons && Array.isArray(manifest.icons) && manifest.icons.length > 0) {
        log(`✅ Icons: ${manifest.icons.length} icons defined`, 'green');
        score++;
        
        // Check for required icon sizes
        const iconSizes = manifest.icons.map(icon => icon.sizes);
        const has192 = iconSizes.some(size => size && size.includes('192x192'));
        const has512 = iconSizes.some(size => size && size.includes('512x512'));
        
        if (has192 && has512) {
            log('   ✅ Required icon sizes (192x192, 512x512) present', 'green');
        } else {
            log('   ⚠️  Missing recommended icon sizes (192x192, 512x512)', 'yellow');
        }
        
        // Check for maskable icons
        const hasMaskable = manifest.icons.some(icon => 
            icon.purpose && icon.purpose.includes('maskable')
        );
        if (hasMaskable) {
            log('   ✅ Maskable icons present', 'green');
        } else {
            log('   ⚠️  No maskable icons found', 'yellow');
        }
        
        // Check icon purposes
        const purposes = [...new Set(manifest.icons.flatMap(icon => 
            icon.purpose ? icon.purpose.split(' ') : ['any']
        ))];
        log(`   📱 Icon purposes: ${purposes.join(', ')}`, 'blue');
        
    } else {
        log('❌ Missing or empty icons field', 'red');
    }
    
    // IARC Rating ID
    totalChecks++;
    if (manifest.iarc_rating_id !== undefined && manifest.iarc_rating_id !== '') {
        log(`✅ IARC Rating ID: ${manifest.iarc_rating_id}`, 'green');
        score++;
    } else {
        log('❌ Missing or empty IARC Rating ID', 'red');
    }
    
    // Scope Extensions
    totalChecks++;
    if (manifest.scope_extensions && Array.isArray(manifest.scope_extensions) && manifest.scope_extensions.length > 0) {
        log(`✅ Scope Extensions: ${manifest.scope_extensions.length} extensions`, 'green');
        score++;
        
        manifest.scope_extensions.forEach((ext, index) => {
            if (ext.origin) {
                log(`   🌐 Extension ${index + 1}: ${ext.origin}`, 'blue');
            } else {
                log(`   ⚠️  Extension ${index + 1}: No origin specified`, 'yellow');
            }
        });
    } else {
        log('❌ Missing or empty scope_extensions field', 'red');
    }
    
    // Additional PWA best practices
    log('\n🎯 PWA Best Practices Check:', 'bold');
    
    const bestPractices = [
        { 
            field: 'description', 
            description: 'App description',
            check: (manifest) => manifest.description && manifest.description.length > 10
        },
        { 
            field: 'orientation', 
            description: 'Screen orientation',
            check: (manifest) => manifest.orientation
        },
        { 
            field: 'scope', 
            description: 'App scope',
            check: (manifest) => manifest.scope
        },
        { 
            field: 'categories', 
            description: 'App categories',
            check: (manifest) => manifest.categories && manifest.categories.length > 0
        },
        { 
            field: 'shortcuts', 
            description: 'App shortcuts',
            check: (manifest) => manifest.shortcuts && manifest.shortcuts.length > 0
        }
    ];
    
    bestPractices.forEach(({ field, description, check }) => {
        totalChecks++;
        if (check(manifest)) {
            const value = Array.isArray(manifest[field]) ? 
                `${manifest[field].length} items` : 
                manifest[field];
            log(`✅ ${description}: ${value}`, 'green');
            score++;
        } else {
            log(`⚠️  ${description} could be improved`, 'yellow');
        }
    });
    
    // Security and compatibility checks
    log('\n🔒 Security & Compatibility Check:', 'bold');
    
    // Check HTTPS in start_url
    totalChecks++;
    if (manifest.start_url && (manifest.start_url.startsWith('https://') || manifest.start_url.startsWith('/'))) {
        log('✅ Start URL is secure (HTTPS or relative)', 'green');
        score++;
    } else {
        log('❌ Start URL should use HTTPS or be relative', 'red');
    }
    
    // Check display mode
    totalChecks++;
    const validDisplayModes = ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
    if (manifest.display && validDisplayModes.includes(manifest.display)) {
        log(`✅ Valid display mode: ${manifest.display}`, 'green');
        score++;
    } else {
        log('❌ Invalid or missing display mode', 'red');
    }
    
    // Final score
    log('\n📊 Validation Results:', 'bold');
    log('=' .repeat(30), 'blue');
    
    const percentage = Math.round((score / totalChecks) * 100);
    const scoreColor = percentage >= 90 ? 'green' : percentage >= 70 ? 'yellow' : 'red';
    
    log(`Score: ${score}/${totalChecks} (${percentage}%)`, scoreColor);
    
    if (percentage >= 90) {
        log('🎉 Excellent! Your PWA manifest is fully compliant!', 'green');
    } else if (percentage >= 70) {
        log('👍 Good! Your PWA manifest meets most requirements.', 'yellow');
    } else {
        log('⚠️  Your PWA manifest needs improvement.', 'red');
    }
    
    // Recommendations
    if (score < totalChecks) {
        log('\n💡 Recommendations:', 'bold');
        log('- Fix any missing required fields', 'yellow');
        log('- Add maskable icons for better Android integration', 'yellow');
        log('- Include proper IARC rating for app store distribution', 'yellow');
        log('- Add scope extensions for cross-origin support', 'yellow');
        log('- Consider adding app shortcuts for better UX', 'yellow');
    }
    
    log('\n🔗 Useful Resources:', 'blue');
    log('- PWA Manifest Validator: https://manifest-validator.appspot.com/', 'blue');
    log('- Maskable Icons: https://maskable.app/', 'blue');
    log('- IARC Ratings: https://www.globalratings.com/', 'blue');
    log('- PWA Best Practices: https://web.dev/pwa-checklist/', 'blue');
    
    return percentage >= 70;
}

// Run validation
if (require.main === module) {
    const isValid = validateManifest();
    process.exit(isValid ? 0 : 1);
}

module.exports = { validateManifest };