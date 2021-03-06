const config = require('../config')
const FullContact = require('fullcontact')
const apiKey = config.apiKey
const fullcontact = new FullContact(apiKey)
const rateLimit = require('function-rate-limit')

const fullcontactRequest = rateLimit(config.fullContactLimit, 62000, fn => fn())

class Q {
  constructor ({sdk, credentials, project, source, dest, error, sourceC, destC, errorC}) {
    this.tables = {}
    this.project = project
    this.source = source
    this.dest = dest
    this.error = error
    this.sourceC = sourceC
    this.destC = destC
    this.errorC = errorC
    this.sourceId = false
    this.destId = false
    this.errorId = false
    this.sourceCId = false
    this.destCId = false
    this.errorCId = false
    this.credentials = credentials
    this.debounced = this.debounce(this.onRequest.bind(this), 500)
    let dt = new sdk.Project(this.credentials, this.project).getDataTable()
    this.dt = { table: dt, handlers: {}, websocketOpen: false }
    this.createWebsocket()
    this.initCells()
  }

  debounce (func, wait, immediate) {
    var timeout
    return function () {
      var context = this
      var args = arguments
      var later = function () {
        timeout = null
        if (!immediate) func.apply(context, args)
      }
      var callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(context, args)
    }
  }

  initCells () {
    this.dt.table.listCells().then((cells) => {
      cells.entities.forEach((cell) => {
        if (cell.label === this.source) this.sourceId = cell.id
        if (cell.label === this.dest) this.destId = cell.id
        if (cell.label === this.error) this.errorId = cell.id
        if (cell.label === this.sourceC) this.sourceCId = cell.id
        if (cell.label === this.destC) this.destCId = cell.id
        if (cell.label === this.errorC) this.errorCId = cell.id
      })

      // tbc add that user can type name of cell for target and error keys to documentation

      // tbc add promise to initcells function because of race condition

      if (!this.destId) {
        this.dt.table.createCell(this.dest, {description: this.dest, value: 'No data yet'})
          .then((cell) => { this.destId = cell.id })
      }
      if (!this.destCId) {
        this.dt.table.createCell(this.destC, {description: this.destC, value: 'No data yet'})
          .then((cell) => { this.destCId = cell.id })
      }
      if (!this.errorId) {
        this.dt.table.createCell(this.error, {description: this.error, value: 'No errors yet!'})
          .then((cell) => { this.errorId = cell.id })
      }
      if (!this.errorCId) {
        this.dt.table.createCell(this.errorC, {description: this.errorC, value: 'No errors yet!'})
          .then((cell) => { this.errorCId = cell.id })
      }
    })
  }

  onRequest (msg) {
    if (msg.type === 'CELL_MODIFIED' && msg.body.label === this.source) {
      this.dt.table.getCell(msg.body.id).fetch()
        .then((cell) => {
          if (cell.value) {
            let val = cell.value

            if (!Array.isArray(val)) {
              this.dt.table.getCell(this.errorId).update({value: 'Please enter valid JSON Array'})
              return
            }

            const responsePs = val.map((email) => {
              return new Promise(resolve => {
                fullcontactRequest(() => {
                  fullcontact.person.email(email, (err, response) => {
                    if (err) {
                      resolve({ status: err.status, errorMesssage: err.message, email })
                    } else {
                      response.email = email
                      resolve(response)
                    }
                  })
                })
              })
            })

            Promise.all(responsePs)
              .then((rawResponses) => {
                const {
                 responses,
                 errors
                } = rawResponses.reduce((acc, response) => {
                  delete response.requestId
                  if (response.status !== 200) {
                    acc.errors.push(response)
                  } else if (response.status === 202) {
                    acc.errors.push(response)
                  } else {
                    acc.responses.push(response)
                  }
                  return acc
                }, {responses: [], errors: []})

                this.dt.table.getCell(this.destId).update({value: responses})
                this.dt.table.getCell(this.errorId).update({value: errors})
              })
          }
        })
    } else if (msg.type === 'CELL_MODIFIED' && msg.body.label === this.sourceC) {
      this.dt.table.getCell(msg.body.id).fetch()
        .then((cell) => {
          if (cell.value) {
            let valC = cell.value

            if (!Array.isArray(valC)) {
              this.dt.table.getCell(this.errorCId).update({value: 'Please enter valid JSON Array'})
              return
            }

            const responsePs = valC.map((companyAddr) => {
              return new Promise(resolve => {
                fullcontactRequest(() => {
                  fullcontact.company.domain(companyAddr, (err, response) => {
                    if (err) {
                      resolve({ status: err.status, errorMessage: err.message, domain: companyAddr })
                    } else {
                      response.domain = companyAddr
                      resolve(response)
                    }
                  })
                })
              })
            })

            Promise.all(responsePs)
              .then((rawResponses) => {
                const {
                 responses,
                 errors
                } = rawResponses.reduce((acc, response) => {
                  delete response.requestId
                  if (response.status !== 200) {
                    acc.errors.push(response)
                  } else if (response.status === 202) {
                    acc.errors.push(response)
                  } else {
                    acc.responses.push(response)
                  }
                  return acc
                }, {responses: [], errors: []})

                this.dt.table.getCell(this.destCId).update({value: responses})
                this.dt.table.getCell(this.errorCId).update({value: errors})
              })
          }
        })
    }
  }

  createWebsocket () {
    var options = {}

    const websocketRefHandler = (msg) => {
      for (var k in this.dt.handlers) {
        this.dt.handlers[k](msg)
      }
    }

    this.dt.handlers[this.credentials.idToken.payload.sub] = this.debounced

    if (!this.dt.websocketOpen) {
      this.dt.websocketOpen = true
      this.dt.table.openWebSocket(options)
      this.dt.table.addWebSocketHandler(websocketRefHandler)
    }
  }
}

module.exports = Q
