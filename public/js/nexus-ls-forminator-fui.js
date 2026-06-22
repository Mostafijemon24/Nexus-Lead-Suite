/**
 * Initializes WPMU DEV Forminator UI (FUI) helpers on Nexus Lead Suite forms.
 *
 * Depends on: jquery, forminator-form.min.js (window.FUI), nexulesuite_forms-runtime.
 */
(function ($) {
  "use strict";

  function bootOne(root) {
    if (!root || !window.FUI) {
      return;
    }
    var $root = $(root);
    var design = "";
    if (root.classList) {
      root.classList.forEach(function (c) {
        if (c.indexOf("forminator-design--") === 0) {
          design = c.replace("forminator-design--", "");
        }
      });
    }

    $root.find("input, textarea, select").each(function () {
      var tag = (this.tagName || "").toLowerCase();
      var type = (this.type || "").toLowerCase();
      if (tag === "input") {
        if (type === "radio") {
          if (FUI.radioStates) {
            FUI.radioStates($(this));
          }
          return;
        }
        if (type === "checkbox") {
          if (FUI.checkboxStates) {
            FUI.checkboxStates($(this));
          }
          return;
        }
        if (FUI.inputStates) {
          FUI.inputStates($(this));
        }
        if (design === "material" && FUI.inputMaterial) {
          FUI.inputMaterial($(this));
        }
      } else if (tag === "textarea") {
        if (FUI.textareaStates) {
          FUI.textareaStates($(this));
        }
        if (design === "material" && FUI.textareaMaterial) {
          FUI.textareaMaterial($(this));
        }
      }
    });
  }

  $(function () {
    document.querySelectorAll(".nexulesuite_st-form.forminator-ui").forEach(function (el) {
      bootOne(el);
    });
  });
})(jQuery);
