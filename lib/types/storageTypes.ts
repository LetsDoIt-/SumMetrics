import { IContext } from "./loggingTypes"

type IStorage = {
    _storage : Map<string,number>;
    getValueByKey({key, context} : {key : string, context ?: IContext}) : Promise<number>;
    setValueByKey({key, value,context}: {key: string,value :number,context ?: IContext}) : Promise<number>;
    getAllKeys({context} : {context : IContext}) : Promise<Map<string,number>>;
    deleteKey({key,context} : {key : string,context ?: IContext}) : Promise<boolean>;
}

export {
    IStorage
}