# Skill System Fixes Summary

## Issues Fixed

### 1. Skills showing "Skill 2" instead of names
- **Problem**: Some skills were not displaying their proper short names in the UI
- **Solution**: 
  - Verified all skills have proper `shortName` values in the skill database
  - Enhanced the UI to use `skill.shortName || skill.name || 'NO NAME'` for better fallback
  - Added stacking numbers to skill names (e.g., "HEAL 2" for stacked skills)

### 2. Skills being reset after each wave
- **Problem**: Active skills were being cleared between waves, making battles harder
- **Solution**: 
  - Removed the `clearActiveSkills()` call from `startBattle()` in game-engine.js
  - Skills now persist between waves within the same battle
  - Health still regenerates between waves as intended
  - Skills only reset when starting a completely new battle or resetting the game

### 3. Skills not being stackable
- **Problem**: Players could only upgrade skills, not stack multiple instances
- **Solution**: 
  - Modified `addSkill()` method to allow stacking of active skills
  - Active skills can now be selected multiple times, creating multiple instances
  - Passive skills still upgrade instead of stacking (as intended)
  - Added unique IDs for stacked skills (e.g., `heal_stack_2`)
  - Updated skill names to show stack count (e.g., "Emergency Repair (2)")

## Implementation Details

### New Methods Added
- `findSkillByBaseId()`: Finds skills by their base ID (ignoring stack suffixes)
- `clearActiveSkillsForNewBattle()`: Properly clears skills only when starting new battles

### Modified Methods
- `addSkill()`: Now handles skill stacking for active skills
- `getRandomSkillChoices()`: Updated to allow offering stackable active skills multiple times
- `clearActiveSkills()`: Now only logs a warning instead of clearing skills

### Skill Stacking Logic
1. When adding an active skill that already exists:
   - Count existing instances of the same base skill
   - Create a unique ID with stack suffix
   - Update display name and short name with stack number
   - Add to available skill slot or replace oldest skill

2. When adding a passive skill that already exists:
   - Upgrade the existing skill level instead of creating a new instance
   - Maintains the original upgrade behavior for passive skills

## Files Modified
- `js/skills.js`: Main skill system logic
- `js/game-engine.js`: Removed skill clearing between waves
- `js/ui.js`: Already had proper skill name display logic

## Testing
- Created `tests/test-skill-names.html` to verify all skills have proper short names
- Test includes skill stacking verification
- All skills confirmed to have proper short names

## User Experience Improvements
- Skills now persist between waves, maintaining progression
- Players can stack powerful active skills for stronger effects
- Clear visual feedback for stacked skills with numbered names
- Health regeneration between waves balances the retained skills