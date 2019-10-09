/* global flatpickr */
import { select, settings } from '../settings.js';
import { utils } from '../utils.js';
import { BaseWidget } from './BaseWidget.js';

export class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.datePicker.input
    );

    thisWidget.initPlugin();
  }

  initPlugin() {
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);

    thisWidget.maxDate = utils.addDays(
      thisWidget.minDate,
      settings.datePicker.maxDaysInFuture
    );
    console.log('maxDate', thisWidget.maxDate);
    const maxDate = utils.dateToStr(thisWidget.maxDate);

    flatpickr(thisWidget.dom.input, {
      dateFormat: 'Y-m-d',
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: maxDate,
      disable: [
        function(date) {
          return date.getDay() === 1;
        }
      ],
      locale: {
        firstDayOfWeek: 1
      },

      onChange: function(selectedDates, dateStr) {
        thisWidget.value = dateStr;
      }
    });
  }

  parseValue(newValue) {
    return newValue;
  }

  isValid() {
    return true;
  }

  renderValue() {}
}
