const playwright = require("playwright")
async function main() {
  const browser = await playwright.chromium.launch({
    headless: true,
  })
  const page = await browser.newPage()
  await page.goto("https://www.autotrader.ca/cars/")

  const pageNum = page.locator(".page-item")
  let currentPage = page.locator("id=listingsPagerWrapper").locator("li.active")
  let cPage = await currentPage.allTextContents()
  let data = await pageNum.allTextContents()
  console.log(data, cPage)

  const vehicleCard = await page.$$eval("div.result-item", (tableData) => {
    let data = {}
    tableData.forEach((element) => {
      const details = element.querySelector("div.listing-details")
      const title = details.querySelector("span").innerText
      const description = details.querySelector("p.details").innerText
      const odometer = element.querySelector("div.dealer-badges").innerText
      const href = details.querySelector("a").getAttribute("href")
      const id = element.id
      const price = element.querySelector("span.price-amount").innerText

      data[id] = {
        title: title,
        description: description,
        odometer: odometer,
        link: href,
        price: price,
      }
    })
    return data
  })
  console.log(vehicleCard)
}

main()
