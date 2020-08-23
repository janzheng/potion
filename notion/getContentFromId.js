

const call = require("./call")
const normalizeId = require("./normalizeId")
const asyncForEach = require("../helpers/asyncForEach.js")
const getTableFromId = require("./getTableFromId")
const getPageChunkFromId = require("./getPageChunkFromId")

const fetch = require("node-fetch")





async function getContentFromId(id, depth=0, pageChunk=undefined, addIndentation=true) {
  
  if(!pageChunk) {
    pageChunk = await getPageChunkFromId(id)
  }
  // console.log('getting Content from id:', id, 'chunk:', pageChunk)


  // grab from chunk if itexists, otherwise get from API
  let record

  if(pageChunk && pageChunk.recordMap.block[id]) {
    record = pageChunk.recordMap.block[id]
    // console.log('found records ::: ', record.value.id)
  } else {
    // usually required for nested content; these won't exist in pageChunk
    let records = await call("getRecordValues", {
      requests: [
        {
          id,
          table: "block"
        }
      ]
    })
    record = records.results[0]
    console.log('----> getContentFromId API call: ', id, record.value.type, 'content:', record.value.content)

    // add to recordmap as caching
    pageChunk.recordMap.block[id] = record
  }

  if(!record.value) {
    // throw new Error("could not read Notion doc with this ID - make sure public access is enabled")
    return {
      'type': false,
      'message': 'could not read Notion doc with this ID - make sure public access is enabled'
    }
  }


  const type = record.value.type


  const content = {
    id,
    type,
    value: record.value.properties && record.value.properties.title ? record.value.properties.title[0][0] : undefined,
    properties: record.value.properties,
    markdown: await getMarkdownFromContents([record.value], true, depth, pageChunk, addIndentation)
  }

  // console.log('BLOCK???', record.value, record.value.properties ? record.value.properties.title[0][0] : '')
  // console.log('BLOCK???', record.value.id, 'type:', record.value.type, 'content:', record.value.content)
  


  // accumulate all contents
  const contentIds = record.value.content
  if(contentIds) {
    const contents = []
    await asyncForEach(contentIds, async (id) => {
      const content = await getContentFromId(id, ++depth, pageChunk)
      contents.push(content)
    })
    content.content = contents
  }

  if(type === 'collection_view') {
    content.table = await getTableFromId(record.value.id)
  }


  // console.log('>>>>> ____Contents', content)

  return content
}



module.exports = getContentFromId

// prevents circular dependency trap (markdown <> gontents)
const getMarkdownFromContents = require("./getMarkdownFromContents.js")




