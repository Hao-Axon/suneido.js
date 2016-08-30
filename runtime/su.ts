/**
 * @file
 * Run-time support routines
 */

//TODO global
//TODO dynget, dynset, dynpush, dynpop
//TODO record builder

import { Dnum } from "./dnum";
import { SuObject } from "./suobject";
import display from "./display";
import is from "./is";
import { suglobals } from "./globals";
import { StringMethods } from "./builtin/stringmethods";
const sm: any = StringMethods.prototype;

export { display, is };

export const empty_object = new SuObject().setReadonly();

export function put(ob: any, key: any, val: any): void {
    if (ob instanceof SuObject)
        ob.put(key, val);
    else
        throw typeName(ob) + " does not support put (" + key + ")";
}

export function get(x: any, key: any): any {
    if (typeof x === 'string')
        return x[toInt(key)];
    if (x instanceof SuObject)
        return x.get(key);
    throw typeName(x) + " does not support get (" + key + ")";
}

export function rangeto(x: any, i: number, j: number) {
    let len = x.length;
    return x.slice(prepFrom(i, len), j);
}

export function rangelen(x: any, i: number, n: number) {
    let len = x.length;
    i = prepFrom(i, len);
    return x.slice(i, i + n);
}

function prepFrom(from: number, len: number) {
    if (from < 0) {
        from += len;
        if (from < 0)
            from = 0;
    }
    return from;
}

export function inc(x: any) {
    return x + 1; // TODO
}

export function dec(x: any) {
    return x - 1; // TODO
}

export function uadd(x: any) {
    return +x; // TODO
}

export function usub(x: any) {
    return -x; // TODO
}

export function not(x: any): boolean {
    return !toBool(x);
}

export function bitnot(x: any): number {
    return ~x; // TODO
}

function toInt(x: any): number {
    if (Number.isSafeInteger(x))
        return x;
    if (x instanceof Dnum && x.isInt())
        return x.toInt();
    throw "can't convert " + typeName(x) + " to integer";
}

function toNum(x: any): number | Dnum {
    if (typeof x === 'number' || x instanceof Dnum)
        return x;
    if (x === false || x === "")
        return 0;
    if (x === true)
        return 1;
    if (typeof x === 'string') {
        let n: Dnum | null;
        if (!/[.eE]/.test(x) && x.length < 14)
            return parseInt(x);
        else if (n = Dnum.parse(x))
            return n;
    }
    throw "can't convert " + typeName(x) + " to number";
}

function toDnum(x: number | Dnum): Dnum {
    return (typeof x === 'number') ? Dnum.make(x) : x;
}

export function add(x: any, y: any): any {
    x = toNum(x);
    y = toNum(y);
    if (typeof x === 'number' && typeof y === 'number')
        return x + y;
    else
        return Dnum.add(toDnum(x), toDnum(y));
}

export function sub(x: any, y: any) {
    return x - y; //TODO
}

export function cat(x: any, y: any): string {
    return "" + x + y; //TODO
}

export function mul(x: any, y: any) {
    return x * y; //TODO
}

export function div(x: any, y: any) {
    return x / y; //TODO
}

export function mod(x: any, y: any) {
    return x % y; //TODO
}

export function lshift(x: any, y: any): number {
    return x << y; //TODO
}

export function rshift(x: any, y: any): number {
    return x >> y; //TODO
}

export function bitand(x: any, y: any): number {
    return x & y; //TODO
}

export function bitor(x: any, y: any): number {
    return x | y; //TODO
}

export function bitxor(x: any, y: any): number {
    return x ^ y; //TODO
}

export function isnt(x: any, y: any): boolean {
    return !is(x, y); //TODO
}

export function lt(x: any, y: any): boolean {
    return x < y; //TODO
}

export function lte(x: any, y: any): boolean {
    return x <= y; //TODO
}

export function gt(x: any, y: any): boolean {
    return x > y; //TODO
}

export function gte(x: any, y: any): boolean {
    return x >= y; //TODO
}

export function match(x: any, y: any): boolean {
    return RegExp(y).test(x); //TODO
}

export function matchnot(x: any, y: any): boolean {
    return !RegExp(y).test(x); //TODO
}

export function toBool(x: any): boolean {
    if (x !== true && x !== false)
        throw "can't convert " + typeof x + " to boolean";
    return x;
}

export function catchMatch(e: string, pat: string): boolean { // TODO
    if (pat[0] === '*')
        return -1 !== e.indexOf(pat.substring(1));
    else
        return -1 !== e.lastIndexOf(pat, 0);

}

export function noargs(args: any[]): void {
    if (args.length !== 0)
        throw "too many arguments";
}

export function argsall(args: any[]) {
    return args; //TODO
}

export function args(args: any[], _spec: string) {
    return args; //TODO
}

export function typeName(x: any): string {
    if (typeof x.typeName === 'function')
        return x.typeName();
    let t = typeof x;
    switch (t) {
        case 'boolean': return 'Boolean';
        case 'string': return 'String';
        case 'number': return 'Number';
    }
    return t;
}

export function mandatory() {
    throw new Error("missing argument");
}

export function mknum(s: string) {
    return Dnum.parse(s) ||
        err("can't convert " + display(s) + " to number");
}

function err(s: string): void {
    throw new Error(s);
}

/**
 * constructor for object constants i.e. #(...)
 * named members passed as sequence of key,value
 */
export function mkObject(...args: any[]): SuObject {
    let i = args.indexOf(null);
    if (i === -1)
        return new SuObject(args).setReadonly();
    let vec = args.slice(0, i);
    let map = new Map<any, any>();
    for (i++; i < args.length; i += 2)
        map.set(args[i], args[i + 1]);
    return new SuObject(vec, map).setReadonly();
}

export function mkObject2(vec: any[], map?: Map<any, any>): SuObject {
    return new SuObject(vec, map);
}

export function typename(x: any): string {
    return x === null ? "null"
        : x === undefined ? "undefined"
            : typeof x;
}

// Note: only Suneido values and strings are callable

// Note: using apply until better spread (...) performance in v8

export function call(f: any, ...args: any[]): any {
    let call = f.$call;
    if (call)
        return call.apply(undefined, args);
    //  TODO strings
    cantCall(f);
}

export function callNamed(f: any, ...args: any[]) {
    let call = f.$callNamed;
    if (call)
        return call.apply(undefined, args);
    //  TODO strings
    cantCall(f);
}

export function callAt(f: any, args: SuObject): any {
    let call = f.$callAt;
    if (call)
        return call(args);
    //  TODO strings
    cantCall(f);
}

function cantCall(f: any): never {
    throw new Error("can't call " + typename(f));
}

/**
 * Call a method on an object.
 */
export function invoke(ob: any, method: string, ...args: any[]): any {
    return getMethod(ob, method).apply(ob, args);
}

function getMethod(ob: any, method: string): any {
    if (typeof ob === 'string')
        return sm[method];
    return ob[method]; // TODO (e.g. handle Default)
}

export function global(name: string) {
    let x = suglobals[name];
    if (!x)
        throw new Error("can't find " + name);
    return x;
}
