
const call = require("../notion/call")
const normalizeId = require("../notion/normalizeId")
const getMarkdownFromId = require("../notion/getMarkdownFromId")

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
    output = await getMarkdownFromId(id)
  } catch(e) {
    console.error(e)
    return res.send(e.message)
  }

  res.setHeader('content-type', 'text/plain')
  return res.send(output)
}
