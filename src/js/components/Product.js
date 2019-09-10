import {
  select,
  classNames,
  templates
} from '../settings.js';
import {
  utils
} from '../utils.js';
import {
  AmountWidget
} from './AmountWidget.js';
export class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;


    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();


    //console.log('new product', thisProduct);
  }
  renderInMenu() {
    const thisProduct = this;
    /*generate html based on template*/
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /*create element using utils.createElementFromHTML*/
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /*find menu container*/
    const menuContainer = document.querySelector(select.containerOf.menu);

    /*add element to mentu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElm = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion() {

    const thisProduct = this;
    /* find the clickable trigger (the element that should react to clicking) */
    const clickableTriggers = thisProduct.element.querySelectorAll(select.menuProduct.clickable);

    /* START: click event listener to trigger */
    for (let clickableTrigger of clickableTriggers) {
      clickableTrigger.addEventListener('click', function (event) {

        /* prevent default action for event */
        event.preventDefault();
        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.add('active');
        /* find all active products */
        const activeProducts = document.querySelectorAll('article.active');
        /* START LOOP: for each active product */
        for (let activeProduct of activeProducts) {
          /* START: if the active product isn't the element of thisProduct */
          if (activeProduct != thisProduct.element) {
            /* remove class active for the active product */
            activeProduct.classList.remove('active');
          }

        }
      });
    }
  }

  initOrderForm() {
    const thisProduct = this;
    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
  processOrder() {
    const thisProduct = this;
    thisProduct.params = {};
    // console.log('processOrder: ', thisProduct);

    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData: ', formData);

    let price = thisProduct.data.price;
    // console.log('price: ', price);

    for (let paramId in thisProduct.data.params) {


      const selected = thisProduct.data.params[paramId];


      for (let optionId in selected.options) {

        const option = selected.options[optionId];
        //console.log('option: ', option);
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

        if (optionSelected && !option.default) {
          // console.log('!option default:', !option.default);
          price += option.price;
          //console.log('price +:', option.price);

        } else if (!optionSelected && option.default) {
          price -= option.price;

          // console.log('price -:', option.price);
        }
        const images = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
        if (optionSelected) {

          if (!thisProduct.params[paramId]) {
            thisProduct.params[paramId] = {
              label: option.label,
              options: {},
            };


          }
          thisProduct.params[paramId].options[optionId] = option.label;
          for (let image of images) {
            image.classList.add(classNames.menuProduct.imageVisible);

          }

        } else if (!optionSelected) {
          for (let image of images) {
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }





      }
    }
    /*multiplay price by amount*/
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    /*set the contents of thisProduct.priceElm to be the value of variable price*/
    thisProduct.priceElem.innerHTML = thisProduct.price;
  }
  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElm);
    thisProduct.amountWidgetElm.addEventListener('update', function () {
      thisProduct.processOrder();

    });
  }
  addToCart() {
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;



    // app.cart.add(thisProduct);
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
}
