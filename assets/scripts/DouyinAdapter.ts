import { _decorator, Component, sys, native } from 'cc';
const { ccclass } = _decorator;

/**
 * 抖音小游戏平台适配器
 * 处理抖音平台特有的 API：登录、分享、广告、振动等
 */
@ccclass('DouyinAdapter')
export class DouyinAdapter extends Component {

    private _isDouyin: boolean = false;
    private _systemInfo: any = null;

    onLoad() {
        this.detectPlatform();
        if (this._isDouyin) {
            this._systemInfo = tt.getSystemInfoSync();
            console.log(`[DouyinAdapter] 平台: ${this._systemInfo.platform}, 版本: ${this._systemInfo.version}`);
        }
    }

    /**
     * 检测是否在抖音小游戏环境
     */
    public detectPlatform(): boolean {
        this._isDouyin = typeof tt !== 'undefined';
        console.log(`[DouyinAdapter] 抖音环境: ${this._isDouyin}`);
        return this._isDouyin;
    }

    public get isDouyin(): boolean {
        return this._isDouyin;
    }

    /**
     * 抖音登录
     */
    public login(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this._isDouyin) {
                console.warn('[DouyinAdapter] 非抖音环境，跳过登录');
                resolve(null);
                return;
            }
            tt.login({
                success: (res: any) => {
                    console.log(`[DouyinAdapter] 登录成功: ${res.code}`);
                    resolve(res);
                },
                fail: (err: any) => {
                    console.error(`[DouyinAdapter] 登录失败:`, err);
                    reject(err);
                }
            });
        });
    }

    /**
     * 分享游戏
     */
    public share(title: string, imageUrl?: string): void {
        if (!this._isDouyin) return;
        tt.shareAppMessage({
            title,
            imageUrl: imageUrl || '',
        });
    }

    /**
     * 振动反馈
     */
    public vibrate(type: 'heavy' | 'medium' | 'light' = 'medium'): void {
        if (!this._isDouyin) return;
        if (type === 'heavy') {
            tt.vibrateLong({});
        } else {
            tt.vibrateShort({ type });
        }
    }

    /**
     * 展示插屏广告
     */
    public showInterstitialAd(adUnitId: string): void {
        if (!this._isDouyin) return;
        try {
            const ad = tt.createInterstitialAd({ adUnitId });
            ad.show();
        } catch (e) {
            console.error('[DouyinAdapter] 插屏广告失败:', e);
        }
    }

    /**
     * 创建激励视频广告
     */
    public createRewardedVideoAd(adUnitId: string): any {
        if (!this._isDouyin) return null;
        try {
            return tt.createRewardedVideoAd({ adUnitId });
        } catch (e) {
            console.error('[DouyinAdapter] 激励视频广告创建失败:', e);
            return null;
        }
    }
}

// 抖音小游戏全局 tt 对象声明
declare const tt: any;
