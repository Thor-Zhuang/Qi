import { _decorator, Component } from 'cc';
import { SaveManager } from '../core/SaveManager';
import { CultivationSystem } from './CultivationSystem';
import { EventBus, GameEvent } from '../core/EventBus';
import { RealmConfig } from '../config/RealmConfig';
import { TechniqueConfig } from '../config/TechniqueConfig';
import { TimeUtils } from '../utils/TimeUtils';
import { GameConstants } from '../config/GameConstants';

const { ccclass } = _decorator;

/**
 * 战力计算器
 * 战力 = 境界基础 × 功法加成
 */
@ccclass('CombatCalculator')
export class CombatCalculator extends Component {
    private static _instance: CombatCalculator | null = null;
    private _combatPower: number = 0;

    public static get instance(): CombatCalculator {
        return this._instance!;
    }

    public get combatPower(): number {
        return this._combatPower;
    }

    onLoad() {
        CombatCalculator._instance = this;
        // 监听属性变化自动重算
        EventBus.instance.on(GameEvent.BREAKTHROUGH_SUCCESS, this.recalc, this);
        EventBus.instance.on(GameEvent.TECHNIQUE_CHANGED, this.recalc, this);
        EventBus.instance.on(GameEvent.TECHNIQUE_UPGRADED, this.recalc, this);
    }

    /** 初始化 */
    public initFromSave(): void {
        this.recalc();
    }

    /** 重算战力 */
    public recalc(): void {
        const data = SaveManager.instance.data;
        const realm = RealmConfig.get(data.realmIndex);
        let power = realm.baseCombatPower;

        // 功法战力加成
        if (data.techniqueId >= 0) {
            const tech = TechniqueConfig.get(data.techniqueId);
            const levelBonus = tech.bonusPerLevel * (data.techniqueLevel - 1);
            power *= (tech.combatBonus + levelBonus * 0.5);
        }

        this._combatPower = Math.floor(power);
        EventBus.instance.emit(GameEvent.COMBAT_POWER_CHANGED, this._combatPower);
    }

    public getCombatPower(): number {
        return this._combatPower;
    }
}

/**
 * 离线收益系统（合并到同文件，功能简单）
 */
@ccclass('OfflineSystem')
export class OfflineSystem extends Component {
    private static _instance: OfflineSystem | null = null;

    public static get instance(): OfflineSystem {
        return this._instance!;
    }

    onLoad() {
        OfflineSystem._instance = this;
    }

    /** 计算离线收益 */
    public calcOfflineReward(): { duration: number; cultivation: number } {
        const data = SaveManager.instance.data;
        const duration = TimeUtils.calcOfflineDuration(data.lastOnlineTime, GameConstants.OFFLINE_MAX_HOURS);

        if (duration <= 0) return { duration: 0, cultivation: 0 };

        // 离线修为 = 在线效率 × 系数 × 时长
        const realm = RealmConfig.get(data.realmIndex);
        let baseSpeed = realm.baseCultivationSpeed;

        // 功法加成
        if (data.techniqueId >= 0) {
            const tech = TechniqueConfig.get(data.techniqueId);
            baseSpeed *= tech.cultivationBonus;
        }

        const cultivation = baseSpeed * GameConstants.OFFLINE_EFFICIENCY * duration;

        return { duration, cultivation };
    }

    /** 领取离线收益 */
    public claimOfflineReward(double: boolean = false): number {
        const reward = this.calcOfflineReward();
        if (reward.cultivation <= 0) return 0;

        const amount = double ? reward.cultivation * 2 : reward.cultivation;
        CultivationSystem.instance.addCultivation(amount);
        EventBus.instance.emit(GameEvent.OFFLINE_REWARD, amount, reward.duration, double);
        return amount;
    }
}
