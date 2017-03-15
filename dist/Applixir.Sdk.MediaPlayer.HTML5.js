/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>
<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */
"use strict";

/**
 * Created by nayana on 11/26/16.
 */
/*jslint node: true */
/*jshint esversion: 6*/

var eventConfig = { "bubbles": true, "cancelable": false };
var el = document.getElementById('myContent');
window.flashVPaid = new VPAIDFLASHClient(el, flashVPAIDWrapperLoaded);
window.Applixir.duration = 0;
window.Applixir.adType = null;
window.Applixir.VAST = {};

function RequestController(zoneId) {
    this.zoneId = zoneId;
    this.adUnit = null;
    this.preLoadVast(zoneId);
}

RequestController.prototype.preLoadVast = function (zoneId) {
    var bindedload = this.loadAdUnit.bind(this);
    var url = "https://ssd.appprizes.com/foobar/foobar/foobar/foobar/fc.php?script=apVideo:vast2&foo=" + zoneId;
    DMVAST.client.get(url, { wrapperLimit: 3 }, function (resp, err) {

        window.Applixir.duration = resp.ads[0].creatives[0].duration;
        window.Applixir.adType = resp.ads[0].creatives[0].type;
        window.Applixir.VAST = resp;

        window.flashVPaid.loadAdUnit(resp.ads["0"].creatives["0"].mediaFiles["0"].fileURL, bindedload);
        window.Applixir.$service.sendMessage('ApplixirVastLoaded', { name: 'msg', type: 'handler' });
    });
};

RequestController.prototype.loadAdUnit = function (err, adUnit) {

    var that = this;

    console.log('ad-unit-loaded');
    if (err !== null) return;

    this.adUnit = adUnit;
    window.Applixir.adUnit = adUnit;

    this.adUnit.on('AdLoaded', function (err, result) {
        that.adsReady = true;
    });

    this.adUnit.on('AdStarted', function (err, result) {
        console.log('event:AdStarted', err, result);
        that.checkAdProperties();
    });

    this.adUnit.on('AdVideoStart', function (err, result) {
        window.Applixir.$service.sendMessage('ApplixirEventVideoStart', { name: 'msg', type: 'handler' });
        window.Applixir.$close.show();
        window.Applixir.$progress.start(true);
    });

    this.adUnit.on('adLoadError', function (err, rest) {
        console.log('error');
        console.log(err);
        console.log(rest);
    });

    var that = this;
    this.adUnit.handshakeVersion('2.0', function (err, result) {
        that.adUnit.initAd(0, 0, 'normal', -1, '', '', function (err) {
            window.Applixir.$service.sendMessage('ApplixirEventVideoReady', { name: 'msg', type: 'handler' });
            console.log('initAd', err);
        });
    });
};

RequestController.prototype.checkAdProperties = function () {
    this.adUnit.getAdIcons(function (err, result) {
        console.log('getAdIcons', result);
    });
    this.adUnit.setAdVolume(10, function (err, result) {
        console.log('setAdVolume', result);
    });
    this.adUnit.getAdVolume(function (err, result) {
        console.log('getAdVolume', result);
    });

    var that = this;

    var dura = 30.00;
    var timeint = setInterval(function () {
        var t = that.adUnit.getAdRemainingTime(function (e, s) {
            "use strict";

            if (parseInt(s) > dura) dura = parseInt(s);
            window.Applixir.$progress.stat.duration = dura;
            window.Applixir.$progress.stat.remainingTime = parseInt(s);
            window.Applixir.$progress.stat.currentTime = dura - parseInt(s);

            if (s <= 0.0) {
                window.Applixir.$service.sendMessage('ApplixirEventVideoComplete', { name: 'msg', type: 'handler' });
                window.Applixir.$close.hide();
                window.Applixir.$progress.clear();
                window.Applixir.parentWindow.Applixir.$stage.hide();
                clearInterval(timeint);
                that.preLoadVast(that.zoneId);
            }
        });
    }, 1000);
};
module.exports = RequestController;
'use strict';

/**
 * Created by nayana on 12/14/16.
 */

var CloseButton = function CloseButton() {
    this.closeButton = document.getElementById('appprizes-close');
    this.closeButton.addEventListener('click', function () {
        window.Applixir.$service.sendMessage('ApplixirEventUserClose', { name: "adsManager", type: "userClose" });
    });
};

CloseButton.prototype.hide = function () {
    this.closeButton.style.display = "none";
};

CloseButton.prototype.show = function () {
    setTimeout(this._show.bind(this), 5000);
};

CloseButton.prototype._show = function () {
    this.closeButton.style.display = 'block';
};

module.exports = CloseButton;
"use strict";

/**
 * Created by nayana on 11/27/16.
 */
/*jslint node: true */
/*jshint esversion: 6*/
var ProgressBar = function ProgressBar() {
    this.elem = document.getElementById("myBar");
    this.myProgress = document.getElementById("myProgress");
    this.label = document.getElementById("label");
    this.totalTime = 30;
    this.remainTime = 10;
    this.run = false;
    this.stat = {
        currentTime: 0,
        duration: 30, remainingTime: 0,
        bannerDuration: 10, bannerCurrentTime: 0, bannerRemain: 10
    };
};

ProgressBar.prototype.clear = function () {
    this.run = false;
    this.stat = {
        currentTime: 0,
        duration: 30, remainingTime: 0,
        bannerDuration: 10, bannerCurrentTime: 0, bannerRemain: 10
    };
    this.elem.style.width = parseInt("0") + '%';
    this.label.innerHTML = parseInt("0") + '%';
    this.myProgress.style.display = "none";
};

ProgressBar.prototype.start = function ($linear) {
    if (this.run) return;
    this.run = true;
    this.myProgress.style.display = "block";
    this.label.innerHTML = parseInt("0") + '%';
    this.elem.style.width = parseInt("0") + '%';
    window.setInterval(this.increment.bind(this), 1000);
};

ProgressBar.prototype.increment = function () {
    var val = (this.stat.duration - this.stat.remainingTime) / this.stat.duration * 100;
    this.elem.style.width = parseInt(val) + '%';
    this.label.innerHTML = parseInt(val) + '%';
};

module.exports = ProgressBar;
'use strict';

/**
 * Created by nayana on 11/27/16.
 */
/*jslint node: true */
/*jshint esversion: 6*/
//TODO: expose these as configs

function Stage(id) {
    this.id = id;
    this.iframe = document.createElement('iframe');
    this.div = document.createElement('div');
    this.display = false;
    window.Applixir.stageInterval = -1;
};

//TODO: rename to init
Stage.prototype.configure = function ($config) {

    this.iframe.id = "applixirIframe_" + this.id;
    this.iframe.seamless = "seamless";
    this.iframe.name = "applixir_iframe";
    this.iframe.src = $config.iframeSrc;
    this.iframe.frameBorder = 0;
    this.iframe.allowtransparency = true;

    this.iframe.setAttribute('zoneId', $config.zoneId);
    this.iframe.setAttribute('userId', $config.userId);
    this.iframe.style.display = "none";
    this.div.id = "applixirDiv_" + this.id;
    this.div.name = "applixir_vanishing_div";
    this.div.style.position = "absolute";
    this.div.style.display = "none";
    this.div.appendChild(this.iframe);
    document.body.appendChild(this.div);
};

Stage.prototype.show = function () {
    if (window.Applixir.stageInterval !== null) clearInterval(window.Applixir.stageInterval);
    if (this.display) return;
    this.display = true;
    this.iframe.style.display = "block";
    this.div.style.display = "block";
    this.contentWindow = this.iframe.contentWindow.document.body;
    this.iframe.style.width = this.iframe.contentWindow.document.body.scrollWidth;
    this.iframe.style.height = this.iframe.contentWindow.document.body.scrollHeight;
    this.div.style.backgroundColor = window.Applixir.$config.backgroundColor;
    this.div.style.top = window.Applixir.$config.top;
    this.div.style.left = window.Applixir.$config.left;
    this.div.style.transform = window.Applixir.$config.transform;
    this.div.style.height = this.iframe.contentWindow.document.body.scrollHeight;
};

Stage.prototype.reset = function () {
    this.iframe.frameBorder = 0;
    this.iframe.allowtransparency = true;
    this.iframe.style.display = "none";
    this.div.style.position = "absolute";
    this.div.style.display = "none";
    this.div.style.height = "auto";
};

Stage.prototype.hide = function () {
    if (!this.display) return;
    this.display = false;
    this.instanceHeight = parseInt(this.div.style.height);
    this.step = this.instanceHeight * 1.01 / 300;
    window.Applixir.stageInterval = setInterval(this._hide.bind(this), 10);
};
Stage.prototype.getCurrentHeight = function () {
    return parseInt(this.div.style.height);
};
Stage.prototype._hide = function () {
    var pos = this.getCurrentHeight() - this.step;
    if (pos <= 0) {
        clearInterval(window.Applixir.stageInterval);
        this.reset();
        pos = 0;
    }
    this.div.style.height = pos + 'px';
};
module.exports = Stage;
"use strict";

var eventConfig = { "bubbles": true, "cancelable": false };
window.Applixir.$handler = window.addEventListener('message', function (e) {

    if (e.data === "get") {
        return;
    }

    var provider = e.data.substr(0, 6);
    var message = "";
    var event = "";
    var eventName = "";
    try {
        message = JSON.parse(e.data.substr(6));
        event = message.name + "." + message.type;
        eventName = message.eventName;
    } catch (x) {
        window.Applixir.$service.sendMessage('ApplixirEventVideoNotFound', { name: 'msg', type: 'handler' });
    }

    switch (event) {
        case "msg.handler":
            window.dispatchEvent(new Event(eventName, eventConfig));
            break;
        case "Controller.connect":
            window.Applixir.playerWindow = e.source;
            window.Applixir.playerWindow.postMessage("alx://" + JSON.stringify({ name: "Player", type: "loaded" }), '*');
            break;
        case "Player.loaded":
            window.Applixir.parentWindow = e.source;
            break;
        case "adsManager.complete":
            window.Applixir.$service.sendMessage('ApplixirEventVideoComplete', { name: 'msg', type: 'handler' });
            window.Applixir.$close.hide();
            window.Applixir.$progress.clear();
            window.Applixir.parentWindow.Applixir.$stage.hide();
            break;
        case "adsManager.remainingTime":
            window.Applixir.$service.UiUpdate(message.data);
            break;
        case "adsManager.error":
            window.Applixir.$service.sendMessage('ApplixirEventVideoNotFound', { name: 'msg', type: 'handler' });
            break;
        case "adsManager.userClose":
            window.Applixir.playerWindow.Applixir.adUnit.stopAd();
            window.Applixir.$close.hide();
            window.Applixir.$progress.clear();
            window.Applixir.parentWindow.Applixir.$stage.hide();
            break;
    }
});

var MessageService = function MessageService() {};

MessageService.prototype.sendMessage = function (eventName, msg) {
    window.dispatchEvent(new Event(eventName, eventConfig));
    window.parent.postMessage("alx://" + JSON.stringify({ name: msg.name, type: msg.type, eventName: eventName }), "*");
};

MessageService.prototype.showAd = function () {

    try {
        window.Applixir.playerWindow.Applixir.adUnit.startAd(function (e, x) {
            console.log("startAd");
            console.log(e);
            console.log(x);
            window.Applixir.$stage.show();
        });
    } catch (e) {
        window.Applixir.$service.sendMessage('ApplixirEventVideoNotFound', { name: 'msg', type: 'handler' });
    }
};

MessageService.prototype.UiUpdate = function (e) {
    window.Applixir.$progress.stat.duration = e.duration;
    window.Applixir.$progress.stat.remainingTime = e.remainingTime;
    window.Applixir.$progress.stat.currentTime = e.currentTime;
};
module.exports = MessageService;
"use strict";

/**
 * Created by nayana on 11/27/16.
 */

var eventConfig = { "bubbles": true, "cancelable": false };
var Stage = require('./../com/applixir/element/Stage');
var MessageService = require('./../com/applixir/service/MessageService');

