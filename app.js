const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https")
const ejs = require("ejs");
const country = require("country-list-js");
const d2d = require("degrees-to-direction");

const app = express();

let countryID = [];
countryID = country.ls("iso2");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res){
  res.render("home",{
    code: countryID
  });
});

app.post("/", function(req, res){
  const apiKey = "2369b29f592b846dcf8f05a1f3416d55";
  let cityName = req.body.cityName;
  const zipCode = req.body.zip;
  const countryCode = req.body.countryCode;
  if (cityName === undefined) {
    cityName = ''
  }else{
    cityName = req.body.cityName;
  }
  const url = "https://api.openweathermap.org/data/2.5/weather?APPID=" + apiKey  + "&zip=" + zipCode + "," + countryCode + "&units=metric" + "&q=" + cityName;
  https.get(url, function(response){
    console.log(response.statusCode);
    if (response.statusCode === 404) {
      res.redirect("/error")
    }
    response.on("data", function(data){
      const weatherData = JSON.parse(data);
      res.render("weather",{
        city:weatherData.name,
        temp: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        windSpeed: weatherData.wind.speed,
        windDird2d: d2d(weatherData.wind.deg),
        windDir: weatherData.wind.deg,
        des: weatherData.weather[0].description,
      });
    });
  });
});

app.get("/error", function(req, res){
  res.render("error");
});


app.listen(process.env.PORT || 3000, function(){
  console.log("Server is started on 3000");
});
