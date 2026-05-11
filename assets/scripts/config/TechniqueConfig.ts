/**
 * 功法配置表
 * 3本功法，3种成长流派
 */
export interface TechniqueConfigItem {
    /** 功法ID */
    id: number;
    /** 功法名 */
    name: string;
    /** 功法描述 */
    description: string;
    /** 品质颜色 hex */
    qualityColor: string;
    /** 品质名 */
    qualityName: string;
    /** 基础修炼速度加成倍率 */
    cultivationBonus: number;
    /** 每级额外加成 */
    bonusPerLevel: number;
    /** 特殊效果描述 */
    specialEffect: string;
    /** 战力加成系数 */
    combatBonus: number;
}

export class TechniqueConfig {
    static readonly DATA: TechniqueConfigItem[] = [
        {
            id: 0,
            name: '踏雪无痕',
            description: '以身法入道，暴击率极高，修炼速度中上',
            qualityColor: '#ff6b6b',
            qualityName: '玄品',
            cultivationBonus: 1.5,
            bonusPerLevel: 0.15,
            specialEffect: '暴击修炼：每10秒有30%概率获得双倍修为',
            combatBonus: 1.2,
        },
        {
            id: 1,
            name: '太乙真经',
            description: '厚积薄发，修炼速度最稳，后期极强',
            qualityColor: '#4ecdc4',
            qualityName: '地品',
            cultivationBonus: 2.0,
            bonusPerLevel: 0.2,
            specialEffect: '持续增长：每在线1小时修炼速度+5%，上限+50%',
            combatBonus: 1.0,
        },
        {
            id: 2,
            name: '混元功',
            description: '道法自然，攻守兼备，全面发展',
            qualityColor: '#ffe66d',
            qualityName: '黄品',
            cultivationBonus: 1.3,
            bonusPerLevel: 0.1,
            specialEffect: '均衡之道：修炼速度+30%，战力额外+20%',
            combatBonus: 1.4,
        },
    ];

    static get(id: number): TechniqueConfigItem {
        if (id < 0 || id >= this.DATA.length) return this.DATA[0];
        return this.DATA[id];
    }

    /** 功法升级到指定等级所需灵石 */
    static getUpgradeCost(currentLevel: number): number {
        const base = 500;
        const mult = 1.5;
        return Math.floor(base * Math.pow(mult, currentLevel - 1));
    }

    /** 功法最大等级（与境界挂钩） */
    static getMaxLevel(realmIndex: number): number {
        return 10 + realmIndex * 5;
    }
}
