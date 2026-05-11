/**
 * 游戏数值常量
 * 所有硬编码数值集中管理，方便调优
 */
export class GameConstants {
    // ====== 修炼 ======
    /** 基础修炼速度（修为/秒） */
    static readonly BASE_CULTIVATION_SPEED = 10;
    /** 离线收益效率系数（相对在线） */
    static readonly OFFLINE_EFFICIENCY = 0.6;
    /** 离线最大计算时长（小时） */
    static readonly OFFLINE_MAX_HOURS = 8;
    /** 自动存档间隔（秒） */
    static readonly AUTO_SAVE_INTERVAL = 30;

    // ====== 突破 ======
    /** 前中期突破成功率 */
    static readonly BREAKTHROUGH_BASE_RATE = 1.0;
    /** 化神期突破需要丹药 */
    static readonly BREAKTHROUGH_NEED_PILL_REALM_INDEX = 16;
    /** 使用突破丹后的成功率 */
    static readonly BREAKTHROUGH_WITH_PILL_RATE = 0.8;

    // ====== 功法 ======
    /** 功法初始等级 */
    static readonly TECHNIQUE_INIT_LEVEL = 1;
    /** 功法等级上限（与境界挂钩，动态计算） */
    static readonly TECHNIQUE_MAX_LEVEL_BASE = 10;
    /** 功法升级基础灵石消耗 */
    static readonly TECHNIQUE_UPGRADE_BASE_COST = 500;
    /** 功法升级消耗系数 */
    static readonly TECHNIQUE_UPGRADE_COST_MULT = 1.5;

    // ====== 秘境 ======
    /** 挑战消耗灵石基数 */
    static readonly DUNGEON_CHALLENGE_COST = 100;
    /** 战力碾压判定系数（玩家战力 ≥ 敌人战力 × 此值则胜） */
    static readonly DUNGEON_WIN_RATIO = 0.8;
    /** 秘境总关卡数 */
    static readonly DUNGEON_TOTAL_LEVELS = 22;
    /** 秘境Boss关卡索引（第10关和第22关） */
    static readonly DUNGEON_BOSS_LEVELS = [10, 22];
    /** 胜利奖励灵石基数 */
    static readonly DUNGEON_REWARD_SPIRIT_STONES = 200;
    /** 胜利奖励修为丹（固定修为值） */
    static readonly DUNGEON_REWARD_CULTIVATION_PILL = 0; // 根据关卡动态计算

    // ====== 加速修炼（广告） ======
    /** 加速修炼获得的小时数 */
    static readonly SPEEDUP_HOURS = 2;
    /** 每日加速次数上限 */
    static readonly SPEEDUP_DAILY_LIMIT = 10;

    // ====== 广告兜底 ======
    /** 广告失败时给50%收益 */
    static readonly AD_FALLBACK_RATIO = 0.5;
}