var $Applixir = function ($Applixir) {

    var arr = window.location.href.split("/");
    var host = arr[0] + "//" + arr[2];

    var _defaultConfig = {
        iframeSrc: "",
        zoneId: 0,
        userId: 0,
        video: 1,
        banner: 1,
        event: {
            "bubbles": true,
            "cancelable": false
        },
        host: host
    };

    //check if open first
    window.Applixir.hide = function () {
        window.Applixir.$stage.hide();
    };
    window.Applixir.show = function () {
        window.Applixir.$service.showAd();
        window.Applixir.$stage.show();
    };

    window.Applixir.getDuration = function () {
        return window.Applixir.playerWindow.Applixir.duration;
    };

    window.Applixir.getType = function () {
        return window.Applixir.playerWindow.Applixir.adType;
    };

    window.Applixir.$script = document.getElementById("applixirBoot");
    window.Applixir.$config = Object.assign(_defaultConfig, window.Applixir.$script.dataset);
    window.Applixir.$stage = new Stage("showcase");
    window.Applixir.$service = new MessageService();

    var _bootup = function _bootup() {
        window.Applixir.$stage.configure(window.Applixir.$config);
    };

    _bootup.bind(window);

    window.addEventListener("load", _bootup);
}($Applixir);
'use strict';

/**
 * Created by nayana on 11/27/16.
 */

var RequestController = require('./../com/applixir/controller/RequestController');
var MessageService = require('./../com/applixir/service/MessageService');
var ProgressBar = require('./../com/applixir/element/ProgressBar');
var CloseButton = require('./../com/applixir/element/CloseButton');

window.Applixir.$service = new MessageService();

var $Applixir = function ($Applixir) {

    var frame = window.frameElement;

    var arr = window.location.href.split("/");
    var host = arr[0] + "//" + arr[2];

    var _defaultConfig = {
        iframeSrc: "",
        zoneId: 0,
        userId: 0,
        reportState: 0,
        imaDebug: 0,
        fallback: false,
        autoplay: false,
        video: 1,
        banner: 1,
        event: {
            "bubbles": true,
            "cancelable": false
        }, host: host
    };

    var _x = {
        zoneId: frame.getAttribute("zoneId"),
        userId: frame.getAttribute("userId")
    };

    var $config = window.Applixir.$config = Object.assign(_defaultConfig, _x);

    window.Applixir.$close = new CloseButton();
    window.Applixir.$$player = window;

    var _posthook = function _posthook() {
        window.Applixir.$controller = new RequestController($config.zoneId, 'adContainer', 'contentElement');
        window.Applixir.$progress = new ProgressBar(window.Applixir.$controller);
        window.Applixir.$service.sendMessage("loaded", { name: "Controller", type: "connect" });
    };

    var _bootup = function _bootup() {
        console.log('test  bootup');
        _posthook.bind(window);
        _posthook();
    };

    _bootup.bind(window);

    window.addEventListener('load', _bootup);
}($Applixir);
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var unique = require('./utils').unique;
var isPositiveInt = require('./utils').isPositiveInt;
var stringEndsWith = require('./utils').stringEndsWith;
var SingleValueRegistry = require('./registry').SingleValueRegistry;
var MultipleValuesRegistry = require('./registry').MultipleValuesRegistry;
var registry = require('./jsFlashBridgeRegistry');
var VPAID_FLASH_HANDLER = 'vpaid_video_flash_handler';
var ERROR = 'AdError';

var JSFlashBridge = exports.JSFlashBridge = function () {
    function JSFlashBridge(el, flashURL, flashID, width, height, loadHandShake) {
        _classCallCheck(this, JSFlashBridge);

        this._el = el;
        this._flashID = flashID;
        this._flashURL = flashURL;
        this._width = width;
        this._height = height;
        this._handlers = new MultipleValuesRegistry();
        this._callbacks = new SingleValueRegistry();
        this._uniqueMethodIdentifier = unique(this._flashID);
        this._ready = false;
        this._handShakeHandler = loadHandShake;

        registry.addInstance(this._flashID, this);
    }

    JSFlashBridge.prototype.on = function on(eventName, callback) {
        this._handlers.add(eventName, callback);
    };

    JSFlashBridge.prototype.off = function off(eventName, callback) {
        return this._handlers.remove(eventName, callback);
    };

    JSFlashBridge.prototype.offEvent = function offEvent(eventName) {
        return this._handlers.removeByKey(eventName);
    };

    JSFlashBridge.prototype.offAll = function offAll() {
        return this._handlers.removeAll();
    };

    JSFlashBridge.prototype.callFlashMethod = function callFlashMethod(methodName) {
        var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

        var callbackID = '';
        // if no callback, some methods the return is void so they don't need callback
        if (callback) {
            callbackID = this._uniqueMethodIdentifier() + '_' + methodName;
            this._callbacks.add(callbackID, callback);
        }

        try {
            //methods are created by ExternalInterface.addCallback in as3 code, if for some reason it failed
            //this code will throw an error
            this._el[methodName]([callbackID].concat(args));
        } catch (e) {
            if (callback) {
                $asyncCallback.call(this, callbackID, e);
            } else {

                //if there isn't any callback to return error use error event handler
                this._trigger(ERROR, e);
            }
        }
    };

    JSFlashBridge.prototype.removeCallback = function removeCallback(callback) {
        return this._callbacks.removeByValue(callback);
    };

    JSFlashBridge.prototype.removeCallbackByMethodName = function removeCallbackByMethodName(suffix) {
        var _this = this;

        this._callbacks.filterKeys(function (key) {
            return stringEndsWith(key, suffix);
        }).forEach(function (key) {
            _this._callbacks.remove(key);
        });
    };

    JSFlashBridge.prototype.removeAllCallbacks = function removeAllCallbacks() {
        return this._callbacks.removeAll();
    };

    JSFlashBridge.prototype._trigger = function _trigger(eventName, event) {
        var _this2 = this;

        this._handlers.get(eventName).forEach(function (callback) {
            //clickThru has to be sync, if not will be block by the popupblocker
            if (eventName === 'AdClickThru') {
                callback(event);
            } else {
                setTimeout(function () {
                    if (_this2._handlers.get(eventName).length > 0) {
                        callback(event);
                    }
                }, 0);
            }
        });
    };

    JSFlashBridge.prototype._callCallback = function _callCallback(methodName, callbackID, err, result) {

        var callback = this._callbacks.get(callbackID);

        //not all methods callback's are mandatory
        //but if there exist an error, fire the error event
        if (!callback) {
            if (err && callbackID === '') {
                this.trigger(ERROR, err);
            }
            return;
        }

        $asyncCallback.call(this, callbackID, err, result);
    };

    JSFlashBridge.prototype._handShake = function _handShake(err, data) {
        this._ready = true;
        if (this._handShakeHandler) {
            this._handShakeHandler(err, data);
            delete this._handShakeHandler;
        }
    };

    //methods like properties specific to this implementation of VPAID


    JSFlashBridge.prototype.getSize = function getSize() {
        return { width: this._width, height: this._height };
    };

    JSFlashBridge.prototype.setSize = function setSize(newWidth, newHeight) {
        this._width = isPositiveInt(newWidth, this._width);
        this._height = isPositiveInt(newHeight, this._height);
        this._el.setAttribute('width', this._width);
        this._el.setAttribute('height', this._height);
    };

    JSFlashBridge.prototype.getWidth = function getWidth() {
        return this._width;
    };

    JSFlashBridge.prototype.setWidth = function setWidth(newWidth) {
        this.setSize(newWidth, this._height);
    };

    JSFlashBridge.prototype.getHeight = function getHeight() {
        return this._height;
    };

    JSFlashBridge.prototype.setHeight = function setHeight(newHeight) {
        this.setSize(this._width, newHeight);
    };

    JSFlashBridge.prototype.getFlashID = function getFlashID() {
        return this._flashID;
    };

    JSFlashBridge.prototype.getFlashURL = function getFlashURL() {
        return this._flashURL;
    };

    JSFlashBridge.prototype.isReady = function isReady() {
        return this._ready;
    };

    JSFlashBridge.prototype.destroy = function destroy() {
        this.offAll();
        this.removeAllCallbacks();
        registry.removeInstanceByID(this._flashID);
        if (this._el.parentElement) {
            this._el.parentElement.removeChild(this._el);
        }
    };

    return JSFlashBridge;
}();

function $asyncCallback(callbackID, err, result) {
    var _this3 = this;

    setTimeout(function () {
        var callback = _this3._callbacks.get(callbackID);
        if (callback) {
            _this3._callbacks.remove(callbackID);
            callback(err, result);
        }
    }, 0);
}

Object.defineProperty(JSFlashBridge, 'VPAID_FLASH_HANDLER', {
    writable: false,
    configurable: false,
    value: VPAID_FLASH_HANDLER
});

/**
 * External interface handler
 *
 * @param {string} flashID identifier of the flash who call this
 * @param {string} typeID what type of message is, can be 'event' or 'callback'
 * @param {string} typeName if the typeID is a event the typeName will be the eventName, if is a callback the typeID is the methodName that is related this callback
 * @param {string} callbackID only applies when the typeID is 'callback', identifier of the callback to call
 * @param {object} error error object
 * @param {object} data
 */
window[VPAID_FLASH_HANDLER] = function (flashID, typeID, typeName, callbackID, error, data) {
    var instance = registry.getInstanceByID(flashID);
    if (!instance) return;
    if (typeName === 'handShake') {
        instance._handShake(error, data);
    } else {
        if (typeID !== 'event') {
            instance._callCallback(typeName, callbackID, error, data);
        } else {
            instance._trigger(typeName, data);
        }
    }
};
'use strict';

var SingleValueRegistry = require('./registry').SingleValueRegistry;
var instances = new SingleValueRegistry();

var JSFlashBridgeRegistry = {};
Object.defineProperty(JSFlashBridgeRegistry, 'addInstance', {
    writable: false,
    configurable: false,
    value: function value(id, instance) {
        instances.add(id, instance);
    }
});

Object.defineProperty(JSFlashBridgeRegistry, 'getInstanceByID', {
    writable: false,
    configurable: false,
    value: function value(id) {
        return instances.get(id);
    }
});

Object.defineProperty(JSFlashBridgeRegistry, 'removeInstanceByID', {
    writable: false,
    configurable: false,
    value: function value(id) {
        return instances.remove(id);
    }
});

module.exports = JSFlashBridgeRegistry;
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MultipleValuesRegistry = exports.MultipleValuesRegistry = function () {
    function MultipleValuesRegistry() {
        _classCallCheck(this, MultipleValuesRegistry);

        this._registries = {};
    }

    MultipleValuesRegistry.prototype.add = function add(id, value) {
        if (!this._registries[id]) {
            this._registries[id] = [];
        }
        if (this._registries[id].indexOf(value) === -1) {
            this._registries[id].push(value);
        }
    };

    MultipleValuesRegistry.prototype.get = function get(id) {
        return this._registries[id] || [];
    };

    MultipleValuesRegistry.prototype.filterKeys = function filterKeys(handler) {
        return Object.keys(this._registries).filter(handler);
    };

    MultipleValuesRegistry.prototype.findByValue = function findByValue(value) {
        var _this = this;

        var keys = Object.keys(this._registries).filter(function (key) {
            return _this._registries[key].indexOf(value) !== -1;
        });

        return keys;
    };

    MultipleValuesRegistry.prototype.remove = function remove(key, value) {
        if (!this._registries[key]) {
            return;
        }

        var index = this._registries[key].indexOf(value);

        if (index < 0) {
            return;
        }
        return this._registries[key].splice(index, 1);
    };

    MultipleValuesRegistry.prototype.removeByKey = function removeByKey(id) {
        var old = this._registries[id];
        delete this._registries[id];
        return old;
    };

    MultipleValuesRegistry.prototype.removeByValue = function removeByValue(value) {
        var _this2 = this;

        var keys = this.findByValue(value);
        return keys.map(function (key) {
            return _this2.remove(key, value);
        });
    };

    MultipleValuesRegistry.prototype.removeAll = function removeAll() {
        var old = this._registries;
        this._registries = {};
        return old;
    };

    MultipleValuesRegistry.prototype.size = function size() {
        return Object.keys(this._registries).length;
    };

    return MultipleValuesRegistry;
}();

var SingleValueRegistry = exports.SingleValueRegistry = function () {
    function SingleValueRegistry() {
        _classCallCheck(this, SingleValueRegistry);

        this._registries = {};
    }

    SingleValueRegistry.prototype.add = function add(id, value) {
        this._registries[id] = value;
    };

    SingleValueRegistry.prototype.get = function get(id) {
        return this._registries[id];
    };

    SingleValueRegistry.prototype.filterKeys = function filterKeys(handler) {
        return Object.keys(this._registries).filter(handler);
    };

    SingleValueRegistry.prototype.findByValue = function findByValue(value) {
        var _this3 = this;

        var keys = Object.keys(this._registries).filter(function (key) {
            return _this3._registries[key] === value;
        });

        return keys;
    };

    SingleValueRegistry.prototype.remove = function remove(id) {
        var old = this._registries[id];
        delete this._registries[id];
        return old;
    };

    SingleValueRegistry.prototype.removeByValue = function removeByValue(value) {
        var _this4 = this;

        var keys = this.findByValue(value);
        return keys.map(function (key) {
            return _this4.remove(key);
        });
    };

    SingleValueRegistry.prototype.removeAll = function removeAll() {
        var old = this._registries;
        this._registries = {};
        return old;
    };

    SingleValueRegistry.prototype.size = function size() {
        return Object.keys(this._registries).length;
    };

    return SingleValueRegistry;
}();
'use strict';

