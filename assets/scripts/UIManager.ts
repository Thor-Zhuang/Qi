import { _decorator, Component, Label, Node, ProgressBar, Button, Color, tween, UITransform, Vec3, Event } from 'cc';
import { EventBus, GameEvent } from './core/EventBus';
import { SaveManager } from './core/SaveManager';
import { CultivationSystem } from './systems/CultivationSystem';
import { TechniqueSystem } from './systems/TechniqueSystem';
import { DungeonSystem } from './systems/DungeonSystem';
import { CombatCalculator } from './systems/CombatCalculator';
import { OfflineSystem } from './systems/OfflineSystem';
import { RealmConfig } from './config/RealmConfig';
import { TechniqueConfig } from './config/TechniqueConfig';
import { DungeonConfig } from './config/DungeonConfig';
import { NumberUtils } from './utils/NumberUtils';
import { TimeUtils } from './utils/TimeUtils';
import { GameConstants } from './config/GameConstants';

const { ccclass, property } = _decorator;

/**
 * UI管理器
 * 管理所有面板显示、数据绑定、按钮事件
 */
@ccclass('UIManager')
export class UIManager extends Component {

    // ====== 主界面元素 ======
    @property(Label)
    public realmLabel: Label | null = null;

    @property(Label)
    public cultivationLabel: Label | null = null;

    @property(Label)
    public cultivationRateLabel: Label | null = null;

    @property(Label)
    public combatPowerLabel: Label | null = null;

    @property(Label)
    public spiritStonesLabel: Label | null = null;

    @property(ProgressBar)
    public cultivationBar: ProgressBar | null = null;

    @property(Button)
    public breakthroughBtn: Button | null = null;

    @property(Button)
    public speedupBtn: Button | null = null;

    // ====== 面板 ======
    @property(Node)
    public mainPanel: Node | null = null;

    @property(Node)
    public techniquePanel: Node | null = null;

    @property(Node)
    public dungeonPanel: Node | null = null;

    @property(Node)
    public profilePanel: Node | null = null;

    @property(Node)
    public offlinePopup: Node | null = null;

    @property(Node)
    public breakthroughEffect: Node | null = null;

    // ====== 功法面板元素 ======
    @property(Label)
    public techNameLabel: Label | null = null;

    @property(Label)
    public techLevelLabel: Label | null = null;

    @property(Label)
    public techBonusLabel: Label | null = null;

    @property(Button)
    public techUpgradeBtn: Button | null = null;

    @property(Label)
    public techUpgradeCostLabel: Label | null = null;

    // ====== 秘境面板元素 ======
    @property(Label)
    public dungeonProgressLabel: Label | null = null;

    @property(Label)
    public dungeonEnemyLabel: Label | null = null;

    @property(Label)
    public dungeonEnemyPowerLabel: Label | null = null;

    @property(Button)
    public dungeonChallengeBtn: Button | null = null;

    // ====== 离线弹窗元素 ======
    @property(Label)
    public offlineDurationLabel: Label | null = null;

    @property(Label)
    public offlineRewardLabel: Label | null = null;

    @property(Button)
    public offlineClaimBtn: Button | null = null;

    @property(Button)
    public offlineDoubleBtn: Button | null = null;

    /** 个人面板（运行时装配时可赋值） */
    public profileRealmLabel: Label | null = null;
    public profileSpiritLabel: Label | null = null;
    public profileCombatLabel: Label | null = null;

    /** 选功法全屏层（运行时装配） */
    public techniquePickOverlay: Node | null = null;

    // ====== 内部状态 ======
    private _currentTab: number = 0;
    private _pendingOfflineReward: number = 0;
    private _pendingOfflineDuration: number = 0;

    protected onLoad() {
        this.bindEvents();
        this.bindButtons();
        // 不要在这里调用 switchTab(0)，由 onRuntimeShellReady 统一处理
    }

    /** 程序化绑定按钮（Prefab/场景未拖事件时仍可点击） */
    private bindButtons(): void {
        const hook = (btn: Button | null, handler: () => void) => {
            if (!btn) return;
            btn.node.off(Button.EventType.CLICK);
            btn.node.on(Button.EventType.CLICK, handler, this);
        };
        hook(this.breakthroughBtn, () => this.onBreakthroughClick());
        hook(this.speedupBtn, () => this.onSpeedupClick());
        hook(this.techUpgradeBtn, () => this.onTechUpgradeClick());
        hook(this.dungeonChallengeBtn, () => this.onDungeonChallengeClick());
        hook(this.offlineClaimBtn, () => this.onOfflineClaimClick());
        hook(this.offlineDoubleBtn, () => this.onOfflineDoubleClick());
    }

