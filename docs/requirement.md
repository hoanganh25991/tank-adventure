**Core Business Logic**

- **Platform:** Mobile and tablet with touch screen.
- **Player and Mini Tanks:**
  - Control a large tank with five mini tanks via a virtual joystick (bottom-left).
  - Main tank auto-aims; skill and shoot buttons on the bottom-right.
- **Battle Mechanics:**
  - Fight auto-deployed enemy troops in waves, increasing in strength.
  - Enemies scale in appearance and strength based on the main tank's level and current wave.
  - Choose one skill (active/passive) after each wave; skills reset periodically.
  - Battles consist of 3-10 waves, increasing in difficulty.
  - Each battle type has a unique title displayed at the start.
  - Battle types have different reward structures:
    - Quick Battle (3 waves): Base rewards with 30% completion bonus
    - Standard Battle (5 waves): 20% higher base rewards with 50% completion bonus
    - Extended Battle (10 waves): 50% higher base rewards with 100% completion bonus
- **Progression and Upgrades:**
  - Levels awarded based on battle performance.
  - Rewards include score, experience points, and coins:
    - Score: Based on enemy value and battle type multipliers
    - Experience: Contributes to player level progression
    - Coins: Calculated as score ÷ 4, used for upgrades
  - Upgrade tanks and mini tanks post-battle with various upgrade paths.
  - A "Battle" button is available after upgrades to start a new battle directly.
- **Skill Management:**
  - Active skills auto-cast; focus on movement control.

**External Rendering Layer**

- **Rendering Requirements:**
  - 2D graphics using HTML and JavaScript.
  - Designed for simplicity and speed, no compilation needed.
  - Display the main tank's level on the health bar.
- **User Interface Enhancements:**
  - Add emojis to buttons for a fun and engaging experience.
  - In the main menu, replace "Start Game" with "Battle" to directly initiate gameplay.
  - Display reward multipliers for each battle type in the battle selection screen.
  - Show detailed reward information in the battle results screen, including applied bonuses.