//const swfobject = require('swfobject');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JSFlashBridge = require('./jsFlashBridge').JSFlashBridge;
var VPAIDAdUnit = require('./VPAIDAdUnit').VPAIDAdUnit;

var noop = require('./utils').noop;
var callbackTimeout = require('./utils').callbackTimeout;
var isPositiveInt = require('./utils').isPositiveInt;
var createElementWithID = require('./utils').createElementWithID;
var uniqueVPAID = require('./utils').unique('vpaid');
var createFlashTester = require('./flashTester.js').createFlashTester;

var ERROR = 'error';
var FLASH_VERSION = '10.1.0';

var flashTester = { isSupported: function isSupported() {
        return true;
    } }; // if the runFlashTest is not run the flashTester will always return true

var VPAIDFLASHClient = function () {
    function VPAIDFLASHClient(vpaidParentEl, callback) {
        var swfConfig = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { data: 'VPAIDFlash.swf', width: 640, height: 360 };

        var _this = this;

        var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { wmode: 'transparent', salign: 'tl', align: 'left', allowScriptAccess: 'always', scale: 'noScale', allowFullScreen: 'true', quality: 'high' };
        var vpaidOptions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : { debug: false, timeout: 10000 };

        _classCallCheck(this, VPAIDFLASHClient);

        var me = this;

        this._vpaidParentEl = vpaidParentEl;
        this._flashID = uniqueVPAID();
        this._destroyed = false;
        callback = callback || noop;

        swfConfig.width = isPositiveInt(swfConfig.width, 640);
        swfConfig.height = isPositiveInt(swfConfig.height, 360);

        createElementWithID(vpaidParentEl, this._flashID, true);

        params.movie = swfConfig.data;
        params.FlashVars = 'flashid=' + this._flashID + '&handler=' + JSFlashBridge.VPAID_FLASH_HANDLER + '&debug=' + vpaidOptions.debug + '&salign=' + params.salign;

        if (!VPAIDFLASHClient.isSupported()) {
            return onError('user don\'t support flash or doesn\'t have the minimum required version of flash ' + FLASH_VERSION);
        }

        this.el = swfobject.createSWF(swfConfig, params, this._flashID);

        if (!this.el) {
            return onError('swfobject failed to create object in element');
        }

        var handler = callbackTimeout(vpaidOptions.timeout, function (err, data) {
            console.log(data);
            $loadPendedAdUnit.call(_this);
            callback(err, data);
        }, function () {
            callback('vpaid flash load timeout ' + vpaidOptions.timeout);
        });

        this._flash = new JSFlashBridge(this.el, swfConfig.data, this._flashID, swfConfig.width, swfConfig.height, handler);

        function onError(error) {
            setTimeout(function () {
                callback(new Error(error));
            }, 0);
            return me;
        }
    }

    VPAIDFLASHClient.prototype.destroy = function destroy() {
        this._destroyAdUnit();

        if (this._flash) {
            this._flash.destroy();
            this._flash = null;
        }
        this.el = null;
        this._destroyed = true;
    };

    VPAIDFLASHClient.prototype.isDestroyed = function isDestroyed() {
        return this._destroyed;
    };

    VPAIDFLASHClient.prototype._destroyAdUnit = function _destroyAdUnit() {
        delete this._loadLater;

        if (this._adUnitLoad) {
            this._adUnitLoad = null;
            this._flash.removeCallback(this._adUnitLoad);
        }

        if (this._adUnit) {
            this._adUnit._destroy();
            this._adUnit = null;
        }
    };

    VPAIDFLASHClient.prototype.loadAdUnit = function loadAdUnit(adURL, callback) {
        var _this2 = this;

        $throwIfDestroyed.call(this);

        if (this._adUnit) {
            this._destroyAdUnit();
        }

        if (this._flash.isReady()) {
            this._adUnitLoad = function (err, message) {
                if (!err) {
                    _this2._adUnit = new VPAIDAdUnit(_this2._flash);
                }
                _this2._adUnitLoad = null;
                callback(err, _this2._adUnit);
            };

            this._flash.callFlashMethod('loadAdUnit', [adURL], this._adUnitLoad);
        } else {
            this._loadLater = { url: adURL, callback: callback };
        }
    };

    VPAIDFLASHClient.prototype.unloadAdUnit = function unloadAdUnit() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

        $throwIfDestroyed.call(this);

        this._destroyAdUnit();
        this._flash.callFlashMethod('unloadAdUnit', [], callback);
    };

    VPAIDFLASHClient.prototype.getFlashID = function getFlashID() {
        $throwIfDestroyed.call(this);
        return this._flash.getFlashID();
    };

    VPAIDFLASHClient.prototype.getFlashURL = function getFlashURL() {
        $throwIfDestroyed.call(this);
        return this._flash.getFlashURL();
    };

    return VPAIDFLASHClient;
}();

setStaticProperty('isSupported', function () {
    return swfobject.hasFlashPlayerVersion(FLASH_VERSION) && flashTester.isSupported();
}, true);

setStaticProperty('runFlashTest', function (swfConfig) {
    flashTester = createFlashTester(document.body, swfConfig);
});

function $throwIfDestroyed() {
    if (this._destroyed) {
        throw new Error('VPAIDFlashToJS is destroyed!');
    }
}

function $loadPendedAdUnit() {
    if (this._loadLater) {
        this.loadAdUnit(this._loadLater.url, this._loadLater.callback);
        delete this._loadLater;
    }
}

function setStaticProperty(propertyName, value) {
    var writable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    Object.defineProperty(VPAIDFLASHClient, propertyName, {
        writable: writable,
        configurable: false,
        value: value
    });
}

VPAIDFLASHClient.swfobject = swfobject;

module.exports = VPAIDFLASHClient;
'use strict';

//simple representation of the API

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var IVPAIDAdUnit = exports.IVPAIDAdUnit = function () {
    function IVPAIDAdUnit() {
        _classCallCheck(this, IVPAIDAdUnit);
    }

    //all methods below
    //are async methods
    IVPAIDAdUnit.prototype.handshakeVersion = function handshakeVersion() {
        var playerVPAIDVersion = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '2.0';
        var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    };

    //creativeData is an object to be consistent with VPAIDHTML


    IVPAIDAdUnit.prototype.initAd = function initAd(width, height, viewMode, desiredBitrate) {
        var creativeData = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : { AdParameters: '' };
        var environmentVars = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : { flashVars: '' };
        var callback = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : undefined;
    };

    IVPAIDAdUnit.prototype.resizeAd = function resizeAd(width, height, viewMode) {
        var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
    };

    IVPAIDAdUnit.prototype.startAd = function startAd() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    };

    IVPAIDAdUnit.prototype.stopAd = function stopAd() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    };

    IVPAIDAdUnit.prototype.pauseAd = function pauseAd() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    };

    IVPAIDAdUnit.prototype.resumeAd = function resumeAd() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    };

    IVPAIDAdUnit.prototype.expandAd = function expandAd() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    };

    IVPAIDAdUnit.prototype.collapseAd = function collapseAd() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    };

    IVPAIDAdUnit.prototype.skipAd = function skipAd() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    };

    //properties that will be treat as async methods


    IVPAIDAdUnit.prototype.getAdLinear = function getAdLinear(callback) {};

    IVPAIDAdUnit.prototype.getAdWidth = function getAdWidth(callback) {};

    IVPAIDAdUnit.prototype.getAdHeight = function getAdHeight(callback) {};

    IVPAIDAdUnit.prototype.getAdExpanded = function getAdExpanded(callback) {};

    IVPAIDAdUnit.prototype.getAdSkippableState = function getAdSkippableState(callback) {};

    IVPAIDAdUnit.prototype.getAdRemainingTime = function getAdRemainingTime(callback) {};

    IVPAIDAdUnit.prototype.getAdDuration = function getAdDuration(callback) {};

    IVPAIDAdUnit.prototype.setAdVolume = function setAdVolume(soundVolume) {
        var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    };

    IVPAIDAdUnit.prototype.getAdVolume = function getAdVolume(callback) {};

    IVPAIDAdUnit.prototype.getAdCompanions = function getAdCompanions(callback) {};

    IVPAIDAdUnit.prototype.getAdIcons = function getAdIcons(callback) {};

    return IVPAIDAdUnit;
}();

Object.defineProperty(IVPAIDAdUnit, 'EVENTS', {
    writable: false,
    configurable: false,
    value: ['AdLoaded', 'AdStarted', 'AdStopped', 'AdSkipped', 'AdSkippableStateChange', // VPAID 2.0 new event
    'AdSizeChange', // VPAID 2.0 new event
    'AdLinearChange', 'AdDurationChange', // VPAID 2.0 new event
    'AdExpandedChange', 'AdRemainingTimeChange', // [Deprecated in 2.0] but will be still fired for backwards compatibility
    'AdVolumeChange', 'AdImpression', 'AdVideoStart', 'AdVideoFirstQuartile', 'AdVideoMidpoint', 'AdVideoThirdQuartile', 'AdVideoComplete', 'AdClickThru', 'AdInteraction', // VPAID 2.0 new event
    'AdUserAcceptInvitation', 'AdUserMinimize', 'AdUserClose', 'AdPaused', 'AdPlaying', 'AdLog', 'AdError']
});
'use strict';

var utils = require('./utils');
var unique = utils.unique('vpaidIframe');
var VPAIDAdUnit = require('./VPAIDAdUnit');

var defaultTemplate = '<!DOCTYPE html>' + '<html lang="en">' + '<head><meta charset="UTF-8"></head>' + '<body style="margin:0;padding:0"><div class="ad-element"></div>' + '<script type="text/javascript" src="{{iframeURL_JS}}"></script>' + '<script type="text/javascript">' + 'window.parent.postMessage(\'{"event": "ready", "id": "{{iframeID}}"}\', \'{{origin}}\');' + '</script>' + '</body>' + '</html>';

var AD_STOPPED = 'AdStopped';

/**
 * This callback is displayed as global member. The callback use nodejs error-first callback style
 * @callback NodeStyleCallback
 * @param {string|null}
 * @param {undefined|object}
 */

/**
 * VPAIDHTML5Client
 * @class
 *
 * @param {HTMLElement} el that will contain the iframe to load adUnit and a el to add to adUnit slot
 * @param {HTMLVideoElement} video default video element to be used by adUnit
 * @param {object} [templateConfig] template: html template to be used instead of the default, extraOptions: to be used when rendering the template
 * @param {object} [vpaidOptions] timeout: when loading adUnit
 */
function VPAIDHTML5Client(el, video, templateConfig, vpaidOptions) {
    templateConfig = templateConfig || {};

    this._id = unique();
    this._destroyed = false;

    this._frameContainer = utils.createElementInEl(el, 'div');
    this._videoEl = video;
    this._vpaidOptions = vpaidOptions || { timeout: 10000 };

    this._templateConfig = {
        template: templateConfig.template || defaultTemplate,
        extraOptions: templateConfig.extraOptions || {}
    };
}

/**
 * destroy
 *
 */
VPAIDHTML5Client.prototype.destroy = function destroy() {
    if (this._destroyed) {
        return;
    }
    this._destroyed = true;
    $unloadPreviousAdUnit.call(this);
};

/**
 * isDestroyed
 *
 * @return {boolean}
 */
VPAIDHTML5Client.prototype.isDestroyed = function isDestroyed() {
    return this._destroyed;
};

/**
 * loadAdUnit
 *
 * @param {string} adURL url of the js of the adUnit
 * @param {nodeStyleCallback} callback
 */
