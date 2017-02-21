### lambda-tree

A tool for doing big work on small AWS Lambda Functions.

## Setup

1. clone this repo
2. install serverless
3. deploy this serverless function to AWS

##  Example Usage - Simple Syntax

### Submit work to the endpoint.

The following is an example of how you might
specify a tree's structure. Ignore explanatory comments.

All leaf queries are performed using HTTP GET unless explicitly told otherwise (example below).
Internal ones are performed using HTTP POST and by passing the children responses as a JSON array in the payload.

```
POST https://aws-endpoints/trees
Content-Type: application/json
{
  "request": "http://parent-url.com",
  "children": [
    "http://child1-url.com",
    {
      "request": "http://child2-url.com",
      "children": [
        "http://child2-1-url.com"
      ]
    },
    {
      // Requests can be specified in the same way you would use the request module.
      "request": {
        "method": "POST",
        "url":  "http://www.testing.com"
      }
    }
  ]
}
```

### Response
```
Content-Type: application/json
{
  "statusCode":200,
  "treeUrl":"https://aws-endpoint/trees/TREEID"
}
```

### Collecting Results

Results of the processing can be queried by performing an HTTP GET on the tree url.

```
GET https://aws-endpoint/trees/TREEID
```

If the work is not yet completed, it returns an HTTP 202 Accepted response.

Once the result has been computed, the tree url, returns the result with an HTTP 200 OK.

### Inspecting the tree state
As work proceeds, the state of nodes in the tree can be queried by performing an
HTTP GET on the tree url with an additional suffix of '/query'

```
GET https://aws-endpoint/trees/TREEID/state
```
