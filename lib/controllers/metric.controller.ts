import * as util from "util";
import {EventEmitter} from "events";
import {Category} from "typescript-logging";
import {Store} from '../models/storage';
import {CONSTANTS, generateKey,isHourPast, splitKey,validateParameters,generateTempId,isWithinOneHour} from '../utils/utils';
import {IResult, Result} from '../types/resultTypes';
import {GenericError, StorageError,UtilError,InvalidParametersError,ERROR_CONSTANTS,ERROR_CODES} from "../types/errorTypes";
import { IContext } from '../types/loggingTypes';

const logger = new Category(CONSTANTS.METRIC_CONTROLLER);

const eventEmitter = new EventEmitter();

eventEmitter.on('deleteOldKeys', async (self : MetricController) => {
    /**
     * Function to delete all keys asynchronously which not part of the current hour,
     * This is only triggered on event of markEventByKey
     */
    async function cb(){
        const context = {
            uniqueRequestId : generateTempId({length : 10})
        };
        try {
            logger.info(() => `Deleting all keys older than the current hour started`);
            const entries = await self._store.getAllKeys({context});
            entries.forEach((value, key) => {
                const split = splitKey({key,context});
                
                if(isHourPast({dateInMS : parseInt(split[1]),context})){
                    self._store.deleteKey({key, context});
                }
            });
            logger.info(() => `Current storage after deleting ${util.inspect(entries)}`);

        } catch(err){
            if(err instanceof StorageError || err instanceof UtilError || err instanceof InvalidParametersError){
                throw err;
            } else {
                throw new GenericError({status : ERROR_CODES.INTERNAL_SERVER_ERROR, message : ERROR_CONSTANTS.GENERIC_ERROR, retry : false});
            }
        }
    }
    process.nextTick(cb)
  });

export class MetricController{
    _store : Store;
    constructor(){
        this._store = new Store();
    }
    /**
     * Controller function for marking the metric event
     *
     * @param {{key : string, value : number, context ?: IContext}} {key, value, context}
     * @returns {Promise<{}>}
     * @memberof MetricController
     */
    public async markEventByKey({key, value, context} : {key : string, value : number, context ?: IContext}) : Promise<{}> {
        const method = 'markEventByKey';
        try{
            logger.info(() => `method : ${method} called with RequestId : ${context.uniqueRequestId} and params key : ${key}, value : ${value} started`);
            
            validateParameters({params : ['key','value'], input : {key, value},context});
            logger.info(() => `method : ${method} Parameter validation for RequestId passed ${context.uniqueRequestId}`);
            
            const generatedKey = generateKey({key, suffix: CONSTANTS.SUFFIX,context});
            logger.info(() => `method : ${method} GenerateKey returned success for RequestId ${context.uniqueRequestId} with returned : ${generatedKey}`);
            
            await this._store.setValueByKey({key : generatedKey, value,context});
            logger.info(() => `method : ${method} called with RequestId : ${context.uniqueRequestId} and params key : ${key}, value : ${value} ended`);
            
            // Emit event to delete the Keys older than past hour
            eventEmitter.emit('deleteOldKeys', this);
            return Promise.resolve({});    
        } catch(err) {
            if(err instanceof StorageError || err instanceof UtilError || err instanceof InvalidParametersError){
                logger.error(`method : ${method} RequestId : ${context.uniqueRequestId} failed with error ${err.status}, ${err.message}`,err);
                throw err;
            } else {
                logger.error(`method : ${method} RequestId : ${context.uniqueRequestId} failed with error throwing Generic error`,err);
                throw new GenericError({status : ERROR_CODES.INTERNAL_SERVER_ERROR, message : ERROR_CONSTANTS.GENERIC_ERROR, retry : false});
            }
            
        }
    }

    /**
     * Controller function to get the current total sum
     *
     * @param {{key : string, context ?: IContext}} {key,context}
     * @returns {Promise<IResult>}
     * @memberof MetricController
     */
    public async getSumByKey({key,context} :{key : string, context ?: IContext}) : Promise<IResult>{
        const method = 'getSumByKey';
        try{
            logger.info(() => `method : ${method} called with RequestId : ${context.uniqueRequestId} and params key : ${key} started`);

            validateParameters({params : ['key'], input : {key},context});
            logger.info(() => `method : ${method} Parameter validation for RequestId passed ${context.uniqueRequestId}`);

            const entries = await this._store.getAllKeys({context});
            let totalSum = 0;
            entries.forEach((v, k) => {
                const split = splitKey({key : k,context});
                const splitK = split[0];
                // If the Key exists check the timestamp is within one hour
                if(splitK === key){
                    if(isWithinOneHour({dateInMS : parseInt(split[1]),context})){
                        totalSum += v;
                    }
                }
            });

            logger.info(() => `method : ${method} called with RequestId : ${context.uniqueRequestId} and params key : ${key}, value : ${totalSum} ended`);
            return Promise.resolve(new Result(totalSum));
        } catch(err){
            if(err instanceof StorageError || err instanceof UtilError || err instanceof InvalidParametersError){
                logger.error(`method : ${method} RequestId : ${context.uniqueRequestId} failed with error ${err.status}, ${err.message}`,err);
                throw err;
            } else {
                logger.error(`method : ${method} RequestId : ${context.uniqueRequestId} failed with error throwing Generic error`,err);
                throw new GenericError({status : ERROR_CODES.INTERNAL_SERVER_ERROR, message : ERROR_CONSTANTS.GENERIC_ERROR, retry : false});
            }
            
        }
    }
}