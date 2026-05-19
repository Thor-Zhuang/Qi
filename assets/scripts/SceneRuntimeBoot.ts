/**
 * 场景运行时引导：修复手写 scene JSON 导致的 MissingScript，
 * 并挂载 GameManager / UIManager，顺便按节点名绑定主界面引用。
 */
import { Button, Color, Component, director, Director, js, Label, Node, ProgressBar, Sprite, UITransform, Widget, resources, SpriteFrame } from 'cc';
import type { UIManager } from './UIManager';
import { buildExtendedUi } from './scene-ui-runtime';

const FLAG = '__QI_SCENE_RUNTIME_BOOT__';

// UI图片资源路径
const ASSETS = {
    background: 'textures/backgrounds/main_bg',
    ui: {
        panelBg: 'textures/ui/panel_bg',
        iconRealm: 'textures/ui/icon_realm',
        iconCultivation: 'textures/ui/icon_cultivation',
        progressFill: 'textures/ui/progress_fill',
        buttonGold: 'textures/ui/button_gold',
    },
};

// 加载失败的资源记录
const loadFailedSet: Set<string> = new Set();

function addUITransform(node: Node, w: number, h: number, anchorX = 0.5, anchorY = 0.5): UITransform {
    let ui = node.getComponent(UITransform);
    if (!ui) ui = node.addComponent(UITransform);
    ui.setContentSize(w, h);
    ui.anchorX = anchorX;
    ui.anchorY = anchorY;
    return ui;
}

/**
 * 加载Sprite图片（带缓存和纯色后备）
 */
function loadSprite(sprite: Sprite, path: string, fallbackColor?: Color): void {
    // 如果之前加载失败，直接使用后备色
    if (loadFailedSet.has(path)) {
        if (fallbackColor) {
            sprite.color = fallbackColor;
        }
        return;
    }

    // 先设置后备色
    if (fallbackColor) {
        sprite.color = fallbackColor;
    }

    resources.load(path, SpriteFrame, (err, spriteFrame) => {
        if (err || !spriteFrame) {
            console.warn(`[SceneRuntimeBoot] Failed to load: ${path}`);
            loadFailedSet.add(path);
            return;
        }
        sprite.spriteFrame = spriteFrame;
    });
}

function isPlaceholderMissingScript(comp: Component): boolean {
    const u = (comp as unknown as { __scriptAsset?: { uuid?: string } }).__scriptAsset?.uuid;
    return typeof u === 'string' && !u.includes('-');
}

function stripPlaceholderScripts(node: Node): void {
    for (const c of node.components) {
        const cn = js.getClassName(c);
        if (cn === 'cc.MissingScript' || isPlaceholderMissingScript(c)) {
            node.removeComponent(c);
        }
    }
}

function wireMainHud(uiRoot: Node, ui: UIManager): boolean {
    let panel = uiRoot.getChildByName('MainPanel');
    let needsExtendedRebuild = false;

    if (panel) {
        const btn = panel.getChildByName('BreakthroughBtn');
        const hasSprite = btn ? !!btn.getComponentInChildren(Sprite) : false;
        if (btn && !hasSprite) {
            panel.destroy();
            needsExtendedRebuild = true;
            panel.removeFromParent();
        }
    }

    if (!panel) {
        const oldPanels = ['TechniquePanel', 'DungeonPanel', 'ProfilePanel', 'TabBar', 'TechniquePickOverlay', 'MainPanel'];
        for (const name of oldPanels) {
            const oldPanel = uiRoot.getChildByName(name);
            if (oldPanel) {
                oldPanel.destroy();
                oldPanel.removeFromParent();
            }
        }
        panel = createMainPanel(uiRoot);
        needsExtendedRebuild = true;
    }

    const gl = (name: string, ctor: typeof Label | typeof ProgressBar | typeof Button) => {
        const n = panel!.getChildByName(name);
        return n ? n.getComponent(ctor) : null;
    };

    ui.realmLabel = gl('RealmLabel', Label);
    ui.cultivationLabel = gl('CultivationLabel', Label);
    ui.cultivationRateLabel = gl('CultivationRateLabel', Label);
    ui.combatPowerLabel = gl('CombatPowerLabel', Label);
    ui.spiritStonesLabel = gl('SpiritStonesLabel', Label);

    const barNode = panel.getChildByName('CultivationBar');
    if (barNode) {
        ui.cultivationBar = barNode.getComponent(ProgressBar);
    }

    ui.breakthroughBtn = gl('BreakthroughBtn', Button);
    ui.speedupBtn = gl('SpeedupBtn', Button);

    const bTxt = ui.breakthroughBtn?.node.getComponent(Label);
    if (bTxt) bTxt.string = '突破';
    const sTxt = ui.speedupBtn?.node.getComponent(Label);
    if (sTxt) sTxt.string = '加速';

    ui.mainPanel = panel;
    return needsExtendedRebuild;
}

