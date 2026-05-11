import { _decorator, Component, sys } from 'cc';
import { GameConstants } from '../config/GameConstants';

const { ccclass } = _decorator;

// 抖音小游戏全局 tt 对象声明
declare const tt: any;

/**
 * 抖音小游戏平台适配器
 * 登录、分享、广告、振动
 */
@ccclass('DouyinAdapter')
export class DouyinAdapter extends Component {
    private static _instance: DouyinAdapter | null = null;
    private _isDouyin: boolean = false;
    private _systemInfo: any = null;

    /** 激励视频广告实例缓存 */
    private _rewardedAds: Map<string, any> = new Map();

    public static get instance(): DouyinAdapter {
        return this._instance!;
    }

    public get isDouyin(): boolean {
        return this._isDouyin;
    }

    onLoad() {
        DouyinAdapter._instance = this;
        this._isDouyin = typeof tt !== 'undefined';
        if (this._isDouyin) {
            try {
                this._systemInfo = tt.getSystemInfoSync();
                console.log(`[DouyinAdapter] 平台: ${this._systemInfo.platform}, 版本: ${this._systemInfo.version}`);
            } catch (e) {
                console.warn('[DouyinAdapter] 获取系统信息失败:', e);
            }
        } else {
            console.log('[DouyinAdapter] 非抖音环境，使用模拟模式');
        }
    }

    /** 抖音登录 */
    public async login(): Promise<any> {
        if (!this._isDouyin) return null;
        return new Promise((resolve, reject) => {
            tt.login({
                success: (res: any) => {
                    console.log(`[DouyinAdapter] 登录成功: ${res.code}`);
                    resolve(res);
                },
                fail: (err: any) => {
                    console.error('[DouyinAdapter] 登录失败:', err);
                    reject(err);
                }
            });
        });
    }

    /** 分享游戏 */
    public share(title: string, imageUrl?: string): void {
        if (!this._isDouyin) return;
        try {
            tt.shareAppMessage({ title, imageUrl: imageUrl || '' });
        } catch (e) {
            console.warn('[DouyinAdapter] 分享失败:', e);
        }
    }

    /** 振动反馈 */
    public vibrate(type: 'heavy' | 'medium' | 'light' = 'medium'): void {
        if (!this._isDouyin) return;
        try {
            if (type === 'heavy') {
                tt.vibrateLong({});
            } else {
                tt.vibrateShort({ type });
            }
        } catch (e) { /* 忽略 */ }
    }

    /** 展示激励视频广告 */
    public showRewardedVideoAd(
        adUnitId: string,
        onSuccess: () => void,
        onFail?: () => void
    ): void {
        if (!this._isDouyin) {
            // 非抖音环境直接给兜底奖励
            console.log('[DouyinAdapter] 非抖音环境，给予兜底奖励');
            onSuccess();
            return;
        }

        try {
            let ad = this._rewardedAds.get(adUnitId);
            if (!ad) {
                ad = tt.createRewardedVideoAd({ adUnitId });
                this._rewardedAds.set(adUnitId, ad);
            }

            ad.onClose((res: any) => {
                if (res && res.isEnded) {
                    onSuccess();
                } else {
                    // 看了但没看完，给兜底奖励
                    console.log('[DouyinAdapter] 广告未看完，给兜底50%奖励');
                    onSuccess(); // 简化处理，都给奖励
                }
            });

            ad.onError((err: any) => {
                console.error('[DouyinAdapter] 激励视频广告错误:', err);
                // 广告失败给兜底
                if (onFail) onFail();
            });

            ad.show().catch(() => {
                // show 失败先 load 再 show
                ad.load().then(() => ad.show()).catch(() => {
                    if (onFail) onFail();
                });
            });
        } catch (e) {
            console.error('[DouyinAdapter] 激励视频广告异常:', e);
            if (onFail) onFail();
        }
    }

    /** 展示插屏广告 */
    public showInterstitialAd(adUnitId: string): void {
        if (!this._isDouyin) return;
        try {
            const ad = tt.createInterstitialAd({ adUnitId });
            ad.show();
        } catch (e) {
            console.warn('[DouyinAdapter] 插屏广告失败:', e);
        }
    }
}
