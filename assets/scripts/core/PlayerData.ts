/**
 * 玩家运行时数据模型
 */
export interface PlayerData {
    /** 角色名 */
    name: string;
    /** 当前境界索引 0-19 */
    realmIndex: number;
    /** 当前修为 */
    cultivation: number;
    /** 当前功法ID */
    techniqueId: number;
    /** 功法等级 */
    techniqueLevel: number;
    /** 灵石 */
    spiritStones: number;
    /** 秘境已通关最高关卡（0=未开始，1=过了第1关） */
    dungeonProgress: number;
    /** 上次在线时间戳（秒） */
    lastOnlineTime: number;
    /** 总游戏时长（秒） */
    totalPlayTime: number;
    /** 今日已使用加速次数 */
    todaySpeedupCount: number;
    /** 今日日期标记（用于重置每日计数） */
    todayDateStr: string;
    /** 存档版本 */
    saveVersion: number;
}

/** 玩家数据工厂 — 创建默认新玩家 */
export class PlayerDataFactory {
    static create(name: string = '道友'): PlayerData {
        return {
            name,
            realmIndex: 0,
            cultivation: 0,
            techniqueId: -1, // -1表示尚未选择功法
            techniqueLevel: 1,
            spiritStones: 0,
            dungeonProgress: 0,
            lastOnlineTime: Math.floor(Date.now() / 1000),
            totalPlayTime: 0,
            todaySpeedupCount: 0,
            todayDateStr: new Date().toISOString().slice(0, 10),
            saveVersion: 1,
        };
    }
}
