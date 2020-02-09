type IResult = {
    "value" : number
}

class Result implements IResult {
    value: number;
    constructor(val: number){
        this.value = val;
    }
}

export{
    IResult,
    Result
}