/**
 * 运行时拼装 Tab / 子面板 / 选功法遮罩
 */
import {
    Button,
    Color,
    Label,
    Node,
    Sprite,
    UITransform,
    Widget,
    Overflow,
    HorizontalTextAlignment,
    VerticalTextAlignment,
    ProgressBar,
    EventHandler,
    director,
} from 'cc';
import { UIManager } from './UIManager';
import { TechniqueConfig } from './config/TechniqueConfig';
import { TechniqueSystem } from './systems/TechniqueSystem';

const DESIGN_W = 750;
const DESIGN_H = 1334;

// 修仙风格颜色配置
const COLORS = {
    gold: new Color(255, 215, 0),
    goldDark: new Color(200, 160, 0),
    purple: new Color(138, 90, 200),
    purpleDark: new Color(100, 60, 160),
    white: new Color(255, 255, 255),
    gray: new Color(180, 180, 180),
    red: new Color(220, 60, 60),
    blue: new Color(100, 150, 255),
    green: new Color(100, 220, 120),
    panelBg: new Color(25, 20, 40, 220),
};

// UI图片资源路径（保留供将来使用）
// const ASSET_PATHS = { ... };

function addUITransform(node: Node, w: number, h: number, anchorX = 0.5, anchorY = 0.5): UITransform {
    let ui = node.getComponent(UITransform);
    if (!ui) ui = node.addComponent(UITransform);
    ui.setContentSize(w, h);
    ui.anchorX = anchorX;
    ui.anchorY = anchorY;
    return ui;
}

/**
 * 创建修仙风格标签
 */
function makeLabel(parent: Node, name: string, text: string, size: number, y: number, w = 600, color: Color = COLORS.white): Label {
    const n = new Node(name);
    addUITransform(n, w, size + 20);
    const lb = n.addComponent(Label);
    lb.string = text;
    lb.fontSize = size;
    lb.lineHeight = size + 6;
    lb.overflow = Overflow.SHRINK;
    lb.horizontalAlign = HorizontalTextAlignment.CENTER;
    lb.verticalAlign = VerticalTextAlignment.CENTER;
    lb.color = color;
    n.setPosition(0, y, 0);
    parent.addChild(n);
    return lb;
}

/**
 * 创建修仙风格面板标题
 */
function makePanelTitle(parent: Node, name: string, text: string, y: number): Label {
    return makeLabel(parent, name, text, 28, y, 500, COLORS.gold);
}

/**
 * 创建修仙风格按钮
 */
function makeButton(parent: Node, name: string, title: string, y: number, w = 260, h = 52, color: Color = COLORS.purple, handler?: (idx: number) => void, customData?: string): Button {
    const n = new Node(name);
    addUITransform(n, w, h);
    const btn = n.addComponent(Button);
    btn.transition = Button.Transition.COLOR;
    btn.normalColor = color;
    btn.hoverColor = new Color(Math.min(color.r + 30, 255), Math.min(color.g + 30, 255), Math.min(color.b + 30, 255));
    btn.pressedColor = new Color(color.r * 0.7, color.g * 0.7, color.b * 0.7);

    // 按钮背景
    const bg = new Node('Background');
    addUITransform(bg, w, h);
    bg.setPosition(0, 0, 0);
    const bgSprite = bg.addComponent(Sprite);
    bgSprite.type = Sprite.Type.SLICED;
    bgSprite.color = color; // 使用纯色
    n.addChild(bg);

    // 按钮顶部高光
    const highlight = new Node('Highlight');
    addUITransform(highlight, w - 10, 4);
    const hlSprite = highlight.addComponent(Sprite);
    hlSprite.color = new Color(255, 255, 255, 80);
    highlight.setPosition(0, h/2 - 6, 0);
    n.addChild(highlight);

    // 标签
    const lt = new Node('Label');
    addUITransform(lt, w - 20, h - 8);
    const lab = lt.addComponent(Label);
    lab.string = title;
    lab.fontSize = 20;
    lab.horizontalAlign = HorizontalTextAlignment.CENTER;
    lab.verticalAlign = VerticalTextAlignment.CENTER;
    lab.color = COLORS.white;
    lt.setPosition(0, 0, 0);
    n.addChild(lt);

    btn.target = bg;

    // 添加点击事件 - 如果提供了 customData，则添加事件处理器
    if (customData !== undefined) {
        const clickHandler = new EventHandler();
        clickHandler.target = _uiManagerNode;
        clickHandler.component = 'UIManager';
        clickHandler.handler = '_onTechniquePickClick';
        clickHandler.customEventData = customData;
        btn.clickEvents.push(clickHandler);

        // 同时使用 node.on('click') 绑定直接回调
        n.on('click', () => {
            const id = parseInt(customData, 10);
            if (!isNaN(id)) {
                // 尝试从 _uiManagerNode 获取 UIManager
                let ui: UIManager | null = null;
                if (_uiManagerNode) {
                    ui = _uiManagerNode.getComponent('UIManager') as UIManager;
                }
                // 备用：从 GameLogic 获取
                if (!ui) {
                    const gameLogic = director.getScene()?.getChildByName('GameLogic');
                    if (gameLogic) {
                        ui = gameLogic.getComponent('UIManager') as UIManager;
                    }
                }
                if (ui && ui.onPickTechnique) {
                    ui.onPickTechnique(id);
                    console.log(`[scene-ui-runtime] Clicked technique: ${id}`);
                }
            }
        });
    }

    n.setPosition(0, y, 0);
    parent.addChild(n);
    return btn;
}

