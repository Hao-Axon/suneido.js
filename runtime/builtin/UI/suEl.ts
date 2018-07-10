import * as util from '../../utility';
import { isString, toStr } from "../../ops";
import { SuNum } from "../../sunum";
import { SuObject } from "../../suobject";
import { display } from "../../su";
import { SuValue, SuCallable } from "../../suvalue";

const convertMap: [any, any][] = [];

export function defMap(key: any, val: any) {
    convertMap.push([key, val]);
}

export abstract class SuEl extends SuValue {
    public abstract el: any;
    compareTo(x: any): util.Cmp {
        return -1;
    }
    equals(that: any): boolean {
        if (!(that instanceof SuEl))
            return false;
        return this.el === that.el;
    }
    lookup(this: any, method: string): SuCallable {
        if (this[method])
            return this[method];
        let jsMethodName = method[0].toLowerCase() + method.substr(1);
        if (typeof this.el[jsMethodName] === "function") {
            let fn: any = function () {
                let args: any[] = [];
                for (let i = 0; i < arguments.length; i++) {
                    args[i] = convertSuValue(arguments[i]);
                }
                return makeSuValue(this.el[jsMethodName](...args));
            };
            fn.$params = "???";
            fn.$callableType = "???";
            fn['$blockThis?'] = undefined;
            fn.$call = fn;
            fn.$callAt = () => { throw new Error('Javascript built-in does not support call @'); } ;
            fn.$callNamed = () => { throw new Error('Javascript built-in does not support call by name'); };
            return fn;
        }
        return this.lookupGlobal(method);
    }
    protected lookupGlobal(method: string) {
        return null;
    }
    get(key: any): any {
        let k = toStr(key);
        if (this.el[k] == null)
            return undefined;
        return makeSuValue(this.el[k]);
    }
    put(key: any, val: any): void {
        let k = toStr(key);
        this.el[k] = convertSuValue(val);
    }
}

// export for testing
export function convertSuValue(value: any) {
    if (isString(value))
        return value.toString();
    if (typeof value === 'number' || typeof value === 'boolean')
        return value;
    if (value instanceof SuNum)
        return value.toNumber();
    if (value instanceof SuObject)
        return convertSuObject(value);
    if (value instanceof SuEl)
        return value.el;
    throw new Error(`Cannot convert value: ${display(value)}`);
}

function convertSuObject(ob: SuObject) {
    if (ob.vecsize() === 0) {
        let res: any = {};
        ob.map.forEach((value, key) => res[key] = convertSuValue(value));
        return res;
    } else if (ob.mapsize() === 0) {
        let res: any[] = [];
        ob.vec.forEach((value, index) => res[index] = convertSuValue(value));
        return res;
    } else {
        throw new Error(`Cannot convert Object with both named and un-named elements`);
    }
}

// export for testing
export function makeSuValue(value: any) {
    let type = typeof value;
    if (value == null)
        return undefined;
    if (type === 'string' || type === 'boolean')
        return value;
    if (type === 'number')
        return SuNum.fromNumber(value);
    for (let i = 0; i < convertMap.length; i++) {
        if (value instanceof convertMap[i][0])
            return new convertMap[i][1](value);
    }
    if (type === 'object')
        return makeSuObject(value);
    throw new Error(`Cannot convert Javascript ${type} to Suneido value`);
}

function makeSuObject(value: any[] | {[key: string]: any}): SuObject {
    let ob = new SuObject();
    if (Array.isArray(value) || (typeof window !== 'undefined' && value instanceof NodeList)) {
        for (let i = 0; i < value.length; i++)
            ob.add(makeSuValue(value[i]));
    } else {
        for (let key in value)
            if (value.hasOwnProperty(key))
                ob.put(key, makeSuValue(value[key]));
    }
    return ob;
}
