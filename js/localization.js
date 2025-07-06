// Localization System for Tank Adventure
class Localization {
    constructor() {
        this.currentLanguage = 'en';
        this.supportedLanguages = ['en', 'vi'];
        this.translations = {};
        this.init();
    }

    init() {
        // Load translations
        this.loadTranslations();
        
        // Detect device language
        this.detectLanguage();
        
        // Load saved language preference
        this.loadLanguagePreference();
    }

    loadTranslations() {
        this.translations = {
            en: {
                // Main Menu
                'game_title': 'Tank Adventure',
                'menu_battle': '🔥 Battle',
                'menu_base': '🏠 Base & Upgrades',
                'menu_guide': '📖 Guide',
                
                // Battle UI
                'wave': 'Wave',
                'enemies': 'Enemies',
                'score': 'Score',
                'health': 'Health',
                'game_paused': 'Game Paused',
                'resume': '▶️ Resume',
                'exit_to_menu': '🏠 Exit to Menu',
                
                // Mobile Controls
                'skill_1': 'SKILL 1',
                'skill_2': 'SKILL 2',
                'skill_3': 'SKILL 3',
                'shoot': 'SHOOT',
                
                // Skill Selection
                'choose_enhancement': 'Choose Your Enhancement',
                
                // Battle Results
                'battle_complete': 'Battle Complete!',
                'complete_victory': '🏆 Complete Victory!',
                'battle_victory': '🎖️ Battle Victory!',
                'battle_defeat': '☠️ Battle Defeat',
                'wave_reached': 'Wave Reached',
                'enemies_defeated': 'Enemies Defeated',
                'score_earned': 'Score Earned',
                'experience_gained': 'Experience Gained',
                'continue': 'Continue',
                'back_to_base': '🏠 Back to Base',
                
                // Base/Upgrades
                'tank_base': 'Tank Base',
                'level': 'Level',
                'experience': 'Experience',
                'coins': 'Coins',
                'main_tank': '🚗 Main Tank',
                'mini_tanks': '🚙 Mini Tanks',
                'armor': '❤️ Armor',
                'cannon': '⚔️ Cannon',
                'weapons': '⚔️ Weapons',
                'engine': '💨 Engine',
                'mobility': '💨 Mobility',
                'auto_loader': '🔥 Auto-loader',
                'coordination': '🎯 Coordination',
                'formation': '👥 Formation',
                'coin_bonus': '💰 Coin Bonus',
                'exp_bonus': '🌟 Exp Bonus',
                'bullet_speed': '🚀 Bullet Speed',
                'formation_expand': '📈 Formation Expand',
                
                // Guide/Settings
                'tank_guide': 'Tank Guide',
                'language': 'Language',
                'english': 'English',
                'vietnamese': 'Tiếng Việt',
                'welcome_title': '🎮 Welcome to Tank Adventure!',
                'welcome_desc': 'Command your tank formation and survive endless waves of enemies. Master your skills and upgrade your tanks to become the ultimate commander!',
                'how_to_play': '🕹️ How to Play',
                'movement': 'Movement',
                'movement_desc': 'Use the virtual joystick to move your tank formation around the battlefield.',
                'shooting': 'Shooting',
                'shooting_desc': 'Tap the SHOOT button to fire at enemies. Your tank will auto-aim at the nearest threat!',
                'skills': 'Skills',
                'skills_desc': 'Use SKILL buttons to activate powerful abilities during battle.',
                'desktop_controls': '⌨️ Desktop Controls',
                'desktop_movement': 'Use WASD keys (W=Up, A=Left, S=Down, D=Right) to move your tank formation.',
                'desktop_shooting': 'Press and hold <strong>SPACEBAR</strong> to continuously fire at enemies.',
                'desktop_game_controls': 'Press <strong>ESC</strong> to exit fullscreen mode when playing.',
                'game_features': '🏗️ Game Features',
                'feature_formation': 'Formation Combat: Control a main tank with mini-tank escorts',
                'feature_waves': 'Wave Survival: Face increasingly difficult enemy waves',
                'feature_skills': 'Skill System: Choose powerful enhancements between waves',
                'feature_upgrades': 'Upgrades: Improve your tanks at the base between battles',
                'feature_mobile': 'Mobile Optimized: Designed for touch screen gaming',
                'tips_success': '💡 Tips for Success',
                'tip_movement': 'Keep moving to avoid enemy fire',
                'tip_skills': 'Use skills strategically during tough moments',
                'tip_upgrades': 'Upgrade your tanks regularly at the base',
                'tip_choose_skills': 'Choose skills that complement your playstyle',
                'tip_formation': 'Position your formation to maximize firepower',
                'best_experience': '📱 Best Experience',
                'landscape_note': 'For the best gaming experience, rotate your device to <strong>landscape mode</strong> and play in <strong>fullscreen</strong>.',
                'fullscreen': '📺 Fullscreen',
                'game_reset': '🔄 Game Reset',
                'reset_warning': 'Use this button to reset all progress and start from the beginning. This action cannot be undone!',
                'reset_game': 'Reset Game',
                'back_to_menu': 'Back to Menu',
                
                // Orientation
                'rotate_device': 'Rotate Your Device',
                'rotate_desc': 'Please rotate your device to landscape mode for the best gaming experience.',
                'rotate_tip': '🎮 Tank Adventure works best in landscape orientation',
                
                // Skills
                'emergency_repair': 'Emergency Repair',
                'emergency_repair_desc': 'Instantly repairs all tanks',
                'combat_overdrive': 'Combat Overdrive',
                'combat_overdrive_desc': 'Increases damage for 10 seconds',
                'nitro_boost': 'Nitro Boost',
                'nitro_boost_desc': 'Increases movement speed for 8 seconds',
                'energy_shield': 'Energy Shield',
                'energy_shield_desc': 'Adds temporary shield to all tanks',
                'explosive_rounds': 'Explosive Rounds',
                'explosive_rounds_desc': 'Shots explode on impact for 12 seconds',
                'multi_cannon': 'Multi-Cannon',
                'multi_cannon_desc': 'Fire multiple shots at once for 10 seconds',
                'temporal_field': 'Temporal Field',
                'temporal_field_desc': 'Slows all enemies for 6 seconds',
                'auto_repair_system': 'Auto-Repair System',
                'auto_repair_system_desc': 'Gradually repairs tanks for 20 seconds',
                'freeze_blast': 'Freeze Blast',
                'freeze_blast_desc': 'Freezes and slows all enemies for 8 seconds',
                'lightning_storm': 'Lightning Storm',
                'lightning_storm_desc': 'Chain lightning jumps between enemies',
                'fire_nova': 'Fire Nova',
                'fire_nova_desc': 'Spreads burning damage over time',
                'vortex_field': 'Vortex Field',
                'vortex_field_desc': 'Pulls enemies together and damages them',
                'plasma_burst': 'Plasma Burst',
                'plasma_burst_desc': 'High-damage energy wave that pierces enemies',
                'ice_barrier': 'Ice Barrier',
                'ice_barrier_desc': 'Creates protective ice walls around tanks',
                'magnetic_field': 'Magnetic Field',
                'magnetic_field_desc': 'Attracts and redirects enemy bullets',
                'quantum_strike': 'Quantum Strike',
                'quantum_strike_desc': 'Teleports and deals massive damage',
                'reinforced_armor': 'Reinforced Armor',
                'reinforced_armor_desc': 'Permanently increases max health',
                'enhanced_weapons': 'Enhanced Weapons',
                'enhanced_weapons_desc': 'Permanently increases damage',
                'improved_engine': 'Improved Engine',
                'improved_engine_desc': 'Permanently increases speed',
                'rapid_fire_system': 'Rapid Fire System',
                'rapid_fire_system_desc': 'Permanently reduces shoot cooldown',
                
                // Additional Skill Names (missing ones)
                'heal': 'Emergency Repair',
                'damage_boost': 'Combat Overdrive',
                'speed_boost': 'Nitro Boost',
                'shield': 'Energy Shield',
                'explosive_shot': 'Explosive Rounds',
                'multi_shot': 'Multi-Cannon',
                'time_slow': 'Temporal Field',
                'auto_repair': 'Auto-Repair System',
                'armor_upgrade': 'Reinforced Armor',
                'weapon_upgrade': 'Enhanced Weapons',
                'engine_upgrade': 'Improved Engine',
                'rapid_fire': 'Rapid Fire System',
                'targeting_system': 'Advanced Targeting',
                'formation_expand': 'Formation Expansion',
                'freeze_blast': 'Freeze Blast',
                'lightning_storm': 'Lightning Storm',
                'fire_nova': 'Fire Nova',
                'vortex_field': 'Vortex Field',
                'plasma_burst': 'Plasma Burst',
                'ice_barrier': 'Ice Barrier',
                'magnetic_pull': 'Magnetic Field',
                'quantum_strike': 'Quantum Strike',
                
                // Additional Skill Descriptions (missing ones)
                'heal_desc': 'Instantly repairs all tanks',
                'damage_boost_desc': 'Increases damage for 10 seconds',
                'speed_boost_desc': 'Increases movement speed for 8 seconds',
                'shield_desc': 'Adds temporary shield to all tanks',
                'explosive_shot_desc': 'Shots explode on impact for 12 seconds',
                'multi_shot_desc': 'Fire multiple shots at once for 10 seconds',
                'time_slow_desc': 'Slows all enemies for 6 seconds',
                'auto_repair_desc': 'Gradually repairs tanks for 20 seconds',
                'armor_upgrade_desc': 'Permanently increases max health',
                'weapon_upgrade_desc': 'Permanently increases damage',
                'engine_upgrade_desc': 'Permanently increases speed',
                'rapid_fire_desc': 'Permanently reduces shoot cooldown',
                'targeting_system_desc': 'Increases bullet speed and accuracy',
                'formation_expand_desc': 'Add +1 mini tank to formation',
                'freeze_blast_desc': 'Freezes and slows all enemies for 8 seconds',
                'lightning_storm_desc': 'Chain lightning jumps between enemies',
                'fire_nova_desc': 'Spreads burning damage over time',
                'vortex_field_desc': 'Pulls enemies together and damages them',
                'plasma_burst_desc': 'High-damage energy wave that pierces enemies',
                'ice_barrier_desc': 'Creates protective ice walls around tanks',
                'magnetic_pull_desc': 'Attracts and redirects enemy bullets',
                'quantum_strike_desc': 'Teleports and deals massive damage',
                
                // Upgrade Categories
                'formation_category': 'Formation',
                'economy_category': 'Economy',
                'special_category': 'Special',
                
                // Upgrade Names (missing ones)
                'tactics': 'Tactics',
                'salvage': 'Salvage',
                'experience_upgrade': 'Experience',
                'accelerator': 'Accelerator',
                'auto_repair_upgrade': 'Auto-Repair',
                'shield_upgrade': 'Shield',
                'multi_shot_upgrade': 'Multi-Shot',
                
                // Upgrade Effect Units
                'health_unit': 'Health',
                'damage_unit': 'Damage',
                'speed_unit': 'Speed',
                'cooldown_unit': 'Cooldown',
                'mini_tanks_unit': 'Mini Tanks',
                'coordination_unit': 'Coordination',
                'bonus_unit': 'Bonus',
                'bullet_speed_unit': 'Bullet Speed',
                'hp_per_sec_unit': 'HP/sec',
                'shield_unit': 'Shield',
                'multi_shot_unit': 'Multi-Shot',
                'level_unit': 'Level',
                
                // Skill Short Names for Button Display
                'heal_short': 'REPAIR',
                'damage_boost_short': 'POWER',
                'speed_boost_short': 'SPEED',
                'shield_short': 'SHIELD',
                'explosive_shot_short': 'BOOM',
                'multi_shot_short': 'MULTI',
                'time_slow_short': 'SLOW',
                'auto_repair_short': 'REGEN',
                'freeze_blast_short': 'FREEZE',
                'lightning_storm_short': 'BOLT',
                'fire_nova_short': 'NOVA',
                'vortex_field_short': 'VORTEX',
                'plasma_burst_short': 'PLASMA',
                'ice_barrier_short': 'WALL',
                'magnetic_pull_short': 'MAGNET',
                'quantum_strike_short': 'QUANTUM',
                'armor_upgrade_short': 'ARMOR',
                'weapon_upgrade_short': 'WEAPON',
                'engine_upgrade_short': 'ENGINE',
                'rapid_fire_short': 'RAPID',
                'targeting_system_short': 'TARGET',
                'formation_expand_short': 'EXPAND',
                
                // Battle Type Modal
                'select_battle_type': 'Select Battle Type',
                'quick_battle': 'Quick Battle',
                'quick_battle_desc': '3 Waves',
                'standard_battle': 'Standard Battle',
                'standard_battle_desc': '5 Waves',
                'extended_battle': 'Extended Battle',
                'extended_battle_desc': '10 Waves',
                'endless_battle': 'Endless Battle',
                'endless_battle_desc': 'Infinite Waves',
                'reward': 'Reward',
                
                // Confirmation Modal
                'confirm_action': 'Confirm Action',
                'are_you_sure': 'Are you sure?',
                'confirm': 'Confirm',
                'cancel': 'Cancel',
                'reset_game_title': 'Reset Game',
                'reset_game_message': 'Are you sure you want to reset all progress?',
                'reset_game_warning': 'This action cannot be undone!',
                'reset_bullet_upgrades': '• All tank upgrades will be lost',
                'reset_bullet_level': '• Your level and experience will reset',
                'reset_bullet_coins': '• All earned coins will be removed',
                'reset_bullet_skills': '• All unlocked skills will be lost',
                'loading': 'Loading...'
            },
            vi: {
                // Main Menu
                'game_title': 'Tank Adventure',
                'menu_battle': '🔥 Chiến Đấu',
                'menu_base': '🏠 Căn Cứ & Nâng Cấp',
                'menu_guide': '📖 Hướng Dẫn',
                
                // Battle UI
                'wave': 'Đợt',
                'enemies': 'Kẻ Thù',
                'score': 'Điểm',
                'health': 'Máu',
                'game_paused': 'Tạm Dừng',
                'resume': '▶️ Tiếp Tục',
                'exit_to_menu': '🏠 Về Menu',
                
                // Mobile Controls
                'skill_1': 'KỸ NĂNG 1',
                'skill_2': 'KỸ NĂNG 2',
                'skill_3': 'KỸ NĂNG 3',
                'shoot': 'BẮN',
                
                // Skill Selection
                'choose_enhancement': 'Chọn Kỹ Năng',
                
                // Battle Results
                'battle_complete': 'Hoàn Thành!',
                'complete_victory': '🏆 Chiến Thắng Hoàn Toàn!',
                'battle_victory': '🎖️ Chiến Thắng!',
                'battle_defeat': '☠️ Thất Bại',
                'wave_reached': 'Đợt Đạt Được',
                'enemies_defeated': 'Kẻ Thù Tiêu Diệt',
                'score_earned': 'Điểm Đạt Được',
                'experience_gained': 'Kinh Nghiệm Nhận',
                'continue': 'Tiếp Tục',
                'back_to_base': '🏠 Về Căn Cứ',
                
                // Base/Upgrades
                'tank_base': 'Căn Cứ Xe Tăng',
                'level': 'Cấp Độ',
                'experience': 'Kinh Nghiệm',
                'coins': 'Xu',
                'main_tank': '🚗 Xe Tăng Chính',
                'mini_tanks': '🚙 Xe Tăng Nhỏ',
                'armor': '❤️ Giáp',
                'cannon': '⚔️ Pháo',
                'weapons': '⚔️ Vũ Khí',
                'engine': '💨 Động Cơ',
                'mobility': '💨 Cơ Động',
                'auto_loader': '🔥 Nạp Tự Động',
                'coordination': '🎯 Phối Hợp',
                'formation': '👥 Đội Hình',
                'coin_bonus': '💰 Thưởng Xu',
                'exp_bonus': '🌟 Thưởng Exp',
                'bullet_speed': '🚀 Tốc Độ Đạn',
                'formation_expand': '📈 Mở Rộng Đội Hình',
                
                // Guide/Settings
                'tank_guide': 'Hướng Dẫn',
                'language': 'Ngôn Ngữ',
                'english': 'English',
                'vietnamese': 'Tiếng Việt',
                'welcome_title': '🎮 Chào Mừng Đến Tank Adventure!',
                'welcome_desc': 'Chỉ huy đội hình xe tăng và sống sót qua những đợt kẻ thù bất tận. Thành thạo kỹ năng và nâng cấp xe tăng để trở thành chỉ huy tối cao!',
                'how_to_play': '🕹️ Cách Chơi',
                'movement': 'Di Chuyển',
                'movement_desc': 'Sử dụng joystick ảo để di chuyển đội hình xe tăng trên chiến trường.',
                'shooting': 'Bắn',
                'shooting_desc': 'Chạm nút BẮN để bắn kẻ thù. Xe tăng sẽ tự ngắm mục tiêu gần nhất!',
                'skills': 'Kỹ Năng',
                'skills_desc': 'Sử dụng nút KỸ NĂNG để kích hoạt khả năng mạnh mẽ trong chiến đấu.',
                'desktop_controls': '⌨️ Điều Khiển Máy Tính',
                'desktop_movement': 'Sử dụng phím WASD (W=Lên, A=Trái, S=Xuống, D=Phải) để di chuyển đội hình.',
                'desktop_shooting': 'Nhấn và giữ <strong>SPACEBAR</strong> để bắn liên tục.',
                'desktop_game_controls': 'Nhấn <strong>ESC</strong> để thoát chế độ toàn màn hình.',
                'game_features': '🏗️ Tính Năng Game',
                'feature_formation': 'Chiến Đấu Đội Hình: Điều khiển xe tăng chính với xe tăng hộ tống',
                'feature_waves': 'Sống Sót Theo Đợt: Đối mặt với những đợt kẻ thù khó khăn hơn',
                'feature_skills': 'Hệ Thống Kỹ Năng: Chọn những tăng cường mạnh mẽ giữa các đợt',
                'feature_upgrades': 'Nâng Cấp: Cải thiện xe tăng tại căn cứ giữa các trận',
                'feature_mobile': 'Tối Ưu Di Động: Thiết kế cho gaming cảm ứng',
                'tips_success': '💡 Mẹo Thành Công',
                'tip_movement': 'Luôn di chuyển để tránh hỏa lực kẻ thù',
                'tip_skills': 'Sử dụng kỹ năng một cách chiến lược trong lúc khó khăn',
                'tip_upgrades': 'Nâng cấp xe tăng thường xuyên tại căn cứ',
                'tip_choose_skills': 'Chọn kỹ năng phù hợp với lối chơi của bạn',
                'tip_formation': 'Sắp xếp đội hình để tối đa hóa hỏa lực',
                'best_experience': '📱 Trải Nghiệm Tốt Nhất',
                'landscape_note': 'Để có trải nghiệm gaming tốt nhất, xoay thiết bị sang <strong>chế độ ngang</strong> và chơi ở <strong>toàn màn hình</strong>.',
                'fullscreen': '📺 Toàn Màn Hình',
                'game_reset': '🔄 Đặt Lại Game',
                'reset_warning': 'Sử dụng nút này để đặt lại toàn bộ tiến trình và bắt đầu từ đầu. Hành động này không thể hoàn tác!',
                'reset_game': 'Đặt Lại Game',
                'back_to_menu': 'Về Menu',
                
                // Orientation
                'rotate_device': 'Xoay Thiết Bị',
                'rotate_desc': 'Vui lòng xoay thiết bị sang chế độ ngang để có trải nghiệm gaming tốt nhất.',
                'rotate_tip': '🎮 Tank Adventure hoạt động tốt nhất ở chế độ ngang',
                
                // Skills
                'emergency_repair': 'Sửa Chữa Khẩn Cấp',
                'emergency_repair_desc': 'Sửa chữa tức thì tất cả xe tăng',
                'combat_overdrive': 'Tăng Lực Chiến Đấu',
                'combat_overdrive_desc': 'Tăng sát thương trong 10 giây',
                'nitro_boost': 'Tăng Tốc Nitro',
                'nitro_boost_desc': 'Tăng tốc độ di chuyển trong 8 giây',
                'energy_shield': 'Khiên Năng Lượng',
                'energy_shield_desc': 'Thêm khiên tạm thời cho tất cả xe tăng',
                'explosive_rounds': 'Đạn Nổ',
                'explosive_rounds_desc': 'Đạn phát nổ khi va chạm trong 12 giây',
                'multi_cannon': 'Pháo Đa Nòng',
                'multi_cannon_desc': 'Bắn nhiều đạn cùng lúc trong 10 giây',
                'temporal_field': 'Trường Thời Gian',
                'temporal_field_desc': 'Làm chậm tất cả kẻ thù trong 6 giây',
                'auto_repair_system': 'Hệ Thống Tự Sửa',
                'auto_repair_system_desc': 'Sửa chữa từ từ xe tăng trong 20 giây',
                'freeze_blast': 'Làm Đóng Băng',
                'freeze_blast_desc': 'Đóng băng và làm chậm tất cả kẻ thù trong 8 giây',
                'lightning_storm': 'Bão Sét',
                'lightning_storm_desc': 'Sét dây chuyền nhảy giữa các kẻ thù',
                'fire_nova': 'Bùng Nổ Lửa',
                'fire_nova_desc': 'Lan truyền sát thương cháy theo thời gian',
                'vortex_field': 'Trường Xoáy',
                'vortex_field_desc': 'Kéo kẻ thù lại gần và gây sát thương',
                'plasma_burst': 'Bùng Nổ Plasma',
                'plasma_burst_desc': 'Sóng năng lượng sát thương cao xuyên qua kẻ thù',
                'ice_barrier': 'Rào Cản Băng',
                'ice_barrier_desc': 'Tạo tường băng bảo vệ xung quanh xe tăng',
                'magnetic_field': 'Trường Từ',
                'magnetic_field_desc': 'Hút và chuyển hướng đạn kẻ thù',
                'quantum_strike': 'Tấn Công Lượng Tử',
                'quantum_strike_desc': 'Dịch chuyển và gây sát thương khủng khiếp',
                'reinforced_armor': 'Giáp Cường Hóa',
                'reinforced_armor_desc': 'Tăng vĩnh viễn máu tối đa',
                'enhanced_weapons': 'Vũ Khí Nâng Cấp',
                'enhanced_weapons_desc': 'Tăng vĩnh viễn sát thương',
                'improved_engine': 'Động Cơ Cải Tiến',
                'improved_engine_desc': 'Tăng vĩnh viễn tốc độ',
                'rapid_fire_system': 'Hệ Thống Bắn Nhanh',
                'rapid_fire_system_desc': 'Giảm vĩnh viễn thời gian hồi chiêu bắn',
                
                // Additional Skill Names (missing ones) - Vietnamese
                'heal': 'Sửa Chữa Khẩn Cấp',
                'damage_boost': 'Tăng Cường Chiến Đấu',
                'speed_boost': 'Tăng Tốc Nitro',
                'shield': 'Khiên Năng Lượng',
                'explosive_shot': 'Đạn Nổ',
                'multi_shot': 'Đa Pháo',
                'time_slow': 'Trường Thời Gian',
                'auto_repair': 'Hệ Thống Tự Sửa',
                'armor_upgrade': 'Giáp Cường Hóa',
                'weapon_upgrade': 'Vũ Khí Nâng Cấp',
                'engine_upgrade': 'Động Cơ Cải Tiến',
                'rapid_fire': 'Hệ Thống Bắn Nhanh',
                'targeting_system': 'Hệ Thống Ngắm Tiên Tiến',
                'formation_expand': 'Mở Rộng Đội Hình',
                'freeze_blast': 'Làm Đóng Băng',
                'lightning_storm': 'Bão Sét',
                'fire_nova': 'Bùng Nổ Lửa',
                'vortex_field': 'Trường Xoáy',
                'plasma_burst': 'Bùng Nổ Plasma',
                'ice_barrier': 'Rào Cản Băng',
                'magnetic_pull': 'Trường Từ',
                'quantum_strike': 'Tấn Công Lượng Tử',
                
                // Additional Skill Descriptions (missing ones) - Vietnamese
                'heal_desc': 'Sửa chữa ngay lập tức tất cả xe tăng',
                'damage_boost_desc': 'Tăng sát thương trong 10 giây',
                'speed_boost_desc': 'Tăng tốc độ di chuyển trong 8 giây',
                'shield_desc': 'Thêm khiên tạm thời cho tất cả xe tăng',
                'explosive_shot_desc': 'Đạn nổ khi va chạm trong 12 giây',
                'multi_shot_desc': 'Bắn nhiều đạn cùng lúc trong 10 giây',
                'time_slow_desc': 'Làm chậm tất cả kẻ thù trong 6 giây',
                'auto_repair_desc': 'Sửa chữa từ từ xe tăng trong 20 giây',
                'armor_upgrade_desc': 'Tăng vĩnh viễn máu tối đa',
                'weapon_upgrade_desc': 'Tăng vĩnh viễn sát thương',
                'engine_upgrade_desc': 'Tăng vĩnh viễn tốc độ',
                'rapid_fire_desc': 'Giảm vĩnh viễn thời gian hồi chiêu bắn',
                'targeting_system_desc': 'Tăng tốc độ đạn và độ chính xác',
                'formation_expand_desc': 'Thêm +1 xe tăng nhỏ vào đội hình',
                'freeze_blast_desc': 'Đóng băng và làm chậm tất cả kẻ thù trong 8 giây',
                'lightning_storm_desc': 'Sét dây chuyền nhảy giữa các kẻ thù',
                'fire_nova_desc': 'Lan truyền sát thương cháy theo thời gian',
                'vortex_field_desc': 'Kéo kẻ thù lại gần và gây sát thương',
                'plasma_burst_desc': 'Sóng năng lượng sát thương cao xuyên qua kẻ thù',
                'ice_barrier_desc': 'Tạo tường băng bảo vệ xung quanh xe tăng',
                'magnetic_pull_desc': 'Hút và chuyển hướng đạn kẻ thù',
                'quantum_strike_desc': 'Dịch chuyển và gây sát thương khủng khiếp',
                
                // Upgrade Categories - Vietnamese
                'formation_category': 'Đội Hình',
                'economy_category': 'Kinh Tế',
                'special_category': 'Đặc Biệt',
                
                // Upgrade Names (missing ones) - Vietnamese
                'tactics': 'Chiến Thuật',
                'salvage': 'Thu Gom',
                'experience_upgrade': 'Kinh Nghiệm',
                'accelerator': 'Gia Tốc',
                'auto_repair_upgrade': 'Tự Sửa',
                'shield_upgrade': 'Khiên',
                'multi_shot_upgrade': 'Đa Pháo',
                
                // Upgrade Effect Units - Vietnamese
                'health_unit': 'Máu',
                'damage_unit': 'Sát Thương',
                'speed_unit': 'Tốc Độ',
                'cooldown_unit': 'Hồi Chiêu',
                'mini_tanks_unit': 'Xe Tăng Nhỏ',
                'coordination_unit': 'Phối Hợp',
                'bonus_unit': 'Thưởng',
                'bullet_speed_unit': 'Tốc Độ Đạn',
                'hp_per_sec_unit': 'Máu/giây',
                'shield_unit': 'Khiên',
                'multi_shot_unit': 'Đa Pháo',
                'level_unit': 'Cấp',
                
                // Skill Short Names for Button Display - Vietnamese
                'heal_short': 'SỬA',
                'damage_boost_short': 'SỨC MẠNH',
                'speed_boost_short': 'TỐC ĐỘ',
                'shield_short': 'KHIÊN',
                'explosive_shot_short': 'NỔ',
                'multi_shot_short': 'ĐA PHÁO',
                'time_slow_short': 'CHẬM',
                'auto_repair_short': 'TỰ SỬA',
                'freeze_blast_short': 'ĐÓNG BĂNG',
                'lightning_storm_short': 'SÉT',
                'fire_nova_short': 'LỬA',
                'vortex_field_short': 'XOÁY',
                'plasma_burst_short': 'PLASMA',
                'ice_barrier_short': 'TƯỜNG',
                'magnetic_pull_short': 'TỪ TÍNH',
                'quantum_strike_short': 'LƯỢNG TỬ',
                'armor_upgrade_short': 'GIÁP',
                'weapon_upgrade_short': 'VŨ KHÍ',
                'engine_upgrade_short': 'ĐỘNG CƠ',
                'rapid_fire_short': 'BẮN NHANH',
                'targeting_system_short': 'NGẮM',
                'formation_expand_short': 'MỞ RỘNG',
                
                // Battle Type Modal
                'select_battle_type': 'Chọn Loại Trận Đấu',
                'quick_battle': 'Trận Nhanh',
                'quick_battle_desc': '3 Đợt',
                'standard_battle': 'Trận Tiêu Chuẩn',
                'standard_battle_desc': '5 Đợt',
                'extended_battle': 'Trận Mở Rộng',
                'extended_battle_desc': '10 Đợt',
                'endless_battle': 'Trận Vô Tận',
                'endless_battle_desc': 'Vô Số Đợt',
                'reward': 'Phần Thưởng',
                
                // Confirmation Modal
                'confirm_action': 'Xác Nhận Hành Động',
                'are_you_sure': 'Bạn có chắc chắn?',
                'confirm': 'Xác Nhận',
                'cancel': 'Hủy Bỏ',
                'reset_game_title': 'Đặt Lại Trò Chơi',
                'reset_game_message': 'Bạn có chắc chắn muốn đặt lại toàn bộ tiến trình?',
                'reset_game_warning': 'Hành động này không thể hoàn tác!',
                'reset_bullet_upgrades': '• Tất cả nâng cấp xe tăng sẽ bị mất',
                'reset_bullet_level': '• Cấp độ và kinh nghiệm sẽ bị đặt lại',
                'reset_bullet_coins': '• Tất cả xu đã kiếm được sẽ bị xóa',
                'reset_bullet_skills': '• Tất cả kỹ năng đã mở khóa sẽ bị mất',
                'loading': 'Đang Tải...'
            }
        };
    }

