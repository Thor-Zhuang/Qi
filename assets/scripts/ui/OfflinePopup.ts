import { _decorator, Component, Node, Label, Button, Sprite, Color, tween, Vec3, EventHandler } from 'cc';
import { EventBus, GameEvent } from '../core/EventBus';
import { OfflineSystem } from '../systems/OfflineSystem';
import { NumberUtils } from '../utils/NumberUtils';
import { TimeUtils } from '../utils/TimeUtils';
import { DouyinAdapter } from '../DouyinAdapter';

const { ccclass } = _decorator;

/**
 * 离线收益弹窗组件 - 纯文字风格
 */
@ccclass('OfflinePopup')
export class OfflinePopup extends Component {

    private _overlay: Node | null = null;
    private _panel: Node | null = null;
    private _rewardLabel: Label | null = null;
    private _durationLabel: Label | null = null;
    private _claimBtn: Node | null = null;
    private _doubleBtn: Node | null = null;

    private _pendingReward: number = 0;
    private _pendingDuration: number = 0;

    // 颜色配置
    private readonly COLORS = {
        gold: new Color(255, 215, 0),
        goldDark: new Color(200, 160, 0),
        red: new Color(220, 60, 60),
        redDark: new Color(160, 40, 40),
        white: new Color(255, 255, 255),
        gray: new Color(180, 180, 180),
        overlayBg: new Color(0, 0, 0, 180),
        panelBg: new Color(25, 20, 40, 250),
    };

    protected onLoad() {
        this._createUI();
        this._bindEvents();
    }

    protected onDestroy(): void {
        EventBus.instance.off(GameEvent.OFFLINE_REWARD, this._onOfflineReward, this);
    }

