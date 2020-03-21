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
  inputDateDepart = document.querySelector('.input__date-depart'),
  cheapestTicket = document.querySelector('#cheapest-ticket'),
  otherCheapTickets = document.querySelector('#other-cheap-tickets'),
  body = document.querySelector('body');
//data

const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
  proxy = 'https://cors-anywhere.herokuapp.com/',
  API_KEY = '618fac694efd7b4171e869dbac97d42d',
  calendar = 'http://min-prices.aviasales.ru/calendar_preload',
  MAX_COUNT = 5;

let cities = [];

//functions

const getData = (url, callback, reject = console.error) => {
  const request = new XMLHttpRequest();

  request.open('GET', url);
  request.addEventListener('readystatechange', () => {
    if (request.readyState !== 4) 
      return;
    
    if (request.status === 200) {
      callback(request.response);
    } else {
      reject(request.status)
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

const getNameCity = code => {
  const objCity = cities.find(item => item.code === code);
  return objCity.name;
}

const getChanges = num => {
  if (num) {
    return num === 1
      ? 'С одной пересадкой'
      : 'С двумя пересадками';
  } else {
    return 'Без пересадок';
  }
};

const getDate = date => {
  return new Date(date).toLocaleString('ru', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

const getLinkAviasales = (data) => {
  let link = 'https://www.aviasales.ru/search/';

  link += data.origin;

  const date = new Date(data.depart_date);

  const day = date.getDay();

  link += day < 10
    ? '0' + day
    : day;

  const month = date.getMonth() + 1;

  link += month < 10
    ? '0' + month
    : month;

  link += data.destination;

  link += '1';

  return link;
};

const createCard = data => {
  const ticket = document.createElement('article');
  ticket
    .classList
    .add('ticket');

  let deep = '';

  if (data) {
    deep = `
    <h3 class="agent">${data.gate}</h3>
    <div class="ticket__wrapper">
      <div class="left-side">
        <a href="${getLinkAviasales(data)}" target="_blank"" class="button button__buy">Купить
          за ${data.value}₽</a>
      </div>
      <div class="right-side">
        <div class="block-left">
          <div class="city__from">Вылет из города
            <span class="city__name">${getNameCity(data.origin)}</span>
          </div>
          <div class="city__to">Город назначения:
            <span class="city__name">${getNameCity(data.destination)}</span>
          </div>
        </div>

        <div class="block-right">
          <div class="changes">${getChanges(data.number_of_changes)}</div>
                   
          <div class="date">Дата: ${getDate(data.depart_date)}</div>
        </div>
      </div>
    </div>
    `;
  } else {
    deep = '<h3>К сожалению, на текущую дату билетов не найдено!</h3>'
  }

  ticket.insertAdjacentHTML('afterbegin', deep)

  return ticket;
};

renderCheapDay = (cheapTickets) => {
  cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';

  const ticket = createCard(cheapTickets[0]);

  cheapestTicket.append(ticket);
};

renderCheapYear = (cheapTickets) => {
  otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';

  cheapTickets.sort((a, b) => a.value - b.value);

  for (let i = 0; i < cheapTickets.length && i < MAX_COUNT; i++) {
    const ticket = createCard(cheapTickets[i]);
    otherCheapTickets.append(ticket);
  }
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

body.addEventListener('click', () => {
  dropdownCitiesFrom.innerHTML = '';
  dropdownCitiesTo.innerHTML = '';
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
  if (formData.from && formData.to) {
    const requestData = `?depart_date=${formData.when}&origin=${formData.from}&destination=${formData.to}&oneway=true&token=${API_KEY}`;

    getData(calendar + requestData, (response) => {
      renderCheap(response, formData.when);
    }, (error) => {
      cheapestTicket.innerHTML = '<h2>К сожалению, на данное направление отсутствуют рейсы</h2>';
      otherCheapTickets.innerHTML = '';
      console.error('Ошибка ', error);
    });
  } else {
    cheapestTicket.innerHTML = '<h3>Введите корректное название города</h3>';
  };
});

//call functions

getData(proxy + citiesApi, data => {
  cities = JSON.parse(data);

  cities.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    return 0;
  });
});

// getData(proxy + calendar + '?depart_date=2020-05-25', data => {   cities =
// JSON.parse(data) });