    detectLanguage() {
        // Detect device/browser language
        const browserLanguage = navigator.language || navigator.userLanguage;
        
        // Check if it's Vietnamese
        if (browserLanguage && browserLanguage.toLowerCase().startsWith('vi')) {
            this.currentLanguage = 'vi';
        } else {
            this.currentLanguage = 'en';
        }
        
        console.log('Detected language:', browserLanguage, '-> Set to:', this.currentLanguage);
    }

    loadLanguagePreference() {
        // Load saved language preference
        const savedLanguage = localStorage.getItem('tank_adventure_language');
        if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
            this.currentLanguage = savedLanguage;
            console.log('Loaded saved language:', savedLanguage);
        }
    }

    saveLanguagePreference() {
        localStorage.setItem('tank_adventure_language', this.currentLanguage);
        console.log('Saved language preference:', this.currentLanguage);
    }

    setLanguage(language) {
        if (this.supportedLanguages.includes(language)) {
            this.currentLanguage = language;
            this.saveLanguagePreference();
            this.updateAllText();
            console.log('Language set to:', language);
        }
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    t(key) {
        return this.translations[this.currentLanguage][key] || this.translations['en'][key] || key;
    }

    updateAllText() {
        // Update all translatable text in the DOM
        this.updateStaticText();
        this.updateDynamicText();
    }

    updateStaticText() {
        // Update static text elements with data-translate attribute
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (key && this.translations[this.currentLanguage][key]) {
                if (element.tagName === 'INPUT' && element.type === 'button') {
                    element.value = this.t(key);
                } else {
                    element.textContent = this.t(key);
                }
            }
        });

        // Update HTML content for elements with data-translate-html
        const htmlElements = document.querySelectorAll('[data-translate-html]');
        htmlElements.forEach(element => {
            const key = element.getAttribute('data-translate-html');
            if (key && this.translations[this.currentLanguage][key]) {
                element.innerHTML = this.t(key);
            }
        });
    }

    updateDynamicText() {
        // Update dynamic text that's set via JavaScript
        // This will be called from UI updates
        
        // Update upgrade displays if UI manager exists
        if (window.uiManager && typeof window.uiManager.updateBaseScreen === 'function') {
            window.uiManager.updateBaseScreen();
        }
    }

    // Helper method to get skill translation
    getSkillTranslation(skillId, type = 'name') {
        const key = type === 'name' ? skillId : `${skillId}_desc`;
        return this.t(key);
    }

    // Helper method to get skill short name translation
    getSkillShortName(skillId) {
        const key = `${skillId}_short`;
        return this.t(key);
    }
}

// Create global instance
window.Localization = new Localization();