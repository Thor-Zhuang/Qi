/**
 * 全局事件总线 — 模块间解耦通信
 * 单例模式，全局唯一实例
 */
export class EventBus {
    private static _instance: EventBus | null = null;
    private _listeners: Map<string, Set<Function>> = new Map();

    public static get instance(): EventBus {
        if (!this._instance) {
            this._instance = new EventBus();
        }
        return this._instance;
    }

    private constructor() {}

    /** 监听事件 */
    public on(event: string, callback: Function): void {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, new Set());
        }
        this._listeners.get(event)!.add(callback);
    }

    /** 监听一次，触发后自动移除 */
    public once(event: string, callback: Function): void {
        const wrapper = (...args: any[]) => {
            this.off(event, wrapper);
            callback(...args);
        };
        this.on(event, wrapper);
    }

    /** 移除监听 */
    public off(event: string, callback: Function): void {
        const set = this._listeners.get(event);
        if (set) {
            set.delete(callback);
            if (set.size === 0) {
                this._listeners.delete(event);
            }
        }
    }

    /** 触发事件 */
    public emit(event: string, ...args: any[]): void {
        const set = this._listeners.get(event);
        if (set) {
            set.forEach(cb => {
                try {
                    cb(...args);
                } catch (e) {
                    console.error(`[EventBus] 事件 ${event} 回调异常:`, e);
                }
            });
        }
    }

    /** 移除某事件所有监听 */
    public offAll(event: string): void {
        this._listeners.delete(event);
    }

    /** 清空所有监听 */
    public clear(): void {
        this._listeners.clear();
    }
}

/** 全局事件名枚举 */
export enum GameEvent {
    // 修炼相关
    CULTIVATION_UPDATED = 'cultivation_updated',       // 修为变化
    CULTIVATION_PER_SEC_CHANGED = 'cultivation_per_sec_changed', // 修炼速度变化
    CAN_BREAKTHROUGH = 'can_breakthrough',             // 可突破
    BREAKTHROUGH_SUCCESS = 'breakthrough_success',     // 突破成功
    BREAKTHROUGH_FAILED = 'breakthrough_failed',       // 突破失败

    // 功法相关
    TECHNIQUE_CHANGED = 'technique_changed',           // 功法切换
    TECHNIQUE_UPGRADED = 'technique_upgraded',         // 功法升级

    // 秘境相关
    DUNGEON_CHALLENGE = 'dungeon_challenge',           // 挑战秘境
    DUNGEON_VICTORY = 'dungeon_victory',               // 秘境胜利
    DUNGEON_DEFEAT = 'dungeon_defeat',                 // 秘境失败

    // 资源相关
    SPIRIT_STONES_CHANGED = 'spirit_stones_changed',   // 灵石变化
    COMBAT_POWER_CHANGED = 'combat_power_changed',     // 战力变化

    // 离线相关
    OFFLINE_REWARD = 'offline_reward',                 // 离线奖励

    // 广告相关
    AD_REWARD_DOUBLE_OFFLINE = 'ad_reward_double_offline', // 广告翻倍离线
    AD_REWARD_SPEEDUP = 'ad_reward_speedup',           // 广告加速

    // 存档
    SAVE_REQUEST = 'save_request',                     // 请求存档
    SAVE_COMPLETE = 'save_complete',                   // 存档完成
}
