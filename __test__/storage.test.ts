import {generateKey} from "../lib/utils/utils";
import {Store} from "../lib/models/storage";
import { IStorage } from "../lib/types/storageTypes";

const context = {uniqueRequestId : 'oiuy'};

let storage : IStorage;

beforeAll(() => {
    storage = new Store();
});

describe('Tests for getValueByKey & setValueByKey method', ()=>{
    it('should get stored value lookup by Key',async ()=>{
        const key = "active";
        const suffix = "sum";
        const value = 10;
        const generatedKey = generateKey({key,suffix,context});
        await storage.setValueByKey({key : generatedKey,value,context});
        const result = await storage.getValueByKey({key: generatedKey,context});
        expect(result).toEqual(10);
    }); 
});