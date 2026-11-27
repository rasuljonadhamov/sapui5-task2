sap.ui.define(["./BaseController"], (BaseController) => {
  "use strict";

  return BaseController.extend("sapui5task2.controller.Product", {
    onNavBack() {
      this.getOwnerComponent()
        .getRouter()
        .navTo("RouteTab", { tabKey: "odataV2" }, true);
    },
  });
});
