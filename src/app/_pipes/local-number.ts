/**
  * Usage: number | localNumber:'format'
  * If no format is provided 2 decimals will be used.
 **/

import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';
import { ConfigService } from '../_services';

@Pipe({
    name: 'localNumber',
})
export class LocalNumberPipe implements PipeTransform {

    constructor(
        private config: ConfigService,
    ) { }

    transform(value: number, format?: string) {
        if (value == null) { return ''; } // !value would also react to zeros.
        if (!format) { format = '.2-2'; }

        return formatNumber(value, this.config.locale, format);
    }
}