    /** Tab、选功法按钮等在运行时生成后调用 */
    public registerRuntimeTabs(buttons: Button[]): void {
        buttons.forEach((btn, i) => {
            btn.node.off(Button.EventType.CLICK);
            btn.node.on(Button.EventType.CLICK, () => this.switchTab(i), this);
        });
    }

    public registerTechniquePickButtons(buttons: Button[]): void {
        buttons.forEach((btn) => {
            btn.node.off(Button.EventType.CLICK);
            btn.node.on(Button.EventType.CLICK, () => {
                const techId = (btn.node as unknown as { __techniqueId?: string }).__techniqueId;
                if (techId !== undefined) {
                    const id = parseInt(techId, 10);
                    if (!isNaN(id)) {
                        this.onPickTechnique(id);
                    }
                }
            }, this);
        });
    }

    /** SceneRuntimeBoot 完成装配后刷新绑定与初始显示 */
    public onRuntimeShellReady(): void {
        this.bindButtons();
        this.refreshRealmHeader();
        this.switchTab(this._currentTab);
        if (TechniqueSystem.instance.hasTechnique()) {
            if (this.techniquePickOverlay) this.techniquePickOverlay.active = false;
        }
    }

    private refreshRealmHeader(): void {
        const data = SaveManager.instance.data;
        const realm = RealmConfig.get(data.realmIndex);
        if (this.realmLabel) this.realmLabel.string = realm.name;
        if (this.profileRealmLabel) this.profileRealmLabel.string = `境界 ${realm.name}`;
    }

    /** 新玩家选择功法 */
    public onPickTechnique(id: number): void {
        if (!TechniqueSystem.instance.selectTechnique(id)) return;
        SaveManager.instance.saveGame();
        if (this.techniquePickOverlay) this.techniquePickOverlay.active = false;
        this.switchTab(0);
        this.refreshRealmHeader();
        this.updateCultivationUI();
        this.updateRateUI();
        this.updateTechniqueUI();
        this.updateCombatPowerUI();
    }

    /** 功法选择按钮点击回调（供运行时 UI 事件调用） */
    public _onTechniquePickClick(event: Event, customData: string): void {
        const id = parseInt(customData, 10);
        if (!isNaN(id)) {
            this.onPickTechnique(id);
        }
    }

    /** 绑定全局事件 */
    private bindEvents(): void {
        const eb = EventBus.instance;

        eb.on(GameEvent.CULTIVATION_UPDATED, this.updateCultivationUI, this);
        eb.on(GameEvent.CULTIVATION_PER_SEC_CHANGED, this.updateRateUI, this);
        eb.on(GameEvent.CAN_BREAKTHROUGH, this.onCanBreakthrough, this);
        eb.on(GameEvent.BREAKTHROUGH_SUCCESS, this.onBreakthroughSuccess, this);
        eb.on(GameEvent.BREAKTHROUGH_FAILED, this.onBreakthroughFailed, this);
        eb.on(GameEvent.SPIRIT_STONES_CHANGED, this.updateSpiritStonesUI, this);
        eb.on(GameEvent.COMBAT_POWER_CHANGED, this.updateCombatPowerUI, this);
        eb.on(GameEvent.TECHNIQUE_CHANGED, this.updateTechniqueUI, this);
        eb.on(GameEvent.TECHNIQUE_UPGRADED, this.updateTechniqueUI, this);
        eb.on(GameEvent.DUNGEON_VICTORY, this.onDungeonResult, this);
        eb.on(GameEvent.DUNGEON_DEFEAT, this.onDungeonResult, this);
        eb.on(GameEvent.OFFLINE_REWARD, this.onOfflineReward, this);
    }

    // ====== Tab 切换 ======

    public switchTab(index: number): void {
        this._currentTab = index;
        this.setPanelActive(this.mainPanel, index === 0);
        this.setPanelActive(this.techniquePanel, index === 1);
        this.setPanelActive(this.dungeonPanel, index === 2);
        this.setPanelActive(this.profilePanel, index === 3);

        if (index === 1) this.updateTechniqueUI();
        if (index === 2) this.updateDungeonUI();
        if (index === 3) this.updateProfileUI();
    }

    // ====== 主界面更新 ======

    private updateCultivationUI(cultivation?: number): void {
        const sys = CultivationSystem.instance;
        if (!sys) return;

        const val = cultivation !== undefined ? cultivation : sys.cultivation;
        const nextReq = sys.getNextRealmRequired();

        if (this.cultivationLabel) {
            this.cultivationLabel.string = `${NumberUtils.format(val)} / ${NumberUtils.format(nextReq)}`;
        }

        if (this.cultivationBar) {
            this.cultivationBar.progress = sys.getProgress();
        }
    }

