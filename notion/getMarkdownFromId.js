

const call = require("./call")
const normalizeId = require("./normalizeId")
const getMarkdownFromContents = require("./getMarkdownFromContents.js")

const fetch = require("node-fetch")


module.exports = async (id) => {
  
  const records = await call("getRecordValues", {
    requests: [
      {
        id,
        table: "block"
      }
    ]
  })

  if(!records.results[0].value) {
    throw new Error("could not read Notion doc with this ID - make sure public access is enabled")
    // return res.json({
    //   error: "could not read Notion doc with this ID - make sure public access is enabled"
    // })
  }

  const contentIds = records.results[0].value.content

  if(!contentIds) {
    console.log('not a content page; is this a block?', records, records.results[0], records.results[0].value, records.results[0].value.properties ? records.results[0].value.properties.title[0][0] : '')
    // console.log('not a content page; is this a block?', records.results[0], records.results[0].value.properties.title[0][0])
    // return res.json({
    //   error: "this doc has no content"
    // })
    throw new Error("this doc has no content")
  }

  const contents = []

  const chunk = await call("loadPageChunk", {
    pageId: id,
    limit: 999999,
    cursor: {
      stack: []
    },
    chunkNumber: 0,
    verticalColumns: false
  })

  contentIds.forEach(id => {
    const block = chunk.recordMap.block[id]
    if(block) {
    	contents.push(block.value)
    }
  })


  // console.log('getMdFromId:::: chunk:', chunk)

  
  const markdown = await getMarkdownFromContents({contents, recurse:true, depth:0, recordMap: chunk.recordMap})
  return markdown.join("")
}
