/*

  Returns as much info as possible from an id
  - if it's a page, will return its contents as markdown
  - if it's a collection, will return itself as a collection 
  - if it's a node 

*/

const call = require("../../notion/call")
const normalizeId = require("../../notion/normalizeId")
const getContentFromId = require("../../notion/getContentFromId")

const fetch = require("node-fetch")


module.exports = async (req, res) => {
  const { id:queryId } = req.query
  const id = normalizeId(queryId)

  if(!id) {
    return res.json({
      error: "no Notion doc ID provided as `id` parameter"
    })
  }

  let output
  try {
    console.time('fetch id')
    output = await getContentFromId({id})
    console.timeEnd('fetch id')
  } catch(e) {
    console.error(e)
    return res.send(e.message)
  }

  return res.json(output)
}