// 用于按钮事件绑定的节点引用
let _uiManagerNode: Node | null = null;
function setUiManagerNode(node: Node) { _uiManagerNode = node; }

/**
 * 创建带背景的面板
 */
function createStyledPanel(parent: Node, name: string, w: number, h: number, y: number, fallbackColor?: Color): Node {
    const panel = new Node(name);
    addUITransform(panel, w, h);

    // 面板背景
    const bg = new Node('Bg');
    addUITransform(bg, w, h);
    const bgSprite = bg.addComponent(Sprite);
    bgSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    bgSprite.color = fallbackColor || COLORS.panelBg;
    bg.setPosition(0, 0, 0);
    panel.addChild(bg);

    // 顶部装饰线
    const topLine = new Node('TopLine');
    addUITransform(topLine, w - 40, 3);
    const topLineSprite = topLine.addComponent(Sprite);
    topLineSprite.color = COLORS.gold;
    topLine.setPosition(0, h/2 - 20, 0);
    panel.addChild(topLine);

    // 底部装饰线
    const bottomLine = new Node('BottomLine');
    addUITransform(bottomLine, w - 40, 3);
    const bottomLineSprite = bottomLine.addComponent(Sprite);
    bottomLineSprite.color = COLORS.gold;
    bottomLine.setPosition(0, -h/2 + 20, 0);
    panel.addChild(bottomLine);

    // 四个角装饰
    const cornerPositions = [
        { x: -w/2 + 15, y: h/2 - 15 },
        { x: w/2 - 15, y: h/2 - 15 },
        { x: -w/2 + 15, y: -h/2 + 15 },
        { x: w/2 - 15, y: -h/2 + 15 },
    ];
    cornerPositions.forEach((pos, i) => {
        const corner = new Node(`Corner${i}`);
        addUITransform(corner, 12, 12);
        const cornerSprite = corner.addComponent(Sprite);
        cornerSprite.color = COLORS.gold;
        corner.setPosition(pos.x, pos.y, 0);
        panel.addChild(corner);
    });

    panel.setPosition(0, y, 0);
    parent.addChild(panel);
    return panel;
}

