/* 
    the StatefulElement class

    this class acts as a stateful representation of an HTML element.
    it's created because it's used to manage the UI/display state of an element 

    for instance, some live/changing part of an XHR app may have multiple states: loading, load-success, load-eror
    and you might want to represent this in the display logic/UI of that part without having to re-write
    all the repetitive javascript / functions used to do this. 

    this class allows you to create a representation of that element having to account for these states, 
    their display/UI representation and also handling state changes in connection to their UI display

    features of the class:
        - manages internal application state in connection to the application UI for a live element
        - handling state changes and doing proper updates on the UI using only a state-listener
        - allows addition of mulitple states in the state listener without having to write repetitive code
        - allows you to also access the stateful-representation of the element using it's DOM representation
          in things like event listeners

    the class holds a reference to the DOM element object of the HTML element it's representing on the UI,
    an internalState value for the stateful representation of the object and a state-listener to handle state changes

    the class constructor accepts:
        - an HTML DOM element object( as element )
        - any javascript value to represent the initial stateful value ( as initialInternalState )
        - a function to be called when listening to state changes in the object ( as stateListener )

    the class methods and properties are descriptive enough so that's all
*/


class StatefulElement {

    // class constructor
    constructor( element, initialInternalState, stateListener ) {
        this._element = element;
        this._stateListener = stateListener;
        this._internalState = initialInternalState;

        // adding the stateful-element representation of the element to it's
        // DOM representation
        this._element.statefulRepresentation = this;

        this._reportInternalStateChange();
    }

    // the internalState getter and setter
    get internalState() {
        return this._internalState;
    }
    set internalState( internalState ) {
        this._internalState = internalState;

        this._reportInternalStateChange();
    }

    // the reportStateChange() method
    // used to report changes in state on the UI by calling the stateListener
    // function with the internalState and element as it's argument
    _reportInternalStateChange() {
        this._stateListener( this._internalState, this._element );
    }
}



/* 
    the ModularTemplate class

    the class acts as a template for repetitively creating elements
        - that render into a common parent 
        - have different view states
        - have the same view layer( i.e. document structure-HTML, styling-CSS and functionality-JS )
        - that come from the same parent data( i.e. like an array of data from an API or localStorage )

    the class main use-case is for repetitively creating DOM element objects from the same html template
    .. for instance, you want to repetitively insert custom HTML list-items into a to-do list parent ctn,
    the class allows you to specify a common parent, common template/view-layer, other info, decompose
    parent data and then repetitvely insert/render elements into the parent and set instructions to run 
    on render( e.g. attaching event listeners, assigning initial state and so on as much as you deem fit )

    the class constructor accepts:
        - a string that is used as the class-name( used in html classes ) of the rendered elements( as className )
        - a DOM element that acts as the parent for the rendered elements( as parent )
        - a function containing the initial render instructions for a newly rendered element( as renderFunction ),
            it's called with the DOM object of the newly-rendered element
        - a function which contains the template of the renderable elements and is called with data that'll be
            used on the template and it must return a string that contains the template with the argument data 
            infused into it( as templateGenerator )
        - a function used as the state-listener for the stateful-element representation of the element's DOM object 
            ( as stateListener )
*/


class ModularTemplate {

    // the class constructor
    constructor( className, parent, renderFunction,
         templateGenerator, stateListener ) {
            this._className = className;
            this._parent = parent;
            this._renderFunction = renderFunction;
            this._templateGenerator = templateGenerator;
            this._stateListener = stateListener;
    }

    // the insert() method
    // used to insert new elements based on saved template into the saved parent with new data and initialState
    insert( data, initialState ) {

        // call the template generator to generate an populated html string with the data
        var htmlDataString = this.templateGenerator( data );

        // assign the template class name into the htmlDataString for proper grouping and identification
        htmlDataString = htmlDataString.replace( "mod-replace", `class="${ this.className }` );

        // add the populated HTMLDataString to the parent element/container
        this.parent.innerHTML += htmlDataString;

        // get the DOM representation of the added html-data-string 
        var elementDOMRep = document.getElementsByClassName(`${ this.className }`)[ 
            ( document.getElementsByClassName(`${ this.className }`).length - 1 ) ];

        // creating a stateful-element representation of the element's DOM object
        new StatefulElement( elementDOMRep, initialState );

        // executing the initial render instructions for the newly added element
        this.renderFunction( elementDOMRep );
    }
}


export { StatefulElement, ModularTemplate };