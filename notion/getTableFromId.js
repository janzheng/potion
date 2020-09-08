
const call = require("./call")
const textArrayToHtml = require("./textArrayToHtml")
const asyncForEach = require("../helpers/asyncForEach.js")


async function getTableFromId({id, recordMap=undefined, collectionMap={}, getContent=false}) {

  let {pageData, tableData, collectionId, collectionViewId} = collectionMap[id] ? collectionMap[id] : {}


  if(!id) {
    throw new Error ("[getTableFromId] Please include an ID!")
  }

  // console.log('coooooolmap', collectionMap)

  if(!collectionMap[id]) {
    pageData = await call("getRecordValues", {
      requests: [
        {
          id: id,
          table: "block"
        }
      ]
    })

    if(!pageData.results[0].value) {
      throw new Error("invalid Notion doc ID, or public access is not enabled on this doc")
      // return res.json({
      //   error: "invalid Notion doc ID, or public access is not enabled on this doc"
      // })
    }

    if(!pageData.results[0].value.type.startsWith("collection_view")) {
      throw new Error("this Notion doc is not a collection")
      // return res.json({
      //   error: "this Notion doc is not a collection"
      // })
    }

    collectionId = pageData.results[0].value.collection_id
    collectionViewId = pageData.results[0].value.view_ids[0]

    tableData = await call("queryCollection", {
      collectionId,
      collectionViewId,
      loader: {
        type: "table"
      }
    })

    // console.log('[     ]-> getTableFromId API call: ', id, ' ||||||| ',  collectionId, collectionViewId, '???' ,pageData, tableData)
    console.log('[     ]-> getTableFromId API call: ', id)
    collectionMap[id] = {pageData, tableData, collectionId, collectionViewId}

    // add the collections' records to the overall record map as cache
    if(recordMap && recordMap.block && tableData && tableData.recordMap)
      recordMap.block = { ...recordMap.block, ...tableData.recordMap.block}
  }



  // console.log('getTableFromId [pageData, tableData]', id, collectionMap, pageData, tableData)



  const subPages = tableData.result.blockIds

  const schema = tableData.recordMap.collection[collectionId].value.schema

  const output = []

  const view = tableData.recordMap.collection_view[collectionViewId]
  const tableProps = view.value.format ? view.value.format.table_properties : undefined
  
  // console.log('tableData VIEW:', tableData.recordMap.collection_view)

  // console.log('getTableFromId:', subPages)


  // subPages.forEach(id => {
  await asyncForEach(subPages, async id => {
    const page = tableData.recordMap.block[id]

    const fields = {}

    for(const s in schema) {
      const schemaDefinition = schema[s]
      const type = schemaDefinition.type
      let value = page.value.properties && page.value.properties[s] && page.value.properties[s][0][0]

      if(type === "checkbox") {
        value = value === "Yes" ? true : false
      } else if(value && type === "date") {
        try {
          value = page.value.properties[s][0][1][0][1]
        } catch {
          // it seems the older Notion date format is [[ string ]]
          value = page.value.properties[s][0][0]
        }
      } else if(value && type === "text") {
        value = textArrayToHtml(page.value.properties[s])
      } else if(value && type === "file") {
        const files = page.value.properties[s].filter(f => f.length > 1)
        // some items in the files array are for some reason just [","]

        const outputFiles = []

        files.forEach(file => {
          const s3Url = file[1][0][1]
          outputFiles.push(getAssetUrl(s3Url, page.value.id))
        })

        value = outputFiles
      } else if(value && type === "multi_select") {
        value = value.split(",")
      }

      fields[schemaDefinition.name] = value || undefined
    }

    // create ordered fields
    const orderedFields = []
    if(tableProps) {
      tableProps.forEach(field => {
        if(field.visible) {
          const obj = {}
          obj[schema[field.property].name] = fields[schema[field.property].name]
          // if(fields[schema[field.property].name]) // we do want empty object to appear — makes it easier to traverse since all arrays will be equal length
          orderedFields.push(obj)
        }
      })
    }

    let content
    if(getContent) {
      content = await getContentFromId({id, recordMap, collectionMap})
      // console.log('Getting linked content', id, page.value.type, recordMap.block[id].value.properties ? recordMap.block[id].value.properties.title[0] : ' [no title]', )
    }

    output.push({
      fields, 
      orderedFields,
      title: page.value.properties.title,
      id: page.value.id,
      emoji: page.value.format && page.value.format.page_icon,
      created: page.value.created_time,
      last_edited: page.value.last_edited_time,
      // recordMap: tableData.recordMap,
      content,
    })
  })

  return output

}


module.exports = getTableFromId


// prevents circular dependency trap (markdown <> contents)
const getContentFromId = require("./getContentFromId.js")


