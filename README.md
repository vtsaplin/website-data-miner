# Website Data Miner
A service for extracting data from websites using simple expressions.

## Use-cases
- You want something simple and minimalistic.
- You prefer a declarative approach to extracting data from websites.
- You plan to have a post-processing step to aggregate or analyze the data.

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

## Command-line options
```bash
Options:
  --no-prompt        No prompt
  --no-headless      Disable headless mode
  -p, --port <port>  Server port
  -h, --help         Show help
```

## Examples
Request payload:
```json
{
  "url":"http://www.apple.com",
  "expressions":[
    {
      "select":[
        "tagName",
        "textContent",
        "getBoundingClientRect"
      ],
      "from":"h1",
      "as":"headings"
    }
  ]
}
```
Response body:
```json
[
  {
    "headings": [
      {
        "tagName": "H1",
        "textContent": "Apple",
        "getBoundingClientRect": {
          "x": 0,
          "y": 0,
          "width": 1,
          "height": 1,
          "top": 0,
          "right": 1,
          "bottom": 1,
          "left": 0
        }
      }
    ]
  }
]
```

For more information see an interactive example in the Jupiter notebook. 
