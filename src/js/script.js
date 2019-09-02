/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED

        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END

  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END

  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,

    },
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };


  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END

  };
  class Product {
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



      app.cart.add(thisProduct);
    }
  }
  class AmountWidget {
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
  class Cart {
    constructor(element) {
      const thisCart = this;
      thisCart.products = [];
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.getElements(element);
      thisCart.initActions();

      //console.log('new Cart', thisCart);
    }
    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

      for (let key of thisCart.renderTotalsKeys) {
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }


    }
    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        const showWrapper = thisCart.dom.wrapper.classList.contains('active');
        console.log(showWrapper);
        if (showWrapper == false) {
          thisCart.dom.wrapper.classList.add(classNames.cart.wrapperActive);
        } else {
          thisCart.dom.wrapper.classList.remove(classNames.cart.wrapperActive);
        }
      });
      thisCart.dom.productList.addEventListener('update', function () {

        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function () {
        thisCart.remove(event.detail.cartProduct);
      });
    }
    add(menuProduct) {
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      // console.log('adding product', menuProduct);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      thisCart.update();
      // console.log('thisCart.products', thisCart.products);

    }
    update() {
      const thisCart = this;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      for (let product of thisCart.products) {
        thisCart.subtotalPrice += product.price;
        thisCart.totalNumber += product.amount;



      }
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      console.log(thisCart.totalNumber, thisCart.subtotalPrice, thisCart.totalPrice);
      for (let key of thisCart.renderTotalsKeys) {

        for (let elem of thisCart.dom[key]) {
          elem.innerHTML = thisCart[key];
          console.log(thisCart.dom[key]);
        }
      }
    }
    remove(cartProduct) {
      const thisCart = this;
      const index = thisCart.products.indexOf(cartProduct);
      console.log('index', index);
      const removeIndex = thisCart.products.splice(index, 1);
      console.log('remove index', removeIndex);

      cartProduct.dom.wrapper.remove();
      thisCart.update();


    }

  }
  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
      // console.log('thisCartProduct', thisCartProduct);
    }
    getElements(element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);


    }
    initAmountWidget() {
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('update', function () {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

      });
    }
    remove() {
      const thisCartProduct = this;
      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },


      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);

    }
    initActions() {
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function () {
        event.preventDefault();

        thisCartProduct.thisCartProduct.dom.remove;
      });
      thisCartProduct.dom.remove.addEventListener('click', function () {
        event.preventDefault();
        thisCartProduct.remove();
      });
    }

  }


  const app = {
    initMenu: function () {
      const thisApp = this;
      // console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
    },
    initCart: function () {
      const thisApp = this;

      const cartElm = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElm);
    },



    init: function () {
      const thisApp = this;
      //console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      //  console.log('classNames:', classNames);
      //  console.log('settings:', settings);
      //  console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };


  app.init();
}
