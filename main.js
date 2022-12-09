const scraper = require('./server/scraper')
const database = require('./db')


async function main() {
  const db = database.initDatabase()
  try {


    let data = await scraper.main()
    let keys = Object.keys(data)


    for (let i = 0; i < keys.length; i++) {
      id = keys[i]
      addVehicle(db, data[id])
    }
    db.close((err) => {
      if (err) {
        console.error(err.message)
      }
      console.log("Closed the database connection")
    })
  } catch (err) {
    console.log('ERROR\n\n\n\n\n', err)
    return
  }
  let timenow = new Date
  let hour = timenow.getHours()
  if (hour < 23) {
    main()
  }
}



function addVehicle(db, data) {
  let sql = `
  INSERT INTO vehicles (id, title, price, link, odometer) VALUES (?, ?, ?, ?, ?)
  `
  db.serialize(function () {
    db.run(sql, data.id, data.title, data.price, data.link, data.odometer, (err) => {
      if (err) {
        console.error(err.message)
      }
      console.log("Row added to the vehicles table")
    })

  })


}

// let timenow = new Date
// let hour = timenow.getHours()
// while (hour < 7) {
//   main()
// }
main()
