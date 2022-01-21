'use strict';

export function appendZero(date: number | string): string {
    return (date < 10 ? `0${date}` : `${date}`);
}