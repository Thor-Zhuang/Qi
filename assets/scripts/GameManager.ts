import { _decorator, Component, director } from 'cc';
import { EventBus, GameEvent } from './core/EventBus';
import { SaveManager } from './core/SaveManager';
import { CultivationSystem } from './systems/CultivationSystem';
import { TechniqueSystem } from './systems/TechniqueSystem';
import { DungeonSystem } from './systems/DungeonSystem';
import { CombatCalculator, OfflineSystem } from './systems/CombatCalculator';

const { ccclass } = _decorator;

/**
 * 游戏主控制器
 * 初始化所有系统，管理游戏生命周期
 */
@ccclass('GameManager')
export class GameManager extends Component {

    onLoad() {
        console.log('[Qi] 炁 — 修仙挂机游戏启动');

        // 初始化存档
        const saveMgr = this.addComponent(SaveManager);
        saveMgr.loadGame();

        // 初始化各系统
        const cultivation = this.addComponent(CultivationSystem);
        const technique = this.addComponent(TechniqueSystem);
        const dungeon = this.addComponent(DungeonSystem);
        const combat = this.addComponent(CombatCalculator);
        const offline = this.addComponent(OfflineSystem);

        // 从存档恢复数据
        cultivation.initFromSave();
        combat.initFromSave();

        // 检查离线收益
        const offlineReward = offline.calcOfflineReward();
        if (offlineReward.duration > 0 && offlineReward.cultivation > 0) {
            // 延迟1帧，等UI准备好
            this.scheduleOnce(() => {
                EventBus.instance.emit(GameEvent.OFFLINE_REWARD, offlineReward.cultivation, offlineReward.duration, false);
            }, 0.1);
        }

        // 每日重置检查
        saveMgr.checkDailyReset();

        // 初始状态判断
        const data = saveMgr.data;
        if (data.techniqueId < 0) {
            // 新玩家，需要选功法
            console.log('[Qi] 新玩家，等待选择功法');
        }
    }

    /** 退出游戏 */
    public quitGame(): void {
        SaveManager.instance.saveGame();
    }
}
