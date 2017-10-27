/**
 * Example Request:
 * {
 *   "request": {
 *     "url": "http://www.ex.com"
 *   },
 *   "children": [
 *     {
 *       "concurrency": 5,
 *       "request": {
 *         "url" "http://www.ex.com/1"
 *	     },
 *       "children": [
 *         {
 *            "request": {
 *              "url": "http://www.ex.com/1/1"
 *            }
 *         },
 *	       {
 *            "request": {
 *              "url": "http://www.ex.com/1/2"
 *            }
 *         }
 *       ]
 *     },
 *     {
 *       "request": {
 *         "url":  "http:/www.ex.com/2"
 *       } 
 *     }
 *   ]
 * }
 */

module.exports = {
  $schema: 'http://json-schema.org/schema#',
  id: 'tree-node',
  type: 'object',
  properties: {
    concurrency: {
      type: 'integer'
    },
    request: {
      type: 'object',
      properties: {
        url: { type: 'string' }
      }
    },
    children: {
      type: 'array',
      uniqueItems: true,
      items: {
        $ref: '#tree-node'
      }
    }
  },
  required: ['request']
}
