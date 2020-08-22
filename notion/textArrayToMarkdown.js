/* Turns an array of text, returned by Notion's API, into Markdown */

const katex = require("katex")

const escapeText = require("../helpers/escape")

module.exports = (source, options={ br: true, escape: true }) => {
  const output = []

  if(!source) return ""

  source.forEach(clip => {
    let text = options.escape ? escapeText(clip[0]) : clip[0]

    if(clip.length === 1) {
      output.push(text)
    } else {
      const modifiers = clip[1]

      modifiers.forEach(mod => {
        const modCode = mod[0]

        if(modCode === "b") {
          text = `**${text.trim()}** `
        } else if(modCode === "i") {
          text = `_${text.trim()}_ `
        } else if(modCode === "a") {
          text = `[${text}](${mod[1]})`
        } else if(modCode === "s") {
          text = `~~${text.trim()}~~`
        } else if(modCode === "_") { // underline
          text = `<u>${text.trim()}</u>` // no markdown for underline
        } else if(modCode === "h") {
          const color = mod[1].split("_")[0]
          const isBackground = mod[1].split("_").length > 1
          text = `<span class="${isBackground ? "background" : "color"}-${color}">${text}</span> `
        } else if(modCode === "c") {
          text = `
~~~
${text}
~~~`
        } else if(modCode === "e") {
          text = `<span class="equation">${katex.renderToString(mod[1], { throwOnError: false })}</span>`
        } else {
          console.error("Unhandled modification in textArrayToHarkdown()", mod, ' text:', text)
        }
      })

      output.push(text)
    }

  })
  
  return options.br ? output.join("").replace(/\n/g, "<br>") : output.join("")
}