export function buildExtendedUi(uiRoot: Node, ui: UIManager): void {
    if (uiRoot.getChildByName('TechniquePanel')) return;

    // 设置 UI 管理器节点引用，用于按钮事件
    setUiManagerNode(uiRoot);

    // 背景
    let bg = uiRoot.getChildByName('RuntimeBg');
    if (!bg) {
        bg = new Node('RuntimeBg');
        const transform = bg.addComponent(UITransform);
        transform.setContentSize(DESIGN_W, DESIGN_H);
        transform.anchorX = 0.5;
        transform.anchorY = 0.5;
        bg.setPosition(0, 0, 0);
        bg.setSiblingIndex(0);

        const sprite = bg.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        sprite.color = new Color(30, 20, 50, 255); // 深紫色背景

        uiRoot.addChild(bg);
    }

    if (uiRoot.getChildByName('TechniquePanel')) return;

    // ========== 功法面板 ==========
    const techniquePanel = createStyledPanel(uiRoot, 'TechniquePanel', 620, 780, 60, COLORS.panelBg);
    techniquePanel.active = false;

    makePanelTitle(techniquePanel, 'TechPanelTitle', '功法修炼', 330);

    // 功法图标
    const techIconBg = new Node('TechIconBg');
    addUITransform(techIconBg, 90, 90);
    const techIconBgSprite = techIconBg.addComponent(Sprite);
    techIconBgSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    techIconBgSprite.color = COLORS.goldDark;
    techIconBg.setPosition(0, 260, 0);
    techniquePanel.addChild(techIconBg);

    // 功法信息区
    const techInfoY = 180;
    makeLabel(techniquePanel, 'TechName', '', 26, techInfoY, 550, COLORS.gold);
    makeLabel(techniquePanel, 'TechLevel', '', 20, techInfoY - 45, 550, COLORS.white);
    makeLabel(techniquePanel, 'TechBonus', '', 18, techInfoY - 90, 550, COLORS.green);
    makeLabel(techniquePanel, 'TechUpgradeCost', '', 18, techInfoY - 135, 550, COLORS.gray);

    // 升级按钮
    const techUpgradeBtn = makeButton(techniquePanel, 'TechUpgradeBtn', '升级功法', techInfoY - 210, 280, 55, COLORS.gold);

    // ========== 秘境面板 ==========
    const dungeonPanel = createStyledPanel(uiRoot, 'DungeonPanel', 620, 780, 60, COLORS.panelBg);
    dungeonPanel.active = false;

    makePanelTitle(dungeonPanel, 'DungeonTitle', '秘境探险', 330);

    // 秘境图标
    const dungeonIconBg = new Node('DungeonIconBg');
    addUITransform(dungeonIconBg, 90, 90);
    const dungeonIconBgSprite = dungeonIconBg.addComponent(Sprite);
    dungeonIconBgSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    dungeonIconBgSprite.color = COLORS.redDark;
    dungeonIconBg.setPosition(0, 260, 0);
    dungeonPanel.addChild(dungeonIconBg);

    // 秘境信息区
    const dungeonInfoY = 180;
    makeLabel(dungeonPanel, 'DungeonProgress', '', 22, dungeonInfoY, 550, COLORS.white);
    makeLabel(dungeonPanel, 'DungeonEnemy', '', 24, dungeonInfoY - 55, 550, COLORS.red);
    makeLabel(dungeonPanel, 'DungeonEnemyPower', '', 20, dungeonInfoY - 100, 550, COLORS.gray);

    // 挑战按钮
    const dungeonChallengeBtn = makeButton(dungeonPanel, 'DungeonChallengeBtn', '挑战BOSS', dungeonInfoY - 185, 280, 55, COLORS.red);

    // ========== 个人面板 ==========
    const profilePanel = createStyledPanel(uiRoot, 'ProfilePanel', 620, 780, 60, COLORS.panelBg);
    profilePanel.active = false;

    makePanelTitle(profilePanel, 'ProfileTitle', '修仙者档案', 330);

    // 角色图标
    const profileCharBg = new Node('CharBg');
    addUITransform(profileCharBg, 180, 260);
    const charBgSprite = profileCharBg.addComponent(Sprite);
    charBgSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    charBgSprite.color = COLORS.purpleDark;
    profileCharBg.setPosition(0, 110, 0);
    profilePanel.addChild(profileCharBg);

    // 角色信息
    const profileInfoY = -80;
    makeLabel(profilePanel, 'ProfileRealm', '', 24, profileInfoY, 550, COLORS.gold);
    makeLabel(profilePanel, 'ProfileSpirit', '', 22, profileInfoY - 45, 550, COLORS.blue);
    makeLabel(profilePanel, 'ProfileCombat', '', 22, profileInfoY - 90, 550, COLORS.green);

    // ========== 底部Tab栏 ==========
    const tabBar = new Node('TabBar');
    addUITransform(tabBar, DESIGN_W, 95);
    tabBar.setPosition(0, -DESIGN_H / 2 + 63, 0);
    const widget = tabBar.addComponent(Widget);
    widget.isAlignBottom = true;
    widget.bottom = 0;
    widget.isAlignHorizontalCenter = true;
    widget.horizontalCenter = 0;
    widget.alignMode = 2;
    uiRoot.addChild(tabBar);

    // Tab背景
    const tabBarBg = new Node('TabBarBg');
    addUITransform(tabBarBg, DESIGN_W, 95);
    const tabBarSprite = tabBarBg.addComponent(Sprite);
    tabBarSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    tabBarSprite.color = new Color(30, 25, 50, 200);
    tabBarBg.setPosition(0, 0, 0);
    tabBar.addChild(tabBarBg);

    // Tab顶部装饰线
    const tabTopLine = new Node('TabTopLine');
    addUITransform(tabTopLine, DESIGN_W, 3);
    const tabLineSprite = tabTopLine.addComponent(Sprite);
    tabLineSprite.color = COLORS.gold;
    tabTopLine.setPosition(0, 45, 0);
    tabBar.addChild(tabTopLine);

    const tabNames = ['修炼', '功法', '秘境', '我的'];
    const tabIconColors = [COLORS.gold, COLORS.goldDark, COLORS.red, COLORS.purple];
    const tabBtns: Button[] = [];
    const gap = 155;
    const startX = -(tabNames.length - 1) * (gap / 2);

    for (let i = 0; i < tabNames.length; i++) {
        const b = makeTabButton(tabBar, `Tab${i}`, tabNames[i], tabIconColors[i], startX + i * gap);
        tabBtns.push(b);
    }

    // ========== 选功法遮罩 ==========
    const pick = new Node('TechniquePickOverlay');
    pick.active = false;
    addUITransform(pick, DESIGN_W, DESIGN_H);
    pick.setPosition(0, 0, 0);

    // 遮罩背景
    const pickBg = new Node('PickBg');
    addUITransform(pickBg, DESIGN_W, DESIGN_H);
    const pickBgSprite = pickBg.addComponent(Sprite);
    pickBgSprite.color = new Color(0, 0, 0, 200);
    pickBg.setPosition(0, 0, 0);
    pick.addChild(pickBg);

    // 选功法面板
    const pickPanel = createStyledPanel(pick, 'PickPanel', 580, 680, 0, COLORS.panelBg);

    makePanelTitle(pickPanel, 'PickTitle', '选择功法', 290);
    makeLabel(pickPanel, 'PickSubtitle', '仅可选择一次，请谨慎选择', 16, 245, 500, COLORS.gray);

    // 功法选项
    const pickBtns: Button[] = [];
    let py = 150;
    for (let i = 0; i < TechniqueConfig.DATA.length; i++) {
        const item = TechniqueConfig.DATA[i];

        // 功法选项卡片
        const card = new Node(`PickCard${i}`);
        addUITransform(card, 500, 90);
        const cardSprite = card.addComponent(Sprite);
        cardSprite.color = COLORS.purpleDark;
        card.setPosition(0, py, 0);
        pickPanel.addChild(card);

        // 功法图标
        const itemIcon = new Node(`PickIcon${i}`);
        addUITransform(itemIcon, 55, 55);
        const itemIconSprite = itemIcon.addComponent(Sprite);
        itemIconSprite.sizeMode = Sprite.SizeMode.CUSTOM;
        itemIconSprite.color = COLORS.gold;
        itemIcon.setPosition(-195, 0, 0);
        card.addChild(itemIcon);

        // 功法名称
        const itemName = new Node(`PickName${i}`);
        addUITransform(itemName, 180, 32);
        const itemNameLabel = itemName.addComponent(Label);
        itemNameLabel.string = item.name;
        itemNameLabel.fontSize = 22;
        itemNameLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        itemNameLabel.verticalAlign = VerticalTextAlignment.CENTER;
        itemNameLabel.color = COLORS.gold;
        itemName.setPosition(-100, 12, 0);
        card.addChild(itemName);

        // 品质标签
        const qualityLabel = new Node(`PickQuality${i}`);
        addUITransform(qualityLabel, 90, 26);
        const qualityLabelComp = qualityLabel.addComponent(Label);
        qualityLabelComp.string = item.qualityName;
        qualityLabelComp.fontSize = 14;
        qualityLabelComp.horizontalAlign = HorizontalTextAlignment.CENTER;
        qualityLabelComp.verticalAlign = VerticalTextAlignment.CENTER;
        qualityLabelComp.color = getQualityColor(item.quality);
        qualityLabel.setPosition(-100, -18, 0);
        card.addChild(qualityLabel);

        // 选择按钮
        const btn = makeButton(card, `PickBtn${i}`, '选择', 0, 110, 42, COLORS.gold, undefined, String(i));
        btn.node.setPosition(160, 0, 0);
        pickBtns.push(btn);

        // 描述文字 - 放在卡片下方，相对于卡片定位
        const desc = new Node(`PickDesc${i}`);
        addUITransform(desc, 500, 22);
        const descLabel = desc.addComponent(Label);
        descLabel.string = item.description;
        descLabel.fontSize = 12;
        descLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        descLabel.verticalAlign = VerticalTextAlignment.CENTER;
        descLabel.color = COLORS.gray;
        descLabel.overflow = Overflow.SHRINK;
        // 描述放在卡片下方
        desc.setPosition(0, py - 70, 0);
        pickPanel.addChild(desc);

        py -= 140;
    }

    uiRoot.addChild(pick);

    // ========== 绑定UI引用 ==========
    ui.mainPanel = uiRoot.getChildByName('MainPanel');
    ui.techniquePanel = techniquePanel;
    ui.dungeonPanel = dungeonPanel;
    ui.profilePanel = profilePanel;
    ui.techniquePickOverlay = pick;

    // 功法面板引用
    ui.techNameLabel = techniquePanel.getChildByName('TechName')!.getComponent(Label)!;
    ui.techLevelLabel = techniquePanel.getChildByName('TechLevel')!.getComponent(Label)!;
    ui.techBonusLabel = techniquePanel.getChildByName('TechBonus')!.getComponent(Label)!;
    ui.techUpgradeCostLabel = techniquePanel.getChildByName('TechUpgradeCost')!.getComponent(Label)!;
    ui.techUpgradeBtn = techniquePanel.getChildByName('TechUpgradeBtn')!.getComponent(Button)!;

    // 秘境面板引用
    ui.dungeonProgressLabel = dungeonPanel.getChildByName('DungeonProgress')!.getComponent(Label)!;
    ui.dungeonEnemyLabel = dungeonPanel.getChildByName('DungeonEnemy')!.getComponent(Label)!;
    ui.dungeonEnemyPowerLabel = dungeonPanel.getChildByName('DungeonEnemyPower')!.getComponent(Label)!;
    ui.dungeonChallengeBtn = dungeonPanel.getChildByName('DungeonChallengeBtn')!.getComponent(Button)!;

    // 个人面板引用
    const prRealm = profilePanel.getChildByName('ProfileRealm')!.getComponent(Label)!;
    const prSpirit = profilePanel.getChildByName('ProfileSpirit')!.getComponent(Label)!;
    const prCombat = profilePanel.getChildByName('ProfileCombat')!.getComponent(Label)!;
    ui.profileRealmLabel = prRealm;
    ui.profileSpiritLabel = prSpirit;
    ui.profileCombatLabel = prCombat;

    ui.registerRuntimeTabs(tabBtns);
    ui.registerTechniquePickButtons(pickBtns);

    // 检查是否需要显示功法选择界面
    const hasTech = TechniqueSystem.instance?.hasTechnique() ?? false;
    pick.active = !hasTech;
    console.log(`[scene-ui-runtime] pick.active = ${pick.active}, hasTechnique = ${hasTech}`);
}

