const playwright = require("playwright")
const fs = require('fs')
const { randomInt } = require("crypto")
async function main() {
  const browser = await playwright.chromium.launch({
    headless: false,
  })
  const page = await browser.newPage()
  await page.goto("https://www.autotrader.ca/cars/?rcp=100&rcs=0&srt=10&inMarket=advancedSearch")

  const pageNum = page.locator(".page-item")
  let currentPage = page.locator("id=listingsPagerWrapper").locator("li.active")
  let cPage = await currentPage.allTextContents()
  let Pages = await pageNum.allTextContents()

  // console.log(Pages)

  cPage = Number(cPage)

  let npage = cPage + 1
  console.log(npage)
  let nextPage = pageNum.locator(`a.page-link-${npage}`).first()
  // console.log('next page', await nextPage.allInnerTexts())


  async function scrapePage() {
    await page.waitForSelector('div.result-item')

    console.log('Scraping:', page.url())
    try {
      const vehicleCard = await page.$$eval("div.result-item", (tableData) => {
        let data = {}
        let i = 0
        try {
          tableData.forEach((element) => {

            const details = element.querySelector("div.listing-details")
            const title = details.querySelector("span").innerText
            const description = details.querySelector("p.details").innerText
            const odometer = element.querySelector("div.dealer-badges").innerText
            const href = details.querySelector("a").getAttribute("href")
            const id = element.id
            const price = element.querySelector("span.price-amount").innerText

            data[id] = {
              id: id,
              title: title,
              description: description,
              odometer: odometer,
              link: href,
              price: price,
            }
            i++
          })
          return data
        } catch (err) {
          console.log('ERROR @ 56\n\n\n\n\n\n', err)
          return
        }
      })


      let vehicleData = vehicleCard
      let dataLen = Object.keys(vehicleData).length


      console.log('Scraped Page\nNew Entries:', dataLen)
      return { vehicleData, dataLen }

    } catch (err) {
      if (err) {
        console.log('ERROR @ 71\n\n\n\n\n\n', err)

        return
      }
    }
  }



  Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))]
  }
  let dataLen = 0
  let scraped = {}
  // let i = randomInt(90000)
  let i = 0
  // const sort = [35, 10, 9, 3, 4, 11, 12, 7, 8]
  const srt = 9
  // let srt = sort.random()
  while (dataLen < 250000) {
    try {


      await page.goto(`https://www.autotrader.ca/cars/?rcp=100&rcs=${i += 100}&srt=${srt}&inMarket=advancedSearch`)
      let nScrape = await scrapePage()

      dataLen += nScrape.dataLen
      console.log('DataLength:', dataLen)

      scraped = { ...scraped, ...nScrape.vehicleData }
      console.log('object length', Object.keys(scraped).length)
    } catch (err) {
      console.log('ERROR @ 96\n\n\n\n', err)
      page.close()

      return scraped
    }
  }









  page.close()
  browser.close()

  return scraped
}



module.exports = {
  main
}
