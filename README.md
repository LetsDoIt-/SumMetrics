# SumMetrics

Sum metrics problem is designed to accept metrics by key and save it to local storage for the most recent hour.  

### POST metric
Request:
```http
POST /metric/:key
{
    "value" : 30
}
```
Response (201)
```
{}
```

### GET metric sum
Returns the sum of all metrics reported for this key over the past hour

```http
GET /metric/:key/sum
```
Response (200):
```
{
    "value": 400
}
```

| Status Code | Description |
| :--- | :--- |
| 200 | `OK` |
| 201 | `CREATED` |
| 400 | `BAD REQUEST` |
| 404 | `NOT FOUND` |
| 500 | `INTERNAL SERVER ERROR` |


To run the solution :
```
//installation
nvm install 13.6.0
npm install
npm install -g typescript ts-node

// Run in Dev mode
npm run dev

// Run all test 
npm test
```