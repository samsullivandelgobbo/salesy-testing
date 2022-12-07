const sqlite3 = require("sqlite3").verbose()

function initDatabase() {
  let db = new sqlite3.Database(
    "AutoTrader.db",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.error(err.message)
      }
      console.log("Connected to DB\nChecking for vehicles table")
      checkTable(db)
    }
  )
  return db
}

function checkTable(db) {
  let sql = `
  SELECT name
  FROM sqlite_master
  WHERE type='table' AND name='vehicles'
`
  db.get(sql, (err, row) => {
    if (err) {
      console.error(err.message)
    }
    if (row) {
      console.log("Vehicles table exists")
    } else {
      console.log("Vehicles table does not exist, creating table")
      createTables(db)
    }
  })
}

function createTables(db) {
  db.run(
    `CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    make TEXT,
    year INTEGER ,
    price INTEGER NOT NULL,
    link TEXT NOT NULL,
    odometer TEXT NOT NULL
  )`,
    (err) => {
      if (err) {
        console.error(err.message)
      }
      console.log("Created vehicles table")
    }
  )
}
// function addVehicle(db, data) {
//   let sql = `
//   INSERT INTO vehicles (id, title, make, year, price, link, odometer) VALUES (?, ?, ?, ?, ?, ?, ?)
//   `
//   db.run(sql, [data.id, data.title, data.make, data.year, data.price, data.link, data.odometer], (err) => {
//     if (err) {
//       console.error(err.message)
//     }
//     console.log("Row added to the vehicles table")
//   })
//   db.close((err) => {
//     if (err) {
//       console.error(err.message)
//     }
//     console.log("Closed the database connection")
//   })
// }

// db.close((err) => {
//   if (err) {
//     console.error(err.message)
//   }
//   console.log("Closed the database connection")
// })

// let data = {
//   id: 123,
//   title: "abc",
//   make: "coco",
//   year: 2020,
//   price: 2020,
//   link: "Abc",
//   odometer: "2333",
// }
// db = createDatabase()
// addVehicle(db, data)

module.exports = {
  initDatabase
}