import {Request, Response,NextFunction} from "express";
import * as util from "util";
import {MetricController} from "../controllers/metric.controller";
import {CONSTANTS,validateParameters,generateTempId} from "../utils/utils";
import {Category,CategoryServiceFactory,CategoryConfiguration,LogLevel} from "typescript-logging";

CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Info));

const logger = new Category(CONSTANTS.ROUTER);

export class Routes {       
    public metricController: MetricController;
    constructor(){
        this.metricController = new MetricController();
    }
    /**
     *  Defined Routes
     *
     * @param {*} app
     * @memberof Routes
     */
    public routes(app): void {          
        app.route(CONSTANTS.POST_METRIC_ROUTE) 
        .post(async (req: Request, res: Response, next : NextFunction) =>{
            const context = {
                uniqueRequestId : generateTempId({length : 10})
            };
            try {
                logger.info(() => `Route ${CONSTANTS.POST_METRIC_ROUTE} Method : POST call with RequestId : ${context.uniqueRequestId} started`);
                
                validateParameters({params : ['key'], input : req.params, context});
                validateParameters({params : ['value'], input : req.body, context});
                logger.info(() => `Parameter validation for RequestId passed ${context.uniqueRequestId}`);
                
                const key = req.params.key;
                const value = parseInt(req.body.value);
                logger.info(() => `Params Key : ${key} Value : ${value} and with RequestId : ${context.uniqueRequestId}`);
                
                const result = await this.metricController.markEventByKey({key,value,context});
                logger.info(() => `Route ${CONSTANTS.POST_METRIC_ROUTE} Method : POST call with RequestId : ${context.uniqueRequestId} ended with result : ${util.inspect(result)}`);
                res.status(201);
                res.json(result);
            } catch(err) {
                logger.error(`RequestId : ${context.uniqueRequestId} failed with error ${err.status}, ${err.message}`,err);
                next(err);
            }
        })

        app.route(CONSTANTS.GET_METRIC_SUM_ROUTE) 
        .get(async (req: Request, res: Response, next : NextFunction) => {
            const context = {
                uniqueRequestId : generateTempId({length : 10})
            };
            try{
                logger.info(() => `Route ${CONSTANTS.GET_METRIC_SUM_ROUTE} Method : GET call with RequestId : ${context.uniqueRequestId} started`);
                
                validateParameters({params : ['key'], input : req.params, context});
                logger.info(() => `Parameter validation for RequestId passed ${context.uniqueRequestId}`);
                
                const key = req.params.key;
                logger.info(() => `Params Key : ${key} and with RequestId : ${context.uniqueRequestId}`);
                
                const result = await this.metricController.getSumByKey({key, context});
                logger.info(() => `Route ${CONSTANTS.GET_METRIC_SUM_ROUTE} Method : GET call with RequestId : ${context.uniqueRequestId} ended with result : ${util.inspect(result)}`);
                
                res.json(result)
            } catch(err){
                logger.error(`RequestId : ${context.uniqueRequestId} failed with error ${err.status}, ${err.message}`,err);
                next(err);
            }
        })
    }
}