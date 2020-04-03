
/* tslint:disable */

import {ViewString} from "./definitions";
import {unitOfTime} from 'moment';

export const all: ViewString[] = ['decade', 'year', 'month', 'day', 'hour', 'minute'];

export const precisions: { [viewString: string]: unitOfTime.StartOf } = { decade: 'year', year: 'month', month: 'date', day: 'hour', hour: 'minute', minute: 'second' };

export const formats = {
    decade:	'Y{1,2}(?!Y)|YYYY|[Ll]{1,4}(?!T)',
    /* formats: Y,YY,YYYY,L,LL,LLL,LLLL,l,ll,lll,llll */
    year:	'M{1,4}(?![Mo])|Mo|Q',
    /* formats: M,MM,MMM,MMM,Mo,Q */
    month:	'[Dd]{1,4}(?![Ddo])|DDDo|[Dd]o|[Ww]{1,2}(?![Wwo])|[Ww]o|[Ee]|L{1,2}(?!T)|l{1,2}',
    /* formats: D,DD,DDD,DDDD,d,dd,ddd,dddd,DDDo,Do,do,W,WW,w,ww,Wo,wo,E,e,L,LL,l,ll */
    day:	'[Hh]{1,2}|LTS?',
    /* formats: H,HH,h,hh,LT,LTS */
    hour:	'm{1,2}|[Ll]{3,4}|LT(?!S)',
    /* formats: m,mm,LLL,LLLL,lll,llll,LT */
    minute:	's{1,2}|S{1,}|X|LTS'
    /* formats: s,ss,S,SS,SSS..,X,LTS */
};
