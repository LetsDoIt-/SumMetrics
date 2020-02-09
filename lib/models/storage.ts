import * as util from "util" ;
import {IStorage} from "../types/storageTypes";
import {IContext} from "../types/loggingTypes";
import {StorageError,InvalidParametersError,ERROR_CONSTANTS,ERROR_CODES} from "../types/errorTypes";
import {validateParameters,CONSTANTS} from "../utils/utils";
import {Category} from "typescript-logging";

const logger = new Category(CONSTANTS.STORAGE);

/**
 * Storage class is not persisted to memory
 * It is a Map of key as string and value as number
 * The number represents the sum of value at that moment
 * No locking is implemented hence simultaneous writes can cause incosistent result
 * 
 * @export
 * @class Store
 * @implements {IStorage}
 */
export class Store implements IStorage{
    _storage;
    constructor(){
        this._storage = new Map();  
    }

    /**
     * Method gets value from the storage based on a key
     * 
     * @param {{key : string, context ?: IContext}} {key, context}
     * @returns {Promise<number>}
     * @memberof Store
     */
    public async getValueByKey({key, context} : {key : string, context ?: IContext}) : Promise<number> {
        const method = 'getValueByKey';
        try{
            logger.info(() => `method : ${method} called with RequestId : ${context.uniqueRequestId} and params key : ${key} started`);
            
            validateParameters({params : ['key'], input : {key}, context});
            logger.info(() => `method : ${method} Parameter validation for RequestId passed ${context.uniqueRequestId}`);
            
            const result = Promise.resolve(this._storage.has(key) ? this._storage.get(key) : 0);
            logger.info(() => `method : ${method} returned success for RequestId ${context.uniqueRequestId} with returned : ${util.inspect(result)}`);
            
            return result;
        } catch(err){
            if(err instanceof InvalidParametersError){
                logger.error(`method : ${method} RequestId : ${context.uniqueRequestId} failed with error ${err.status}, ${err.message}`,err);
                throw err;
            } else {
                logger.error(`method : ${method} RequestId : ${context.uniqueRequestId} failed with error ${err.status}, ${err.message}`,err);
                throw new StorageError({status : ERROR_CODES.STORAGE_ERROR, message:  ERROR_CONSTANTS.STORAGE_ERROR, retry: true});
            }
        }
        
    }

    /**
     * Method sets value to storage by using a key
     *
     * @param {{key: string,value :number,context ?: IContext}} {key, value, context}
     * @returns {Promise<number>}
     * @memberof Store
     */
    public async setValueByKey({key, value, context}: {key: string,value :number,context ?: IContext}) : Promise<number>{
        const method = 'setValueByKey';
        try{
            logger.info(() => `method : ${method} called with RequestId : ${context.uniqueRequestId} and params key : ${key} started`);
            
            validateParameters({params : ['key','value'], input : {key, value},context});
            logger.info(() => `method : ${method} Parameter validation for RequestId passed ${context.uniqueRequestId}`);
            
            await this._storage.set(key, value);
            logger.info(() => `method : ${method} completed success for RequestId ${context.uniqueRequestId} completed`);
            
            return Promise.resolve(this._storage.get(key));
        } catch (err) {
            if(err instanceof InvalidParametersError){
                logger.error(`method : ${method}  RequestId : ${context.uniqueRequestId} failed with error ${err.status}, ${err.message}`,err);
                throw err;
            } else {
                logger.error(`method : ${method}  RequestId : ${context.uniqueRequestId} failed with error ${err.status}, ${err.message}`,err);
                throw new StorageError({status : ERROR_CODES.STORAGE_ERROR, message:  ERROR_CONSTANTS.STORAGE_ERROR, retry: true});
            }
        }
        
    }

    /**
     *
     *
     * @param {{context ?: IContext}} {context}
     * @returns {Promise<IStorage>}
     * @memberof Store
     */
    public async getAllKeys({context} : {context ?: IContext}) : Promise<Map<string,number>>{
        const method = 'getAllKeys';
        try{
            logger.info(() => `method : ${method} called with RequestId : ${context.uniqueRequestId} and params started`);
            return Promise.resolve(this._storage);
        } catch(err){
            if(err instanceof InvalidParametersError){
                throw err;
            } else {
                throw new StorageError({status : ERROR_CODES.STORAGE_ERROR, message:  ERROR_CONSTANTS.STORAGE_ERROR, retry: true});
            }
        }
    }

    /**
     *
     *
     * @param {{key : string, context ?: IContext}} {key, context}
     * @returns {Promise<boolean>}
     * @memberof Store
     */
    public async deleteKey({key, context} : {key : string, context ?: IContext}) : Promise<boolean> {
        try{
            validateParameters({params : ['key'], input : {key}, context});
            return Promise.resolve(this._storage.delete(key));
        } catch(err) {
            if(err instanceof InvalidParametersError){
                throw err;
            } else {
                throw new StorageError({status : ERROR_CODES.STORAGE_ERROR, message:  ERROR_CONSTANTS.STORAGE_ERROR, retry: true});
            }
        }
        
    }
}