VPAIDHTML5Client.prototype.loadAdUnit = function loadAdUnit(adURL, callback) {
    $throwIfDestroyed.call(this);
    $unloadPreviousAdUnit.call(this);
    var that = this;

    var frame = utils.createIframeWithContent(this._frameContainer, this._templateConfig.template, utils.extend({
        iframeURL_JS: adURL,
        iframeID: this.getID(),
        origin: getOrigin()
    }, this._templateConfig.extraOptions));

    this._frame = frame;

    this._onLoad = utils.callbackTimeout(this._vpaidOptions.timeout, onLoad.bind(this), onTimeout.bind(this));

    window.addEventListener('message', this._onLoad);

    function onLoad(e) {
        /*jshint validthis: false */
        //don't clear timeout
        if (e.origin !== getOrigin()) return;
        var result = JSON.parse(e.data);

        //don't clear timeout
        if (result.id !== that.getID()) return;

        var adUnit, error, createAd;
        if (!that._frame.contentWindow) {

            error = 'the iframe is not anymore in the DOM tree';
        } else {
            createAd = that._frame.contentWindow.getVPAIDAd;
            error = utils.validate(typeof createAd === 'function', 'the ad didn\'t return a function to create an ad');
        }

        if (!error) {
            var adEl = that._frame.contentWindow.document.querySelector('.ad-element');
            adUnit = new VPAIDAdUnit(createAd(), adEl, that._videoEl, that._frame);
            adUnit.subscribe(AD_STOPPED, $adDestroyed.bind(that));
            error = utils.validate(adUnit.isValidVPAIDAd(), 'the add is not fully complaint with VPAID specification');
        }

        that._adUnit = adUnit;
        $destroyLoadListener.call(that);
        callback(error, error ? null : adUnit);

        //clear timeout
        return true;
    }

    function onTimeout() {
        callback('timeout', null);
    }
};

/**
 * unloadAdUnit
 *
 */
VPAIDHTML5Client.prototype.unloadAdUnit = function unloadAdUnit() {
    $unloadPreviousAdUnit.call(this);
};

/**
 * getID will return the unique id
 *
 * @return {string}
 */
VPAIDHTML5Client.prototype.getID = function () {
    return this._id;
};

/**
 * $removeEl
 *
 * @param {string} key
 */
function $removeEl(key) {
    var el = this[key];
    if (el) {
        el.remove();
        delete this[key];
    }
}

function $adDestroyed() {
    $removeAdElements.call(this);
    delete this._adUnit;
}

function $unloadPreviousAdUnit() {
    $removeAdElements.call(this);
    $destroyAdUnit.call(this);
}

function $removeAdElements() {
    $removeEl.call(this, '_frame');
    $destroyLoadListener.call(this);
}

/**
 * $destroyLoadListener
 *
 */
function $destroyLoadListener() {
    if (this._onLoad) {
        window.removeEventListener('message', this._onLoad);
        utils.clearCallbackTimeout(this._onLoad);
        delete this._onLoad;
    }
}

function $destroyAdUnit() {
    if (this._adUnit) {
        this._adUnit.stopAd();
        delete this._adUnit;
    }
}

/**
 * $throwIfDestroyed
 *
 */
function $throwIfDestroyed() {
    if (this._destroyed) {
        throw new Error('VPAIDHTML5Client already destroyed!');
    }
}

function getOrigin() {
    if (window.location.origin) {
        return window.location.origin;
    } else {
        return window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    }
}

module.exports = VPAIDHTML5Client;
'use strict';

function Subscriber() {
    this._subscribers = {};
}

Subscriber.prototype.subscribe = function subscribe(handler, eventName, context) {
    if (!this.isHandlerAttached(handler, eventName)) {
        this.get(eventName).push({ handler: handler, context: context, eventName: eventName });
    }
};

Subscriber.prototype.unsubscribe = function unsubscribe(handler, eventName) {
    this._subscribers[eventName] = this.get(eventName).filter(function (subscriber) {
        return handler !== subscriber.handler;
    });
};

Subscriber.prototype.unsubscribeAll = function unsubscribeAll() {
    this._subscribers = {};
};

Subscriber.prototype.trigger = function (eventName, data) {
    var that = this;
    var subscribers = this.get(eventName).concat(this.get('*'));

    subscribers.forEach(function (subscriber) {
        setTimeout(function () {
            if (that.isHandlerAttached(subscriber.handler, subscriber.eventName)) {
                subscriber.handler.call(subscriber.context, data);
            }
        }, 0);
    });
};

Subscriber.prototype.triggerSync = function (eventName, data) {
    var subscribers = this.get(eventName).concat(this.get('*'));

    subscribers.forEach(function (subscriber) {
        subscriber.handler.call(subscriber.context, data);
    });
};

Subscriber.prototype.get = function get(eventName) {
    if (!this._subscribers[eventName]) {
        this._subscribers[eventName] = [];
    }
    return this._subscribers[eventName];
};

Subscriber.prototype.isHandlerAttached = function isHandlerAttached(handler, eventName) {
    return this.get(eventName).some(function (subscriber) {
        return handler === subscriber.handler;
    });
};

module.exports = Subscriber;
'use strict';

/**
 * noop a empty function
 */

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.hideFlashEl = hideFlashEl;
exports.stringEndsWith = stringEndsWith;
exports.isPositiveInt = isPositiveInt;
exports.createElementWithID = createElementWithID;
function noop() {}

/**
 * validate if is not validate will return an Error with the message
 *
 * @param {boolean} isValid
 * @param {string} message
 */
function validate(isValid, message) {
    return isValid ? null : new Error(message);
}

var timeouts = {};
/**
 * clearCallbackTimeout
 *
 * @param {function} func handler to remove
 */
function clearCallbackTimeout(func) {
    var timeout = timeouts[func];
    if (timeout) {
        clearTimeout(timeout);
        delete timeouts[func];
    }
}

/**
 * callbackTimeout if the onSuccess is not called and returns true in the timelimit then onTimeout will be called
 *
 * @param {number} timer
 * @param {function} onSuccess
 * @param {function} onTimeout
 */
function callbackTimeout(timer, onSuccess, onTimeout) {
    var _callback, timeout;

    timeout = setTimeout(function () {
        onSuccess = noop;
        delete timeout[_callback];
        onTimeout();
    }, timer);

    _callback = function callback() {
        // TODO avoid leaking arguments
        // https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
        if (onSuccess.apply(this, arguments)) {
            clearCallbackTimeout(_callback);
        }
    };

    timeouts[_callback] = timeout;

    return _callback;
}

/**
 * createElementInEl
 *
 * @param {HTMLElement} parent
 * @param {string} tagName
 * @param {string} id
 */
function createElementInEl(parent, tagName, id) {
    var nEl = document.createElement(tagName);
    if (id) nEl.id = id;
    parent.appendChild(nEl);
    return nEl;
}

/**
 * createIframeWithContent
 *
 * @param {HTMLElement} parent
 * @param {string} template simple template using {{var}}
 * @param {object} data
 */
function createIframeWithContent(parent, template, data) {
    var iframe = createIframe(parent, null, data.zIndex);
    if (!setIframeContent(iframe, simpleTemplate(template, data))) return;
    return iframe;
}

/**
 * createIframe
 *
 * @param {HTMLElement} parent
 * @param {string} url
 */
function createIframe(parent, url, zIndex) {
    var nEl = document.createElement('iframe');
    nEl.src = url || 'about:blank';
    nEl.marginWidth = '0';
    nEl.marginHeight = '0';
    nEl.frameBorder = '0';
    nEl.width = '100%';
    nEl.height = '100%';
    setFullSizeStyle(nEl);

    if (zIndex) {
        nEl.style.zIndex = zIndex;
    }

    nEl.setAttribute('SCROLLING', 'NO');
    parent.innerHTML = '';
    parent.appendChild(nEl);
    return nEl;
}

function setFullSizeStyle(element) {
    element.style.position = 'absolute';
    element.style.left = '0';
    element.style.top = '0';
    element.style.margin = '0px';
    element.style.padding = '0px';
    element.style.border = 'none';
    element.style.width = '100%';
    element.style.height = '100%';
}

/**
 * simpleTemplate
 *
 * @param {string} template
 * @param {object} data
 */
function simpleTemplate(template, data) {
    Object.keys(data).forEach(function (key) {
        var value = (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' ? JSON.stringify(data[key]) : data[key];
        template = template.replace(new RegExp('{{' + key + '}}', 'g'), value);
    });
    return template;
}

/**
 * setIframeContent
 *
 * @param {HTMLIframeElement} iframeEl
 * @param content
 */
function setIframeContent(iframeEl, content) {
    var iframeDoc = iframeEl.contentWindow && iframeEl.contentWindow.document;
    if (!iframeDoc) return false;

    iframeDoc.write(content);

    return true;
}

/**
 * extend object with keys from another object
 *
 * @param {object} toExtend
 * @param {object} fromSource
 */
function extend(toExtend, fromSource) {
    Object.keys(fromSource).forEach(function (key) {
        toExtend[key] = fromSource[key];
    });
    return toExtend;
}

/**
 * unique will create a unique string everytime is called, sequentially and prefixed
 *
 * @param {string} prefix
 */
function unique(prefix) {
    var count = -1;
    return function () {
        return prefix + '_' + ++count;
    };
}

function hideFlashEl(el) {
    // can't use display none or visibility none because will block flash in some browsers
    el.style.position = 'absolute';
    el.style.left = '-1px';
    el.style.top = '-1px';
    el.style.width = '1px';
    el.style.height = '1px';
}

var endsWith = function () {
    if (String.prototype.endsWith) return String.prototype.endsWith;
    return function endsWith(searchString, position) {
        var subjectString = this.toString();
        if (position === undefined || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}();

function stringEndsWith(string, search) {
    return endsWith.call(string, search);
}

function isPositiveInt(newVal, oldVal) {
    return !isNaN(parseFloat(newVal)) && isFinite(newVal) && newVal > 0 ? newVal : oldVal;
}

function createElementWithID(parent, id) {
    var cleanContent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var nEl = document.createElement('div');
    nEl.id = id;
    if (cleanContent) {
        parent.innerHTML = '';
    }
    parent.appendChild(nEl);
    return nEl;
}

module.exports = {
    noop: noop,
    validate: validate,
    clearCallbackTimeout: clearCallbackTimeout,
    callbackTimeout: callbackTimeout,
    createElementInEl: createElementInEl,
    createIframeWithContent: createIframeWithContent,
    createIframe: createIframe,
    setFullSizeStyle: setFullSizeStyle,
    simpleTemplate: simpleTemplate,
    setIframeContent: setIframeContent,
    extend: extend,
    unique: unique
};
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IVPAIDAdUnit = require('./IVPAIDAdUnit').IVPAIDAdUnit;
var ALL_VPAID_METHODS = Object.getOwnPropertyNames(IVPAIDAdUnit.prototype).filter(function (property) {
    return ['constructor'].indexOf(property) === -1;
});

var VPAIDAdUnit = exports.VPAIDAdUnit = function (_IVPAIDAdUnit) {
    _inherits(VPAIDAdUnit, _IVPAIDAdUnit);

    function VPAIDAdUnit(flash) {
        _classCallCheck(this, VPAIDAdUnit);

        var _this = _possibleConstructorReturn(this, _IVPAIDAdUnit.call(this));

        _this._destroyed = false;
        _this._flash = flash;
        return _this;
    }

    VPAIDAdUnit.prototype._destroy = function _destroy() {
        var _this2 = this;

        this._destroyed = true;
        ALL_VPAID_METHODS.forEach(function (methodName) {
            _this2._flash.removeCallbackByMethodName(methodName);
        });
        IVPAIDAdUnit.EVENTS.forEach(function (event) {
            _this2._flash.offEvent(event);
        });

        this._flash = null;
    };

    VPAIDAdUnit.prototype.isDestroyed = function isDestroyed() {
        return this._destroyed;
    };

    VPAIDAdUnit.prototype.on = function on(eventName, callback) {
        this._flash.on(eventName, callback);
    };

    VPAIDAdUnit.prototype.off = function off(eventName, callback) {
        this._flash.off(eventName, callback);
    };

    //VPAID interface


    VPAIDAdUnit.prototype.handshakeVersion = function handshakeVersion() {
        var playerVPAIDVersion = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '2.0';
        var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

        this._flash.callFlashMethod('handshakeVersion', [playerVPAIDVersion], callback);
    };

    VPAIDAdUnit.prototype.initAd = function initAd(width, height, viewMode, desiredBitrate) {
        var creativeData = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : { AdParameters: '' };
        var environmentVars = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : { flashVars: '' };
        var callback = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : undefined;

        //resize element that has the flash object
        this._flash.setSize(width, height);
        creativeData = creativeData || { AdParameters: '' };
        environmentVars = environmentVars || { flashVars: '' };

        this._flash.callFlashMethod('initAd', [this._flash.getWidth(), this._flash.getHeight(), viewMode, desiredBitrate, creativeData.AdParameters || '', environmentVars.flashVars || ''], callback);
    };

    VPAIDAdUnit.prototype.resizeAd = function resizeAd(width, height, viewMode) {
        var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;

        //resize element that has the flash object
        this._flash.setSize(width, height);

        //resize ad inside the flash
        this._flash.callFlashMethod('resizeAd', [this._flash.getWidth(), this._flash.getHeight(), viewMode], callback);
    };

    VPAIDAdUnit.prototype.startAd = function startAd() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

        this._flash.callFlashMethod('startAd', [], callback);
    };

    VPAIDAdUnit.prototype.stopAd = function stopAd() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

        this._flash.callFlashMethod('stopAd', [], callback);
    };

    VPAIDAdUnit.prototype.pauseAd = function pauseAd() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

        this._flash.callFlashMethod('pauseAd', [], callback);
    };

    VPAIDAdUnit.prototype.resumeAd = function resumeAd() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

        this._flash.callFlashMethod('resumeAd', [], callback);
    };

    VPAIDAdUnit.prototype.expandAd = function expandAd() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

        this._flash.callFlashMethod('expandAd', [], callback);
    };

    VPAIDAdUnit.prototype.collapseAd = function collapseAd() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

        this._flash.callFlashMethod('collapseAd', [], callback);
    };

    VPAIDAdUnit.prototype.skipAd = function skipAd() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

        this._flash.callFlashMethod('skipAd', [], callback);
    };

    //properties that will be treat as async methods


    VPAIDAdUnit.prototype.getAdLinear = function getAdLinear(callback) {
        this._flash.callFlashMethod('getAdLinear', [], callback);
    };

    VPAIDAdUnit.prototype.getAdWidth = function getAdWidth(callback) {
        this._flash.callFlashMethod('getAdWidth', [], callback);
    };

    VPAIDAdUnit.prototype.getAdHeight = function getAdHeight(callback) {
        this._flash.callFlashMethod('getAdHeight', [], callback);
    };

    VPAIDAdUnit.prototype.getAdExpanded = function getAdExpanded(callback) {
        this._flash.callFlashMethod('getAdExpanded', [], callback);
    };

    VPAIDAdUnit.prototype.getAdSkippableState = function getAdSkippableState(callback) {
        this._flash.callFlashMethod('getAdSkippableState', [], callback);
    };

    VPAIDAdUnit.prototype.getAdRemainingTime = function getAdRemainingTime(callback) {
        this._flash.callFlashMethod('getAdRemainingTime', [], callback);
    };

    VPAIDAdUnit.prototype.getAdDuration = function getAdDuration(callback) {
        this._flash.callFlashMethod('getAdDuration', [], callback);
    };

    VPAIDAdUnit.prototype.setAdVolume = function setAdVolume(volume) {
        var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

        this._flash.callFlashMethod('setAdVolume', [volume], callback);
    };

    VPAIDAdUnit.prototype.getAdVolume = function getAdVolume(callback) {
        this._flash.callFlashMethod('getAdVolume', [], callback);
    };

    VPAIDAdUnit.prototype.getAdCompanions = function getAdCompanions(callback) {
        this._flash.callFlashMethod('getAdCompanions', [], callback);
    };

    VPAIDAdUnit.prototype.getAdIcons = function getAdIcons(callback) {
        this._flash.callFlashMethod('getAdIcons', [], callback);
    };

    return VPAIDAdUnit;
}(IVPAIDAdUnit);
/*jslint node: true */
/*jshint esversion: 6*/

