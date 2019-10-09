import { select, settings, classNames, templates } from '../settings.js';
import { utils } from '../utils.js';
import { AmountWidget } from './AmountWidget.js';
import { DatePicker } from './DatePicker.js';
import { HourPicker } from './HourPicker.js';

export class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    // console.log('thisBooking.dom.wrapper:', thisBooking.dom.wrapper);
    thisBooking.dom.wrapper.appendChild(generatedDOM);
    // console.log('thisBooking.dom.wrapper:', thisBooking.dom.wrapper);

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );

    // console.log('thisBooking.dom', thisBooking.dom);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });
  }

  getData() {
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(
      thisBooking.datePicker.minDate
    );
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(
      thisBooking.datePicker.maxDate
    );

    const endDate = {};
    endDate[settings.db.dateEndParamKey] =
      startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent:
        settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate)
    };

    console.log('getData params', endDate);

    const urls = {
      booking:
        settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent:
        settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat:
        settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat
    };

    // console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ])
      .then(function([
        bookingsResponse,
        eventsCurrentResponse,
        eventsRepeatResponse
      ]) {
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json()
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsRepeat) {
      //console.log('item', item);
      const minDate = utils.dateToStr(thisBooking.datePicker.minDate);
      //const maxDate = utils.dateToStr(thisBooking.datePicker.maxDate);
      //console.log('maxDate', maxDate);
      const days = [];

      for (
        let number = 0;
        number < settings.datePicker.maxDaysInFuture;
        number + 1
      ) {
        number++;
        //console.log('number', number++);
        let nextDay = utils.addDays(minDate, number);
        let nextDate = utils.dateToStr(nextDay);

        days.push(nextDate);

        // console.log('days', days);

        for (let day of days) {
          //console.log('day', day);
          item.date = day;
        }

        thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
      }
    }

    console.log('thisBooking.booked ', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
    thisBooking.dom.tables.addEventListener('click', function() {
      console.log('aaaa');
    });

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hour = startHour; hour < startHour + duration; hour += 0.5) {
      if (typeof thisBooking.booked[date][hour] == 'undefined') {
        thisBooking.booked[date][hour] = [];
      }

      thisBooking.booked[date][hour].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;
    //console.log('metoda updateDOM', thisBooking.booked[thisBooking.date][thisBooking.hour] );

    thisBooking.date = thisBooking.datePicker.value;

    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for (let table of thisBooking.dom.tables) {
      let numberTable = table.getAttribute(settings.booking.tableIdAttribute);
      console.log('table:', numberTable);
      if (!isNaN(numberTable)) {
        numberTable = parseInt(numberTable);
      }

      if (
        typeof thisBooking.booked[thisBooking.date] != 'undefined' &&
        typeof thisBooking.booked[thisBooking.date][thisBooking.hour] !=
          'undefined' &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].indexOf(
          numberTable
        ) > -1
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
    console.log('thisBooking.date', thisBooking.datePicker.value);
  }
}
import { select, settings, classNames, templates } from '../settings.js';
import { utils } from '../utils.js';
import { AmountWidget } from './AmountWidget.js';
import { DatePicker } from './DatePicker.js';
import { HourPicker } from './HourPicker.js';

export class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    // console.log('thisBooking.dom.wrapper:', thisBooking.dom.wrapper);
    thisBooking.dom.wrapper.appendChild(generatedDOM);
    // console.log('thisBooking.dom.wrapper:', thisBooking.dom.wrapper);

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );

    // console.log('thisBooking.dom', thisBooking.dom);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });
  }

  getData() {
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(
      thisBooking.datePicker.minDate
    );
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(
      thisBooking.datePicker.maxDate
    );

    const endDate = {};
    endDate[settings.db.dateEndParamKey] =
      startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent:
        settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate)
    };

    console.log('getData params', endDate);

    const urls = {
      booking:
        settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent:
        settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat:
        settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat
    };

    // console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ])
      .then(function([
        bookingsResponse,
        eventsCurrentResponse,
        eventsRepeatResponse
      ]) {
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json()
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsRepeat) {
      //console.log('item', item);
      const minDate = utils.dateToStr(thisBooking.datePicker.minDate);
      //const maxDate = utils.dateToStr(thisBooking.datePicker.maxDate);
      //console.log('maxDate', maxDate);
      const days = [];

      for (
        let number = 0;
        number < settings.datePicker.maxDaysInFuture;
        number + 1
      ) {
        number++;
        //console.log('number', number++);
        let nextDay = utils.addDays(minDate, number);
        let nextDate = utils.dateToStr(nextDay);

        days.push(nextDate);

        // console.log('days', days);

        for (let day of days) {
          //console.log('day', day);
          item.date = day;
        }

        thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
      }
    }

    console.log('thisBooking.booked ', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
    thisBooking.dom.tables.addEventListener('click', function() {
      console.log('aaaa');
    });

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hour = startHour; hour < startHour + duration; hour += 0.5) {
      if (typeof thisBooking.booked[date][hour] == 'undefined') {
        thisBooking.booked[date][hour] = [];
      }

      thisBooking.booked[date][hour].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;
    //console.log('metoda updateDOM', thisBooking.booked[thisBooking.date][thisBooking.hour] );

    thisBooking.date = thisBooking.datePicker.value;

    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for (let table of thisBooking.dom.tables) {
      let numberTable = table.getAttribute(settings.booking.tableIdAttribute);
      console.log('table:', numberTable);
      if (!isNaN(numberTable)) {
        numberTable = parseInt(numberTable);
      }

      if (
        typeof thisBooking.booked[thisBooking.date] != 'undefined' &&
        typeof thisBooking.booked[thisBooking.date][thisBooking.hour] !=
          'undefined' &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].indexOf(
          numberTable
        ) > -1
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
    console.log('thisBooking.date', thisBooking.datePicker.value);
  }
}
