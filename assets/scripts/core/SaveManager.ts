import { _decorator, Component, sys } from 'cc';
import { PlayerData, PlayerDataFactory } from './PlayerData';
import { EventBus, GameEvent } from './EventBus';

const { ccclass } = _decorator;

/** 存档key */
const SAVE_KEY = 'qi_save';
const SAVE_VERSION = 1;

/**
 * 存档管理器
 * 本地存储 + 自动存档 + 离线时间记录
 */
@ccclass('SaveManager')
export class SaveManager extends Component {
    private static _instance: SaveManager | null = null;
    private _data: PlayerData | null = null;
    private _autoSaveTimer: number = 0;

    public static get instance(): SaveManager {
        return this._instance!;
    }

    public get data(): PlayerData {
        return this._data!;
    }

    onLoad() {
        SaveManager._instance = this;
        this.loadGame();
    }

    /** 加载存档 */
    public loadGame(): boolean {
        try {
            const raw = sys.localStorage.getItem(SAVE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as PlayerData;
                // 版本检查
                if (parsed.saveVersion === SAVE_VERSION) {
                    this._data = parsed;
                    console.log('[SaveManager] 存档加载成功');
                    return true;
                }
                // TODO: 版本迁移
            }
        } catch (e) {
            console.error('[SaveManager] 存档加载失败:', e);
        }

        // 无存档或损坏，创建新档
        this._data = PlayerDataFactory.create();
        console.log('[SaveManager] 创建新存档');
        return false;
    }

    /** 保存存档 */
    public saveGame(): void {
        if (!this._data) return;
        try {
            this._data.lastOnlineTime = Math.floor(Date.now() / 1000);
            const json = JSON.stringify(this._data);
            sys.localStorage.setItem(SAVE_KEY, json);
            EventBus.instance.emit(GameEvent.SAVE_COMPLETE);
        } catch (e) {
            console.error('[SaveManager] 存档保存失败:', e);
        }
    }

    /** 重置存档 */
    public resetGame(name?: string): void {
        this._data = PlayerDataFactory.create(name);
        sys.localStorage.removeItem(SAVE_KEY);
        this.saveGame();
    }

    /** 更新每日计数器 */
    public checkDailyReset(): void {
        if (!this._data) return;
        const today = new Date().toISOString().slice(0, 10);
        if (this._data.todayDateStr !== today) {
            this._data.todaySpeedupCount = 0;
            this._data.todayDateStr = today;
        }
    }

    update(dt: number) {
        // 自动存档
        this._autoSaveTimer += dt;
        if (this._autoSaveTimer >= 30) {
            this._autoSaveTimer = 0;
            this.saveGame();
        }

        // 累计游戏时长
        if (this._data) {
            this._data.totalPlayTime += dt;
        }
    }

    onDestroy() {
        this.saveGame();
    }
}
