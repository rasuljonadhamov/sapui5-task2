sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    /**
     * Base controller with helper functions that are shared by the controllers of this app.
     */
    return Controller.extend("sapui5task2.controller.BaseController", {
        /**
         * Returns the model with the given name, or the default model of the view
         * when no name is given.
         *
         * @param {string} [sName] Name of the model
         * @returns {sap.ui.model.Model} The model instance
         */
        getModel(sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Sets a model on the view.
         *
         * @param {sap.ui.model.Model} oModel The model to set
         * @param {string} [sName] Name of the model
         * @returns {sapui5task2.controller.BaseController} The controller, for chaining
         */
        setModel(oModel, sName) {
            this.getView().setModel(oModel, sName);

            return this;
        },

        /**
         * Returns the resource bundle of the i18n model.
         *
         * @returns {sap.base.i18n.ResourceBundle} The resource bundle of the component
         */
        getResourceBundle() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        }
    });
});
