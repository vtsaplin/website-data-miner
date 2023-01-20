# Website Data Miner
A service for extracting data from websites using simple expressions.

## Usage
- Checkout the code
- Install dependencies using `npm install`
- Run `npm start` to start the server
- Send a POST request to `http://localhost:3000/query` with the following body:
```json
 {
  "url": "<web site URL>",
  "expressions": [
    {
      "select": ["<attributes you want to extract>"],
      "from": "<selectors of the elements you want to extract data from>",
      "as": "<name of the result>"
    }
  ]
}
```

For more information see an example of a Jupiter notebook in the `examples` folder. 