var eventConfig = { "bubbles":true,  "cancelable":false };
var el = document.getElementById('myContent');
window.flashVPaid = new VPAIDFLASHClient(el, flashVPAIDWrapperLoaded);
window.Applixir.duration = 0;
window.Applixir.adType = null;
window.Applixir.VAST = {};

function RequestController (zoneId) {
    this.zoneId = zoneId;
    this.adUnit = null;
    this.preLoadVast(zoneId);
}

RequestController.prototype.preLoadVast = function (zoneId) {
    var bindedload = this.loadAdUnit.bind(this);
    var url = "https://ssd.appprizes.com/foobar/foobar/foobar/foobar/fc.php?script=apVideo:vast2&foo=" + zoneId;
    DMVAST.client.get(url, {wrapperLimit: 3}, function (resp, err) {

        window.Applixir.duration = resp.ads[0].creatives[0].duration;
        window.Applixir.adType = resp.ads[0].creatives[0].type;
        window.Applixir.VAST = resp;

        window.flashVPaid.loadAdUnit(resp.ads["0"].creatives["0"].mediaFiles["0"].fileURL, bindedload);
        window.Applixir.$service.sendMessage('ApplixirVastLoaded', {name: 'msg', type: 'handler'});
    });
};

RequestController.prototype.loadAdUnit = function (err, adUnit) {

    var that = this;

    console.log('ad-unit-loaded');
    if (err !== null) return;

    this.adUnit = adUnit;
    window.Applixir.adUnit = adUnit;

    this.adUnit.on('AdLoaded', function (err, result) {
        that.adsReady = true;
    });

    this.adUnit.on('AdStarted', function (err, result) {
        console.log('event:AdStarted', err, result);
        that.checkAdProperties();
    });

    this.adUnit.on('AdVideoStart', function (err, result) {
        window.Applixir.$service.sendMessage('ApplixirEventVideoStart', {name: 'msg', type: 'handler'});
        window.Applixir.$close.show();
        window.Applixir.$progress.start(true);
    });

    this.adUnit.on('adLoadError', function (err, rest) {
       console.log('error');
        console.log(err);
        console.log(rest);
    });

    var that = this;
    this.adUnit.handshakeVersion('2.0', function (err, result) {
        that.adUnit.initAd(0, 0, 'normal', -1, '', '', function (err) {
            window.Applixir.$service.sendMessage('ApplixirEventVideoReady', {name: 'msg', type: 'handler'});
            console.log('initAd', err);
        });
    });
};

RequestController.prototype.checkAdProperties = function() {
    this.adUnit.getAdIcons(function (err, result) {
        console.log('getAdIcons', result);
    });
    this.adUnit.setAdVolume(10, function (err, result) {
        console.log('setAdVolume', result);
    });
    this.adUnit.getAdVolume(function (err, result) {
        console.log('getAdVolume', result);
    });

    var that = this;

    var dura = 30.00;
    var timeint = setInterval(function () {
        var t = that.adUnit.getAdRemainingTime(function (e, s) {
            "use strict";
            if (parseInt(s) > dura) dura = parseInt(s);
            window.Applixir.$progress.stat.duration = dura;
            window.Applixir.$progress.stat.remainingTime = parseInt(s);
            window.Applixir.$progress.stat.currentTime = dura - parseInt(s);

            if (s <= 0.0) {
                window.Applixir.$service.sendMessage('ApplixirEventVideoComplete', {name: 'msg', type: 'handler'});
                window.Applixir.$close.hide();
                window.Applixir.$progress.clear();
                window.Applixir.parentWindow.Applixir.$stage.hide();
                clearInterval(timeint);
                that.preLoadVast(that.zoneId);
            }

        });

    }, 1000);
};
module.exports = RequestController;
let CloseButton = function() {
    this.closeButton = document.getElementById('appprizes-close');
    this.closeButton.addEventListener('click', function () {
        window.Applixir.$service.sendMessage('ApplixirEventUserClose', {name: "adsManager", type: "userClose"});
    });
};

CloseButton.prototype.hide = function () {
    this.closeButton.style.display = "none";
};

CloseButton.prototype.show = function () {
    setTimeout(this._show.bind(this), 5000);
};

CloseButton.prototype._show = function () {
    this.closeButton.style.display = 'block';
};

module.exports = CloseButton;
/*jslint node: true */
/*jshint esversion: 6*/
let ProgressBar = function() {
    this.elem = document.getElementById("myBar");
    this.myProgress = document.getElementById("myProgress");
    this.label = document.getElementById("label");
    this.totalTime = 30;
    this.remainTime = 10;
    this.run = false;
    this.stat = {
        currentTime: 0,
        duration: 30, remainingTime: 0,
        bannerDuration: 10, bannerCurrentTime: 0, bannerRemain: 10
    };
};

ProgressBar.prototype.clear = function () {
    this.run = false;
    this.stat = {
        currentTime: 0,
        duration: 30, remainingTime: 0,
        bannerDuration: 10, bannerCurrentTime: 0, bannerRemain: 10
    };
    this.elem.style.width = parseInt("0") + '%';
    this.label.innerHTML = parseInt("0") + '%';
    this.myProgress.style.display = "none";
};

ProgressBar.prototype.start = function ($linear) {
    if (this.run) return;
    this.run = true;
    this.myProgress.style.display = "block";
    this.label.innerHTML = parseInt("0") + '%';
    this.elem.style.width = parseInt("0") + '%';
    window.setInterval(this.increment.bind(this), 1000);
};

ProgressBar.prototype.increment = function () {
    let val = (this.stat.duration - this.stat.remainingTime) / this.stat.duration * 100;
    this.elem.style.width = parseInt(val) + '%';
    this.label.innerHTML = parseInt(val) + '%';
};

module.exports = ProgressBar;
/*jslint node: true */
/*jshint esversion: 6*/
//TODO: expose these as configs

function Stage(id) {
    this.id = id;
    this.iframe = document.createElement('iframe');
    this.div = document.createElement('div');
    this.display = false;
    window.Applixir.stageInterval = -1;
};

//TODO: rename to init
Stage.prototype.configure = function ($config) {

    this.iframe.id = "applixirIframe_" + this.id;
    this.iframe.seamless = "seamless";
    this.iframe.name = "applixir_iframe";
    this.iframe.src = $config.iframeSrc;
    this.iframe.frameBorder =  0;
    this.iframe.allowtransparency = true;

    this.iframe.setAttribute('zoneId', $config.zoneId);
    this.iframe.setAttribute('userId', $config.userId);
    this.iframe.style.display = "none";
    this.div.id = "applixirDiv_" + this.id;
    this.div.name = "applixir_vanishing_div";
    this.div.style.position = "absolute";
    this.div.style.display = "none";
    this.div.appendChild(this.iframe);
    document.body.appendChild(this.div);
};

Stage.prototype.show = function () {
    if (window.Applixir.stageInterval !== null) clearInterval(window.Applixir.stageInterval);
    if (this.display) return;
    this.display = true;
    this.iframe.style.display = "block";
    this.div.style.display = "block";
    this.contentWindow = this.iframe.contentWindow.document.body;
    this.iframe.style.width = this.iframe.contentWindow.document.body.scrollWidth;
    this.iframe.style.height = this.iframe.contentWindow.document.body.scrollHeight;
    this.div.style.backgroundColor = window.Applixir.$config.backgroundColor;
    this.div.style.top = window.Applixir.$config.top;
    this.div.style.left = window.Applixir.$config.left;
    this.div.style.transform = window.Applixir.$config.transform;
    this.div.style.height = this.iframe.contentWindow.document.body.scrollHeight;
};

Stage.prototype.reset = function () {
    this.iframe.frameBorder =  0;
    this.iframe.allowtransparency = true;
    this.iframe.style.display = "none";
    this.div.style.position = "absolute";
    this.div.style.display = "none";
    this.div.style.height = "auto";
};

Stage.prototype.hide = function () {
    if (!this.display) return;
    this.display = false;
    this.instanceHeight = parseInt(this.div.style.height);
    this.step = (this.instanceHeight * 1.01) / 300;
    window.Applixir.stageInterval = setInterval(this._hide.bind(this) , 10);
};
Stage.prototype.getCurrentHeight = function () {
    return parseInt(this.div.style.height);
};
Stage.prototype._hide = function() {
    let pos = this.getCurrentHeight() - this.step;
    if (pos <= 0) {
        clearInterval(window.Applixir.stageInterval);
        this.reset();
        pos = 0;
    }
    this.div.style.height =  pos + 'px';
};
module.exports = Stage;
var eventConfig = { "bubbles":true,  "cancelable":false };
window.Applixir.$handler = window.addEventListener('message', function (e) {

    if (e.data === "get") {
        return;
    }

    var provider = e.data.substr(0,6);
    var message = "";
    var event = "";
    var eventName = "";
    try {
        message = JSON.parse(e.data.substr(6));
        event = message.name + "." +  message.type;
        eventName = message.eventName;
    }  catch (x) {
        window.Applixir.$service.sendMessage('ApplixirEventVideoNotFound', {name: 'msg', type: 'handler'});
    }

    switch (event) {
        case "msg.handler":
            window.dispatchEvent(new Event(eventName, eventConfig));
            break;
        case "Controller.connect":
            window.Applixir.playerWindow = e.source;
            window.Applixir.playerWindow.postMessage("alx://" + JSON.stringify({name: "Player", type: "loaded"}), '*');
            break;
        case "Player.loaded":
            window.Applixir.parentWindow = e.source;
            break;
        case "adsManager.complete":
            window.Applixir.$service.sendMessage('ApplixirEventVideoComplete', {name: 'msg', type: 'handler'});
            window.Applixir.$close.hide();
            window.Applixir.$progress.clear();
            window.Applixir.parentWindow.Applixir.$stage.hide();
            break;
        case "adsManager.remainingTime":
            window.Applixir.$service.UiUpdate(message.data);
            break;
        case "adsManager.error":
            window.Applixir.$service.sendMessage('ApplixirEventVideoNotFound', {name: 'msg', type: 'handler'});
            break;
        case "adsManager.userClose":
            window.Applixir.playerWindow.Applixir.adUnit.stopAd();
            window.Applixir.$close.hide();
            window.Applixir.$progress.clear();
            window.Applixir.parentWindow.Applixir.$stage.hide();
            break;
        }
});

