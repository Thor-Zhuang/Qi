/**
 * 秘境配置表
 * 20关 + 2 Boss关 = 22关
 */
export interface DungeonConfigItem {
    /** 关卡号 1-22 */
    level: number;
    /** 关卡名 */
    name: string;
    /** 敌人名称 */
    enemyName: string;
    /** 敌人战力 */
    enemyCombatPower: number;
    /** 是否Boss关 */
    isBoss: boolean;
    /** 通关奖励灵石 */
    rewardSpiritStones: number;
    /** 通关奖励修为丹（立即获得修为） */
    rewardCultivationPill: number;
    /** 推荐境界索引 */
    recommendRealmIndex: number;
}

export class DungeonConfig {
    static readonly DATA: DungeonConfigItem[] = [
        // ====== 第一篇章：凡尘试炼（1-10）======
        { level: 1, name: '荒野小径', enemyName: '山贼', enemyCombatPower: 80,
          isBoss: false, rewardSpiritStones: 50, rewardCultivationPill: 200,
          recommendRealmIndex: 0 },
        { level: 2, name: '幽暗密林', enemyName: '妖狐', enemyCombatPower: 200,
          isBoss: false, rewardSpiritStones: 80, rewardCultivationPill: 500,
          recommendRealmIndex: 0 },
        { level: 3, name: '断崖古洞', enemyName: '石魔', enemyCombatPower: 500,
          isBoss: false, rewardSpiritStones: 120, rewardCultivationPill: 1000,
          recommendRealmIndex: 0 },
        { level: 4, name: '碧水潭', enemyName: '蛟蛇', enemyCombatPower: 1200,
          isBoss: false, rewardSpiritStones: 180, rewardCultivationPill: 2000,
          recommendRealmIndex: 0 },
        { level: 5, name: '迷雾山谷', enemyName: '幻影蝠', enemyCombatPower: 3000,
          isBoss: false, rewardSpiritStones: 250, rewardCultivationPill: 4000,
          recommendRealmIndex: 0 },
        { level: 6, name: '古战场', enemyName: '怨灵将军', enemyCombatPower: 8000,
          isBoss: false, rewardSpiritStones: 350, rewardCultivationPill: 8000,
          recommendRealmIndex: 1 },
        { level: 7, name: '毒瘴沼泽', enemyName: '蜈蚣精', enemyCombatPower: 20000,
          isBoss: false, rewardSpiritStones: 500, rewardCultivationPill: 15000,
          recommendRealmIndex: 1 },
        { level: 8, name: '熔岩地宫', enemyName: '火蜥蜴', enemyCombatPower: 50000,
          isBoss: false, rewardSpiritStones: 700, rewardCultivationPill: 30000,
          recommendRealmIndex: 1 },
        { level: 9, name: '寒冰秘境', enemyName: '冰魄妖', enemyCombatPower: 120000,
          isBoss: false, rewardSpiritStones: 1000, rewardCultivationPill: 60000,
          recommendRealmIndex: 1 },
        { level: 10, name: '🎭 天魔殿', enemyName: '天魔护法', enemyCombatPower: 300000,
          isBoss: true, rewardSpiritStones: 5000, rewardCultivationPill: 200000,
          recommendRealmIndex: 2 },

        // ====== 第二篇章：仙途险阻（11-22）======
        { level: 11, name: '落星原', enemyName: '星兽', enemyCombatPower: 500000,
          isBoss: false, rewardSpiritStones: 1500, rewardCultivationPill: 100000,
          recommendRealmIndex: 2 },
        { level: 12, name: '碧落天', enemyName: '雷鹰', enemyCombatPower: 1000000,
          isBoss: false, rewardSpiritStones: 2000, rewardCultivationPill: 250000,
          recommendRealmIndex: 2 },
        { level: 13, name: '紫霄宫外', enemyName: '守宫真人', enemyCombatPower: 2500000,
          isBoss: false, rewardSpiritStones: 3000, rewardCultivationPill: 500000,
          recommendRealmIndex: 2 },
        { level: 14, name: '忘川河', enemyName: '冥蛇', enemyCombatPower: 6000000,
          isBoss: false, rewardSpiritStones: 4500, rewardCultivationPill: 1200000,
          recommendRealmIndex: 3 },
        { level: 15, name: '鬼门关', enemyName: '鬼将', enemyCombatPower: 15000000,
          isBoss: false, rewardSpiritStones: 6500, rewardCultivationPill: 3000000,
          recommendRealmIndex: 3 },
        { level: 16, name: '幽冥殿', enemyName: '幽冥判官', enemyCombatPower: 38000000,
          isBoss: false, rewardSpiritStones: 9000, rewardCultivationPill: 8000000,
          recommendRealmIndex: 3 },
        { level: 17, name: '九天雷域', enemyName: '雷兽', enemyCombatPower: 90000000,
          isBoss: false, rewardSpiritStones: 13000, rewardCultivationPill: 20000000,
          recommendRealmIndex: 3 },
        { level: 18, name: '太虚幻境', enemyName: '幻魔', enemyCombatPower: 220000000,
          isBoss: false, rewardSpiritStones: 18000, rewardCultivationPill: 50000000,
          recommendRealmIndex: 4 },
        { level: 19, name: '混沌海', enemyName: '混沌巨兽', enemyCombatPower: 550000000,
          isBoss: false, rewardSpiritStones: 25000, rewardCultivationPill: 120000000,
          recommendRealmIndex: 4 },
        { level: 20, name: '天道之梯', enemyName: '天道守卫', enemyCombatPower: 1400000000,
          isBoss: false, rewardSpiritStones: 35000, rewardCultivationPill: 300000000,
          recommendRealmIndex: 4 },
        { level: 21, name: '仙界入口', enemyName: '仙人残影', enemyCombatPower: 3500000000,
          isBoss: false, rewardSpiritStones: 50000, rewardCultivationPill: 800000000,
          recommendRealmIndex: 4 },
        { level: 22, name: '🏆 飞升台', enemyName: '天道化身', enemyCombatPower: 9000000000,
          isBoss: true, rewardSpiritStones: 200000, rewardCultivationPill: 5000000000,
          recommendRealmIndex: 4 },
    ];

    static get(level: number): DungeonConfigItem {
        if (level < 1 || level > this.DATA.length) return this.DATA[0];
        return this.DATA[level - 1];
    }

    static get total(): number {
        return this.DATA.length;
    }

    /** 挑战消耗灵石 */
    static getChallengeCost(level: number): number {
        return Math.floor(100 * Math.pow(1.3, level - 1));
    }
}
