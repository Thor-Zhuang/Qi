import { _decorator, Component } from 'cc';
import { SaveManager } from '../core/SaveManager';
import { EventBus, GameEvent } from '../core/EventBus';
import { DungeonConfig, DungeonConfigItem } from '../config/DungeonConfig';
import { CombatCalculator } from './CombatCalculator';
import { GameConstants } from '../config/GameConstants';

const { ccclass } = _decorator;

/**
 * 秘境系统
 * 关卡制，战力碾压判定
 */
@ccclass('DungeonSystem')
export class DungeonSystem extends Component {
    private static _instance: DungeonSystem | null = null;

    public static get instance(): DungeonSystem {
        return this._instance!;
    }

    onLoad() {
        DungeonSystem._instance = this;
    }

    /** 获取当前进度（已通关的最高关卡号） */
    public getProgress(): number {
        return SaveManager.instance.data.dungeonProgress;
    }

    /** 获取下一关配置，null表示已全部通关 */
    public getNextLevel(): DungeonConfigItem | null {
        const nextLevel = SaveManager.instance.data.dungeonProgress + 1;
        if (nextLevel > DungeonConfig.total) return null;
        return DungeonConfig.get(nextLevel);
    }

    /** 挑战秘境 */
    public challenge(): { victory: boolean; rewardStones: number; rewardPill: number; costStones: number } {
        const data = SaveManager.instance.data;
        const nextLevel = data.dungeonProgress + 1;

        if (nextLevel > DungeonConfig.total) {
            return { victory: false, rewardStones: 0, rewardPill: 0, costStones: 0 };
        }

        const dungeon = DungeonConfig.get(nextLevel);
        const cost = DungeonConfig.getChallengeCost(nextLevel);

        // 灵石不足
        if (data.spiritStones < cost) {
            return { victory: false, rewardStones: 0, rewardPill: 0, costStones: 0 };
        }

        // 扣除挑战费用
        data.spiritStones -= cost;
        EventBus.instance.emit(GameEvent.SPIRIT_STONES_CHANGED, data.spiritStones);

        // 战力判定
        const playerPower = CombatCalculator.instance.getCombatPower();
        const enemyPower = dungeon.enemyCombatPower;
        const victory = playerPower >= enemyPower * GameConstants.DUNGEON_WIN_RATIO;

        if (victory) {
            data.dungeonProgress = nextLevel;
            data.spiritStones += dungeon.rewardSpiritStones;
            EventBus.instance.emit(GameEvent.SPIRIT_STONES_CHANGED, data.spiritStones);
            EventBus.instance.emit(GameEvent.DUNGEON_VICTORY, nextLevel, dungeon);
        } else {
            EventBus.instance.emit(GameEvent.DUNGEON_DEFEAT, nextLevel, dungeon);
        }

        return {
            victory,
            rewardStones: victory ? dungeon.rewardSpiritStones : 0,
            rewardPill: victory ? dungeon.rewardCultivationPill : 0,
            costStones: cost,
        };
    }

    /** 能否挑战下一关 */
    public canChallenge(): boolean {
        const data = SaveManager.instance.data;
        const nextLevel = data.dungeonProgress + 1;
        if (nextLevel > DungeonConfig.total) return false;
        const cost = DungeonConfig.getChallengeCost(nextLevel);
        return data.spiritStones >= cost;
    }

    /** 是否已全部通关 */
    public isAllClear(): boolean {
        return SaveManager.instance.data.dungeonProgress >= DungeonConfig.total;
    }
}
