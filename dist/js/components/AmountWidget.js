import { settings, select } from '../settings.js';

export class AmountWidget {
    constructor(element) {
        const thisWidget = this;


        thisWidget.getElements(element);

        thisWidget.value = settings.amountWidget.defaultValue; //do sprawdzenia
        thisWidget.setValue(thisWidget.input.value);
        thisWidget.initActions();

        // console.log('AmountWidget:', thisWidget);
        // console.log('constructor arguments:', element);
    }
    getElements(element) {
        const thisWidget = this;

        thisWidget.element = element;
        thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
        thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
        thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);

    }
    setValue(value) {
        const thisWidget = this;

        const newValue = parseInt(value);

        /*TODO: Add validation*/

        if (newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
            thisWidget.value = newValue;
            thisWidget.announce();
        }
        thisWidget.input.value = thisWidget.value;

    }


    initActions() {
        const thisWidget = this;
        thisWidget.input.addEventListener('change', function () {
            thisWidget.setValue(thisWidget.input.value);




        });


        thisWidget.linkDecrease.addEventListener('click', function () {
            event.preventDefault();
            thisWidget.setValue(thisWidget.value - 1);

            //console.log(thisWidget.value, 'wywyołanie eventu odejmij  ');


        });
        thisWidget.linkIncrease.addEventListener('click', function () {
            event.preventDefault();
            thisWidget.setValue(thisWidget.value + 1);

            // console.log(thisWidget.value, 'wywyołanie eventu dodaj  ');
        });
    }
    announce() {
        const thisWidget = this;
        const event = new CustomEvent('update', {
            bubbles: true
        });
        thisWidget.element.dispatchEvent(event);
    }
}
