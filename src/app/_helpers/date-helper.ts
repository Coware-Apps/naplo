import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DateHelper {
    pad(n: number): string {
        return n > 9 ? n.toString() : '0' + n;
    }

    public getTodayString(): string {
        let date = new Date();
        return date.getUTCFullYear() + '-' + this.pad(date.getUTCMonth() + 1) + '-' + this.pad(date.getUTCDate());
    }

    public getDayFromToday(n: number = 1): string {
        let date = new Date();
        date.setDate(date.getDate() + n);
        return date.getUTCFullYear() + '-' + this.pad(date.getUTCMonth() + 1) + '-' + this.pad(date.getUTCDate());
    }

    public getMonthFromToday(n: number = 1): string {
        let date = new Date();
        date.setMonth(date.getMonth() + n);
        return date.getUTCFullYear() + '-' + this.pad(date.getUTCMonth() + 1) + '-' + this.pad(date.getUTCDate());
    }

    public stripTimeFromDate(datum: Date | string): Date {
        let d = new Date(datum);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    public createDateAsUTC(date: Date): Date {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    }

    public isInFuture(date: Date): boolean {
        let kezdete = new Date(date);
        kezdete.setUTCHours(0, 0, 0, 0);

        let ma = new Date();
        ma.setUTCHours(0, 0, 0, 0);

        return kezdete > ma;
    }
}
