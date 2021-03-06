/*global CodeMirror, document, exports, module, require, define*/
/*jslint browser: true*/
(function (mod) {
	"use strict";
	if (typeof exports === "object" && typeof module === "object") { // CommonJS
		mod(require("../../lib/codemirror"));
	} else if (typeof define === "function" && define.amd) { // AMD
		define(["../../lib/codemirror"], mod);
	} else { // Plain browser env
		mod(CodeMirror);
	}
}(function (CodeMirror) {
	"use strict";
	function dialogDiv(template) {
		var dialog = document.createElement("div");

		if (typeof template === "string") {
			dialog.innerHTML = template;
		} else { // Assuming it's a detached DOM element.
			dialog.appendChild(template);
		}
		return dialog;
	}
	CodeMirror.defineExtension("openComplex", function (template, buttonCallbacks, checkboxCallbacks, options) {
		if (!options) { 
			options = {}; 
		}

		var dialog = dialogDiv(template),
			panel = this.addPanel(dialog, { position: options.where || "bottom" }),
			closed = false,
			me = this,
			blurring = 1,
			i,
			inputs,
			inp,
			buttons = [],
			checkboxes = [],
			b,
			close = function (newVal) {
				if (typeof newVal === 'string') {
					inp.value = newVal;
				} else {
					if (closed) {return; }
					closed = true;
					panel.clear();
					me.focus();
					if (options.onClose) {
						options.onClose();
					}
				}
			},
			assignCallback = function (element, event, callback) {
				CodeMirror.on(element, event, function (e) {
					// CodeMirror.e_preventDefault(e);
					if (callback) {
						if (callback(me, e, element) === "Not found") {
							dialog.style.backgroundColor = "#f99";
						} else {
							dialog.style.backgroundColor = null;
						}
					} else {
						(function () {
							close();
							me.focus();
						}());
					}
				});
			},
			handleBlur = function () {
				blurring -= 1;
				setTimeout(function () {
					if (blurring <= 0) {
						close();
					}
				}, 200);
			},
			handleFocus = function () {
				blurring += 1;
			};

		inputs = dialog.getElementsByTagName("input");
		for (i = 0; i < inputs.length; i++) {
			switch (inputs[i].type) {
				case 'text':
					inp = inputs[i];
					break;
				case 'button':
					buttons.push(inputs[i]);
					break;
				case 'checkbox':
					checkboxes.push(inputs[i]);
					break;
				default:
					console.log("Dialog.js - Invalid input type: " + inputs[i].type);
			}
		}

		if (inp) {
			if (options.value) {
				inp.value = options.value;
				if (options.selectValueOnOpen !== false) {
					inp.select();
				}
			}

			if (options.onInput) {
				CodeMirror.on(inp, "input", function (e) {
					if (options.onInput(e, inp.value, close) === "Not found") {
						dialog.style.backgroundColor = "#f99";
					} else {
						dialog.style.backgroundColor = null;
					}
				});
			}
			if (options.onKeyUp) {
				CodeMirror.on(dialog, "keyup", function (e) {
					options.onKeyUp(e, inp.value, close);
				});
			}

			CodeMirror.on(dialog, "keydown", function (e) {
				if (options && options.onKeyDown) {
					options.onKeyDown(e, inp.value, close);
				}
				if (e.keyCode === 27 || (options.closeOnEnter !== false && e.keyCode === 13)) {
					inp.blur();
					close();
					CodeMirror.e_stop(e);
				}
				if (e.keyCode === 13) {
					CodeMirror.e_stop(e);
					me.focus();
				}
			});

			if (options.closeOnBlur !== false) {
				CodeMirror.on(inp, "blur", close);
			}
			inp.focus();
		}
		for (i = 0; i < buttons.length; i += 1) {
			b = buttons[i];
			assignCallback(b, "click", buttonCallbacks[i]);
			// CodeMirror.on(b, "blur", handleBlur);
			// CodeMirror.on(b, "focus", handleFocus);
		}
		for (i = 0; i < checkboxes.length; i += 1) {
			b = checkboxes[i];
			assignCallback(b, "click", checkboxCallbacks[i]);
			// CodeMirror.on(b, "blur", handleBlur);
			// CodeMirror.on(b, "focus", handleFocus);
		}
		return {close: close, dialog: dialog};
	});
}));
