
/*

  turns a collection object's fields (from /table endpoint) into a simple markdown table, e.g. 

  First Header | Second Header |
  ------------ | ------------- |
  Content Cell | Content Cell |
  Content Cell | Content Cell |

*/




function getCollectionFromFields (collection) {
  if(collection.length == 0)
    return undefined

  const markdown = []

  // populate the header
  let header = '', divider = ''
  Object.keys(collection[0].fields).reverse().map(fieldKey => {
    header += `${fieldKey} |`
    divider += `:-|` // left align by default
  })

  markdown.push(header+'\n')
  markdown.push(divider+'\n')

  collection.forEach(row => {
    let _row = ''
    Object.keys(row.fields).reverse().map(fieldKey => {
      if(row.fields[fieldKey])
        _row += `${row.fields[fieldKey]} |`
    })
    markdown.push(_row+'\n')
  })

  return markdown.join('')
}


function getCollectionFromOrderedFields (collection) {
  if(collection.length == 0)
    return undefined

  const markdown = []

  // populate the header
  let header = '', divider = ''
  const fieldArr = collection[0].orderedFields
  Object.keys(fieldArr).map(i => {
    header += `${Object.keys(fieldArr[i])[0]} |`
    divider += `:-|` // left align by default
  })

  markdown.push(header+'\n')
  markdown.push(divider+'\n')

  collection.forEach(row => {
    let _row = ''
    Object.keys(row.fields).reverse().map(fieldKey => {
      if(row.fields[fieldKey])
        _row += `${row.fields[fieldKey]} |`
    })
    markdown.push(_row+'\n')
  })

  return markdown.join('')
}



module.exports = getCollectionFromOrderedFields