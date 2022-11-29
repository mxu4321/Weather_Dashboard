// open weather api key:  871cd2f61f9b7922aecdb5aa1ff191f9
// open weather: https://openweathermap.org/forecast5

//----- display current weather conditions -----
// get below infos from the API for current weather
//    - City name
//    - Date&time
//    - Icon image (visual representation of weather conditions)
//    - temperature
//    - humidity
//    - wind speed
// 5 day forecast info
//    - date
//    - icon
//    - temperature
//    - wind speed
//    - humidity
// recent search history
//    - city name must be clickable

//----- display current date & time use jquery & dayjs -----
function displayTime() {
  $("#current-date").text(dayjs().format("MMM D, YYYY"));
  $("#current-time").text(dayjs().format("h:mm:ss A"));
}
setInterval(displayTime, 1000);
//--------------- variables ---------------
const APIKey = "871cd2f61f9b7922aecdb5aa1ff191f9";
var searchBtn = document.querySelector("#search-button");
var userInput = document.querySelector("#user-search-input");
// var cityArrList = localStorage.getItem("cities") == null?localStorage.setItem("cities", []):localStorage.getItem("cities");//Restore saved city Array
var cityArrList = localStorage.getItem("cities") || [];
console.log(cityArrList);
// this function will run when the user clicks the search button
searchBtn.addEventListener("click", () => {
  // ------ get user input for city name ------
  var cityInput = userInput.value;
  var cityArr = cityInput.split(" ");//split words by empty space

  for (var i = 0; i < cityArr.length; i++) {// each 1st letter of city name will be uppercase
    cityArr[i] = cityArr[i].charAt(0).toUpperCase() + cityArr[i].slice(1);
  }
  //----- city variable for fetch url -----
  var city = cityArr.join(" ");
  var queryURL =`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`;
    //console.log("url1 " + queryURL);

  function searchCity() {
    fetch(queryURL)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        // console.log(data);

        var cityName = data.name;
        var currentTemp = Math.round(data.main.temp);
        var currentHumidity = data.main.humidity;
        var currentWindSpeed = data.wind.speed;
        var currentWeatherIcon = data.weather[0].icon;
        // ----- check the value -----
        // console.log(cityName);
        // console.log(currentTemp + "℉");
        // console.log(currentHumidity + "%");
        // console.log(currentWindSpeed + "mph");

        // ----- display the current weather data on the right-top side of page -----
        function displayCurrentWeather() {
          $("#city-name-display").text(city);
          $("#temperature").text(currentTemp);
          $("#humidity").text(currentHumidity);
          $("#wind-speed").text(currentWindSpeed);
          var iconTemplate = ``;
          document.getElementById("weather-icon").innerHTML = "";
          iconTemplate = `<img src="http://openweathermap.org/img/wn/${currentWeatherIcon}.png" alt="weather-icon" id="current-weather-icon">`;
          document.getElementById("weather-icon").innerHTML += iconTemplate;
        }
        displayCurrentWeather();
      });
  }

  searchCity();
  getCityGeo(city, APIKey); // to get the city's geo latitudes & longitudes
  // --------⬇to be completed⬇------------
  saveRecentSearch(city); // to save the recent search to local storage & display under the search box
  // ❕待完成❕saved search可以被点击 
  // ❕待完成❕点击后，之前的current weather & 5-day forecast会被清除，然后重新显示新的current weather & 5-day forecast
  // ❕待完成❕if user input is empty or invalid, display error message, and display the last search result

  //----- get the city's geo latitudes & longitudes -----
  function getCityGeo(city, APIKey) {
    var cityGeoCodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${APIKey}`;
     //console.log("url2 " + cityGeoCodeURL);
    fetch(cityGeoCodeURL)
      .then(function (response) {
        //console.log(response);
        return response.json();
      })
      .then(function (data) {
        //console.log(data);
        var lat = data[0].lat.toFixed(2);
        var lon = data[0].lon.toFixed(2);
        //console.log(lat);
        //console.log(lon);
        displayFiveDayForecast(lat, lon);
      });
  }

  // -------- pass lat&lon into getCityGeo function --------
  function displayFiveDayForecast(lat, lon) {
    var fiveDayForecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;
    // console.log("URL3: "+fiveDayForecastURL);
    fetch(fiveDayForecastURL) 
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
         //console.log("second fetch", data);

        // display the 5 day forecast under the current weather display
        document.getElementById("forecast").innerHTML = "";
        var template = ``;
        for (var i = 0; i < data.list.length; i += 8) {
          var date = data.list[i].dt_txt.substring(0, 10);
          var humidity = data.list[i].main.humidity;
          var windSpeed = data.list[i].wind.speed;
          var temp = Math.round(data.list[i].main.temp);
          template = `
            <ul class="forecast-five-day">
            <li><span class="fs-5 text">${date}</span></li>
            <img src="http://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png" alt="weather-icon" id="forecast-weather-icon">
            <li> Temp: <span class="fs-5 text">${temp}&#176F</span></li>
            <li> Wind: <span class="fs-5 text">${windSpeed}MPH</span></li>
            <li> Humidity: <span class="fs-5 text">${humidity}%</span></li>
            </ul>
            `;
          document.getElementById("forecast").innerHTML += template;
        }
      });
  }

// ----- save searched cities & display under the search box -----
  function saveRecentSearch(city) { 
    cityArrList.push(city);//Add the new city to the array
      //Remove the oldest city if reaching the limit(No more than 8)
      cityArrList.slice(-8);

      for (var i = 0; i < 8; i++) {
        var buttonEl = document.createElement("button");
        buttonEl.textContent = city;
        buttonEl.setAttribute("class", "searched-city-btn btn btn-secondary px-5 my-1");
        // buttonEl.setAttribute("data-cities",""); 
        var recentSearch = document.querySelector("#recent-search");
        recentSearch.appendChild(buttonEl);
        localStorage.setItem("cities", cityArrList);
      }

    //   for (cityName of cityArrList) { // for of/in is for object only
    //     var buttonEl = document.createElement("button");
    //     buttonEl.textContent = cityName;
    //     buttonEl.setAttribute("class", "searched-city-btn btn btn-secondary px-5 my-1");
    //     buttonEl.setAttribute("data-cities",""); // ❓ how to set up for different cities ❓
    //     var recentSearch = document.querySelector("#recent-search");
    //     recentSearch.appendChild(buttonEl);
    // }

      //Make the buttons clickable

      //Save the new array back to localstorage.
      

    // ❓if user input is empty or INVALID, display error message, and display the last search result❓
    if (city === "") {
      alert("Please enter a city name");
    }
  }









});