/**
 * 创建精美的主面板
 */
function createMainPanel(uiRoot: Node): Node {
    const panel = new Node('MainPanel');
    addUITransform(panel, 750, 900);
    panel.setPosition(0, 60, 0);
    uiRoot.addChild(panel);

    // 面板背景
    const panelBg = new Node('PanelBg');
    addUITransform(panelBg, 700, 850);
    const panelBgSprite = panelBg.addComponent(Sprite);
    panelBgSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    panelBgSprite.color = new Color(25, 20, 40, 220); // 默认纯色
    loadSprite(panelBgSprite, ASSETS.ui.panelBg, new Color(25, 20, 40, 220));
    panelBg.setPosition(0, 0, 0);
    panel.insertChild(panelBg, 0);

    // 顶部区域
    createTopSection(panel);

    // 中部区域 - 修为进度
    createCultivationSection(panel);

    // 按钮区域
    createButtonsSection(panel);

    // 底部信息区域
    createInfoSection(panel);

    return panel;
}

/**
 * 创建顶部区域
 */
function createTopSection(panel: Node): void {
    // 境界图标
    const realmIconBg = new Node('RealmIconBg');
    addUITransform(realmIconBg, 80, 80);
    const realmIconBgSprite = realmIconBg.addComponent(Sprite);
    realmIconBgSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    realmIconBgSprite.color = new Color(138, 90, 200); // 默认紫色
    loadSprite(realmIconBgSprite, ASSETS.ui.iconRealm, new Color(138, 90, 200));
    realmIconBg.setPosition(-280, 360, 0);
    panel.addChild(realmIconBg);

    // 境界名称
    const realmLabel = new Node('RealmLabel');
    addUITransform(realmLabel, 180, 40);
    const realmLabelComp = realmLabel.addComponent(Label);
    realmLabelComp.string = '练气期';
    realmLabelComp.fontSize = 26;
    realmLabelComp.color = new Color(255, 215, 0);
    realmLabelComp.horizontalAlign = 0; // 左对齐，避免文字被裁切
    realmLabelComp.verticalAlign = 1;
    realmLabel.setPosition(-210, 360, 0);
    panel.addChild(realmLabel);

    // 战力标签
    const combatLabel = new Node('CombatPowerLabel');
    addUITransform(combatLabel, 180, 35);
    const combatLabelComp = combatLabel.addComponent(Label);
    combatLabelComp.string = '战力 0';
    combatLabelComp.fontSize = 18;
    combatLabelComp.color = new Color(220, 60, 60);
    combatLabelComp.horizontalAlign = 1;
    combatLabelComp.verticalAlign = 1;
    combatLabel.setPosition(100, 370, 0);
    panel.addChild(combatLabel);

    // 灵石标签
    const spiritLabel = new Node('SpiritStonesLabel');
    addUITransform(spiritLabel, 180, 35);
    const spiritLabelComp = spiritLabel.addComponent(Label);
    spiritLabelComp.string = '灵石 0';
    spiritLabelComp.fontSize = 18;
    spiritLabelComp.color = new Color(100, 150, 255);
    spiritLabelComp.horizontalAlign = 1;
    spiritLabelComp.verticalAlign = 1;
    spiritLabel.setPosition(200, 340, 0);
    panel.addChild(spiritLabel);
}

/**
 * 创建修为区域
 */