let MessageService = function() {  };

MessageService.prototype.sendMessage = function (eventName, msg) {
    window.dispatchEvent(new Event(eventName, eventConfig));
    window.parent.postMessage("alx://" + JSON.stringify({name: msg.name, type: msg.type, eventName: eventName}), "*");
};

MessageService.prototype.showAd = function () {

    try {
        window.Applixir.playerWindow.Applixir.adUnit.startAd(function (e, x) {
            console.log("startAd");
            console.log(e);
            console.log(x);
            window.Applixir.$stage.show();
        });
    } catch (e) {
        window.Applixir.$service.sendMessage('ApplixirEventVideoNotFound', {name: 'msg', type: 'handler'});
    }
};

MessageService.prototype.UiUpdate = function (e) {
    window.Applixir.$progress.stat.duration = e.duration;
    window.Applixir.$progress.stat.remainingTime = e.remainingTime;
    window.Applixir.$progress.stat.currentTime = e.currentTime;
};
module.exports = MessageService;
var eventConfig = { "bubbles":true,  "cancelable":false };
var Stage = require('./../com/applixir/element/Stage');
var MessageService = require('./../com/applixir/service/MessageService');

var $Applixir = function ($Applixir) {

    var arr = window.location.href.split("/");
    var host = arr[0] + "//" + arr[2];

    var _defaultConfig = {
        iframeSrc: "",
        zoneId: 0,
        userId: 0,
        video: 1,
        banner: 1,
        event: {
            "bubbles":true,
            "cancelable":false
        },
        host: host
    };

    //check if open first
    window.Applixir.hide = function () {
        window.Applixir.$stage.hide();
    };
    window.Applixir.show = function () {
        window.Applixir.$service.showAd();
        window.Applixir.$stage.show();
    };

    window.Applixir.getDuration = function () {
        return window.Applixir.playerWindow.Applixir.duration;
    };

    window.Applixir.getType = function () {
        return window.Applixir.playerWindow.Applixir.adType;
    };

    window.Applixir.$script = document.getElementById("applixirBoot");
    window.Applixir.$config = Object.assign(_defaultConfig, window.Applixir.$script.dataset);
    window.Applixir.$stage = new Stage("showcase");
    window.Applixir.$service = new MessageService();

    var _bootup = function () {
        window.Applixir.$stage.configure(window.Applixir.$config);
    };

    _bootup.bind(window);

    window.addEventListener("load", _bootup);

}($Applixir);











var RequestController = require('./../com/applixir/controller/RequestController');
var MessageService = require('./../com/applixir/service/MessageService');
var ProgressBar = require('./../com/applixir/element/ProgressBar');
var CloseButton = require('./../com/applixir/element/CloseButton');

window.Applixir.$service = new MessageService();

var $Applixir = function ($Applixir) {

    var frame = window.frameElement;

    var arr = window.location.href.split("/");
    var host = arr[0] + "//" + arr[2];

    var _defaultConfig = {
        iframeSrc: "",
        zoneId: 0,
        userId: 0,
        reportState: 0,
        imaDebug: 0,
        fallback: false,
        autoplay: false,
        video: 1,
        banner: 1,
        event: {
            "bubbles":true,
            "cancelable":false
        }, host: host
    };


    var _x = {
        zoneId: frame.getAttribute("zoneId"),
        userId: frame.getAttribute("userId")
    };

    var $config = window.Applixir.$config = Object.assign(_defaultConfig, _x);


    window.Applixir.$close = new CloseButton();
    window.Applixir.$$player = window;

    var _posthook = function () {
        window.Applixir.$controller = new RequestController($config.zoneId, 'adContainer', 'contentElement');
        window.Applixir.$progress = new ProgressBar(window.Applixir.$controller);
        window.Applixir.$service.sendMessage("loaded", {name: "Controller", type: "connect"});
    };

    var _bootup = function () {
        console.log('test  bootup');
        _posthook.bind(window);
        _posthook();
    };

    _bootup.bind(window);

    window.addEventListener('load', _bootup);

}($Applixir);
'use strict';

let unique = require('./utils').unique;
let isPositiveInt = require('./utils').isPositiveInt;
let stringEndsWith = require('./utils').stringEndsWith;
let SingleValueRegistry = require('./registry').SingleValueRegistry;
let MultipleValuesRegistry = require('./registry').MultipleValuesRegistry;
const registry = require('./jsFlashBridgeRegistry');
const VPAID_FLASH_HANDLER = 'vpaid_video_flash_handler';
const ERROR = 'AdError';

export class JSFlashBridge {
    constructor (el, flashURL, flashID, width, height, loadHandShake) {
        this._el = el;
        this._flashID = flashID;
        this._flashURL = flashURL;
        this._width = width;
        this._height = height;
        this._handlers = new MultipleValuesRegistry();
        this._callbacks = new SingleValueRegistry();
        this._uniqueMethodIdentifier = unique(this._flashID);
        this._ready = false;
        this._handShakeHandler = loadHandShake;

        registry.addInstance(this._flashID, this);
    }

    on(eventName, callback) {
        this._handlers.add(eventName, callback);
    }

    off(eventName, callback) {
        return this._handlers.remove(eventName, callback);
    }

    offEvent(eventName) {
        return this._handlers.removeByKey(eventName);
    }

    offAll() {
        return this._handlers.removeAll();
    }

    callFlashMethod(methodName, args = [], callback = undefined) {
        var callbackID = '';
        // if no callback, some methods the return is void so they don't need callback
        if (callback) {
            callbackID = `${this._uniqueMethodIdentifier()}_${methodName}`;
            this._callbacks.add(callbackID, callback);
        }


        try {
            //methods are created by ExternalInterface.addCallback in as3 code, if for some reason it failed
            //this code will throw an error
            this._el[methodName]([callbackID].concat(args));

        } catch (e) {
            if (callback) {
                $asyncCallback.call(this, callbackID, e);
            } else {

                //if there isn't any callback to return error use error event handler
                this._trigger(ERROR, e);
            }
        }
    }

    removeCallback(callback) {
        return this._callbacks.removeByValue(callback);
    }

    removeCallbackByMethodName(suffix) {
        this._callbacks.filterKeys((key) => {
            return stringEndsWith(key, suffix);
        }).forEach((key) => {
            this._callbacks.remove(key);
        });
    }

    removeAllCallbacks() {
        return this._callbacks.removeAll();
    }

    _trigger(eventName, event) {
        this._handlers.get(eventName).forEach((callback) => {
            //clickThru has to be sync, if not will be block by the popupblocker
            if (eventName === 'AdClickThru') {
                callback(event);
            } else {
                setTimeout(() => {
                    if (this._handlers.get(eventName).length > 0) {
                        callback(event);
                    }
                }, 0);
            }
        });
    }

    _callCallback(methodName, callbackID, err, result) {

        let callback = this._callbacks.get(callbackID);

        //not all methods callback's are mandatory
        //but if there exist an error, fire the error event
        if (!callback) {
            if (err && callbackID === '') {
                this.trigger(ERROR, err);
            }
            return;
        }

        $asyncCallback.call(this, callbackID, err, result);

    }

    _handShake(err, data) {
        this._ready = true;
        if (this._handShakeHandler) {
            this._handShakeHandler(err, data);
            delete this._handShakeHandler;
        }
    }

    //methods like properties specific to this implementation of VPAID
    getSize() {
        return {width: this._width, height: this._height};
    }
    setSize(newWidth, newHeight) {
        this._width = isPositiveInt(newWidth, this._width);
        this._height = isPositiveInt(newHeight, this._height);
        this._el.setAttribute('width', this._width);
        this._el.setAttribute('height', this._height);
    }
    getWidth() {
        return this._width;
    }
    setWidth(newWidth) {
        this.setSize(newWidth, this._height);
    }
    getHeight() {
        return this._height;
    }
    setHeight(newHeight) {
        this.setSize(this._width, newHeight);
    }
    getFlashID() {
        return this._flashID;
    }
    getFlashURL() {
        return this._flashURL;
    }
    isReady() {
        return this._ready;
    }
    destroy() {
        this.offAll();
        this.removeAllCallbacks();
        registry.removeInstanceByID(this._flashID);
        if (this._el.parentElement) {
            this._el.parentElement.removeChild(this._el);
        }
    }
}

function $asyncCallback(callbackID, err, result) {
    setTimeout(() => {
        let callback = this._callbacks.get(callbackID);
        if (callback) {
            this._callbacks.remove(callbackID);
            callback(err, result);
        }
    }, 0);
}

Object.defineProperty(JSFlashBridge, 'VPAID_FLASH_HANDLER', {
    writable: false,
    configurable: false,
    value: VPAID_FLASH_HANDLER
});

/**
 * External interface handler
 *
 * @param {string} flashID identifier of the flash who call this
 * @param {string} typeID what type of message is, can be 'event' or 'callback'
 * @param {string} typeName if the typeID is a event the typeName will be the eventName, if is a callback the typeID is the methodName that is related this callback
 * @param {string} callbackID only applies when the typeID is 'callback', identifier of the callback to call
 * @param {object} error error object
 * @param {object} data
 */
window[VPAID_FLASH_HANDLER] = (flashID, typeID, typeName, callbackID, error, data) => {
    let instance = registry.getInstanceByID(flashID);
    if (!instance) return;
    if (typeName === 'handShake') {
        instance._handShake(error, data);
    } else {
        if (typeID !== 'event') {
            instance._callCallback(typeName, callbackID, error, data);
        } else {
            instance._trigger(typeName, data);
        }
    }
};


'use strict';

let SingleValueRegistry = require('./registry').SingleValueRegistry;
let instances = new SingleValueRegistry();

const JSFlashBridgeRegistry = {};
Object.defineProperty(JSFlashBridgeRegistry, 'addInstance', {
    writable: false,
    configurable: false,
    value: function (id, instance) {
        instances.add(id, instance);
    }
});

Object.defineProperty(JSFlashBridgeRegistry, 'getInstanceByID', {
    writable: false,
    configurable: false,
    value: function (id) {
        return instances.get(id);
    }
});

Object.defineProperty(JSFlashBridgeRegistry, 'removeInstanceByID', {
    writable: false,
    configurable: false,
    value: function (id) {
        return instances.remove(id);
    }
});

module.exports = JSFlashBridgeRegistry;


'use strict';

export class MultipleValuesRegistry {
    constructor () {
        this._registries = {};
    }
    add (id, value) {
        if (!this._registries[id]) {
            this._registries[id] = [];
        }
        if (this._registries[id].indexOf(value) === -1) {
            this._registries[id].push(value);
        }
    }
    get (id) {
        return this._registries[id] || [];
    }
    filterKeys (handler) {
        return Object.keys(this._registries).filter(handler);
    }
    findByValue (value) {
        var keys = Object.keys(this._registries).filter((key) => {
            return this._registries[key].indexOf(value) !== -1;
        });

        return keys;
    }
    remove(key, value) {
        if (!this._registries[key]) { return; }

        var index = this._registries[key].indexOf(value);

        if (index < 0) { return; }
        return this._registries[key].splice(index, 1);
    }
    removeByKey (id) {
        let old = this._registries[id];
        delete this._registries[id];
        return old;
    }
    removeByValue (value) {
        let keys = this.findByValue(value);
        return keys.map((key) => {
            return this.remove(key, value);
        });
    }
    removeAll() {
        let old = this._registries;
        this._registries = {};
        return old;
    }
    size() {
        return Object.keys(this._registries).length;
    }
}

