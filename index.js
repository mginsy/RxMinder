const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

const accountSid = process.env.accountSID;
const authToken =  process.env.authToken;
const client = require('twilio')(accountSid, authToken);

let data = {};

const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}

app.use(cors(corsOptions)); // Use this after the variable declaration

// GET and POST routes
app.get("/getData", (req, res) => {
  // console.log("In / route!");
  // res.send("Hello world");
  console.log(data);
  res.json(data);
});

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Insert endpoint
app.post("/add", (req, res) => {
  const medicationName = req.body.medication;
  const scheduleTime = req.body.time;
  const daysArray = req.body.dayArr;
  const patientPhoneNum = req.body.patientPhone;
  const caregiverPhoneNum = req.body.caregiverPhone;

  data = {
    medication: medicationName,
    time: scheduleTime,
    dayArr: daysArray,
    patientPhone: patientPhoneNum,
    caregiverPhone: caregiverPhoneNum,
    taken: false,
    timeTaken: ""
  };

  console.log(data);

  res.sendStatus(200);
}); 

app.post("/taken", (req, res) => {
  data.taken = true;

  let UTCdate = new Date(req.body.published_at);

  let PTDdate = new Date(UTCdate.setHours(UTCdate.getHours()-7));

  let minutes = String(PTDdate.getMinutes());

  if (minutes.length == 1){
    minutes = "0" + minutes;
  }

  data.timeTaken = PTDdate.getHours() + ':' + minutes;

  console.log(data);

  res.sendStatus(200);
}); 

app.post("/test", (req, res) => {
  console.log("hi"); 

  let toCaregiverPhone = "+1" + data.caregiverPhone;
  let toPatientPhone = "+1" + data.patientPhone;

  client.calls
      .create({
         twiml: '<Response><Say>This is Reminder, your patient\'s medication is ready. Please check up on them.</Say></Response>',
         to: toCaregiverPhone,
         from: '+18643852438'
       })
      .then(call => console.log(call.sid));

  /*client.calls
      .create({
         twiml: '<Response><Say>Hello, this is reminder, your medication is ready. Please go pick it up.</Say></Response>',
         to: toPatientPhone,
         from: '+18643852438'
       })
      .then(call => console.log(call.sid));*/

  res.sendStatus(200);
}); 

app.listen(port, () => {
  console.log("Example app listening.");
});