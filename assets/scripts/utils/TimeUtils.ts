/**
 * 时间工具 — 离线时长计算、格式化
 */
export class TimeUtils {
    /** 每秒毫秒数 */
    public static readonly MS_PER_SEC = 1000;
    /** 每分钟毫秒数 */
    public static readonly MS_PER_MIN = 60 * 1000;
    /** 每小时毫秒数 */
    public static readonly MS_PER_HOUR = 3600 * 1000;

    /** 获取当前时间戳（秒） */
    public static now(): number {
        return Math.floor(Date.now() / this.MS_PER_SEC);
    }

    /** 获取当前时间戳（毫秒） */
    public static nowMs(): number {
        return Date.now();
    }

    /**
     * 计算离线时长（秒）
     * @param lastOnlineTime 上次在线时间戳（秒）
     * @param maxHours 最大离线计算小时数
     */
    public static calcOfflineDuration(lastOnlineTime: number, maxHours: number = 8): number {
        const now = this.now();
        const diff = now - lastOnlineTime;
        const maxSeconds = maxHours * 3600;
        // 至少离线5秒才算
        if (diff < 5) return 0;
        return Math.min(diff, maxSeconds);
    }

    /** 格式化时长 "2小时35分" */
    public static formatDuration(seconds: number): string {
        if (seconds < 60) return `${Math.floor(seconds)}秒`;
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return mins > 0 ? `${hours}小时${mins}分` : `${hours}小时`;
        }
        return `${mins}分钟`;
    }

    /** 格式化时长（含秒）"2:35:12" */
    public static formatDurationFull(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
}
