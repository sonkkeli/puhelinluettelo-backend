// ohjelma käynnistyy komennolla npm run watch
if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const logger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(express.static('build'))

app.use(bodyParser.json())

// MORGANIN KONFIGUROINTI
// app.use(morgan('tiny'))
app.use(morgan((tokens, req, res) => {
    morgan.token('data', ((req, res) => { return JSON.stringify(req.body) }))
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.data(req, res)
    ].join(' ')
}))

app.use(cors())

app.get('/api', (req, res) => {
    res.send('<h1>Hello API!</h1>')
})

// LISTAAMINEN
app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons.map(person => person.toJSON()))
    })
})

// INFOSIVU
app.get('/api/info', (req, res) => {
    const date = new Date()
    let amount = 0

    Person
    .find({})
    .then(results => {
        amount = results.length
        res.send(
            `<div>
                <p>Puhelinluettelossa on ${amount} henkilön tiedot</p>
                <p>${date}</p>
            </div>`
        )
    })
})

// YKSITTÄISEN HENKILÖN NÄYTTÄMINEN, testaa esim id:llä 5cacdefe5f34dc49bc21910f
app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
    .then(person => {
        if (person){
            res.json(person.toJSON())
        } else {
            console.log('kyseistä henkilöä ei löydy tietokannasta')
            res.status(404).end()
        }        
    })
    .catch(error => next(error))   
})

// POISTAMINEN
app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
    .then(result => {
        res.status(204).end()
    })
    .catch(error => next(error))
})

// LISÄÄMINEN
app.post('/api/persons', (req, res, next) => {
    
    const body = req.body

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        res.json(savedPerson.toJSON())
    })
    .catch(error => next(error))

    console.log(person)    
})

// PUHELINNUMERON PÄIVITTÄMINEN
app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
        res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

// middleware joka antaa routejen käsittelemättömistä 
// virhetilanteista JSON-muotoisen virheilmoituksen
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// ERRORHANDLER MIDDLEWARE
const errorHandler = (error, request, response, next) => {
    console.error(error.message)  
    if (error.name === 'CastError' && error.kind == 'ObjectId') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
