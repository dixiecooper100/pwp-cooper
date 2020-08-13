const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const Recaptcha = require('express-recaptcha').RecaptchaV2
const {check, validationResult} = require("express-validator")
const mailgun = require('mailgun-js')


//app variable
const app = express()

app.use(morgan('dev'))
app.use(express.json())
app.use(bodyParser.urlencoded({extend: false}))
app.use(bodyParser.json())
const recaptcha = new Recaptcha(process.env.Recaptcha_Site_Key, process.env.Recaptcha_Secret_Key)

const RequestValidation = [
  check ("name", "A valid name is required").not().isEmpty().trim().escape(),
  check ("year", "A valid year/grade is required").not().isEmpty().trim().escape(),
  check ("email", "A valid email is required").optional().isEmail().normalizeEmail(),
  check("message", "A message is required to send an email").not().isEmpty().trim().escape().isLength({max:2000})
]

const indexRoute = express.Router()


const indexRouteMiddleware = (request, response, nextFunction)  => {
  console.log ("request", request)
  nextFunction()
}

const handleEmailPost = function(request, response, nextFunction) => {
  response.appen('Content-Type', 'text/html')

  if(request.recaptcha.error){
    return response.send(`<div class='alert alert-danger' role ='alert'> <strong> There was an error with Recaptcha please try again</strong></div>`)
  }

  const errors = validationResult(request)

  if(!errors.isEmpty()) {
    const currentError = errors.array ()[0]
  }

}




indexRoute.route('/')
  .get(indexRouteMiddleware)
  .post(recaptcha.middleware.verify, requestValidation, handleEmailPost)

app.use('/apis', indexRoute)

app.listen(4200, () => {console.log("express server was successfully built")})