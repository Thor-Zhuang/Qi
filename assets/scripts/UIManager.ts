import { _decorator, Component, Label, Node } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

/**
 * UI 管理器 - 管理所有 UI 面板的显示/隐藏
 */
@ccclass('UIManager')
export class UIManager extends Component {

    @property(Label)
    public scoreLabel: Label | null = null;

    @property(Node)
    public menuPanel: Node | null = null;

    @property(Node)
    public gamePanel: Node | null = null;

    @property(Node)
    public gameOverPanel: Node | null = null;

    private _gameManager: GameManager | null = null;

    onLoad() {
        this._gameManager = this.node.getComponent(GameManager);
        this.showMenu();
    }

    /**
     * 显示主菜单
     */
    public showMenu(): void {
        this.setPanelActive(this.menuPanel, true);
        this.setPanelActive(this.gamePanel, false);
        this.setPanelActive(this.gameOverPanel, false);
    }

    /**
     * 显示游戏界面
     */
    public showGame(): void {
        this.setPanelActive(this.menuPanel, false);
        this.setPanelActive(this.gamePanel, true);
        this.setPanelActive(this.gameOverPanel, false);
    }

    /**
     * 显示游戏结束界面
     */
    public showGameOver(score: number): void {
        this.setPanelActive(this.menuPanel, false);
        this.setPanelActive(this.gamePanel, false);
        this.setPanelActive(this.gameOverPanel, true);
        this.updateScore(score);
    }

    /**
     * 更新分数显示
     */
    public updateScore(score: number): void {
        if (this.scoreLabel) {
            this.scoreLabel.string = `${score}`;
        }
    }

    /**
     * 开始按钮回调
     */
    public onStartButtonClick(): void {
        if (this._gameManager) {
            this._gameManager.startGame();
            this.showGame();
        }
    }

    /**
     * 重新开始按钮回调
     */
    public onRestartButtonClick(): void {
        if (this._gameManager) {
            this._gameManager.restart();
            this.showGame();
        }
    }

    private setPanelActive(panel: Node | null, active: boolean): void {
        if (panel) {
            panel.active = active;
        }
    }
}