/**
 * 创建Tab按钮
 */
function makeTabButton(parent: Node, name: string, title: string, iconColor: Color, x: number): Button {
    const n = new Node(name);
    addUITransform(n, 115, 75);
    const btn = n.addComponent(Button);
    btn.transition = Button.Transition.COLOR;
    btn.normalColor = new Color(0, 0, 0, 0);
    btn.hoverColor = new Color(50, 40, 80, 200);
    btn.pressedColor = new Color(40, 30, 60, 200);

    // 按钮背景
    const bg = new Node('Background');
    addUITransform(bg, 115, 75);
    const bgSprite = bg.addComponent(Sprite);
    bgSprite.color = new Color(0, 0, 0, 0);
    n.addChild(bg);

    // 图标
    const icon = new Node('Icon');
    addUITransform(icon, 32, 32);
    icon.setPosition(0, 10, 0);
    const iconSprite = icon.addComponent(Sprite);
    iconSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    iconSprite.color = iconColor;
    n.addChild(icon);

    // 标签
    const lt = new Node('Label');
    addUITransform(lt, 95, 26);
    const lab = lt.addComponent(Label);
    lab.string = title;
    lab.fontSize = 14;
    lab.horizontalAlign = HorizontalTextAlignment.CENTER;
    lab.verticalAlign = VerticalTextAlignment.CENTER;
    lab.color = COLORS.gray;
    lt.setPosition(0, -16, 0);
    n.addChild(lt);

    btn.target = bg;
    n.setPosition(x, 0, 0);
    parent.addChild(n);

    return btn;
}

/**
 * 根据品质获取颜色
 */
function getQualityColor(quality: number): Color {
    switch (quality) {
        case 1: return new Color(100, 200, 100);
        case 2: return new Color(100, 150, 255);
        case 3: return new Color(180, 100, 255);
        case 4: return new Color(255, 200, 100);
        case 5: return new Color(255, 100, 100);
        default: return COLORS.gray;
    }
}