function createCultivationSection(panel: Node): void {
    // 修为图标
    const cultIcon = new Node('CultIcon');
    addUITransform(cultIcon, 80, 80);
    const cultIconSprite = cultIcon.addComponent(Sprite);
    cultIconSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    cultIconSprite.color = new Color(255, 215, 0); // 默认金色
    loadSprite(cultIconSprite, ASSETS.ui.iconCultivation, new Color(255, 215, 0));
    cultIcon.setPosition(-260, 230, 0);
    panel.addChild(cultIcon);

    // 修为标签
    const cultTitle = new Node('CultTitle');
    addUITransform(cultTitle, 200, 35);
    const cultTitleComp = cultTitle.addComponent(Label);
    cultTitleComp.string = '当前修为';
    cultTitleComp.fontSize = 16;
    cultTitleComp.color = new Color(180, 180, 180);
    cultTitleComp.horizontalAlign = 1;
    cultTitleComp.verticalAlign = 1;
    cultTitle.setPosition(0, 290, 0);
    panel.addChild(cultTitle);

    // 修为数值
    const cultLabel = new Node('CultivationLabel');
    addUITransform(cultLabel, 480, 55);
    const cultLabelComp = cultLabel.addComponent(Label);
    cultLabelComp.string = '0 / 100';
    cultLabelComp.fontSize = 38;
    cultLabelComp.color = new Color(255, 215, 0);
    cultLabelComp.horizontalAlign = 1;
    cultLabelComp.verticalAlign = 1;
    cultLabel.setPosition(0, 230, 0);
    panel.addChild(cultLabel);

    // 进度条背景
    const barBg = new Node('BarBg');
    addUITransform(barBg, 550, 28);
    const barBgSprite = barBg.addComponent(Sprite);
    barBgSprite.color = new Color(40, 35, 60, 255);
    barBg.setPosition(0, 150, 0);
    panel.addChild(barBg);

    // 进度条填充
    const barFill = new Node('BarFill');
    addUITransform(barFill, 540, 24);
    const barFillSprite = barFill.addComponent(Sprite);
    barFillSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    barFillSprite.color = new Color(255, 215, 0); // 默认金色
    loadSprite(barFillSprite, ASSETS.ui.progressFill, new Color(255, 215, 0));
    barFill.setPosition(-275, 150, 0);
    panel.addChild(barFill);

    // ProgressBar组件
    const bar = new Node('CultivationBar');
    addUITransform(bar, 540, 24);
    const progressBar = bar.addComponent(ProgressBar);
    progressBar.barSprite = barFillSprite;
    progressBar.mode = ProgressBar.Mode.HORIZONTAL;
    progressBar.progress = 0;
    bar.setPosition(-275, 150, 0);
    panel.addChild(bar);

    // 进度文字
    const rateLabel = new Node('CultivationRateLabel');
    addUITransform(rateLabel, 280, 30);
    const rateLabelComp = rateLabel.addComponent(Label);
    rateLabelComp.string = '+0/秒';
    rateLabelComp.fontSize = 16;
    rateLabelComp.color = new Color(100, 220, 120);
    rateLabelComp.horizontalAlign = 1;
    rateLabelComp.verticalAlign = 1;
    rateLabel.setPosition(0, 100, 0);
    panel.addChild(rateLabel);
}

/**
 * 创建按钮区域
 */
function createButtonsSection(panel: Node): void {
    const btnContainer = new Node('BtnContainer');
    addUITransform(btnContainer, 600, 80);
    btnContainer.setPosition(0, -20, 0);
    panel.addChild(btnContainer);

    // 突破按钮
    createMainButton(btnContainer, 'BreakthroughBtn', '突破', -140, ASSETS.ui.buttonGold, new Color(255, 215, 0));

    // 加速按钮
    createMainButton(btnContainer, 'SpeedupBtn', '加速', 140, ASSETS.ui.buttonGold, new Color(138, 90, 200));
}

/**
 * 创建主按钮
 */
