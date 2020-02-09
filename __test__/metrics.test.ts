import { MetricController } from "../lib/controllers/metric.controller";

const context = {uniqueRequestId : 'oiuy'};

let metricController;
let value : number;
beforeAll(() => {
    metricController = new MetricController();
});

describe('Tests for markEventByKey method', ()=>{
    it('should store the passed value by key',async ()=>{
        const key = "active_player";
        value = 10;
        const result = await metricController.markEventByKey({key,value,context});
        expect(result).toEqual({});
    }); 
});

describe('Tests for getSumByKey method', ()=>{
    it('should get total sum lookup by Key',async ()=>{
        const key = "active_player";
        value = 11;
        await metricController.markEventByKey({key,value,context});
        const result = await metricController.getSumByKey({key,context});
        const expected = {
            "value" : 21
        };
        expect(result).toEqual(expected);
    });
});