    private _createUI(): void {
        // 遮罩层
        this._overlay = new Node('OfflineOverlay');
        const overlayTrans = this._overlay.addComponent('cc.UITransform');
        overlayTrans.setContentSize(750, 1334);
        this._overlay.setPosition(0, 0, 0);
        this._overlay.active = false;
        this._overlay.zIndex = 999;
        this.node.addChild(this._overlay);

        // 点击遮罩关闭
        const bg = new Node('Bg');
        const bgTrans = bg.addComponent('cc.UITransform');
        bgTrans.setContentSize(750, 1334);
        bgTrans.anchorX = 0.5;
        bgTrans.anchorY = 0.5;
        const bgSprite = bg.addComponent(Sprite);
        bgSprite.color = this.COLORS.overlayBg;
        // 添加 Button 组件用于点击
        const bgBtn = bg.addComponent(Button);
        bgBtn.transition = Button.Transition.NONE;
        bgBtn.clickEvents.push(this._makeOverlayClickHandler());
        this._overlay.addChild(bg);

        // 弹窗主面板
        this._panel = new Node('Panel');
        const panelTrans = this._panel.addComponent('cc.UITransform');
        panelTrans.setContentSize(540, 480);
        this._panel.setPosition(0, 0, 0);
        this._overlay.addChild(this._panel);

        // 面板背景底色（确保有不透明底）
        const panelBgSprite = this._panel.addComponent(Sprite);
        panelBgSprite.sizeMode = Sprite.SizeMode.CUSTOM;
        panelBgSprite.color = this.COLORS.panelBg;

        // 边框装饰
        const border = new Node('Border');
        const borderTrans = border.addComponent('cc.UITransform');
        borderTrans.setContentSize(550, 490);
        borderTrans.anchorX = 0.5;
        borderTrans.anchorY = 0.5;
        const borderSprite = border.addComponent(Sprite);
        borderSprite.color = this.COLORS.gold;
        border.setPosition(0, 0, 0);
        border.setSiblingIndex(0);
        this._panel.addChild(border);

        // 弹窗前景背景（盖在边框内）
        const popupBg = new Node('PopupBg');
        const popupBgTrans = popupBg.addComponent('cc.UITransform');
        popupBgTrans.setContentSize(540, 480);
        popupBgTrans.anchorX = 0.5;
        popupBgTrans.anchorY = 0.5;
        const popupBgSprite = popupBg.addComponent(Sprite);
        popupBgSprite.sizeMode = Sprite.SizeMode.CUSTOM;
        popupBgSprite.color = this.COLORS.panelBg;
        popupBg.setPosition(0, 0, 0);
        popupBg.setSiblingIndex(1);
        this._panel.addChild(popupBg);
        popupBg.setPosition(0, 0, 0);
        this._panel.addChild(popupBg);

        // 标题
        const title = new Node('Title');
        const titleTrans = title.addComponent('cc.UITransform');
        titleTrans.setContentSize(250, 45);
        titleTrans.anchorX = 0.5;
        titleTrans.anchorY = 0.5;
        const titleLabel = title.addComponent(Label);
        titleLabel.string = '离线收益';
        titleLabel.fontSize = 32;
        titleLabel.horizontalAlign = 1;
        titleLabel.verticalAlign = 1;
        titleLabel.color = this.COLORS.gold;
        title.setPosition(0, 160, 0);
        this._panel.addChild(title);

        // 修为图标
        const cultIcon = new Node('CultIcon');
        const cultIconTrans = cultIcon.addComponent('cc.UITransform');
        cultIconTrans.setContentSize(80, 80);
        cultIconTrans.anchorX = 0.5;
        cultIconTrans.anchorY = 0.5;
        const cultIconSprite = cultIcon.addComponent(Sprite);
        cultIconSprite.sizeMode = Sprite.SizeMode.CUSTOM;
        cultIconSprite.color = this.COLORS.gold;
        cultIcon.setPosition(0, 80, 0);
        this._panel.addChild(cultIcon);

        // 离线时长
        this._durationLabel = this._createLabel('Duration', '离线 0小时', 20, 0, 20, this.COLORS.gray, 400);

        // 修为奖励数字
        this._rewardLabel = this._createLabel('Reward', '+0', 48, 0, -30, this.COLORS.gold, 400);

        // 修为单位
        const unit = new Node('RewardUnit');
        const unitTrans = unit.addComponent('cc.UITransform');
        unitTrans.setContentSize(150, 30);
        unitTrans.anchorX = 0.5;
        unitTrans.anchorY = 0.5;
        const unitLabel = unit.addComponent(Label);
        unitLabel.string = '修为';
        unitLabel.fontSize = 22;
        unitLabel.horizontalAlign = 1;
        unitLabel.verticalAlign = 1;
        unitLabel.color = this.COLORS.gray;
        unit.setPosition(0, -75, 0);
        this._panel.addChild(unit);

        // 按钮容器
        const btnContainer = new Node('BtnContainer');
        const btnContainerTrans = btnContainer.addComponent('cc.UITransform');
        btnContainerTrans.setContentSize(480, 80);
        btnContainerTrans.anchorX = 0.5;
        btnContainerTrans.anchorY = 0.5;
        btnContainer.setPosition(0, -170, 0);
        this._panel.addChild(btnContainer);

        // 普通领取按钮
        this._claimBtn = this._createStyledButton('领取', -110, this.COLORS.gold, this.COLORS.goldDark, false);
        btnContainer.addChild(this._claimBtn);

        // 看广告翻倍按钮
        this._doubleBtn = this._createStyledButton('看广告 x2', 110, this.COLORS.red, this.COLORS.redDark, true);
        btnContainer.addChild(this._doubleBtn);
    }

    /**
     * 创建样式化按钮
     */
    private _createStyledButton(title: string, x: number, color: Color, darkColor: Color, isDouble: boolean): Node {
        const btnNode = new Node('Btn');
        const btnTrans = btnNode.addComponent('cc.UITransform');
        btnTrans.setContentSize(170, 58);
        btnTrans.anchorX = 0.5;
        btnTrans.anchorY = 0.5;

        const btn = btnNode.addComponent(Button);
        btn.transition = Button.Transition.COLOR;

        // 按钮背景
        const bg = new Node('Background');
        const bgTrans = bg.addComponent('cc.UITransform');
        bgTrans.setContentSize(170, 58);
        bgTrans.anchorX = 0.5;
        bgTrans.anchorY = 0.5;

        const bgSprite = bg.addComponent(Sprite);
        bgSprite.sizeMode = Sprite.SizeMode.CUSTOM;
        bgSprite.color = color;
        bg.setPosition(0, 0, 0);
        btnNode.addChild(bg);

        // 按钮文字
        const label = new Node('Label');
        const labelTrans = label.addComponent('cc.UITransform');
        labelTrans.setContentSize(150, 48);
        labelTrans.anchorX = 0.5;
        labelTrans.anchorY = 0.5;

        const labelComp = label.addComponent(Label);
        labelComp.string = title;
        labelComp.fontSize = 20;
        labelComp.horizontalAlign = 1;
        labelComp.verticalAlign = 1;
        labelComp.color = Color.WHITE;
        label.setPosition(0, 0, 0);
        btnNode.addChild(label);

        btn.target = bg;
        btn.normalColor = color;
        btn.hoverColor = new Color(Math.min(color.r + 40, 255), Math.min(color.g + 40, 255), Math.min(color.b + 40, 255));
        btn.pressedColor = darkColor;
        btn.clickEvents.push(this._makeClickHandler(isDouble));

        btnNode.setPosition(x, 0, 0);
        return btnNode;
    }

