const express = require('express')
const Person = require('./models/person')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const person = require('./models/person')
app.use(cors())
app.use(express.json())
app.use(express.static('build'))
morgan.token('myToken', (request) => JSON.stringify(request.body))



app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })

})
app.post('/api/persons', morgan(':method :url :status :res[content-length] - :response-time :myToken'), (request, response,next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }
  if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }


  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(result => {
      response.json(result)
    })
    .catch(error=>next(error))

})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) response.json(person)
      else response.status(404).end()
    })
    .catch(error => next(error))


})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const newPerson = {
    "name": body.name,
    "number": body.number
  }
  Person.findByIdAndUpdate(request.params.id, newPerson, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  const date = new Date()
  Person.find({}).then(persons => {
    response.send(`Phonebook has info for ${persons.length} people 
    <br><br>
    ${date}`)
  })



})


app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown endpoint' })
}


app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if(error.name==='ValidationError') {
    return response.status(400).send({ error:error.message })
  }

  next(error)
}


app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})