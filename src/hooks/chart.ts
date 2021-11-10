import dayjs from 'dayjs';

export function unixToWeek(unix: number): number {
    return dayjs.unix(unix).utc().week();
}

export function unixToMonth(unix: number): number {
    return dayjs.unix(unix).utc().month();
}