    private _makeClickHandler(isDouble: boolean): import('cc').EventHandler {
        const handler = new EventHandler();
        handler.target = this.node;
        handler.component = 'OfflinePopup';
        handler.handler = '_onClaimClick';
        handler.customEventData = isDouble ? '1' : '0';
        return handler;
    }

    private _makeOverlayClickHandler(): import('cc').EventHandler {
        const handler = new EventHandler();
        handler.target = this.node;
        handler.component = 'OfflinePopup';
        handler.handler = '_onOverlayClick';
        handler.customEventData = '';
        return handler;
    }

    // 点击事件回调
    private _onClaimClick(event: Event, customData: string): void {
        const double = customData === '1';
        this._onClaim(double);
    }

    private _onOverlayClick(): void {
        this._hide();
    }

    private _createLabel(name: string, text: string, fontSize: number, x: number, y: number, color: Color, width = 400): Label {
        const n = new Node(name);
        const trans = n.addComponent('cc.UITransform');
        trans.setContentSize(width, fontSize + 16);
        trans.anchorY = 0.5;
        trans.anchorX = 0.5;
        const lb = n.addComponent(Label);
        lb.string = text;
        lb.fontSize = fontSize;
        lb.horizontalAlign = 1;
        lb.verticalAlign = 1;
        lb.color = color;
        n.setPosition(x, y, 0);
        this._panel.addChild(n);
        return lb;
    }

    private _bindEvents(): void {
        EventBus.instance.on(GameEvent.OFFLINE_REWARD, this._onOfflineReward, this);
    }

    private _onOfflineReward(cultivation: number, duration: number, doubled: boolean): void {
        if (doubled) return;

        this._pendingReward = cultivation;
        this._pendingDuration = duration;

        this._show();
    }

    private _show(): void {
        if (this._overlay) {
            this._overlay.active = true;
        }

        if (this._durationLabel) {
            const timeStr = TimeUtils.formatDuration(this._pendingDuration);
            this._durationLabel.string = `离线 ${timeStr}`;
        }

        if (this._rewardLabel) {
            this._rewardLabel.string = `+${NumberUtils.format(this._pendingReward)}`;
        }

        // 弹窗动画
        if (this._panel) {
            this._panel.setScale(0.3, 0.3, 1);
            tween(this._panel)
                .to(0.4, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
                .start();
        }
    }

    private _onClaim(double: boolean): void {
        if (double) {
            DouyinAdapter.instance?.showRewardedVideoAd(
                'YOUR_AD_UNIT_ID',
                () => {
                    OfflineSystem.instance.claimOfflineReward(true);
                    this._hide();
                },
                () => {
                    OfflineSystem.instance.claimOfflineReward(false);
                    this._hide();
                }
            );
        } else {
            OfflineSystem.instance.claimOfflineReward(false);
            this._hide();
        }
    }

    private _hide(): void {
        if (this._panel) {
            tween(this._panel)
                .to(0.25, { scale: new Vec3(0.8, 0.8, 1) })
                .call(() => {
                    if (this._overlay) {
                        this._overlay.active = false;
                    }
                    this._panel?.setScale(1, 1, 1);
                })
                .start();
        } else {
            if (this._overlay) {
                this._overlay.active = false;
            }
        }
    }
}