    private updateRateUI(rate?: number): void {
        const sys = CultivationSystem.instance;
        if (!sys) return;

        if (this.cultivationRateLabel) {
            this.cultivationRateLabel.string = NumberUtils.formatRate(sys.cultivationPerSec);
        }
    }

    private updateSpiritStonesUI(stones?: number): void {
        const data = SaveManager.instance.data;
        if (this.spiritStonesLabel) {
            this.spiritStonesLabel.string = NumberUtils.format(data.spiritStones);
        }
    }

    private updateCombatPowerUI(power?: number): void {
        const combat = CombatCalculator.instance;
        if (!combat) return;
        if (this.combatPowerLabel) {
            this.combatPowerLabel.string = `战力 ${NumberUtils.format(combat.combatPower)}`;
        }
    }

    // ====== 突破 ======

    private onCanBreakthrough(): void {
        if (this.breakthroughBtn) {
            this.breakthroughBtn.node.active = true;
            // 按钮闪烁效果
            this.pulseButton(this.breakthroughBtn);
        }
    }

    private onBreakthroughSuccess(realmIndex: number): void {
        this.refreshRealmHeader();
        this.updateCultivationUI();
        if (this.breakthroughBtn) {
            this.breakthroughBtn.node.active = false;
        }
        const realm = RealmConfig.get(realmIndex);
        this.playBreakthroughAnimation(realm.name);
    }

    private onBreakthroughFailed(): void {
        // TODO: 提示突破失败
        if (CC_DEBUG) {
            console.log('[UI] 突破失败！');
        }
    }

    /** 突破按钮点击 */
    public onBreakthroughClick(): void {
        CultivationSystem.instance.breakthrough();
    }

    /** 加速修炼按钮点击 */
    public onSpeedupClick(): void {
        // TODO: 调用广告SDK
        // 暂时直接给收益
        const sys = CultivationSystem.instance;
        const speedupCultivation = sys.cultivationPerSec * GameConstants.SPEEDUP_HOURS * 3600;
        sys.addCultivation(speedupCultivation);
    }

    // ====== 功法面板 ======

    private updateTechniqueUI(): void {
        const techSys = TechniqueSystem.instance;
        if (!techSys) return;

        const tech = techSys.getCurrentTechnique();
        const data = SaveManager.instance.data;

        if (this.techNameLabel) {
            this.techNameLabel.string = tech ? tech.name : '尚未修炼功法';
        }
        if (this.techLevelLabel) {
            const maxLv = techSys.getMaxLevel();
            this.techLevelLabel.string = tech ? `等级 ${data.techniqueLevel}/${maxLv}` : '';
        }
        if (this.techBonusLabel) {
            this.techBonusLabel.string = tech ? `修炼速度 +${Math.floor((tech.cultivationBonus - 1) * 100)}%` : '';
        }
        if (this.techUpgradeBtn) {
            this.techUpgradeBtn.interactable = techSys.canUpgrade();
        }
        if (this.techUpgradeCostLabel) {
            const cost = techSys.getUpgradeCost();
            this.techUpgradeCostLabel.string = cost > 0 ? `${NumberUtils.format(cost)} 灵石` : '';
        }
    }

    /** 功法升级按钮 */
    public onTechUpgradeClick(): void {
        TechniqueSystem.instance.upgradeTechnique();
    }

    /** 选择功法 */
    public onSelectTechnique(id: number): void {
        TechniqueSystem.instance.selectTechnique(id);
    }

    // ====== 秘境面板 ======

    private updateDungeonUI(): void {
        const dunSys = DungeonSystem.instance;
        if (!dunSys) return;

        const progress = dunSys.getProgress();
        const nextLevel = dunSys.getNextLevel();

        if (this.dungeonProgressLabel) {
            this.dungeonProgressLabel.string = `已通关 ${progress}/${DungeonConfig.total}关`;
        }

        if (nextLevel) {
            if (this.dungeonEnemyLabel) {
                this.dungeonEnemyLabel.string = `${nextLevel.name} — ${nextLevel.enemyName}`;
            }
            if (this.dungeonEnemyPowerLabel) {
                this.dungeonEnemyPowerLabel.string = `敌方战力 ${NumberUtils.format(nextLevel.enemyCombatPower)}`;
            }
            if (this.dungeonChallengeBtn) {
                this.dungeonChallengeBtn.interactable = dunSys.canChallenge();
            }
        } else {
            if (this.dungeonEnemyLabel) this.dungeonEnemyLabel.string = '已全部通关！';
            if (this.dungeonChallengeBtn) this.dungeonChallengeBtn.interactable = false;
        }
    }

    /** 秘境挑战按钮 */
    public onDungeonChallengeClick(): void {
        const result = DungeonSystem.instance.challenge();
        if (result.rewardPill > 0) {
            CultivationSystem.instance.addCultivation(result.rewardPill);
        }
    }

