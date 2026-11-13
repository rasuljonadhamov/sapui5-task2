sap.ui.define([], () => {
  "use strict";

  return {
    formatReleaseYear(sDate) {
      const sYear = sDate.split("-")[0];

      return this.getResourceBundle().getText("publishedYear", [sYear]);
    },

    formatDate(vDate) {
      if (!vDate) {
        return "";
      }

      return new Date(vDate).toLocaleDateString();
    },
  };
});
