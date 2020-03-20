let video = document.querySelector('video');
window.addEventListener('scroll', () => {
  let value = 1 + window.scrollY / -600;
  video.style.opacity = value;
})

//querySelector

const formSearch = document.querySelector('.form-search'),
  inputCitiesFrom = document.querySelector('.input__cities-from'),
  dropdownCitiesFrom = document.querySelector('.dropdown__cities-from'),
  inputCitiesTo = document.querySelector('.input__cities-to'),
  dropdownCitiesTo = document.querySelector('.dropdown__cities-to'),
  inputDateDepart = document.querySelector('.input__date-depart');

//data

const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
  proxy = 'https://cors-anywhere.herokuapp.com/',
  API_KEY = '618fac694efd7b4171e869dbac97d42d',
  calendar = 'http://min-prices.aviasales.ru/calendar_preload';

let cities = [];

//functions

const getData = (url, callback) => {
  const request = new XMLHttpRequest();

  request.open('GET', url);
  request.addEventListener('readystatechange', () => {
    if (request.readyState !== 4) 
      return;
    
    if (request.status === 200) {
      callback(request.response);
    } else {
      console.error(request.status)
    }
  });

  request.send();
}

const showCity = (input, list) => {
  list.textContent = '';

  if (input.value === '') 
    return;
  
  const filterCities = cities.filter((item) => {
    if (item.name) {
      const fixItem = item
        .name
        .toLowerCase();
      return fixItem.includes(input.value.toLowerCase());
    }
  });

  filterCities.forEach((item) => {
    const li = document.createElement('li');
    li
      .classList
      .add('dropdown__city');
    li.textContent = item.name;
    list.append(li);
  });
};

const selectCity = (event, input, list) => {
  const target = event.target;
  if (target.tagName.toLowerCase() === 'li') {
    input.value = target.textContent;
    list.textContent = '';
  }
}

renderCheapDay = (cheapTickets) => {
  console.log(cheapTickets);

};

renderCheapYear = (cheapTickets) => {
  console.log(cheapTickets);

};

const renderCheap = (data, date) => {
  const cheapTicketsYear = JSON
    .parse(data)
    .best_prices;

  const cheapTicketsDay = cheapTicketsYear.filter(item => {
    return item.depart_date === date;
  });

  renderCheapDay(cheapTicketsDay);
  renderCheapYear(cheapTicketsYear);
}

//handlers

inputCitiesFrom.addEventListener('input', () => {
  showCity(inputCitiesFrom, dropdownCitiesFrom)
});

dropdownCitiesFrom.addEventListener('click', event => {
  selectCity(event, inputCitiesFrom, dropdownCitiesFrom);
});

inputCitiesTo.addEventListener('input', () => {
  showCity(inputCitiesTo, dropdownCitiesTo)
});

dropdownCitiesTo.addEventListener('click', event => {
  selectCity(event, inputCitiesTo, dropdownCitiesTo);
});

formSearch.addEventListener('submit', event => {
  event.preventDefault();

  const formData = {
    from: cities
      .find(item => inputCitiesFrom.value === item.name)
      .code,
    to: cities
      .find(item => inputCitiesTo.value === item.name)
      .code,
    when: inputDateDepart.value
  }

  const requestData = '?depart_date=' + formData.when + '&origin=' + formData.from + '&destination=' + formData.to + '&oneway=true&token=' + API_KEY;

  getData(calendar + requestData, (response) => {
    renderCheap(response, formData.when);
  });
});

//call functions

getData(proxy + citiesApi, data => {
  cities = JSON.parse(data)
});

// getData(proxy + calendar + '?depart_date=2020-05-25', data => {   cities =
// JSON.parse(data) });