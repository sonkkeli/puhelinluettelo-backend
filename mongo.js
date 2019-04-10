const mongoose = require('mongoose')

// tehtävä 3.12 tietokanta komentoriviltä

if ( process.argv.length < 3 ) {
    console.log('give password as argument')
    process.exit(1)
}

// koodi suoritetaan komennolla node mongo.js salasana nimi numero
const password = process.argv[2]

const url = process.env.MONGODB_URI
mongoose.connect(url, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5) {
    const name = process.argv[3]
    const number = process.argv[4]

    const person = new Person({
        name: name,
        number: number,
    })

    person.save().then(response => {
        console.log(`lisätään ${name} numero ${number} luetteloon`)
        mongoose.connection.close();
    })
}

if (process.argv.length === 3) {
    Person
        .find({})
        .then(result => {
            result.forEach(person => {
                console.log(`${person.name} ${person.number}`)
            })
            mongoose.connection.close()
        })
}