export class SingleValueRegistry {
    constructor () {
        this._registries = {};
    }
    add (id, value) {
        this._registries[id] = value;
    }
    get (id) {
        return this._registries[id];
    }
    filterKeys (handler) {
        return Object.keys(this._registries).filter(handler);
    }
    findByValue (value) {
        var keys = Object.keys(this._registries).filter((key) => {
            return this._registries[key] === value;
        });

        return keys;
    }
    remove (id) {
        let old = this._registries[id];
        delete this._registries[id];
        return old;
    }
    removeByValue (value) {
        let keys = this.findByValue(value);
        return keys.map((key) => {
            return this.remove(key);
        });
    }
    removeAll() {
        let old = this._registries;
        this._registries = {};
        return old;
    }
    size() {
        return Object.keys(this._registries).length;
    }
}


'use strict';

//const swfobject = require('swfobject');

const JSFlashBridge = require('./jsFlashBridge').JSFlashBridge;
const VPAIDAdUnit = require('./VPAIDAdUnit').VPAIDAdUnit;

const noop = require('./utils').noop;
const callbackTimeout = require('./utils').callbackTimeout;
const isPositiveInt = require('./utils').isPositiveInt;
const createElementWithID = require('./utils').createElementWithID;
const uniqueVPAID = require('./utils').unique('vpaid');
const createFlashTester = require('./flashTester.js').createFlashTester;

const ERROR = 'error';
const FLASH_VERSION = '10.1.0';

let flashTester = {isSupported: ()=> true}; // if the runFlashTest is not run the flashTester will always return true

class VPAIDFLASHClient {
    constructor (vpaidParentEl, callback, swfConfig = {data: 'VPAIDFlash.swf', width: 640, height: 360}, params = { wmode: 'transparent', salign: 'tl', align: 'left', allowScriptAccess: 'always', scale: 'noScale', allowFullScreen: 'true', quality: 'high'}, vpaidOptions = { debug: false, timeout: 10000 }) {

        var me = this;

        this._vpaidParentEl = vpaidParentEl;
        this._flashID = uniqueVPAID();
        this._destroyed = false;
        callback = callback || noop;

        swfConfig.width = isPositiveInt(swfConfig.width, 640);
        swfConfig.height = isPositiveInt(swfConfig.height, 360);

        createElementWithID(vpaidParentEl, this._flashID, true);

        params.movie = swfConfig.data;
        params.FlashVars = `flashid=${this._flashID}&handler=${JSFlashBridge.VPAID_FLASH_HANDLER}&debug=${vpaidOptions.debug}&salign=${params.salign}`;

        if (!VPAIDFLASHClient.isSupported()) {
            return onError('user don\'t support flash or doesn\'t have the minimum required version of flash ' + FLASH_VERSION);
        }

        this.el = swfobject.createSWF(swfConfig, params, this._flashID);

        if (!this.el) {
            return onError( 'swfobject failed to create object in element' );
        }

        var handler = callbackTimeout(vpaidOptions.timeout,
            (err, data) => {
                console.log(data);
                $loadPendedAdUnit.call(this);
                callback(err, data);
            }, () => {
                callback('vpaid flash load timeout ' + vpaidOptions.timeout);
            }
        );

        this._flash = new JSFlashBridge(this.el, swfConfig.data, this._flashID, swfConfig.width, swfConfig.height, handler);

        function onError(error) {
            setTimeout(() => {
                callback(new Error(error));
            }, 0);
            return me;
        }

    }

    destroy () {
        this._destroyAdUnit();

        if (this._flash) {
            this._flash.destroy();
            this._flash = null;
        }
        this.el = null;
        this._destroyed = true;
    }

    isDestroyed () {
        return this._destroyed;
    }

    _destroyAdUnit() {
        delete this._loadLater;

        if (this._adUnitLoad) {
            this._adUnitLoad = null;
            this._flash.removeCallback(this._adUnitLoad);
        }

        if (this._adUnit) {
            this._adUnit._destroy();
            this._adUnit = null;
        }
    }

    loadAdUnit(adURL, callback) {
        $throwIfDestroyed.call(this);

        if (this._adUnit) {
            this._destroyAdUnit();
        }

        if (this._flash.isReady()) {
            this._adUnitLoad = (err, message) => {
                if (!err) {
                    this._adUnit = new VPAIDAdUnit(this._flash);
                }
                this._adUnitLoad = null;
                callback(err, this._adUnit);
            };

            this._flash.callFlashMethod('loadAdUnit', [adURL], this._adUnitLoad);
        }else {
            this._loadLater = {url: adURL, callback};
        }
    }

    unloadAdUnit(callback = undefined) {
        $throwIfDestroyed.call(this);

        this._destroyAdUnit();
        this._flash.callFlashMethod('unloadAdUnit', [], callback);
    }
    getFlashID() {
        $throwIfDestroyed.call(this);
        return this._flash.getFlashID();
    }
    getFlashURL() {
        $throwIfDestroyed.call(this);
        return this._flash.getFlashURL();
    }
}

setStaticProperty('isSupported', () => {
    return swfobject.hasFlashPlayerVersion(FLASH_VERSION) && flashTester.isSupported();
}, true);

setStaticProperty('runFlashTest', (swfConfig) => {
    flashTester = createFlashTester(document.body, swfConfig);
});

function $throwIfDestroyed() {
    if(this._destroyed) {
        throw new Error('VPAIDFlashToJS is destroyed!');
    }
}

function $loadPendedAdUnit() {
    if (this._loadLater) {
        this.loadAdUnit(this._loadLater.url, this._loadLater.callback);
        delete this._loadLater;
    }
}

function setStaticProperty(propertyName, value, writable = false) {
    Object.defineProperty(VPAIDFLASHClient, propertyName, {
        writable: writable,
        configurable: false,
        value: value
    });
}

VPAIDFLASHClient.swfobject = swfobject;

module.exports = VPAIDFLASHClient;

'use strict';

//simple representation of the API
export class IVPAIDAdUnit {

    //all methods below
    //are async methods
    handshakeVersion(playerVPAIDVersion = '2.0', callback = undefined) {}

    //creativeData is an object to be consistent with VPAIDHTML
    initAd (width, height, viewMode, desiredBitrate, creativeData = {AdParameters:''}, environmentVars = {flashVars: ''}, callback = undefined) {}
    resizeAd(width, height, viewMode, callback = undefined) {}

    startAd(callback = undefined) {}
    stopAd(callback = undefined) {}
    pauseAd(callback = undefined) {}
    resumeAd(callback = undefined) {}
    expandAd(callback = undefined) {}
    collapseAd(callback = undefined) {}
    skipAd(callback = undefined) {}

    //properties that will be treat as async methods
    getAdLinear(callback) {}
    getAdWidth(callback) {}
    getAdHeight(callback) {}
    getAdExpanded(callback) {}
    getAdSkippableState(callback) {}
    getAdRemainingTime(callback) {}
    getAdDuration(callback) {}
    setAdVolume(soundVolume, callback = undefined) {}
    getAdVolume(callback) {}
    getAdCompanions(callback) {}
    getAdIcons(callback) {}
}

Object.defineProperty(IVPAIDAdUnit, 'EVENTS', {
    writable: false,
    configurable: false,
    value: [
        'AdLoaded',
        'AdStarted',
        'AdStopped',
        'AdSkipped',
        'AdSkippableStateChange', // VPAID 2.0 new event
        'AdSizeChange', // VPAID 2.0 new event
        'AdLinearChange',
        'AdDurationChange', // VPAID 2.0 new event
        'AdExpandedChange',
        'AdRemainingTimeChange', // [Deprecated in 2.0] but will be still fired for backwards compatibility
        'AdVolumeChange',
        'AdImpression',
        'AdVideoStart',
        'AdVideoFirstQuartile',
        'AdVideoMidpoint',
        'AdVideoThirdQuartile',
        'AdVideoComplete',
        'AdClickThru',
        'AdInteraction', // VPAID 2.0 new event
        'AdUserAcceptInvitation',
        'AdUserMinimize',
        'AdUserClose',
        'AdPaused',
        'AdPlaying',
        'AdLog',
        'AdError'
    ]
});


'use strict';

var utils = require('./utils');
var unique = utils.unique('vpaidIframe');
var VPAIDAdUnit = require('./VPAIDAdUnit');

var defaultTemplate = '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0"><div class="ad-element"></div>' +
    '<script type="text/javascript" src="{{iframeURL_JS}}"></script>' +
    '<script type="text/javascript">' +
    'window.parent.postMessage(\'{"event": "ready", "id": "{{iframeID}}"}\', \'{{origin}}\');' +
    '</script>' +
    '</body>' +
    '</html>';

var AD_STOPPED = 'AdStopped';

/**
 * This callback is displayed as global member. The callback use nodejs error-first callback style
 * @callback NodeStyleCallback
 * @param {string|null}
 * @param {undefined|object}
 */

/**
 * VPAIDHTML5Client
 * @class
 *
 * @param {HTMLElement} el that will contain the iframe to load adUnit and a el to add to adUnit slot
 * @param {HTMLVideoElement} video default video element to be used by adUnit
 * @param {object} [templateConfig] template: html template to be used instead of the default, extraOptions: to be used when rendering the template
 * @param {object} [vpaidOptions] timeout: when loading adUnit
 */
function VPAIDHTML5Client(el, video, templateConfig, vpaidOptions) {
    templateConfig = templateConfig || {};

    this._id = unique();
    this._destroyed = false;

    this._frameContainer = utils.createElementInEl(el, 'div');
    this._videoEl = video;
    this._vpaidOptions = vpaidOptions || {timeout: 10000};

    this._templateConfig = {
        template: templateConfig.template || defaultTemplate,
        extraOptions: templateConfig.extraOptions || {}
    };
}

/**
 * destroy
 *
 */
VPAIDHTML5Client.prototype.destroy = function destroy() {
    if (this._destroyed) {
        return;
    }
    this._destroyed = true;
    $unloadPreviousAdUnit.call(this);
};

/**
 * isDestroyed
 *
 * @return {boolean}
 */
VPAIDHTML5Client.prototype.isDestroyed = function isDestroyed() {
    return this._destroyed;
};

/**
 * loadAdUnit
 *
 * @param {string} adURL url of the js of the adUnit
 * @param {nodeStyleCallback} callback
 */
VPAIDHTML5Client.prototype.loadAdUnit = function loadAdUnit(adURL, callback) {
    $throwIfDestroyed.call(this);
    $unloadPreviousAdUnit.call(this);
    var that = this;

    var frame = utils.createIframeWithContent(
        this._frameContainer,
        this._templateConfig.template,
        utils.extend({
            iframeURL_JS: adURL,
            iframeID: this.getID(),
            origin: getOrigin()
        }, this._templateConfig.extraOptions)
    );

    this._frame = frame;

    this._onLoad = utils.callbackTimeout(
        this._vpaidOptions.timeout,
        onLoad.bind(this),
        onTimeout.bind(this)
    );

    window.addEventListener('message', this._onLoad);

    function onLoad (e) {
        /*jshint validthis: false */
        //don't clear timeout
        if (e.origin !== getOrigin()) return;
        var result = JSON.parse(e.data);

        //don't clear timeout
        if (result.id !== that.getID()) return;

        var adUnit, error, createAd;
        if (!that._frame.contentWindow) {

            error = 'the iframe is not anymore in the DOM tree';

        } else {
            createAd = that._frame.contentWindow.getVPAIDAd;
            error = utils.validate(typeof createAd === 'function', 'the ad didn\'t return a function to create an ad');
        }

        if (!error) {
            var adEl = that._frame.contentWindow.document.querySelector('.ad-element');
            adUnit = new VPAIDAdUnit(createAd(), adEl, that._videoEl, that._frame);
            adUnit.subscribe(AD_STOPPED, $adDestroyed.bind(that));
            error = utils.validate(adUnit.isValidVPAIDAd(), 'the add is not fully complaint with VPAID specification');
        }

        that._adUnit = adUnit;
        $destroyLoadListener.call(that);
        callback(error, error ? null : adUnit);

        //clear timeout
        return true;
    }

    function onTimeout() {
        callback('timeout', null);
    }
};

/**
 * unloadAdUnit
 *
 */
VPAIDHTML5Client.prototype.unloadAdUnit = function unloadAdUnit() {
    $unloadPreviousAdUnit.call(this);
};

/**
 * getID will return the unique id
 *
 * @return {string}
 */
