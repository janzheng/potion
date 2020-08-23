
const call = require("./call")

async function getPageChunkFromId(id) {
  const chunk = await call("loadPageChunk", {
    pageId: id,
    limit: 999999,
    cursor: {
      stack: []
    },
    chunkNumber: 0,
    verticalColumns: false
  })

  // console.log('----> chunk?', chunk)
  return chunk
}


module.exports = getPageChunkFromId