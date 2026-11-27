sap.ui.define(["./BaseController"], (BaseController) => {
  "use strict";

  return BaseController.extend("sapui5task2.controller.Product", {
    onInit() {
      this.getOwnerComponent()
        .getRouter()
        .getRoute("RouteProduct")
        .attachPatternMatched(this._onProductMatched, this);
    },

    onNavBack() {
      this.getOwnerComponent()
        .getRouter()
        .navTo("RouteTab", { tabKey: "odataV2" }, true);
    },

    _onProductMatched(oEvent) {
      const oModel = this.getOwnerComponent().getModel("odataV2");
      const sProductId = oEvent.getParameter("arguments").ProductID;

      oModel.metadataLoaded().then(() => {
        const sPath = oModel.createKey("/Products", {
          ID: Number(sProductId),
        });

        this.getView().bindElement({
          path: sPath,
          model: "odataV2",
          parameters: {
            expand: "Supplier",
          },
        });
      });
    },
  });
});
