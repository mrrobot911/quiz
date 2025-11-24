export class FormatTime {
    static transform(seconds: number) {
        if (seconds == null || isNaN(seconds)) return '00:00 s';
        const mins = Math.floor(Math.abs(seconds) / 60);
        const secs = Math.abs(seconds) % 60;
        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
        return `${pad(mins)}:${pad(secs)} s`;
    }
}
