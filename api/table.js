/* Return the entries of a table in Notion */

const getTableFromId = require("../notion/getTableFromId")
const normalizeId = require("../notion/normalizeId")
const textArrayToHtml = require("../notion/textArrayToHtml.js")
const getAssetUrl = require("../notion/getAssetUrl")



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
    output = await getTableFromId({id})
  } catch(e) {
    console.error(e)
    return res.send(e.message)
  }

  return res.json(output)
}

