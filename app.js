// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

//Взаймодействует с API и Возвращает два метода которые делают запрос на Top Headlines и Everything
const newsService = (function () {
  const apiKey = "aec60a4952204ce695922c96c2bfff32";
  const apiUrl = "https://news-api-v2.herokuapp.com";

  return {
    topHeadlines(country = "gb", cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb); //Возвращает результат на переданным call back е
    },
  };
})();

// Elements
const form = document.forms["newsControls"];
const countrySelect = form.elements["country"];
const searchInput = form.elements["search"];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  loadNews();
});

//  init selects
document.addEventListener("DOMContentLoaded", function () {
  M.AutoInit();
  loadNews(); //Вызываем load news
});

// Load news function
function loadNews() {
  showLoader();

  const country = countrySelect.value;
  const searchText = searchInput.value;

  //Если текст пустой то ищет по стране
  if (!searchText) {
    newsService.topHeadlines(country, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}

// Function on get response from server
function onGetResponse(err, res) {
  removePreloader();

  if (err) {
    showAlert(err, "error-msg");
    return;
  }

  if (!res.articles.length) {
    //показывает пустое сообщение надо дороботать
    return;
  }

  renderNews(res.articles);
}

//Принимает новости
function renderNews(news) {
  const newsContainer = document.querySelector(".news-container .row"); //Находит news-container
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = "";

  //Перебирает новости
  news.forEach((newsItem) => {
    const el = newsTemplate(newsItem); //На каждой итерации вызывает ф-цию newsTemplate передавая одну новость
    fragment += el;
  });

  newsContainer.insertAdjacentHTML("afterbegin", fragment); //раставляет разметку на страницу
}

// Function clear container
function clearContainer(container) {
  // container.innerHTML = '';
  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

//На основе новости формирует разметку и возвращает разметку а разметка сохраняется на переменной el
function newsTemplate({ urlToImage, title, url, description }) {
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}">
          <span class="card-title">${title || ""}</span>
        </div>
        <div class="card-content">
          <p>${description || ""}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
  `;
}

function showAlert(msg, type = "success") {
  M.toast({ html: msg, classes: type });
}

//  Show loader function
function showLoader() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
    <div class="progress">
      <div class="indeterminate"></div>
    </div>
  `
  );
}

// Remove loader function
function removePreloader() {
  const loader = document.querySelector(".progress");
  if (loader) {
    loader.remove();
  }
}
