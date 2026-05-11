/**
 * 数值工具 — 大数字格式化、百分比计算
 */
export class NumberUtils {
    /** 中文大单位 */
    private static readonly UNITS = [
        { value: 1e12, label: '兆' },
        { value: 1e8, label: '亿' },
        { value: 1e4, label: '万' },
    ];

    /**
     * 格式化大数字为中文简写
     * 12345 → 1.23万
     * 567890000 → 5.68亿
     */
    public static format(value: number): string {
        if (!isFinite(value)) return '0';
        if (value < 0) return '-' + this.format(-value);

        for (const unit of this.UNITS) {
            if (value >= unit.value) {
                const divided = value / unit.value;
                // 保留最多2位小数，去掉尾零
                const str = divided.toFixed(2).replace(/\.?0+$/, '');
                return `${str}${unit.label}`;
            }
        }

        return Math.floor(value).toLocaleString();
    }

    /** 格式化为完整数字（加千分位） */
    public static formatFull(value: number): string {
        if (!isFinite(value)) return '0';
        return Math.floor(value).toLocaleString();
    }

    /** 百分比 0-1 → "52.3%" */
    public static percent(current: number, total: number): string {
        if (total <= 0) return '0%';
        const pct = Math.min(current / total, 1) * 100;
        return `${pct.toFixed(1)}%`;
    }

    /** 百分比 0-1 → 0.00~1.00 */
    public static ratio(current: number, total: number): number {
        if (total <= 0) return 0;
        return Math.min(current / total, 1);
    }

    /** 简洁格式化修炼速度 "+128/秒" */
    public static formatRate(perSec: number): string {
        return `+${this.format(perSec)}/秒`;
    }
}
