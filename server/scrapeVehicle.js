const playwright = require("playwright")
const database = require("../db")

async function getLinks() {
  let sql = `
  SELECT DISTINCT link FROM vehicles
  ORDER BY link
  `
  let db = database.initDatabase()
  return new Promise((resolve, reject) => {
    let data = []
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err)
      }
      rows.forEach((row) => {
        data.push(row)
      })
      resolve(data)
    })
  })
}

async function main() {
  let links = await getLinks()
  links.forEach((link) => {
    scrapePage(link)
  })
}

main()

async function scrapePage(link) {
  const browser = await playwright.chromium.launch({
    headless: true,
  })
  const page = await browser.newPage()
  await page.goto(`https://autotrader.ca/${link}`)

  console.log(page.url)
}
