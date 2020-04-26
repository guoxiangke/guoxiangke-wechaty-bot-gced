var levelup = require('levelup')
var leveldown = require('leveldown')

// 1) Create our store
let db = levelup(leveldown('../../rocksdb'))

let f = async function (db){
// 2) Put a key & value
await db.put('hello', 'leveldb-rocksdb', function (err) {
  if (err) return console.log('Ooops!', err) // some kind of I/O error

  // 3) Fetch by key
  
})
await db.get('hello', function (err, value) {
    if (err) return console.log('Ooops!', err) // likely the key was not found

    // Ta da!
    console.log('name=' + value)
  })
}

f(db)