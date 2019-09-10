import {
  select,
  settings,
  classNames,
  templates
} from '../settings.js';
import {
  utils
} from '../utils.js';
import {
  CartProduct
} from './CartProduct.js';
export class Cart {
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
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);


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
    thisCart.dom.form.addEventListener('submit', function () {
      event.preventDefault();
      thisCart.sendOrder();
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
  sendOrder() {
    const thisCart = this;
    const url = 'http://localhost:3131/order';

    const payload = {
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFee,
      totalNumber: thisCart.totalNumber,
      products: [],
    };
    for (let product of thisCart.products) {
      payload.products.push(product.getData());
    }


    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
  }

}
