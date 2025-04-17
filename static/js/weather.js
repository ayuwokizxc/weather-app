document.addEventListener('DOMContentLoaded', function() {
    const weatherForm = document.getElementById('weatherForm');
    const cityInput = document.getElementById('cityInput');
    const weatherContainer = document.getElementById('weatherContainer');
    const initialState = document.getElementById('initialState');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    const retryButton = document.getElementById('retryButton');
    const demoCityButtons = document.querySelectorAll('.demo-city');
    
    const cityName = document.getElementById('cityName');
    const dateTime = document.getElementById('dateTime');
    const weatherIcon = document.getElementById('weatherIcon');
    const temperature = document.getElementById('temperature');
    const weatherDescription = document.getElementById('weatherDescription');
    const feelsLike = document.getElementById('feelsLike');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');
    const pressure = document.getElementById('pressure');
    const sunrise = document.getElementById('sunrise');
    const sunset = document.getElementById('sunset');
    const visibility = document.getElementById('visibility');
    const cloudiness = document.getElementById('cloudiness');
    
    const metricUnit = document.getElementById('metricUnit');
    const imperialUnit = document.getElementById('imperialUnit');
    
    let currentWeatherData = null;
    let currentUnit = 'metric';
    
    weatherForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherData(city, currentUnit);
        }
    });
    
    demoCityButtons.forEach(button => {
        button.addEventListener('click', function() {
            const city = this.dataset.city;
            cityInput.value = city;
            fetchWeatherData(city, currentUnit);
        });
    });
    
    metricUnit.addEventListener('change', function() {
        if (this.checked && currentUnit !== 'metric') {
            currentUnit = 'metric';
            if (currentWeatherData) {
                fetchWeatherData(currentWeatherData.name, currentUnit);
            }
        }
    });
    
    imperialUnit.addEventListener('change', function() {
        if (this.checked && currentUnit !== 'imperial') {
            currentUnit = 'imperial';
            if (currentWeatherData) {
                fetchWeatherData(currentWeatherData.name, currentUnit);
            }
        }
    });
    
    retryButton.addEventListener('click', function() {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherData(city, currentUnit);
        } else {
            errorContainer.classList.add('d-none');
            initialState.classList.remove('d-none');
        }
    });
    
    function fetchWeatherData(city, units = 'metric') {
        showLoadingState();
        
        const apiKey = 'ab9dca2253730a52a0483ad43099fdf3';
        
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}&lang=ru`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.message || 'Ошибка при получении данных о погоде');
                    });
                }
                return response.json();
            })
            .then(data => {
                currentWeatherData = data;
                displayWeatherData(data);
            })
            .catch(error => {
                showErrorState(error.message);
                console.error('Error fetching weather data:', error);
            });
    }
    
    function displayWeatherData(data) {
        hideLoadingState();
        hideErrorState();
        
        cityName.textContent = `${data.name}, ${data.sys.country}`;
        dateTime.textContent = formatDateTime(new Date());
        
        const weatherCondition = data.weather[0].main;
        const weatherCode = data.weather[0].id;
        const weatherIconCode = data.weather[0].icon;
        
        weatherIcon.innerHTML = getWeatherIcon(weatherCode, weatherIconCode);
        
        temperature.textContent = `${Math.round(data.main.temp)}°${currentUnit === 'metric' ? 'C' : 'F'}`;
        weatherDescription.textContent = capitalizeFirstLetter(data.weather[0].description);
        feelsLike.textContent = `${Math.round(data.main.feels_like)}°${currentUnit === 'metric' ? 'C' : 'F'}`;
        
        humidity.textContent = `${data.main.humidity}%`;
        windSpeed.textContent = `${data.wind.speed} ${currentUnit === 'metric' ? 'м/с' : 'миль/ч'}`;
        pressure.textContent = `${data.main.pressure} гПа`;
        visibility.textContent = `${(data.visibility / 1000).toFixed(1)} км`;
        cloudiness.textContent = `${data.clouds.all}%`;
        
        sunrise.textContent = formatTime(data.sys.sunrise * 1000);
        sunset.textContent = formatTime(data.sys.sunset * 1000);
        
        applyWeatherTheme(weatherCondition);
        
        initialState.classList.add('d-none');
        weatherContainer.classList.remove('d-none');
        weatherContainer.classList.add('fade-in');
        
        setTimeout(() => {
            weatherContainer.classList.remove('fade-in');
        }, 500);
    }
    
    function showLoadingState() {
        initialState.classList.add('d-none');
        weatherContainer.classList.add('d-none');
        errorContainer.classList.add('d-none');
        loadingIndicator.classList.remove('d-none');
    }
    
    function hideLoadingState() {
        loadingIndicator.classList.add('d-none');
    }
    
    function showErrorState(message) {
        hideLoadingState();
        initialState.classList.add('d-none');
        weatherContainer.classList.add('d-none');
        errorContainer.classList.remove('d-none');
        
        if (message.includes('401') || message.includes('API key')) {
            errorMessage.innerHTML = 'Ошибка API ключа: Сервис погоды в настоящее время недоступен. ' +
                                    'Скорее всего, это связано с тем, что API ключ еще не активирован. ' +
                                    '<br><br>' +
                                    'Новые API ключи OpenWeather могут активироваться до 2 часов. ' +
                                    'Пожалуйста, попробуйте позже.';
        } else if (message.includes('не найден') || message.includes('not found')) {
            errorMessage.innerHTML = 'Город не найден. Пожалуйста, проверьте правильность написания и попробуйте снова.';
        } else {
            errorMessage.textContent = message || 'Ошибка при получении данных о погоде';
        }
    }
    
    function hideErrorState() {
        errorContainer.classList.add('d-none');
    }
    
    function formatDateTime(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('ru-RU', options);
    }
    
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function getWeatherIcon(code, iconCode) {
        const isDay = iconCode.includes('d');
        
        if (code >= 200 && code < 300) {
            return '<i class="fas fa-bolt text-warning"></i>';
        } else if (code >= 300 && code < 400) {
            return '<i class="fas fa-cloud-rain text-info"></i>';
        } else if (code >= 500 && code < 600) {
            return '<i class="fas fa-cloud-showers-heavy text-info"></i>';
        } else if (code >= 600 && code < 700) {
            return '<i class="fas fa-snowflake text-white"></i>';
        } else if (code >= 700 && code < 800) {
            return '<i class="fas fa-smog text-secondary"></i>';
        } else if (code === 800) {
            return isDay ? 
                '<i class="fas fa-sun text-warning"></i>' : 
                '<i class="fas fa-moon text-light"></i>';
        } else if (code === 801) {
            return isDay ? 
                '<i class="fas fa-cloud-sun text-warning"></i>' : 
                '<i class="fas fa-cloud-moon text-light"></i>';
        } else {
            return '<i class="fas fa-cloud text-secondary"></i>';
        }
    }
    
    function applyWeatherTheme(condition) {
        document.body.classList.remove(
            'theme-clear', 
            'theme-clouds', 
            'theme-rain', 
            'theme-thunderstorm', 
            'theme-snow', 
            'theme-mist'
        );
        
        switch(condition.toLowerCase()) {
            case 'clear':
                document.body.classList.add('theme-clear');
                break;
            case 'clouds':
                document.body.classList.add('theme-clouds');
                break;
            case 'rain':
            case 'drizzle':
                document.body.classList.add('theme-rain');
                break;
            case 'thunderstorm':
                document.body.classList.add('theme-thunderstorm');
                break;
            case 'snow':
                document.body.classList.add('theme-snow');
                break;
            case 'mist':
            case 'fog':
            case 'haze':
                document.body.classList.add('theme-mist');
                break;
            default:
                document.body.classList.add('theme-clear');
        }
    }
});
