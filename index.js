const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

// käynnistyy komennolla npm run watch
app.use(bodyParser.json())

// tehtävä 3.7
// app.use(morgan('tiny'))

// tehtävä 3.8*
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

// tehtävä 3.1, loput package.jsonissa
let persons = [
    {
      name: "Muumi Mamma",
      number: "040-123456",
      id: 1
    },
    {
      name: "Muumi Pappa",
      number: "040-123456",
      id: 2
    },
    {
      name: "Muumi Peikko",
      number: "040-123456",
      id: 3
    },
    {
      name: "Niisku Neiti",
      number: "040-123456",
      id: 4
    }
  ]

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/persons', (req, res) => {
    res.json(persons)
})

// tehtävä 3.2
app.get('/info', (req, res) => {
    const date = new Date()
    res.send(
        `<div>
            <p>Puhelinluettelossa on ${persons.length} henkilön tiedot</p>
            <p>${date}</p>
        </div>`        
    )
})

// tehtävä 3.3
app.get('/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)
    if (person){
        res.json(person)
    } else {
        res.status(404).end()
    }    
})

// tehtävä 3.4
app.delete('/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    persons = persons.filter(person => person.id !== id);
  
    res.status(204).end();
})

const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(p=>p.id))
        : 0
    
    const arvottuId = Math.floor(Math.random()*200)
    return arvottuId
}
// tehtävä 3.5 
app.post('/api/persons', (req, res) => {
    const body = req.body
    // tehtävä 3.6 virheen käsittely
    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'nimi tai numero puuttuu'
        })
    }

    if (persons.map(person => person.name.toLowerCase()).includes(body.name.toLowerCase())){
        return res.status(400).json({
            error: 'lisättävä nimi on jo luettelossa'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }
    persons = persons.concat(person)
    console.log(person)
    res.json(person)
})

// middleware joka antaa routejen käsittelemättömistä 
// virhetilanteista JSON-muotoisen virheilmoituksen
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})