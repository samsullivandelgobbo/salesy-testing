const playwright = require("playwright")
const database = require("../db")
const sqlite3 = require('sqlite3').verbose()

function getDb() {
  let db = new sqlite3.Database(
    "AutoTraderCA.db",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.error(err.message)
      }
      console.log("Connected to DB\nChecking for vehicles table")
      // await checkTable(db)
      // console.log('Checking for dealership table')
    }
  )
  return db
}

async function getLinks() {
  let db = getDb()
  let sql = `
  SELECT * FROM vehicles

  `
  return new Promise((resolve, reject) => {
    let links = []
    let ids = []
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err)
      }
      // console.log(rows)
      rows.forEach((row) => {
        links.push(row.link)
        ids.push(row.id)


      })

      resolve({ links: links, ids: ids })
    })
  })
}

async function main() {
  let rows = await getLinks()
  links = rows.links


  let linkLen = links.length
  let id = await rows.ids
  let dealerID = 1

  // console.log(linkLen)
  // scrapePage(links[1].link)
  for (let i = 24054; i < linkLen; i++) {
    let data = await scrapePage(links[i])
    // console.log(id[i])

    // console.log(data.dealerWebLink, data.dealerName)
    if (data.dealerWebLink) {
      UpdateDB(data.dealerName, data.dealerWebLink, id[i])

    } else if (data.dealerName) {
      UpdateDB(data.dealerName, '', id[i])

    }
    i++



  }
}
let db = getDb()

async function UpdateDB(dealerName, dealerLink, vehicleID) {

  console.log('\nDealerName\n', dealerName, '\nDealerLink\n', dealerLink, '\nVehicleID\n', vehicleID)
  // let sitelink = await dealerLink.split(' ')
  // console.log(await sitelink)
  console.log('INSERTING INTO DEALERSHIPS')
  // db.serialize(async function () {

  let sql = `INSERT INTO dealerships (siteLink, dealername) VALUES (?, ?)`
  db.run(sql, dealerLink, dealerName, (err) => {
    if (err) {
      console.error(err.message)
    }

  })
  // })

  // db.run(`
  // UPDATE vehicles
  //   SET dealer = ?
  //   WHERE id = ?
  // `, dealerID, vehicleID, (err) => {
  //   if (err) {
  //     console.error(err.message)
  //   }
  //   console.log('Updated Vehicle Dealer:', dealerID)
  // })

}

// UpdateDB()

async function scrapePage(link) {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await playwright.chromium.launch({
        headless: false,
      })
      const page = await browser.newPage()

      await page.goto(`https://autotrader.ca/${link}`)

      let isDealer = await page.isVisible('vdp-dealer-info')
      console.log('\nisDealer:', isDealer)
      let isPrivateSeller = await page.isVisible('#privateLeadContainer')
      console.log('\nisPrivateSeller:', isPrivateSeller)
      if (isDealer) {
        let dealerData
        console.log('\nGetting Dealership info\n')
        const dealerInfo = page.locator('vdp-dealer-info').first()
        const dealerName = await dealerInfo.locator('p.di-name').allInnerTexts()

        let hasWebsite = await page.isVisible('#dealerWebsiteLink')

        if (hasWebsite) {
          let dealerWebLink = dealerInfo.locator('#dealerWebsiteLink')
          dealerWebLink = await dealerWebLink.getAttribute('href')
          data = { dealerName, dealerWebLink }
        } else {
          data = { dealerName }
        }


        page.close()
        browser.close()
        resolve(data)
        page.close()

      } else {

        page.close()
        browser.close()
        resolve('\nPrivate Seller')
      }
    } catch (err) {
      reject(err)
    }
  })

}

main()

