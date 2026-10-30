sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], (BaseController, JSONModel, Filter, FilterOperator, MessageToast) => {
    "use strict";

    return BaseController.extend("sapui5task2.controller.Main", {
        onInit() {
            const aBooks = [
                {
                    ID: "B001",
                    Name: "To Kill a Mockingbird",
                    Author: "Harper Lee",
                    Genre: "Fiction",
                    ReleaseDate: "1960-07-11",
                    AvailableQuantity: 12,
                    editMode: false
                },
                {
                    ID: "B002",
                    Name: "Dune",
                    Author: "Frank Herbert",
                    Genre: "Science Fiction",
                    ReleaseDate: "1965-08-01",
                    AvailableQuantity: 7,
                    editMode: false
                },
                {
                    ID: "B003",
                    Name: "The Hobbit",
                    Author: "J. R. R. Tolkien",
                    Genre: "Fantasy",
                    ReleaseDate: "1937-09-21",
                    AvailableQuantity: 0,
                    editMode: false
                },
                {
                    ID: "B004",
                    Name: "Sapiens: A Brief History of Humankind",
                    Author: "Yuval Noah Harari",
                    Genre: "History",
                    ReleaseDate: "2011-01-01",
                    AvailableQuantity: 23,
                    editMode: false
                },
                {
                    ID: "B005",
                    Name: "Clean Code",
                    Author: "Robert C. Martin",
                    Genre: "Programming",
                    ReleaseDate: "2008-08-01",
                    AvailableQuantity: 5,
                    editMode: false
                },
                {
                    ID: "B006",
                    Name: "Murder on the Orient Express",
                    Author: "Agatha Christie",
                    Genre: "Mystery",
                    ReleaseDate: "1934-01-06",
                    AvailableQuantity: 3,
                    editMode: false
                }
            ];

            this.setModel(new JSONModel({
                books: aBooks,
                genres: this._getGenreItems(aBooks)
            }), "books");
        },

        /**
         * Appends a new empty record at the end of the table.
         */
        onAddRecord() {
            const oModel = this.getModel("books");

            oModel.setProperty("/books", oModel.getProperty("/books").concat({
                ID: "",
                Name: "",
                Author: "",
                Genre: "",
                ReleaseDate: "",
                AvailableQuantity: 0,
                editMode: false
            }));
        },

        /**
         * Removes the records that are selected in the table.
         */
        onDeleteRecord() {
            const oTable = this.byId("booksTable");
            const aSelectedBooks = oTable.getSelectedContexts().map((oContext) => oContext.getObject());

            if (!aSelectedBooks.length) {
                MessageToast.show(this.getResourceBundle().getText("noSelectionMessage"));

                return;
            }

            const oModel = this.getModel("books");

            oModel.setProperty("/books", oModel.getProperty("/books").filter((oBook) => !aSelectedBooks.includes(oBook)));
            oTable.removeSelections(true);
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

        /**
         * Filters the table by the book name and the genre that are currently entered
         * in the toolbar. An empty name or genre is ignored.
         */
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

            return [{
                key: "",
                text: this.getResourceBundle().getText("allGenresItem")
            }].concat(aGenres.map((sGenre) => ({
                key: sGenre,
                text: sGenre
            })));
        }
    });
});
