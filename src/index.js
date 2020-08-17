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
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
const recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY)

const requestValidation = [
  check ("name", "A valid name is required").not().isEmpty().trim().escape(),
  check ("year", "A valid year/grade is required").not().isEmpty().trim().escape(),
  check ("email", "A valid email is required").optional().isEmail().normalizeEmail(),
  check("message", "A message is required to send an email").not().isEmpty().trim().escape().isLength({max:2000})
]

const indexRoute = express.Router()

const indexRouteMiddleware = (request, response, nextFunction)  => {
  return response.json("express server is live")
}

const handleEmailPost = function(request, response, nextFunction) {
  response.append('Content-Type', 'text/html')

  if(request.recaptcha.error){
    return response.send(`<div class='alert alert-danger' role ='alert'> <strong> There was an error with Recaptcha please try again</strong></div>`)
  }

  const errors = validationResult(request)

  if(!errors.isEmpty()) {
    const currentError = errors.array ()[0]
    return response.send(Buffer.from(`<div class='alert alert-danger' role ='alert'> <strong> There was an error please try again</strong> ${currentError.msg}</div>`))
  }

  const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN})
  const {name, year, email, message} = request.body

  const mailgunData = {
    to: "dixiecooper100@gmail.com",
    from: `Mailgun Sandbox <postmaster@${process.env.MAILGUN_DOMAIN}>`,
    subject: `${name} - ${year} : ${email}`,
    text: message
  }
console.log(process.env.MAILGUN_RECIPIENT)
  mg.messages().send(mailgunData, (error) => {
    if (error) {
      console.log(error)
      return response.send(Buffer.from(`<div class='alert alert-danger' role='alert'><strong>Oh snap!</strong> Unable to send email error with email sender</div>`))
    }
    return response.send(Buffer.from("<div class='alert alert-success' role='alert'>Email successfully sent.</div>"))
  })
}


indexRoute.route('/')
  .get(indexRouteMiddleware)
  .post(recaptcha.middleware.verify, requestValidation, handleEmailPost)

app.use('/apis', indexRoute)

app.listen(4200, () => {console.log("express server was successfully built")})