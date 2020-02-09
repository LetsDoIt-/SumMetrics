import * as util from "util";
import { UtilError,InvalidParametersError,ERROR_CODES,ERROR_CONSTANTS} from '../types/errorTypes';
import {IContext} from "../types/loggingTypes";
import {Category} from "typescript-logging";

const CONSTANTS = {
    'SUFFIX'                :   'sum',
    'POST_METRIC_ROUTE'     :   '/metric/:key',
    'GET_METRIC_SUM_ROUTE'  :   '/metric/:key/sum',
    'ROUTER'                :   'router',
    'METRIC_CONTROLLER'     :   'metric.controller',
    'STORAGE'               :   'storage.model',
    'UTIL'                  :   'util',
    'DELIMETER'             :   '$%^'
};

const logger = new Category(CONSTANTS.UTIL);

/**
 * Naive implementation of input parameter validation (Not to be used in Production under any circumstances)
 * Implemented this to avoid importing additional modules not sure supported as part of the test
 *
 * @param {{params : Array<string>, input : any, context ?: IContext}} {params,input, context}
 */
const validateParameters = ({params,input, context} : {params : Array<string>, input : any, context ?: IContext}) => {
    const method = "validateParameters";
    try{
        logger.info(() => `method : ${method} called with RequestId : ${context.uniqueRequestId} and params : ${util.inspect(params)}, and ${util.inspect(input)} started`);

        for(const param of params) {
            if(!input[param]) {
                throw new InvalidParametersError({status : ERROR_CODES.INVALID_PARAMETERS, message : `${param} missing`, retry : false});
            }
        }

        logger.info(() => `method : ${method} returned success for RequestId ${context.uniqueRequestId} completed`);
    } catch(err){
        logger.error(`method : ${method}  RequestId : ${context.uniqueRequestId} failed with error ${err.status}, ${err.message}`,err);
        throw new UtilError({status : ERROR_CODES.INTERNAL_SERVER_ERROR, message: `${method} ${ERROR_CONSTANTS.UTIL_ERROR}`, retry : false});
    }
}


/**
 * Function responsible to generate a key from the original key passed in request, 
 * the key is a combination of Key + CurrentHour Timestamp + Suffix string to differentiate keys in future
 * Suffix is passed to have multiple keys for same base key if needed in future 
 * e.g. Suffix => sum (Cumulative sum of all the input), Suffix => log (Array of values passed in order for future if needed)
 * @param {{key: string,suffix: string, context ?: IContext}} {key, suffix,context}
 * @returns {string}
 */
const generateKey = ({key, suffix,context} : {key: string,suffix: string, context ?: IContext}) : string =>{
    const method = 'generateKey';
    try{
        logger.info(() => `method : ${method} called with RequestId : ${context.uniqueRequestId} and params key : ${key}, suffix : ${suffix} started`);
        
        validateParameters({params : ['key','suffix'], input : {key,suffix}, context});
        logger.info(() => `method : ${method} Parameter validation for RequestId passed ${context.uniqueRequestId}`);
        
        const dateNow = new Date();
    
        const currTime = dateNow.getTime();
        const result = `${key}${CONSTANTS.DELIMETER}${currTime}${CONSTANTS.DELIMETER}${suffix}`;
        logger.info(() => `method : ${method} returned success for RequestId ${context.uniqueRequestId} with returned : ${util.inspect(result)}`);
        
        return result;
    } catch(err){
        if(err instanceof InvalidParametersError){
            logger.error(`method : ${method}  RequestId : ${context.uniqueRequestId} failed with error ${err.status}, ${err.message}`,err);
            throw err;
        } else {
            logger.error(`method : ${method}  RequestId : ${context.uniqueRequestId} failed with error ${err.status}, ${err.message}`,err);
            throw new UtilError({status : ERROR_CODES.INTERNAL_SERVER_ERROR, message: `${method} ${ERROR_CONSTANTS.UTIL_ERROR}`, retry : false});
        }
    }
}

/**
 * Function checks if the hour has past, meaning the hour passed as parameter doesn't match current hour
 *
 * @param {{hourPart : number, context ?: IContext}} {hourPart, context}
 * @returns {boolean}
 */
