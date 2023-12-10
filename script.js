// importing the stateful element code needed for the program to work
// if you need info on the stateful element, check the internal documentation
// in the one.js file
import { StatefulElement } from "./one.js";


// declaring the variable needed for our program to hold the reading timeout on a joke
var fetchTimeout;


// creating a statefulElement instance of the jokes pane in order to easily navigate
// between the UI states of the jokes pane
var jokesPaneStatefulElement = new StatefulElement( 
    document.getElementById('jokes-pane'),      // the jokes pane DOM element

    // the initial state of the jokes pane
    { 
        state: 'loading', 
        loadProgress: { current: 0, total: 50 }, 
    }, 

    // the state handler for handling state changes
    function( internalState, element ) {
        switch( internalState.state ) {
            case 'loading':
                // change to the loading screen on the jokes pane if in the 'loading' state
                element.classList.remove('data', 'error', 'loading');
                element.classList.add('loading');

                // update the progress bar with the progress info as passed with the state
                element.children[0].lastElementChild.value = `${ internalState.loadProgress.current }`;
                element.children[0].lastElementChild.max = `${ internalState.loadProgress.total }`;
            break;
            
            case 'error':
                // change to the error screen on the jokes pane if in the 'error' state
                element.classList.remove('data', 'error', 'loading');
                element.classList.add('error');
            break;
            
            case 'data':
                // change to the data screen on the jokes pane if in the 'data/loaded' state
                element.classList.remove('data', 'error', 'loading');
                element.classList.add('data');

                // update the joke on the data screen to the data as passed with the state
                element.children[1].firstElementChild.innerHTML = `${ internalState.data }`;
            break;
        }
    }
);



// the fetchJoke function
// fetches a joke from the Joke API, does the proper state updates and handles the response data
function fetchJoke() {

    // creating an axios 'GET' request in order to fetch a joke from the API
    axios.get( 'https://api.api-ninjas.com/v1/jokes', {
        timeout: 4000,          // adding a loading timeout of 4s on the request

        // updating the progress bar on the loading screen when response download progresses
        onDownloadProgress: function( progressIndicator ) {
            if ( progressIndicator.event.lengthComputable ) {

                jokesPaneStatefulElement.internalState = { 
                    state: "loading", 
                    loadProgress: { 
                        current: progressIndicator.loaded,
                        total: progressIndicator.total
                    } 
                }
            } else {

                jokesPaneStatefulElement.internalState = { 
                    state: "loading", 
                    loadProgress: { 
                        current: 30,
                        total: 30
                    } 
                }
            }
        },

        // adding our api key using the 'X-api-key' header
        headers: {
            'X-Api-Key': 'LVZihaNmpUp6cWJJF60DpQ==9QcH2Nq1n88ozZf6'
        }
    })
    .then( 

        // handling successful response data
        function( response ) {
            // changing to the data screen of the jokes pane
            jokesPaneStatefulElement.internalState = { state: 'data', data: response.data[0].joke };

            // setting a re-fetch timeout of 6s in order to fetch a new joke
            fetchTimeout = setTimeout( function() {
                fetchJoke();
            }, 6000 );
        }
    )
    .catch(

        // handling errors on response
        function() {
            // changing to the error screen of the jokes pane
            jokesPaneStatefulElement.internalState = { state: 'error' };

            // clearing the re-fetch timeout in order to stop the new joke fetch and prevent glitches 
            clearTimeout( fetchTimeout );
        }
    )
}



// the reloadJoke function

// used to reload a joke when clicking on the retry button
// on the error screen of the jokes pane
function reloadJoke() {
    fetchJoke();
}



// importing the retry button DOM element into the program
var retryBtn = document.getElementById('retry-btn');

// adding a 'click' event handler in order to reload the fetch
// from the error screen
retryBtn.addEventListener( 'click', reloadJoke );



// fetching the initial data in order to start the application
fetchJoke();