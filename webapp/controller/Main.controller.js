sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../model/formatter",
  ],
  (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    MessageBox,
    MessageToast,
    formatter,
  ) => {
    "use strict";

    return BaseController.extend("sapui5task2.controller.Main", {
      formatter,

      onInit() {
        this.aNewBookFieldIds = [
          "newBookId",
          "newBookName",
          "newBookAuthor",
          "newBookGenre",
          "newBookReleaseDate",
          "newBookQuantity",
        ];
        this.aProductFieldIds = [
          "newProductId",
          "newProductName",
          "newProductDescription",
          "newProductReleaseDate",
          "newProductRating",
          "newProductPrice",
        ];
        this.sDeleteGroup = "deleteProducts";

        const aBooks = [
          {
            ID: "B001",
            Name: "To Kill a Mockingbird",
            Author: "Harper Lee",
            Genre: "Fiction",
            ReleaseDate: "1960-07-11",
            AvailableQuantity: 12,
            editMode: false,
          },
          {
            ID: "B002",
            Name: "Dune",
            Author: "Frank Herbert",
            Genre: "Science Fiction",
            ReleaseDate: "1965-08-01",
            AvailableQuantity: 7,
            editMode: false,
          },
          {
            ID: "B003",
            Name: "The Hobbit",
            Author: "J. R. R. Tolkien",
            Genre: "Fantasy",
            ReleaseDate: "1937-09-21",
            AvailableQuantity: 0,
            editMode: false,
          },
          {
            ID: "B004",
            Name: "Sapiens: A Brief History of Humankind",
            Author: "Yuval Noah Harari",
            Genre: "History",
            ReleaseDate: "2011-01-01",
            AvailableQuantity: 23,
            editMode: false,
          },
          {
            ID: "B005",
            Name: "Clean Code",
            Author: "Robert C. Martin",
            Genre: "Programming",
            ReleaseDate: "2008-08-01",
            AvailableQuantity: 5,
            editMode: false,
          },
          {
            ID: "B006",
            Name: "Murder on the Orient Express",
            Author: "Agatha Christie",
            Genre: "Mystery",
            ReleaseDate: "1934-01-06",
            AvailableQuantity: 3,
            editMode: false,
          },
        ];

        this.setModel(
          new JSONModel({
            books: aBooks,
            genres: this._getGenreItems(aBooks),
            hasSelection: false,
          }),
          "books",
        );

        this.setModel(
          new JSONModel({ hasProductsSelection: false, isProductEdit: false }),
          "ui",
        );

        const oProductsModel = this.getOwnerComponent().getModel("odataV2");

        oProductsModel.setDeferredGroups(
          oProductsModel.getDeferredGroups().concat(this.sDeleteGroup),
        );
      },

      async onAddRecord() {
        if (!this._oAddBookDialog) {
          this._oAddBookDialog = await this.loadFragment({
            name: "sapui5task2.view.AddBookDialog",
          });
        }

        this._oAddBookDialog.open();
      },

      onAddBook() {
        const oResults = this.aNewBookFieldIds.map((sId) =>
          this._validateControl(this.byId(sId)),
        );

        if (oResults.includes(false)) {
          return;
        }

        const oModel = this.getModel("books");
        const aBooks = oModel.getProperty("/books").concat({
          ID: this.byId("newBookId").getValue().trim(),
          Name: this.byId("newBookName").getValue().trim(),
          Author: this.byId("newBookAuthor").getValue().trim(),
          Genre: this.byId("newBookGenre").getValue().trim(),
          ReleaseDate: this.byId("newBookReleaseDate").getValue(),
          AvailableQuantity: Number(this.byId("newBookQuantity").getValue()),
          editMode: false,
        });

        oModel.setProperty("/books", aBooks);
        oModel.setProperty("/genres", this._getGenreItems(aBooks));
        this._closeAddBookDialog();
      },

      onCancelAddBook() {
        this._closeAddBookDialog();
      },

      onSelectionChange(oEvent) {
        this.getModel("books").setProperty(
          "/hasSelection",
          oEvent.getSource().getSelectedContexts().length > 0,
        );
      },

      onDeleteRecord() {
        const oTable = this.byId("booksTable");
        const aSelectedBooks = oTable
          .getSelectedContexts()
          .map((oContext) => oContext.getObject());
        const oResurceBundle = this.getResourceBundle();

        MessageBox.confirm(oResurceBundle.getText("deleteConfirmationText"), {
          title: oResurceBundle.getText("deleteConfirmationTitle"),
          onClose: (sAction) => {
            if (sAction !== MessageBox.Action.OK) {
              return;
            }

            const oModel = this.getModel("books");

            oModel.setProperty(
              "/books",
              oModel
                .getProperty("/books")
                .filter((oBook) => !aSelectedBooks.includes(oBook)),
            );
            oTable.removeSelections(true);
            oModel.setProperty("/hasSelection", false);
          },
        });
      },

      async onAddProduct() {
        const oContext = this.getModel("odataV2").createEntry("/Products", {
          properties: {},
        });

        await this._openProductDialog(oContext, false);
      },

      async onEditProduct(oEvent) {
        const oContext = oEvent.getSource().getBindingContext("odataV2");

        await this._openProductDialog(oContext, true);
      },

      onSaveProduct() {
        const oResults = this.aProductFieldIds.map((sId) =>
          this._validateControl(this.byId(sId)),
        );

        if (oResults.includes(false)) {
          return;
        }

        const oResourceBundle = this.getResourceBundle();
        const bEdit = this.getModel("ui").getProperty("/isProductEdit");
        const sSuccessText = bEdit
          ? oResourceBundle.getText("updateProductSuccessText")
          : oResourceBundle.getText("createProductSuccessText");
        const sErrorText = bEdit
          ? oResourceBundle.getText("updateProductErrorText")
          : oResourceBundle.getText("createProductErrorText");

        this.getModel("odataV2").submitChanges({
          success: () => {
            this._closeProductDialog();
            MessageToast.show(sSuccessText);
          },
          error: () => {
            MessageBox.error(sErrorText);
          },
        });
      },

      onCancelProduct() {
        const oModel = this.getModel("odataV2");
        const oContext = this._oProductDialog.getBindingContext("odataV2");

        if (this.getModel("ui").getProperty("/isProductEdit")) {
          oModel.resetChanges([oContext.getPath()]);
        } else {
          oModel.deleteCreatedEntry(oContext);
        }

        this._closeProductDialog();
      },

      onProductFieldChange(oEvent) {
        const oField = oEvent.getSource();

        if (oField.getValue().trim()) {
          oField.setValueState("None");
        }
      },

      onProductsSelectionChange(oEvent) {
        this.getModel("ui").setProperty(
          "/hasProductsSelection",
          oEvent.getSource().getSelectedContexts().length > 0,
        );
      },

      onDeleteProducts() {
        const oTable = this.byId("productsV2Table");
        const oModel = this.getModel("odataV2");
        const oResourceBundle = this.getResourceBundle();
        const aSelectedContexts = oTable.getSelectedContexts();

        MessageBox.confirm(oResourceBundle.getText("deleteConfirmationText"), {
          title: oResourceBundle.getText("deleteConfirmationTitle"),
          onClose: (sAction) => {
            if (sAction !== MessageBox.Action.OK) {
              return;
            }

            aSelectedContexts.forEach((oContext) => {
              oModel.remove(oContext.getPath(), { groupId: this.sDeleteGroup });
            });

            oModel.submitChanges({
              groupId: this.sDeleteGroup,
              success: () => {
                oTable.removeSelections(true);
                this.getModel("ui").setProperty("/hasProductsSelection", false);
                MessageToast.show(
                  oResourceBundle.getText("deleteProductSuccessText"),
                );
              },
              error: () => {
                MessageBox.error(
                  oResourceBundle.getText("deleteProductErrorText"),
                );
              },
            });
          },
        });
      },

      /**
       * Switches the row of the pressed button into edit mode. The name is copied into
       * a draft property first, so the model keeps the saved name until the user
       * presses 'Save'.
       *
       * @param {sap.ui.base.Event} oEvent The press event of the 'Edit Title' button
       */
      onEditTitle(oEvent) {
        const oContext = oEvent.getSource().getBindingContext("books");
        const oModel = this.getModel("books");

        oModel.setProperty("NameDraft", oContext.getProperty("Name"), oContext);
        oModel.setProperty("editMode", true, oContext);
      },

      /**
       * Writes the edited name back into the record and switches the row into
       * display mode again.
       *
       * @param {sap.ui.base.Event} oEvent The press event of the 'Save' button, or the
       *   submit event of the name input
       */
      onSaveTitle(oEvent) {
        const oContext = oEvent.getSource().getBindingContext("books");
        const oModel = this.getModel("books");

        oModel.setProperty("Name", oContext.getProperty("NameDraft"), oContext);
        oModel.setProperty("editMode", false, oContext);
      },

      onFilter() {
        const sName = this.byId("nameFilter").getValue().trim();
        const sGenre = this.byId("genreFilter").getSelectedKey();
        const aFilters = [];

        if (sName) {
          aFilters.push(new Filter("Name", FilterOperator.Contains, sName));
        }

        if (sGenre) {
          aFilters.push(new Filter("Genre", FilterOperator.EQ, sGenre));
        }

        this.byId("booksTable").getBinding("items").filter(aFilters);
      },

      onFilterProducts(oEvent) {
        const sName = oEvent.getParameter("newValue").trim();
        const aFilters = [];

        if (sName) {
          aFilters.push(new Filter("Name", FilterOperator.Contains, sName));
        }

        this.byId("productsV2Table").getBinding("items").filter(aFilters);
      },

      _validateControl(oControl) {
        const sValue = oControl.getValue().trim();
        let bIsValid = false;

        if (oControl.isA("sap.m.DatePicker")) {
          bIsValid = !!sValue && oControl.isValidValue();
        } else if (oControl.getType() === "Number") {
          bIsValid = !!sValue && Number(sValue) >= 0;
        } else {
          bIsValid = !!sValue;
        }

        oControl.setValueState(bIsValid ? "None" : "Error");

        return bIsValid;
      },

      _closeAddBookDialog() {
        this.aNewBookFieldIds.forEach((sFieldId) => {
          const oField = this.byId(sFieldId);

          oField.setValue("");
          oField.setValueState("None");
        });

        this._oAddBookDialog.close();
      },

      async _openProductDialog(oContext, bEdit) {
        if (!this._oProductDialog) {
          this._oProductDialog = await this.loadFragment({
            name: "sapui5task2.view.AddProductDialog",
          });
        }

        this.getModel("ui").setProperty("/isProductEdit", bEdit);
        this._oProductDialog.setBindingContext(oContext, "odataV2");
        this._oProductDialog.open();
      },

      _closeProductDialog() {
        this.aProductFieldIds.forEach((sFieldId) => {
          this.byId(sFieldId).setValueState("None");
        });

        this._oProductDialog.setBindingContext(null, "odataV2");
        this._oProductDialog.close();
      },

      /**
       * Builds the items of the genre filter out of the unique genres of the given
       * books. The first item is an empty entry that switches the filter off.
       *
       * @param {object[]} aBooks The books of the JSON model
       * @returns {object[]} Key/text pairs for the genre filter
       * @private
       */
      _getGenreItems(aBooks) {
        const aGenres = [...new Set(aBooks.map((oBook) => oBook.Genre))].sort();

        return [
          {
            key: "",
            text: this.getResourceBundle().getText("allGenresItem"),
          },
        ].concat(
          aGenres.map((sGenre) => ({
            key: sGenre,
            text: sGenre,
          })),
        );
      },
    });
  },
);
