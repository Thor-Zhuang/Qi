import { _decorator, Component } from 'cc';
import { SaveManager } from '../core/SaveManager';
import { EventBus, GameEvent } from '../core/EventBus';
import { TechniqueConfig } from '../config/TechniqueConfig';
import { RealmConfig } from '../config/RealmConfig';
import { GameConstants } from '../config/GameConstants';

const { ccclass } = _decorator;

/**
 * 功法系统
 * 管理功法选择、升级、加成计算
 */
@ccclass('TechniqueSystem')
export class TechniqueSystem extends Component {
    private static _instance: TechniqueSystem | null = null;

    public static get instance(): TechniqueSystem {
        return this._instance!;
    }

    onLoad() {
        TechniqueSystem._instance = this;
    }

    /** 是否已选择功法 */
    public hasTechnique(): boolean {
        return SaveManager.instance.data.techniqueId >= 0;
    }

    /** 选择功法（只能选一次） */
    public selectTechnique(id: number): boolean {
        const data = SaveManager.instance.data;
        if (data.techniqueId >= 0) return false; // 已选择
        if (id < 0 || id >= TechniqueConfig.DATA.length) return false;

        data.techniqueId = id;
        data.techniqueLevel = 1;

        EventBus.instance.emit(GameEvent.TECHNIQUE_CHANGED, id);
        EventBus.instance.emit(GameEvent.CULTIVATION_PER_SEC_CHANGED);
        EventBus.instance.emit(GameEvent.COMBAT_POWER_CHANGED);
        return true;
    }

    /** 升级功法 */
    public upgradeTechnique(): boolean {
        const data = SaveManager.instance.data;
        if (data.techniqueId < 0) return false;

        const maxLevel = TechniqueConfig.getMaxLevel(data.realmIndex);
        if (data.techniqueLevel >= maxLevel) return false;

        const cost = TechniqueConfig.getUpgradeCost(data.techniqueLevel);
        if (data.spiritStones < cost) return false;

        data.spiritStones -= cost;
        data.techniqueLevel++;

        EventBus.instance.emit(GameEvent.TECHNIQUE_UPGRADED, data.techniqueLevel);
        EventBus.instance.emit(GameEvent.SPIRIT_STONES_CHANGED, data.spiritStones);
        EventBus.instance.emit(GameEvent.CULTIVATION_PER_SEC_CHANGED);
        EventBus.instance.emit(GameEvent.COMBAT_POWER_CHANGED);
        return true;
    }

    /** 获取当前功法配置 */
    public getCurrentTechnique() {
        const id = SaveManager.instance.data.techniqueId;
        return id >= 0 ? TechniqueConfig.get(id) : null;
    }

    /** 获取升级所需灵石 */
    public getUpgradeCost(): number {
        const data = SaveManager.instance.data;
        if (data.techniqueId < 0) return 0;
        return TechniqueConfig.getUpgradeCost(data.techniqueLevel);
    }

    /** 获取功法最大等级 */
    public getMaxLevel(): number {
        return TechniqueConfig.getMaxLevel(SaveManager.instance.data.realmIndex);
    }

    /** 能否升级 */
    public canUpgrade(): boolean {
        const data = SaveManager.instance.data;
        if (data.techniqueId < 0) return false;
        if (data.techniqueLevel >= TechniqueConfig.getMaxLevel(data.realmIndex)) return false;
        return data.spiritStones >= TechniqueConfig.getUpgradeCost(data.techniqueLevel);
    }
}
