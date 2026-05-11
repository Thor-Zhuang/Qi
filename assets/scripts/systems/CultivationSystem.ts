import { _decorator, Component } from 'cc';
import { SaveManager } from '../core/SaveManager';
import { EventBus, GameEvent } from '../core/EventBus';
import { RealmConfig } from '../config/RealmConfig';
import { TechniqueConfig } from '../config/TechniqueConfig';
import { GameConstants } from '../config/GameConstants';

const { ccclass } = _decorator;

/**
 * 修炼系统
 * 每秒自动产出修为，修为满后可突破
 */
@ccclass('CultivationSystem')
export class CultivationSystem extends Component {
    private static _instance: CultivationSystem | null = null;

    /** 当前修为 */
    private _cultivation: number = 0;
    /** 修炼速度（修为/秒） */
    private _cultivationPerSec: number = 0;
    /** 当前境界索引 */
    private _realmIndex: number = 0;
    /** 是否可突破 */
    private _canBreakthrough: boolean = false;

    /** 暴击修炼相关 */
    private _critTimer: number = 0;
    private _critChance: number = 0; // 踏雪无痕的暴击概率

    /** 太乙真经持续增长相关 */
    private _onlineHours: number = 0;
    private _sustainedBonus: number = 0;

    public static get instance(): CultivationSystem {
        return this._instance!;
    }

    public get cultivation(): number {
        return this._cultivation;
    }

    public get cultivationPerSec(): number {
        return this._cultivationPerSec;
    }

    public get realmIndex(): number {
        return this._realmIndex;
    }

    public get canBreakthrough(): boolean {
        return this._canBreakthrough;
    }

    onLoad() {
        CultivationSystem._instance = this;
    }

    /** 从存档初始化 */
    public initFromSave(): void {
        const data = SaveManager.instance.data;
        this._cultivation = data.cultivation;
        this._realmIndex = data.realmIndex;
        this.recalcCultivationSpeed();
        this.checkBreakthrough();
    }

    /** 重新计算修炼速度 */
    public recalcCultivationSpeed(): void {
        const realm = RealmConfig.get(this._realmIndex);
        let speed = realm.baseCultivationSpeed;

        // 功法加成
        const data = SaveManager.instance.data;
        if (data.techniqueId >= 0) {
            const tech = TechniqueConfig.get(data.techniqueId);
            const levelBonus = tech.bonusPerLevel * (data.techniqueLevel - 1);
            speed *= (tech.cultivationBonus + levelBonus);

            // 踏雪无痕暴击
            if (data.techniqueId === 0) {
                this._critChance = 0.3;
            } else {
                this._critChance = 0;
            }

            // 太乙真经持续增长
            if (data.techniqueId === 1) {
                this._sustainedBonus = Math.min(this._onlineHours * 0.05, 0.5);
                speed *= (1 + this._sustainedBonus);
            }

            // 混元功均衡加成
            if (data.techniqueId === 2) {
                speed *= 1.3;
            }
        }

        this._cultivationPerSec = speed;
        EventBus.instance.emit(GameEvent.CULTIVATION_PER_SEC_CHANGED, this._cultivationPerSec);
    }

    /** 增加修为（外部调用，如离线收益/秘境奖励） */
    public addCultivation(amount: number): void {
        this._cultivation += amount;
        SaveManager.instance.data.cultivation = this._cultivation;
        EventBus.instance.emit(GameEvent.CULTIVATION_UPDATED, this._cultivation);
        this.checkBreakthrough();
    }

    /** 检查是否可突破 */
    public checkBreakthrough(): void {
        if (RealmConfig.isMaxRealm(this._realmIndex)) {
            this._canBreakthrough = false;
            return;
        }
        const nextRealm = RealmConfig.getNext(this._realmIndex);
        if (nextRealm && this._cultivation >= nextRealm.cultivationRequired) {
            if (!this._canBreakthrough) {
                this._canBreakthrough = true;
                EventBus.instance.emit(GameEvent.CAN_BREAKTHROUGH);
            }
        } else {
            this._canBreakthrough = false;
        }
    }

    /** 突破 */
    public breakthrough(): boolean {
        if (!this._canBreakthrough) return false;
        if (RealmConfig.isMaxRealm(this._realmIndex)) return false;

        const nextRealm = RealmConfig.getNext(this._realmIndex)!;

        // 化神期需要突破丹
        if (this._realmIndex >= GameConstants.BREAKTHROUGH_NEED_PILL_REALM_INDEX) {
            // TODO: 检查是否有突破丹
            // 暂时简化：80%成功率
            if (Math.random() > GameConstants.BREAKTHROUGH_WITH_PILL_RATE) {
                EventBus.instance.emit(GameEvent.BREAKTHROUGH_FAILED);
                return false;
            }
        }

        // 突破成功
        this._cultivation -= nextRealm.cultivationRequired;
        this._realmIndex++;
        this._canBreakthrough = false;

        // 更新存档
        const data = SaveManager.instance.data;
        data.realmIndex = this._realmIndex;
        data.cultivation = this._cultivation;

        this.recalcCultivationSpeed();
        this.checkBreakthrough();

        EventBus.instance.emit(GameEvent.BREAKTHROUGH_SUCCESS, this._realmIndex);
        EventBus.instance.emit(GameEvent.COMBAT_POWER_CHANGED);

        return true;
    }

    /** 获取当前修为进度 0-1 */
    public getProgress(): number {
        if (RealmConfig.isMaxRealm(this._realmIndex)) return 1;
        const nextRealm = RealmConfig.getNext(this._realmIndex);
        if (!nextRealm) return 1;
        return Math.min(this._cultivation / nextRealm.cultivationRequired, 1);
    }

    /** 获取下一境界修为需求 */
    public getNextRealmRequired(): number {
        const next = RealmConfig.getNext(this._realmIndex);
        return next ? next.cultivationRequired : 0;
    }

    update(dt: number) {
        if (this._cultivationPerSec <= 0) return;

        // 累计在线时长（太乙真经用）
        this._onlineHours += dt / 3600;

        // 修为增长
        let gain = this._cultivationPerSec * dt;

        // 暴击修炼（踏雪无痕）
        if (this._critChance > 0) {
            this._critTimer += dt;
            if (this._critTimer >= 10) {
                this._critTimer = 0;
                if (Math.random() < this._critChance) {
                    gain *= 2; // 暴击双倍
                }
            }
        }

        this.addCultivation(gain);
    }
}