    private onDungeonResult(): void {
        this.updateDungeonUI();
        this.updateSpiritStonesUI();
    }

    // ====== 离线弹窗 ======

    private onOfflineReward(cultivation: number, duration: number, doubled: boolean): void {
        this._pendingOfflineReward = cultivation;
        this._pendingOfflineDuration = duration;

        if (this.offlinePopup) this.offlinePopup.active = true;
        if (this.offlineDurationLabel) {
            this.offlineDurationLabel.string = `离线 ${TimeUtils.formatDuration(duration)}`;
        }
        if (this.offlineRewardLabel) {
            this.offlineRewardLabel.string = `修为 +${NumberUtils.format(cultivation)}`;
        }
    }

    /** 领取离线奖励 */
    public onOfflineClaimClick(): void {
        OfflineSystem.instance.claimOfflineReward(false);
        if (this.offlinePopup) this.offlinePopup.active = false;
    }

    /** 看广告翻倍领取 */
    public onOfflineDoubleClick(): void {
        // TODO: 接入广告SDK
        OfflineSystem.instance.claimOfflineReward(true);
        if (this.offlinePopup) this.offlinePopup.active = false;
    }

    // ====== 个人面板 ======

    private updateProfileUI(): void {
        const data = SaveManager.instance.data;
        const realm = RealmConfig.get(data.realmIndex);
        const combat = CombatCalculator.instance;
        if (this.profileRealmLabel) this.profileRealmLabel.string = `境界 ${realm.name}`;
        if (this.profileSpiritLabel) this.profileSpiritLabel.string = `灵石 ${NumberUtils.format(data.spiritStones)}`;
        if (this.profileCombatLabel && combat) {
            this.profileCombatLabel.string = `战力 ${NumberUtils.format(combat.combatPower)}`;
        }
    }

    // ====== 动画 ======

    /** 按钮脉冲动画 */
    private pulseButton(btn: Button): void {
        if (!btn) return;
        tween(btn.node)
            .to(0.6, { scale: new Vec3(1.1, 1.1, 1) })
            .to(0.6, { scale: new Vec3(1, 1, 1) })
            .union()
            .repeatForever()
            .start();
    }

    /** 突破动画 */
    private playBreakthroughAnimation(realmName: string): void {
        if (this.breakthroughEffect) {
            this.breakthroughEffect.active = true;
            // 白光闪烁
            tween(this.breakthroughEffect)
                .to(0.3, { scale: new Vec3(1.5, 1.5, 1) })
                .to(0.5, { scale: new Vec3(1, 1, 1) })
                .call(() => {
                    this.breakthroughEffect!.active = false;
                })
                .start();
        }
        // 震屏
        if (this.node) {
            const origin = this.node.position.clone();
            tween(this.node)
                .by(0.02, { position: new Vec3(5, 0, 0) })
                .by(0.02, { position: new Vec3(-10, 0, 0) })
                .by(0.02, { position: new Vec3(10, 0, 0) })
                .by(0.02, { position: new Vec3(-5, 0, 0) })
                .start();
        }
    }

    // ====== 工具 ======

    private setPanelActive(panel: Node | null, active: boolean): void {
        if (panel) panel.active = active;
    }

    protected onDestroy(): void {
        const eb = EventBus.instance;
        eb.off(GameEvent.CULTIVATION_UPDATED, this.updateCultivationUI, this);
        eb.off(GameEvent.CULTIVATION_PER_SEC_CHANGED, this.updateRateUI, this);
        eb.off(GameEvent.CAN_BREAKTHROUGH, this.onCanBreakthrough, this);
        eb.off(GameEvent.BREAKTHROUGH_SUCCESS, this.onBreakthroughSuccess, this);
        eb.off(GameEvent.BREAKTHROUGH_FAILED, this.onBreakthroughFailed, this);
        eb.off(GameEvent.SPIRIT_STONES_CHANGED, this.updateSpiritStonesUI, this);
        eb.off(GameEvent.COMBAT_POWER_CHANGED, this.updateCombatPowerUI, this);
        eb.off(GameEvent.TECHNIQUE_CHANGED, this.updateTechniqueUI, this);
        eb.off(GameEvent.TECHNIQUE_UPGRADED, this.updateTechniqueUI, this);
        eb.off(GameEvent.DUNGEON_VICTORY, this.onDungeonResult, this);
        eb.off(GameEvent.DUNGEON_DEFEAT, this.onDungeonResult, this);
        eb.off(GameEvent.OFFLINE_REWARD, this.onOfflineReward, this);
    }

    update(dt: number) {
        // 每帧更新主界面修为数字
        if (this._currentTab === 0) {
            this.updateCultivationUI();
            this.updateSpiritStonesUI();
        }
    }
}
