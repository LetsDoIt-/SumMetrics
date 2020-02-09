import {generateKey,isHourPast,splitKey,generateTempId,CONSTANTS} from "../lib/utils/utils";

const context = {uniqueRequestId : 'oiuy'};

describe('Tests for generateKey function', ()=>{
    it('should generate a valid expected key',()=>{
        const key = "active_user";
        const suffix = "sum";
        const result = generateKey({key,suffix,context});
        const now = new Date();
        const currTime = now.getTime();
        const expected = `${key}${CONSTANTS.DELIMETER}${currTime}${CONSTANTS.DELIMETER}${suffix}`;
        expect(result).toEqual(expected);
    });
    
    it('should contain all parts',()=>{
        const key = "active_user";
        const suffix = "sum";
        const result = generateKey({key,suffix,context});
        const now = new Date();
        const currTime = now.getTime();
        
        expect(result).toContain(key);
        expect(result).toContain(suffix);
        expect(result).toContain(currTime);
    });
});

describe('Tests for isHourPassed function', ()=>{
    it('should return true for previous hour passed',()=>{
        const now = new Date();
        const ONE_HOUR = 60 * 60 * 1000;
        const previousHour = (now.getTime() - ONE_HOUR) - 1;
        const result = isHourPast({dateInMS : previousHour, context});
        const expected = true;
        expect(result).toEqual(expected);
    });

    it('should return false for current hour',()=>{
        const now = new Date();
        const ONE_HOUR = 60 * 60 * 1000;
        const previousHour = now.getTime() - 100;
        const result = isHourPast({dateInMS : previousHour, context});
        const expected = false;
        expect(result).toEqual(expected);
    });
    
});

describe('Tests for splitKey function', ()=>{
    it('should split key in three parts',()=>{
        const key = "active_user";
        const suffix = "sum";
        const now = new Date();
        const currentHour = now.getHours();
        const generatedKey = `${key}${CONSTANTS.DELIMETER}${currentHour}${CONSTANTS.DELIMETER}${suffix}`;
        const result = splitKey({key : generatedKey,context});
        const expected = [`${key}`,`${currentHour}`,`${suffix}`];
        expect(result).toEqual(expected);
        expect(result).toHaveLength(3);
    });
    
});

describe('Tests for generateTempId function', ()=>{
    it('should return  id with correct length',()=>{
        const len = 10;
        const result = generateTempId({length : len});
        const expected = 10;
        expect(result).toHaveLength(expected);
    });
});