VPAIDHTML5Client.prototype.getID = function () {
    return this._id;
};


/**
 * $removeEl
 *
 * @param {string} key
 */
function $removeEl(key) {
    var el = this[key];
    if (el) {
        el.remove();
        delete this[key];
    }
}

function $adDestroyed() {
    $removeAdElements.call(this);
    delete this._adUnit;
}

function $unloadPreviousAdUnit() {
    $removeAdElements.call(this);
    $destroyAdUnit.call(this);
}

function $removeAdElements() {
    $removeEl.call(this, '_frame');
    $destroyLoadListener.call(this);
}

/**
 * $destroyLoadListener
 *
 */
function $destroyLoadListener() {
    if (this._onLoad) {
        window.removeEventListener('message', this._onLoad);
        utils.clearCallbackTimeout(this._onLoad);
        delete this._onLoad;
    }
}


function $destroyAdUnit() {
    if (this._adUnit) {
        this._adUnit.stopAd();
        delete this._adUnit;
    }
}

/**
 * $throwIfDestroyed
 *
 */
function $throwIfDestroyed() {
    if (this._destroyed) {
        throw new Error ('VPAIDHTML5Client already destroyed!');
    }
}

function getOrigin() {
    if( window.location.origin ) {
        return window.location.origin;
    }
    else {
        return window.location.protocol + "//" +
            window.location.hostname +
            (window.location.port ? ':' + window.location.port: '');
    }
}

module.exports = VPAIDHTML5Client;


'use strict';

function Subscriber() {
    this._subscribers = {};
}

Subscriber.prototype.subscribe = function subscribe(handler, eventName, context) {
    if (!this.isHandlerAttached(handler, eventName)) {
        this.get(eventName).push({handler: handler, context: context, eventName: eventName});
    }
};

Subscriber.prototype.unsubscribe = function unsubscribe(handler, eventName) {
    this._subscribers[eventName] = this.get(eventName).filter(function (subscriber) {
        return handler !== subscriber.handler;
    });
};

Subscriber.prototype.unsubscribeAll = function unsubscribeAll() {
    this._subscribers = {};
};

Subscriber.prototype.trigger = function(eventName, data) {
    var that = this;
    var subscribers = this.get(eventName)
        .concat(this.get('*'));

    subscribers.forEach(function (subscriber) {
        setTimeout(function () {
            if (that.isHandlerAttached(subscriber.handler, subscriber.eventName)) {
                subscriber.handler.call(subscriber.context, data);
            }
        }, 0);
    });
};

Subscriber.prototype.triggerSync = function(eventName, data) {
    var subscribers = this.get(eventName)
        .concat(this.get('*'));

    subscribers.forEach(function (subscriber) {
        subscriber.handler.call(subscriber.context, data);
    });
};

Subscriber.prototype.get = function get(eventName) {
    if (!this._subscribers[eventName]) {
        this._subscribers[eventName] = [];
    }
    return this._subscribers[eventName];
};

Subscriber.prototype.isHandlerAttached = function isHandlerAttached(handler, eventName) {
    return this.get(eventName).some(function(subscriber) {
        return handler === subscriber.handler;
    })
};

module.exports = Subscriber;


'use strict';

/**
 * noop a empty function
 */
function noop() {}

/**
 * validate if is not validate will return an Error with the message
 *
 * @param {boolean} isValid
 * @param {string} message
 */
function validate(isValid, message) {
    return isValid ? null : new Error(message);
}

var timeouts = {};
/**
 * clearCallbackTimeout
 *
 * @param {function} func handler to remove
 */
function clearCallbackTimeout(func) {
    var timeout = timeouts[func];
    if (timeout) {
        clearTimeout(timeout);
        delete timeouts[func];
    }
}

/**
 * callbackTimeout if the onSuccess is not called and returns true in the timelimit then onTimeout will be called
 *
 * @param {number} timer
 * @param {function} onSuccess
 * @param {function} onTimeout
 */
function callbackTimeout(timer, onSuccess, onTimeout) {
    var callback, timeout;

    timeout = setTimeout(function () {
        onSuccess = noop;
        delete timeout[callback];
        onTimeout();
    }, timer);

    callback = function () {
        // TODO avoid leaking arguments
        // https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
        if (onSuccess.apply(this, arguments)) {
            clearCallbackTimeout(callback);
        }
    };

    timeouts[callback] = timeout;

    return callback;
}


/**
 * createElementInEl
 *
 * @param {HTMLElement} parent
 * @param {string} tagName
 * @param {string} id
 */
function createElementInEl(parent, tagName, id) {
    var nEl = document.createElement(tagName);
    if (id) nEl.id = id;
    parent.appendChild(nEl);
    return nEl;
}

/**
 * createIframeWithContent
 *
 * @param {HTMLElement} parent
 * @param {string} template simple template using {{var}}
 * @param {object} data
 */
function createIframeWithContent(parent, template, data) {
    var iframe = createIframe(parent, null, data.zIndex);
    if (!setIframeContent(iframe, simpleTemplate(template, data))) return;
    return iframe;
}

/**
 * createIframe
 *
 * @param {HTMLElement} parent
 * @param {string} url
 */
function createIframe(parent, url, zIndex) {
    var nEl = document.createElement('iframe');
    nEl.src = url || 'about:blank';
    nEl.marginWidth = '0';
    nEl.marginHeight = '0';
    nEl.frameBorder = '0';
    nEl.width = '100%';
    nEl.height = '100%';
    setFullSizeStyle(nEl);

    if(zIndex){
        nEl.style.zIndex = zIndex;
    }

    nEl.setAttribute('SCROLLING','NO');
    parent.innerHTML = '';
    parent.appendChild(nEl);
    return nEl;
}

function setFullSizeStyle(element) {
    element.style.position = 'absolute';
    element.style.left = '0';
    element.style.top = '0';
    element.style.margin = '0px';
    element.style.padding = '0px';
    element.style.border = 'none';
    element.style.width = '100%';
    element.style.height = '100%';
}

/**
 * simpleTemplate
 *
 * @param {string} template
 * @param {object} data
 */
function simpleTemplate(template, data) {
    Object.keys(data).forEach(function (key) {
        var value = (typeof value === 'object') ? JSON.stringify(data[key]) : data[key];
        template = template.replace(new RegExp('{{' + key + '}}', 'g'), value);
    });
    return template;
}

/**
 * setIframeContent
 *
 * @param {HTMLIframeElement} iframeEl
 * @param content
 */
function setIframeContent(iframeEl, content) {
    var iframeDoc = iframeEl.contentWindow && iframeEl.contentWindow.document;
    if (!iframeDoc) return false;

    iframeDoc.write(content);

    return true;
}


/**
 * extend object with keys from another object
 *
 * @param {object} toExtend
 * @param {object} fromSource
 */
function extend(toExtend, fromSource) {
    Object.keys(fromSource).forEach(function(key) {
        toExtend[key] = fromSource[key];
    });
    return toExtend;
}


/**
 * unique will create a unique string everytime is called, sequentially and prefixed
 *
 * @param {string} prefix
 */
function unique(prefix) {
    var count = -1;
    return function () {
        return prefix + '_' + (++count);
    };
}

export function hideFlashEl(el) {
    // can't use display none or visibility none because will block flash in some browsers
    el.style.position = 'absolute';
    el.style.left = '-1px';
    el.style.top = '-1px';
    el.style.width = '1px';
    el.style.height = '1px';
}

let endsWith = (function () {
    if (String.prototype.endsWith) return String.prototype.endsWith;
    return function endsWith (searchString, position) {
        var subjectString = this.toString();
        if (position === undefined || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
})();

export function stringEndsWith(string, search) {
    return endsWith.call(string, search);
}

export function isPositiveInt(newVal, oldVal) {
    return !isNaN(parseFloat(newVal)) && isFinite(newVal) && newVal > 0 ? newVal : oldVal;
}

export function createElementWithID(parent, id, cleanContent = false) {
    var nEl = document.createElement('div');
    nEl.id = id;
    if (cleanContent) {
        parent.innerHTML = '';
    }
    parent.appendChild(nEl);
    return nEl;
}

module.exports = {
    noop: noop,
    validate: validate,
    clearCallbackTimeout: clearCallbackTimeout,
    callbackTimeout: callbackTimeout,
    createElementInEl: createElementInEl,
    createIframeWithContent: createIframeWithContent,
    createIframe: createIframe,
    setFullSizeStyle: setFullSizeStyle,
    simpleTemplate: simpleTemplate,
    setIframeContent: setIframeContent,
    extend: extend,
    unique: unique
};


'use strict';

let IVPAIDAdUnit = require('./IVPAIDAdUnit').IVPAIDAdUnit;
let ALL_VPAID_METHODS = Object.getOwnPropertyNames(IVPAIDAdUnit.prototype).filter(function (property) {
    return ['constructor'].indexOf(property) === -1;
});

export class VPAIDAdUnit extends IVPAIDAdUnit {
    constructor (flash) {
        super();
        this._destroyed = false;
        this._flash = flash;
    }

    _destroy() {
        this._destroyed = true;
        ALL_VPAID_METHODS.forEach((methodName) => {
            this._flash.removeCallbackByMethodName(methodName);
        });
        IVPAIDAdUnit.EVENTS.forEach((event) => {
            this._flash.offEvent(event);
        });

        this._flash = null;
    }

    isDestroyed () {
        return this._destroyed;
    }

    on(eventName, callback) {
        this._flash.on(eventName, callback);
    }

    off(eventName, callback) {
        this._flash.off(eventName, callback);
    }

    //VPAID interface
    handshakeVersion(playerVPAIDVersion = '2.0', callback = undefined) {
        this._flash.callFlashMethod('handshakeVersion', [playerVPAIDVersion], callback);
    }
    initAd (width, height, viewMode, desiredBitrate, creativeData = {AdParameters: ''}, environmentVars = {flashVars: ''}, callback = undefined) {
        //resize element that has the flash object
        this._flash.setSize(width, height);
        creativeData = creativeData || {AdParameters: ''};
        environmentVars = environmentVars || {flashVars: ''};

        this._flash.callFlashMethod('initAd', [this._flash.getWidth(), this._flash.getHeight(), viewMode, desiredBitrate, creativeData.AdParameters || '', environmentVars.flashVars || ''], callback);
    }
    resizeAd(width, height, viewMode, callback = undefined) {
        //resize element that has the flash object
        this._flash.setSize(width, height);

        //resize ad inside the flash
        this._flash.callFlashMethod('resizeAd', [this._flash.getWidth(), this._flash.getHeight(), viewMode], callback);
    }
    startAd(callback = undefined) {
        this._flash.callFlashMethod('startAd', [], callback);
    }
    stopAd(callback = undefined) {
        this._flash.callFlashMethod('stopAd', [], callback);
    }
    pauseAd(callback = undefined) {
        this._flash.callFlashMethod('pauseAd', [], callback);
    }
    resumeAd(callback = undefined) {
        this._flash.callFlashMethod('resumeAd', [], callback);
    }
    expandAd(callback = undefined) {
        this._flash.callFlashMethod('expandAd', [], callback);
    }
    collapseAd(callback = undefined) {
        this._flash.callFlashMethod('collapseAd', [], callback);
    }
    skipAd(callback = undefined) {
        this._flash.callFlashMethod('skipAd', [], callback);
    }

    //properties that will be treat as async methods
    getAdLinear(callback) {
        this._flash.callFlashMethod('getAdLinear', [], callback);
    }
    getAdWidth(callback) {
        this._flash.callFlashMethod('getAdWidth', [], callback);
    }
    getAdHeight(callback) {
        this._flash.callFlashMethod('getAdHeight', [], callback);
    }
    getAdExpanded(callback) {
        this._flash.callFlashMethod('getAdExpanded', [], callback);
    }
    getAdSkippableState(callback) {
        this._flash.callFlashMethod('getAdSkippableState', [], callback);
    }
    getAdRemainingTime(callback) {
        this._flash.callFlashMethod('getAdRemainingTime', [], callback);
    }
    getAdDuration(callback) {
        this._flash.callFlashMethod('getAdDuration', [], callback);
    }
    setAdVolume(volume, callback = undefined) {
        this._flash.callFlashMethod('setAdVolume', [volume], callback);
    }
    getAdVolume(callback) {
        this._flash.callFlashMethod('getAdVolume', [], callback);
    }
    getAdCompanions(callback) {
        this._flash.callFlashMethod('getAdCompanions', [], callback);
    }
    getAdIcons(callback) {
        this._flash.callFlashMethod('getAdIcons', [], callback);
    }
}

