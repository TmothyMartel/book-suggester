'use strict'

let state = {
  books: [],
  recommendations: [],
  lastView: ".home-view",
  currentView: ".home-view"
}

// google book api AJAX request
function googleApiSearch(searchTerm, callback) {
    $.ajax({
        url: "https://www.googleapis.com/books/v1/volumes",
        data: {
            q: `${searchTerm}`,
            maxResults: 6,
            orderBy: 'relevance'
        },
        error: function(error) {
            console.log('error', error);
        },
        success:  callback,
        type: 'GET'
    });
}

// tastedive api AJAX request
function tastediveApiSearch(tastediveSearchTerm) {
    $.ajax({
        url: "https://tastedive.com/api/similar?",
        data: {
            q: `${tastediveSearchTerm}`,
            type: "books",
            info: 1,
            limit: 12,
            k: "304808-authorse-BD8LBICQ",
        },
        jsonpCallback: 'showTasteDiveResults',
        dataType: 'jsonp'
    });
}

function resultsRender(result, index) {
    return `
          <li>
              <div class="js-book-view" data-index="${index}">
               <img class="list-book-cover js-book-view-link" 
                  src="${result.volumeInfo.imageLinks ? result.volumeInfo.imageLinks.thumbnail : "place-holder.svg"}" 
                  alt="image of book cover">
               <div class="book-info-link list-synopsis-container">
                 <h3 class="list-book-title shadows">${result.volumeInfo.title}</h3>
                 <p class="list-book-synopsis">${result.volumeInfo.description?result.volumeInfo.description:"No description available"}</p>
                 <p><small>click to read more</small>...</p>
              </div>
            </div>
          </li>
          `
}

function bookInfoViewRender(result) {
    $('.book-cover').attr('src', `${result.imageLinks? result.imageLinks.thumbnail : "place-holder.svg" }`);
    $('.book-title').text(`${result.title}`);
    $('.buy-btn').attr('href', `https://www.barnesandnoble.com/s/${result.title}`);
    $('.book-author').text(`${result.authors?result.authors : "No author listed"}`);
    $('#book-description').text(`${result.description}`);
    $('.book-publisher').text(`${result.publisher?result.publisher : "No publisher listed"}`);
    $('.book-pages').text(`${result.pageCount?result.pageCount : "no page count listed"}`);
    $('.book-category').text(`${result.categories ? result.categories[0] : "unavailable"}`);
     
}

function showBookView() {
$('.js-book-view').on('click', event => {
   event.preventDefault();
   let index = $(event.currentTarget).attr('data-index');
    const bookViewResult = state.books[index].volumeInfo;
    bookInfoViewRender(bookViewResult);
    showPage('.book-view');
});
}


function backButtonEventListener() {
  $('.back-btn').on('click', event => {
    event.preventDefault();
    showPage(state.lastView);
  })
}

function showGoogleBooksResults(data) {
   state.books = data.items;
    const results = state.books.map((item, index) => resultsRender(item, index));
    $('.results-view').prop('hidden', false).html(results);
    showBookView();
}

// event listener for google books api search button
function userSearchEventListener() {
    $('#js-search-form').on('click', 'button.search.btn', event => {
        event.preventDefault();
        const queryTarget = $('#js-search-form').find('input.js-search-bar');
        const query = queryTarget.val();
        queryTarget.val("");
        $('.book-title').text(query);
        googleApiSearch(query, showGoogleBooksResults);
        showPage('.search-result-view');
    });
}

// tastedive api functions

function showGoogleBook(data) {
    state.books = data.items;
     const bookViewResult = state.books[0].volumeInfo;
    bookInfoViewRender(bookViewResult);
    showPage('.book-view');
}

// clicking on a link in recommend view will show singular book view from google api.
function showTasteDiveBookView() {
  $('.book-info-link').on('click',  event => {
   event.preventDefault();
   let index = $(event.currentTarget).attr('data-index');
   let title = $(event.currentTarget).find('.list-book-title').text();
   googleApiSearch(title, showGoogleBook);
});
}

function tastediveRender(item, index) {
     return `
          <li>
              <div class="js-td-book-view" data-index="${index}">
              <img class="list-book-cover" src="place-holder.svg" alt="drawing of a book">
               <div class="book-info-link list-synopsis-container">
                 <h3 class="list-book-title shadows">${item.Name}</h3>
                 <p class="list-book-synopsis">${item.wTeaser}</p>
                 <p><small>click to read more</small>...</p>
              </div>
            </div>
          </li>
          `;
}

function showTasteDiveResults(data) {
  state.recommendations = data.Similar.Results;
  const recoResults = state.recommendations.map((item, index) => tastediveRender(item, index));
  $('.td-results').prop('hidden', false).html(recoResults);
 showTasteDiveBookView();
}

function userRecommendEventListener() {
    $('#js-search-form').on('click', 'button.recommend.btn', event => {
        event.preventDefault();
        const tDQueryTarget = $('#js-search-form').find('input.js-search-bar');
        const tDQuery = tDQueryTarget.val();
        tDQueryTarget.val("");
        tastediveApiSearch(tDQuery);
        showPage('.tastedive-search-result-view')
      });
  }


    // render results in single book view
  
  function bookViewRecommendEvenListener() {
      $('.book-view-recommend').on('click', event => {
        event.preventDefault();
        const bookTitleQuery = $('.book-title').text();
        tastediveApiSearch(bookTitleQuery);
        showPage('.book-view-recommend-results');
      });
  }


function showPage(page) {
  state.lastView = state.currentView;
  state.currentView = page;
  $('.search-result-view').hide();
  $('.tastedive-search-result-view').hide();
  $('.results').hide();
  $('.home-view').hide();
  $('.book-view').hide();
  $('.book-view-recommend-results').hide;
  $(page).fadeIn(500).show();
}

function handleEventListeners() {
  $('.search-result-view').hide();
  $('.tastedive-search-result-view').hide();
  userSearchEventListener();
  userRecommendEventListener();
  backButtonEventListener();
  bookViewRecommendEvenListener();
}

$('#js-home-view').on('click', function() {
    showPage('.home-view');  
});

$(handleEventListeners);




// ToDo: 
//    add functionality to recommendation button onbook view
//    add functionality to the buy book button
//    test and fix any emergent bugs.
//   final style touches ie, fade in info