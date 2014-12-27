(function() {
  var DashboardModel, abort_all_requests, classes, elapsedTime, remove_request, requestTimer, reset_loading_panel;

  $.ajaxSetup({
    type: "POST"
  });

  requestTimer = null;

  elapsedTime = 0;

  $.ajaxQueue = [];

  abort_all_requests = function() {
    var request, _i, _len, _ref;
    _ref = $.ajaxQueue;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      request = _ref[_i];
      if (typeof request.abort === 'function') {
        request.abort();
      }
    }
    if ($.ajaxQueue.length > 0) {
      return $.ajaxQueue = [];
    }
  };

  remove_request = function(identifier) {
    $.ajaxQueue = _.filter($.ajaxQueue, function(obj) {
      return obj.identifier !== identifier;
    });
  };

  reset_loading_panel = function() {
    $("#loading-panel").modal('hide');
    clearInterval(requestTimer);
    elapsedTime = 0;
    return $('#elpased_time').html('0:00');
  };

  $(document).ajaxStart(function() {
    $("#loading-panel").modal('show');
    requestTimer = setInterval(function() {
      var minutes, seconds;
      ++elapsedTime;
      seconds = (elapsedTime % 60) > 9 ? (elapsedTime % 60).toString() : '0' + (elapsedTime % 60).toString();
      minutes = Math.floor(elapsedTime / 60).toString();
      $('#elpased_time').html(minutes + ':' + seconds);
    }, 1000);
  }).ajaxSend(function(event, xhr, options) {
    $('#request-count').html($.active);
    $.ajaxQueue.push(xhr);
  }).ajaxSuccess(function(event, xhr, options) {
    remove_request(xhr.identifier);
  }).ajaxComplete(function(event, xhr, options) {
    $('#request-count').html($.active - 1);
  }).ajaxStop(function() {
    reset_loading_panel();
    if ($.ajaxQueue.length > 0) {
      $.ajaxQueue = [];
    }
  }).ajaxError(function(event, xhr, options, error) {
    if (error === 'abort') {
      return false;
    }
    console.log('Error ' + xhr.identifier);
    abort_all_requests();
    reset_loading_panel();
    error = "There was a problem with " + xhr.identifier + ". <b>'" + error + "'</b>.";
    $('#error-generated').html(error);
    $('#error-panel').modal('show');
  });

  $(document).ready(function() {
    $('#cancel_all_requests').on('click', function() {
      abort_all_requests();
      reset_loading_panel();
    });
  });

  DashboardModel = Backbone.Model.extend({
    initialize: function() {
      this.on('change:value', function(model, value, options) {
        var comp, component, _i, _len, _ref;
        if (typeof model.attributes.setter === 'string') {
          comp = this.prototype.getComponentByName(model.attributes.setter);
          comp.updateView(value);
        }
        _ref = model.attributes.deps;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          component = _ref[_i];
          this.prototype.buffer.enqueue(component);
        }
      }, Dashboard);
    }
  });

  this.Dashboard = (function() {
    function Dashboard() {
      var that;
      this.components = [];
      this.models = {};
      that = this;
      this.buffer.handler = this.updateComponent.bind(this);
    }

    Dashboard.prototype.Model = DashboardModel.bind(Dashboard);

    Dashboard.prototype.init = function(components) {
      return this.addComponents(components);
    };

    Dashboard.prototype.addComponent = function(component) {
      var listener, _i, _len, _ref;
      if (typeof component.type.name !== 'undefined' && component.type.name === 'button') {
        component.listeners = [];
      }
      if (typeof component.listeners !== 'undefined' && $.isArray(component.listeners)) {
        _ref = component.listeners;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          listener = _ref[_i];
          if (!this.models[listener]) {
            this.models[listener] = new this.Model({
              value: null,
              deps: [],
              setter: null
            });
          }
          this.models[listener].get('deps').push(component.name);
        }
      }
      if (typeof component.parameter === 'string' && this.models[component.parameter]) {
        this.models[component.parameter].set('setter', component.name);
      }
      if (classes[component.type.name]) {
        component = $.extend(true, component, classes[component.type.name]);
        component.parent = this;
      }
      this.components.push(component);
      if (typeof component.init === 'function') {
        component.init();
      }
      if (typeof component.update === 'function' && component.executeAtStart === true) {
        this.buffer.enqueue(component.name);
      }
    };

    Dashboard.prototype.addComponents = function(components) {
      var component, _i, _len;
      if (!$.isArray(components)) {
        throw new Error('compnents must an array');
      }
      for (_i = 0, _len = components.length; _i < _len; _i++) {
        component = components[_i];
        this.addComponent(component);
      }
    };

    Dashboard.prototype.getComponentByName = function(name) {
      var component, index, _i, _len, _ref;
      _ref = this.components;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        component = _ref[index];
        if (component.name === name) {
          return this.components[index];
        }
      }
      return false;
    };

    Dashboard.prototype.updateComponent = function(component, callback) {
      var obj, ret;
      this.buffer.currentComponent = component;
      if (typeof component.preExecution === 'function') {
        ret = component.preExecution.apply(component);
        if (ret === false) {
          return false;
        }
      }
      obj = this.getComponentByName(component);
      if (typeof obj.update === 'function') {
        this.buffer.currentRequest = obj.update();
        if (typeof component.postExecution === 'function') {
          component.postExecution.apply(component);
        }
        callback();
      }
    };

    Dashboard.prototype.setVariable = function(name, value) {
      if (typeof name === 'undefined') {
        throw new Error("Invalid variable name");
      }
      if (!this.models[name]) {
        this.models[name] = new this.Model({
          value: value,
          deps: [],
          setter: null
        });
        this.findListeners(name);
      } else {
        this.models[name].set('value', value);
      }
    };

    Dashboard.prototype.findListeners = function(variable) {
      var component, _i, _len, _ref;
      _ref = this.components;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        component = _ref[_i];
        if (typeof component.listeners !== 'undefined' && $.isArray(component.listeners) && component.listeners.indexOf(variable) >= 0) {
          this.models[variable].get('deps').push(component.name);
        }
      }
    };

    Dashboard.prototype.buffer = {
      currentComponent: null,
      currentRequest: null,
      queue: [],
      handler: null,
      removeFromQueue: function(component) {
        var index, item, _i, _len, _ref;
        _ref = this.queue;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          item = _ref[index];
          if (item === component) {
            this.queue.splice(index, 1);
          }
        }
      },
      enqueue: function(component) {
        this.addToQueue(component);
        if (this.queue.length === 1) {
          this.run();
        }
      },
      addToQueue: function(component) {
        this.cancelRequest(component);
        this.removeFromQueue(component);
        this.queue.push(component);
      },
      cancelRequest: function(component) {
        if (this.currentComponent === component && this.currentRequest !== null) {
          if (typeof this.currentRequest.abort === 'function') {
            this.currentRequest.abort();
          }
          this.currentComponent = null;
          return true;
        }
        return false;
      },
      run: function() {
        var processQueue;
        processQueue = function() {
          if (this.queue.length > 0) {
            this.run();
          }
        };
        this.currentComponent = this.queue.shift();
        this.handler(this.currentComponent, processQueue.bind(this));
      }
    };

    return Dashboard;

  })();

  classes = {};

  classes.BaseInputType = {
    init: null,
    setListeners: null,
    update: function() {
      var dataToSend, key, that, xhr;
      that = this;
      dataToSend = {};
      if (typeof this.parameters !== 'undefined') {
        for (key in this.parameters) {
          dataToSend[key] = this.parent.models[this.parameters[key]] ? this.parent.models[this.parameters[key]].get('value') : null;
        }
      }
      dataToSend.dir = window.DashboardGlobals.folderpath;
      dataToSend.map_id = this.map;
      xhr = $.post(window.DashboardGlobals.updateService, {
        "data": JSON.stringify(dataToSend)
      }, function(data, textStatus, xhr) {
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        if (typeof that.processData === 'function') {
          that.processData(data);
        }
      });
      xhr.identifier = this.name;
      return xhr;
    },
    processData: null,
    updateView: null
  };

  classes.button = $.extend(true, {}, classes.BaseInputType);

  classes.button.init = function() {
    var display, elem, qwerty;
    if (typeof this.htmlObject === 'undefined') {
      return false;
    }
    display = this.type.options && this.type.options.display ? this.type.options.display : "Submit";
    qwerty = this.type.options && this.type.options.classes ? this.type.options.classes : "btn-primary";
    elem = $('<button class="btn ' + qwerty + '">' + display + '</button>');
    $('#main').find('#' + this.htmlObject).append(elem);
    this.setListeners();
  };

  classes.button.setListeners = function() {
    var self;
    if (typeof this.htmlObject === 'undefined') {
      return false;
    }
    self = this;
    $('#main').find('#' + this.htmlObject).on('click', 'button', function() {
      return self.update();
    });
  };

  classes.button.update = function() {
    var trigger, _i, _len, _ref;
    if (typeof this.triggers !== 'undefined' && $.isArray(this.triggers)) {
      _ref = this.triggers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        trigger = _ref[_i];
        Dashboard.prototype.buffer.enqueue(trigger);
      }
    }
  };

  classes.datepicker = $.extend(true, {}, classes.BaseInputType);

  classes.datepicker.init = function() {
    var currentTime, date, displayFormat, elem, outputFormat;
    if (typeof this.htmlObject === 'undefined' || typeof this.parameter === 'undefined') {
      return false;
    }
    displayFormat = this.type.options && this.type.options.displayFormat ? this.type.options.displayFormat : "YYYY-MM-DD";
    outputFormat = this.type.options && this.type.options.outputFormat ? this.type.options.outputFormat : "YYYY-MM-DD";
    currentTime = outputFormat === 'X' ? moment().format(outputFormat) * 1000 : moment().format(outputFormat);
    if (typeof this.parent.models[this.parameter] === 'undefined') {
      currentTime = outputFormat === 'X' ? moment().format(outputFormat) * 1000 : moment().format(outputFormat);
      this.parent.setVariable(this.parameter, currentTime, {
        silent: true
      });
    }
    date = moment(this.parent.models[this.parameter].get('value'));
    this.parent.findListeners(this.name);
    elem = $('<div class="input-group"><input name="date" class="form-control sb-disable-close"><span class="input-group-addon pointer"><i class="glyphicon glyphicon-calendar"></i></span></div>');
    $('#main').find('#' + this.htmlObject).append(elem);
    $('#' + this.htmlObject).find('input[name=date]').daterangepicker({
      format: displayFormat,
      startDate: date,
      showDropdowns: true,
      singleDatePicker: true
    }, classes.datepicker.setListeners.bind(this));
    $('#' + this.htmlObject).on('click', '.input-group-addon', function() {
      return $(this).parent().find('input').focus();
    });
  };

  classes.datepicker.setListeners = function(start, end, label) {
    var date, outputFormat;
    outputFormat = this.type.options && this.type.options.outputFormat ? this.type.options.outputFormat : "YYYY-MM-DD";
    date = outputFormat === 'X' ? start.format(outputFormat) * 1000 : start.format(outputFormat);
    this.parent.setVariable(this.parameter, date);
  };

  classes.datepicker.update = null;

  classes.datepicker.processData = null;

  classes.daterangepicker = $.extend(true, {}, classes.BaseInputType);

  classes.daterangepicker.init = function() {
    var currentTime, displayFormat, elem, end, outputFormat, separator, start;
    if (typeof this.htmlObject === 'undefined' || typeof this.parameter === 'undefined' || $.isArray(this.parameter) === false || this.parameter.length !== 2) {
      return false;
    }
    displayFormat = this.type.options && this.type.options.displayFormat ? this.type.options.displayFormat : "YYYY-MM-DD";
    outputFormat = this.type.options && this.type.options.outputFormat ? this.type.options.outputFormat : "YYYY-MM-DD";
    separator = this.type.options && this.type.options.separator ? this.type.options.separator : " to ";
    currentTime = outputFormat === 'X' ? moment().format(outputFormat) * 1000 : moment().format(outputFormat);
    if (typeof this.parent.models[this.parameter[0]] === 'undefined') {
      currentTime = outputFormat === 'X' ? moment().format(outputFormat) * 1000 : moment().format(outputFormat);
      this.parent.setVariable(this.parameter[0], currentTime, {
        silent: true
      });
    }
    if (typeof this.parent.models[this.parameter[1]] === 'undefined') {
      this.parent.setVariable(this.parameter[1], currentTime, {
        silent: true
      });
    }
    start = moment(this.parent.models[this.parameter[0]].get('value'));
    end = moment(this.parent.models[this.parameter[1]].get('value'));
    this.parent.findListeners(this.name);
    elem = $('<div class="input-group"><input name="daterange" class="form-control sb-disable-close"><span class="input-group-addon pointer"><i class="glyphicon glyphicon-calendar"></i></span></div>');
    $('#main').find('#' + this.htmlObject).append(elem);
    $('#' + this.htmlObject).find('input[name=daterange]').daterangepicker({
      format: displayFormat,
      startDate: start,
      endDate: end,
      separator: separator,
      showDropdowns: true
    }, classes.daterangepicker.setListeners.bind(this));
    $('#' + this.htmlObject).on('click', '.input-group-addon', function() {
      return $(this).parent().find('input').focus();
    });
  };

  classes.daterangepicker.setListeners = function(start, end, label) {
    var endDate, outputFormat, startDate;
    outputFormat = this.type.options && this.type.options.outputFormat ? this.type.options.outputFormat : "YYYY-MM-DD";
    startDate = outputFormat === 'X' ? start.format(outputFormat) * 1000 : start.format(outputFormat);
    endDate = outputFormat === 'X' ? end.format(outputFormat) * 1000 : end.format(outputFormat);
    this.parent.setVariable(this.parameter[0], startDate);
    this.parent.setVariable(this.parameter[1], endDate);
  };

  classes.daterangepicker.update = null;

  classes.daterangepicker.processData = null;

  classes.dropdown = $.extend(true, {}, classes.BaseInputType);

  classes.dropdown.init = function() {
    var elem;
    if (typeof this.htmlObject === 'undefined') {
      return false;
    }
    elem = $('<select class="form-control sb-disable-close"></select>');
    $('#main').find('#' + this.htmlObject).append(elem);
    this.setListeners();
  };

  classes.dropdown.setListeners = function() {
    var model;
    if (typeof this.htmlObject === 'undefined' || typeof this.parameter === 'undefined') {
      return false;
    }
    model = this.parent.models[this.parameter];
    $('#' + this.htmlObject).on('change', 'select', function(event) {
      var val;
      val = $(this).val();
      model.set('value', val);
    });
  };

  classes.dropdown.processData = function(response) {
    var d, elem, _i, _len, _ref;
    if (typeof this.htmlObject === 'undefined') {
      return false;
    }
    elem = $('#main').find('#' + this.htmlObject + ' select');
    if (response.length < 1) {
      throw new Error('Invalid Data Received');
    }
    elem.html('');
    _ref = response.data;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      d = _ref[_i];
      elem.append('<option value="' + d[this.type.options.values] + '">' + d[this.type.options.display] + '</option>');
    }
    if (typeof this.parameter === 'string' && this.parent.models[this.parameter]) {
      this.updateView(this.parent.models[this.parameter].get('value'));
    }
  };

  classes.dropdown.updateView = function(value) {
    var elem;
    elem = $('#' + this.htmlObject).find('select');
    if (elem.length > 0) {
      return elem.val(value);
    }
  };

  classes.multiselect = $.extend(true, {}, classes.BaseInputType);

  classes.multiselect.init = function() {
    var elem;
    if (typeof this.htmlObject === 'undefined') {
      return false;
    }
    elem = $('<input type="hidden" style="width:100%">');
    $('#main').find('#' + this.htmlObject).append(elem);
    this.setListeners();
  };

  classes.multiselect.setListeners = function() {
    var delay, elem, model, timer;
    if (typeof this.htmlObject === 'undefined' || typeof this.parameter === 'undefined') {
      return false;
    }
    model = this.parent.models[this.parameter];
    timer = null;
    delay = this.type.options.delay || 1500;
    elem = $('#main').find('#' + this.htmlObject + ' input[type=hidden]');
    elem.on('select2-close', function() {
      var val;
      val = $(this).val().split(',');
      setTimeout(function() {
        model.set('value', val);
      }, 500);
    }).on('select2-removed', function() {
      var self;
      self = $(this);
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(function() {
        var val;
        val = self.val().split(',');
        model.set('value', val);
      }, delay);
    });

    /*
    .on('change', 'select[multiple]', ->
        
        
    )
     */
  };

  classes.multiselect.processData = function(response) {
    var elem, formatedData, options;
    if (typeof this.htmlObject === 'undefined') {
      return false;
    }
    options = this.type.options;
    elem = $('#main').find('#' + this.htmlObject + ' input[type=hidden]');
    if (response.length < 1) {
      throw new Error('Invalid Data Received');
    }
    formatedData = [];
    _.each(response.data, function(obj) {
      var temp;
      temp = {};
      temp['id'] = obj[options.values];
      temp['text'] = obj[options.display];
      formatedData.push(temp);
    });
    elem.select2({
      placeholder: "Select a State",
      allowClear: true,
      width: 'resolve',
      closeOnSelect: false,
      data: formatedData,
      multiple: true
    });
  };

  classes.chart = $.extend(true, {}, classes.BaseInputType);

  classes.chart.init = function() {
    var elem, wrap;
    elem = $('#' + this.htmlObject);
    wrap = $('<div><div>').addClass('chart');
    elem.append(wrap);
  };

  classes.chart.update = function() {
    var data, key, request, that;
    that = this;
    if (typeof this.parameters !== 'undefined' && typeof this.vf !== 'undefined') {
      $('#' + this.htmlObject).find('.chart').html('');
      data = {};
      for (key in this.parameters) {
        data[key] = this.parent.models[this.parameters[key]] ? this.parent.models[this.parameters[key]].get('value') : null;
      }
      data.dir = window.DashboardGlobals.folderpath;
      data.vf_id = this.vf.id;
      data.vf_file = this.vf.file;
      request = $.ajax({
        url: window.DashboardGlobals.chartingService,
        data: {
          "data": JSON.stringify(data)
        }
      });
      request.identifier = this.name;
      request.done(function(data, textStatus, xhr) {
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        if (typeof that.processData === 'function') {
          that.processData(data);
        }
      });
      return request.always(function() {});
    }
  };

  classes.chart.processData = function(data) {
    var chart, elem, script;
    chart = $('#' + this.htmlObject).find('.chart');
    elem = $('<div id="' + data.id + '"></div>');
    script = $('<script></script>').html(data.script);
    chart.html('').append(elem).append(script);
    this.menus();
  };

  classes.chart.menus = function() {
    var elem, group, id, index, menu, _i, _len, _ref;
    if (typeof this.htmlObject === 'undefined' || !$.isArray(this.actions)) {
      return false;
    }
    console.log('Implementing menus');
    elem = $('#' + this.htmlObject).css('position', 'relative');
    menu = '<div class="print-menu group"><div class="btn-group"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Actions <span class="caret"></span></button><ul class="dropdown-menu" role="menu">';
    _ref = this.actions;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      group = _ref[index];
      if (index !== 0) {
        menu += '<li class="divider"></li>';
      }
      for (id in group) {
        menu += '<li><a href="#" id="' + id + '">' + group[id] + '</a></li>';
      }
    }
    menu += '</ul></div></div>';
    elem.prepend(menu);
    $('.export_data_csv').on('click', function() {});
  };


  /*
  <div class="print-menu group">
      <div class="btn-group">
        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
          Export Data <span class="caret"></span>
        </button>
        <ul class="dropdown-menu" role="menu">
          <li><a href="#">Export as CSV</a></li>
          <li><a href="#">Another action</a></li>
          <li><a href="#">Something else here</a></li>
          <li class="divider"></li>
          <li><a href="#">Separated link</a></li>
        </ul>
      </div>
  </div>
   */

}).call(this);
