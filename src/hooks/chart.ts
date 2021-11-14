import dayjs from 'dayjs';

export function unixToMonth(unix: number): number {
    return dayjs.unix(unix).utc().month();
}