function createMainButton(parent: Node, name: string, title: string, x: number, spritePath: string, fallbackColor: Color): Node {
    const btnNode = new Node(name);
    addUITransform(btnNode, 190, 58);
    const btn = btnNode.addComponent(Button);
    btn.transition = Button.Transition.COLOR;

    // 按钮背景
    const bg = new Node('Background');
    addUITransform(bg, 190, 58);
    const bgSprite = bg.addComponent(Sprite);
    bgSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    bgSprite.color = fallbackColor;
    loadSprite(bgSprite, spritePath, fallbackColor);
    bg.setPosition(0, 0, 0);
    btnNode.addChild(bg);

    // 按钮标签
    const label = new Node('Label');
    addUITransform(label, 170, 48);
    const labelComp = label.addComponent(Label);
    labelComp.string = title;
    labelComp.fontSize = 22;
    labelComp.color = Color.WHITE;
    labelComp.horizontalAlign = 1;
    labelComp.verticalAlign = 1;
    label.setPosition(0, 0, 0);
    btnNode.addChild(label);

    btn.target = bg;
    btn.normalColor = fallbackColor;
    btn.hoverColor = new Color(Math.min(fallbackColor.r + 30, 255), Math.min(fallbackColor.g + 30, 255), Math.min(fallbackColor.b + 30, 255));
    btn.pressedColor = new Color(fallbackColor.r * 0.7, fallbackColor.g * 0.7, fallbackColor.b * 0.7);

    btnNode.setPosition(x, 0, 0);
    parent.addChild(btnNode);

    return btnNode;
}

/**
 * 创建底部信息区域
 */
function createInfoSection(panel: Node): void {
    // 提示文字
    const tipLabel = new Node('TipLabel');
    addUITransform(tipLabel, 480, 30);
    const tipLabelComp = tipLabel.addComponent(Label);
    tipLabelComp.string = '修仙路漫漫，道心永不移';
    tipLabelComp.fontSize = 14;
    tipLabelComp.color = new Color(180, 180, 180);
    tipLabelComp.horizontalAlign = 1;
    tipLabelComp.verticalAlign = 1;
    tipLabel.setPosition(0, -120, 0);
    panel.addChild(tipLabel);
}

function boot(): void {
    if ((globalThis as Record<string, unknown>)[FLAG]) return;
    const scene = director.getScene();
    if (!scene) return;

    const canvas = scene.getChildByName('Canvas');
    if (!canvas) return;

    (globalThis as Record<string, unknown>)[FLAG] = true;

    void Promise.all([import('./GameManager'), import('./UIManager'), import('./ui/OfflinePopup'), import('./ui/BreakthroughPopup')]).then(([gmMod, uiMod, offlineMod, breakthroughMod]) => {
        const GameManagerCtor = gmMod.GameManager;
        const UIManagerCtor = uiMod.UIManager;
        const OfflinePopupCtor = offlineMod.OfflinePopup;
        const BreakthroughPopupCtor = breakthroughMod.BreakthroughPopup;

        const logic = canvas.getChildByName('GameLogic');
        if (logic) {
            stripPlaceholderScripts(logic);
            if (!logic.getComponent(GameManagerCtor)) {
                logic.addComponent(GameManagerCtor);
            }
        }

        const uiRoot = canvas.getChildByName('UIRoot');
        if (uiRoot) {
            stripPlaceholderScripts(uiRoot);
            let ui = uiRoot.getComponent(UIManagerCtor);
            if (!ui) {
                ui = uiRoot.addComponent(UIManagerCtor);
            }
            const needsExtendedRebuild = wireMainHud(uiRoot, ui);
            const uit = uiRoot.getComponent(UITransform);
            if (uit) {
                uit.setContentSize(750, 1334);
            }
            if (needsExtendedRebuild) {
                buildExtendedUi(uiRoot, ui);
            }
            ui.onRuntimeShellReady();

            let offlinePopup = uiRoot.getComponent(OfflinePopupCtor);
            if (!offlinePopup) {
                offlinePopup = uiRoot.addComponent(OfflinePopupCtor);
            }

            let breakthroughPopup = uiRoot.getComponent(BreakthroughPopupCtor);
            if (!breakthroughPopup) {
                breakthroughPopup = uiRoot.addComponent(BreakthroughPopupCtor);
            }
        }
    });
}

director.on(Director.EVENT_AFTER_SCENE_LAUNCH, boot);
