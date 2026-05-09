import { _decorator, Component, Node, director, view, screen, UITransform, Widget, Canvas } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 游戏主控制器
 * 管理游戏生命周期、状态切换
 */
@ccclass('GameManager')
export class GameManager extends Component {

    // 游戏状态枚举
    public static GameState = {
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameOver',
    };

    private _currentState: string = GameManager.GameState.MENU;
    private _score: number = 0;

    public get currentState(): string {
        return this._currentState;
    }

    public get score(): number {
        return this._score;
    }

    onLoad() {
        // 适配抖音小游戏屏幕
        this.adaptScreen();
        // 进入菜单状态
        this.enterMenu();
    }

    /**
     * 屏幕适配 - 适配抖音小游戏各种分辨率
     */
    private adaptScreen(): void {
        const visibleSize = view.getVisibleSize();
        console.log(`[GameManager] 屏幕尺寸: ${visibleSize.width} x ${visibleSize.height}`);
    }

    /**
     * 进入菜单状态
     */
    public enterMenu(): void {
        this._currentState = GameManager.GameState.MENU;
        console.log('[GameManager] 进入菜单');
    }

    /**
     * 开始游戏
     */
    public startGame(): void {
        this._currentState = GameManager.GameState.PLAYING;
        this._score = 0;
        console.log('[GameManager] 游戏开始');
    }

    /**
     * 暂停游戏
     */
    public pauseGame(): void {
        if (this._currentState === GameManager.GameState.PLAYING) {
            this._currentState = GameManager.GameState.PAUSED;
            director.pause();
            console.log('[GameManager] 游戏暂停');
        }
    }

    /**
     * 恢复游戏
     */
    public resumeGame(): void {
        if (this._currentState === GameManager.GameState.PAUSED) {
            this._currentState = GameManager.GameState.PLAYING;
            director.resume();
            console.log('[GameManager] 游戏恢复');
        }
    }

    /**
     * 游戏结束
     */
    public gameOver(): void {
        this._currentState = GameManager.GameState.GAME_OVER;
        console.log(`[GameManager] 游戏结束，得分: ${this._score}`);
    }

    /**
     * 加分
     */
    public addScore(value: number = 1): void {
        this._score += value;
    }

    /**
     * 重新开始
     */
    public restart(): void {
        this.startGame();
    }

    update(deltaTime: number) {
        if (this._currentState !== GameManager.GameState.PLAYING) {
            return;
        }
        // 游戏主循环逻辑在这里扩展
    }
}