const isHourPast = ({dateInMS, context} : {dateInMS : number, context ?: IContext}) : boolean => {
    const method = 'isHourPast';
    try {
        logger.info(() => `method : ${method} called with RequestId : ${context.uniqueRequestId} and params date: ${new Date(dateInMS)}, started`);
        const ONE_HOUR = 60 * 60 * 1000;
        validateParameters({params : ['dateInMS'], input : {'dateInMS' : dateInMS}, context});
        logger.info(() => `method : ${method} Parameter validation for RequestId passed ${context.uniqueRequestId}`);

        const currentDate = new Date();
        const currentTime = currentDate.getTime();
        const result = ((currentTime - dateInMS) > ONE_HOUR);
        logger.info(() => `method : ${method} returning for RequestId ${context.uniqueRequestId} with returned : ${util.inspect(result)}`);

        return result;
    } catch(err){
        if(err instanceof InvalidParametersError){
            logger.error(`method : ${method}  RequestId : ${context.uniqueRequestId} failed with error ${err.status}, ${err.message}`,err);
            throw err;
        } else {
            logger.error(`method : ${method}  RequestId : ${context.uniqueRequestId} failed with error ${err.status}, ${err.message}`,err);
            throw new UtilError({status : ERROR_CODES.INTERNAL_SERVER_ERROR, message: `${method} ${ERROR_CONSTANTS.UTIL_ERROR}`, retry : false});
        }
    }
};


/**
 * Function checks if time within an hour
 *
 * @param {{dateInMS : number, context ?: IContext}} {dateInMS, context}
 * @returns {boolean}
 */
const isWithinOneHour = ({dateInMS, context} : {dateInMS : number, context ?: IContext}) : boolean => {
    const method = 'isWithinOneHour';
    try {
        logger.info(() => `method : ${method} called with RequestId : ${context.uniqueRequestId} and params date: ${new Date(dateInMS)}, started`);
        const ONE_HOUR = 60 * 60 * 1000;
        validateParameters({params : ['dateInMS'], input : {'dateInMS' : dateInMS}, context});
        logger.info(() => `method : ${method} Parameter validation for RequestId passed ${context.uniqueRequestId}`);

        const currentDate = new Date();
        const currentTime = currentDate.getTime();
        const result = ((currentTime - dateInMS) < ONE_HOUR);
        logger.info(() => `method : ${method} returning for RequestId ${context.uniqueRequestId} with returned : ${util.inspect(result)}`);

        return result;
    } catch(err){
        if(err instanceof InvalidParametersError){
            logger.error(`method : ${method}  RequestId : ${context.uniqueRequestId} failed with error ${err.status}, ${err.message}`,err);
            throw err;
        } else {
            logger.error(`method : ${method}  RequestId : ${context.uniqueRequestId} failed with error ${err.status}, ${err.message}`,err);
            throw new UtilError({status : ERROR_CODES.INTERNAL_SERVER_ERROR, message: `${method} ${ERROR_CONSTANTS.UTIL_ERROR}`, retry : false});
        }
    }
};
/**
 * Function responsible to split the key by the delimeter and return and Array<string>
 *
 * @param {{key: string, context ?: IContext}} {key,context}
 * @returns {Array<string>}
 */
const splitKey = ({key,context} : {key: string, context ?: IContext}) : Array<string> => {
    const method = 'splitKey';
    try {
        logger.info(() => `method : ${method} called with requestId : ${context.uniqueRequestId} and params key : ${key}, started`);

        validateParameters({params : ['key'], input : {key}, context});
        logger.info(() => `method : ${method} Parameter validation for requestId passed ${context.uniqueRequestId}`);

        const result = key.split(CONSTANTS.DELIMETER);
        logger.info(() => `method : ${method} returning for requestId ${context.uniqueRequestId} with returned : ${util.inspect(result)}`);

        return result;
    } catch(err){
        if(err instanceof InvalidParametersError){
            logger.error(`method : ${method}  requestId : ${context.uniqueRequestId} failed with error ${err.status}, ${err.message}`,err);
            throw err;
        } else {
            logger.error(`method : ${method}  requestId : ${context.uniqueRequestId} failed with error ${err.status}, ${err.message}`,err);
            throw new UtilError({status : ERROR_CODES.INTERNAL_SERVER_ERROR, message: `${method} ${ERROR_CONSTANTS.UTIL_ERROR}`, retry : false});
        }
    }
}

/**
 * Generates temp uniqueId of desired length to attach with every request for better debugging in logs
 * Duplicates possible but can be combined by time to ignore them
 *
 * @param {{length : number, context ?: IContext}} {length, context}
 * @returns {string}
 */
const generateTempId = ({length} : {length : number}) : string => {
    const method = 'generateTempId';
    try{
        logger.info(() => `method : ${method} called and params length : ${length}, started`);

        var chars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
        const result = chars.slice(0,length).map(function (ch) {
            return chars[Math.random()*chars.length|0];
        }).join('');
        logger.info(() => `method : ${method} called and params length : ${length}, finished with result ${util.inspect(result)}`);
        return result;
    } catch(err){
        if(err instanceof InvalidParametersError){
            throw err;
        } else {
            throw new UtilError({status : ERROR_CODES.INTERNAL_SERVER_ERROR, message: `${method} ${ERROR_CONSTANTS.UTIL_ERROR}`, retry : false});
        }
    }
}

export{
    CONSTANTS,
    validateParameters,
    generateKey,
    isHourPast,
    isWithinOneHour,
    splitKey,
    generateTempId
}