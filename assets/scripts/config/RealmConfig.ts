/**
 * 境界配置表
 * 5大境界 × 4小阶段 = 20个节点
 */
export interface RealmConfigItem {
    /** 境界名 如"练气初期" */
    name: string;
    /** 大境界名 如"练气" */
    realmName: string;
    /** 大境界索引 0-4 */
    realmIndex: number;
    /** 小阶段索引 0-3 */
    stageIndex: number;
    /** 突破到此境界所需修为 */
    cultivationRequired: number;
    /** 该境界基础战力 */
    baseCombatPower: number;
    /** 该境界基础修炼速度（修为/秒） */
    baseCultivationSpeed: number;
    /** 解锁功能描述，null表示无新功能 */
    unlockFeature: string | null;
}

export class RealmConfig {
    /** 所有境界配置，索引即境界序号 */
    static readonly DATA: RealmConfigItem[] = [
        // ====== 练气期（0-3）======
        { name: '练气初期', realmName: '练气', realmIndex: 0, stageIndex: 0,
          cultivationRequired: 1000, baseCombatPower: 100, baseCultivationSpeed: 10,
          unlockFeature: null },
        { name: '练气中期', realmName: '练气', realmIndex: 0, stageIndex: 1,
          cultivationRequired: 3000, baseCombatPower: 250, baseCultivationSpeed: 12,
          unlockFeature: null },
        { name: '练气后期', realmName: '练气', realmIndex: 0, stageIndex: 2,
          cultivationRequired: 9000, baseCombatPower: 600, baseCultivationSpeed: 15,
          unlockFeature: null },
        { name: '练气圆满', realmName: '练气', realmIndex: 0, stageIndex: 3,
          cultivationRequired: 27000, baseCombatPower: 1500, baseCultivationSpeed: 18,
          unlockFeature: '秘境' },

        // ====== 筑基期（4-7）======
        { name: '筑基初期', realmName: '筑基', realmIndex: 1, stageIndex: 0,
          cultivationRequired: 100000, baseCombatPower: 4000, baseCultivationSpeed: 25,
          unlockFeature: '炼丹' },
        { name: '筑基中期', realmName: '筑基', realmIndex: 1, stageIndex: 1,
          cultivationRequired: 250000, baseCombatPower: 10000, baseCultivationSpeed: 35,
          unlockFeature: null },
        { name: '筑基后期', realmName: '筑基', realmIndex: 1, stageIndex: 2,
          cultivationRequired: 625000, baseCombatPower: 25000, baseCultivationSpeed: 50,
          unlockFeature: null },
        { name: '筑基圆满', realmName: '筑基', realmIndex: 1, stageIndex: 3,
          cultivationRequired: 1562500, baseCombatPower: 60000, baseCultivationSpeed: 70,
          unlockFeature: '洞府' },

        // ====== 金丹期（8-11）======
        { name: '金丹初期', realmName: '金丹', realmIndex: 2, stageIndex: 0,
          cultivationRequired: 5000000, baseCombatPower: 150000, baseCultivationSpeed: 120,
          unlockFeature: '炼器' },
        { name: '金丹中期', realmName: '金丹', realmIndex: 2, stageIndex: 1,
          cultivationRequired: 15000000, baseCombatPower: 400000, baseCultivationSpeed: 200,
          unlockFeature: null },
        { name: '金丹后期', realmName: '金丹', realmIndex: 2, stageIndex: 2,
          cultivationRequired: 45000000, baseCombatPower: 1000000, baseCultivationSpeed: 350,
          unlockFeature: null },
        { name: '金丹圆满', realmName: '金丹', realmIndex: 2, stageIndex: 3,
          cultivationRequired: 135000000, baseCombatPower: 2500000, baseCultivationSpeed: 550,
          unlockFeature: '宗门' },

        // ====== 元婴期（12-15）======
        { name: '元婴初期', realmName: '元婴', realmIndex: 3, stageIndex: 0,
          cultivationRequired: 500000000, baseCombatPower: 6000000, baseCultivationSpeed: 900,
          unlockFeature: '灵兽' },
        { name: '元婴中期', realmName: '元婴', realmIndex: 3, stageIndex: 1,
          cultivationRequired: 1500000000, baseCombatPower: 15000000, baseCultivationSpeed: 1600,
          unlockFeature: null },
        { name: '元婴后期', realmName: '元婴', realmIndex: 3, stageIndex: 2,
          cultivationRequired: 4500000000, baseCombatPower: 38000000, baseCultivationSpeed: 2800,
          unlockFeature: null },
        { name: '元婴圆满', realmName: '元婴', realmIndex: 3, stageIndex: 3,
          cultivationRequired: 13500000000, baseCombatPower: 90000000, baseCultivationSpeed: 4800,
          unlockFeature: '飞升预告' },

        // ====== 化神期（16-19）======
        { name: '化神初期', realmName: '化神', realmIndex: 4, stageIndex: 0,
          cultivationRequired: 50000000000, baseCombatPower: 220000000, baseCultivationSpeed: 8000,
          unlockFeature: '转生' },
        { name: '化神中期', realmName: '化神', realmIndex: 4, stageIndex: 1,
          cultivationRequired: 150000000000, baseCombatPower: 550000000, baseCultivationSpeed: 14000,
          unlockFeature: null },
        { name: '化神后期', realmName: '化神', realmIndex: 4, stageIndex: 2,
          cultivationRequired: 450000000000, baseCombatPower: 1400000000, baseCultivationSpeed: 24000,
          unlockFeature: null },
        { name: '化神圆满', realmName: '化神', realmIndex: 4, stageIndex: 3,
          cultivationRequired: 1350000000000, baseCombatPower: 3500000000, baseCultivationSpeed: 40000,
          unlockFeature: '飞升' },
    ];

    /** 获取指定境界配置 */
    static get(index: number): RealmConfigItem {
        if (index < 0 || index >= this.DATA.length) {
            return this.DATA[0];
        }
        return this.DATA[index];
    }

    /** 是否为最高境界 */
    static isMaxRealm(index: number): boolean {
        return index >= this.DATA.length - 1;
    }

    /** 获取下一个境界的配置，null表示已是最高 */
    static getNext(index: number): RealmConfigItem | null {
        if (this.isMaxRealm(index)) return null;
        return this.DATA[index + 1];
    }

    /** 总境界数 */
    static get total(): number {
        return this.DATA.length;
    }
}
