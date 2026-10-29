sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (BaseController, JSONModel, MessageToast) => {
    "use strict";

    return BaseController.extend("sapui5task2.controller.Main", {
        onInit() {
            const oBooksModel = new JSONModel({
                books: [
                    {
                        ID: "B001",
                        Name: "To Kill a Mockingbird",
                        Author: "Harper Lee",
                        Genre: "Fiction",
                        ReleaseDate: "1960-07-11",
                        AvailableQuantity: 12
                    },
                    {
                        ID: "B002",
                        Name: "Dune",
                        Author: "Frank Herbert",
                        Genre: "Science Fiction",
                        ReleaseDate: "1965-08-01",
                        AvailableQuantity: 7
                    },
                    {
                        ID: "B003",
                        Name: "The Hobbit",
                        Author: "J. R. R. Tolkien",
                        Genre: "Fantasy",
                        ReleaseDate: "1937-09-21",
                        AvailableQuantity: 0
                    },
                    {
                        ID: "B004",
                        Name: "Sapiens: A Brief History of Humankind",
                        Author: "Yuval Noah Harari",
                        Genre: "History",
                        ReleaseDate: "2011-01-01",
                        AvailableQuantity: 23
                    },
                    {
                        ID: "B005",
                        Name: "Clean Code",
                        Author: "Robert C. Martin",
                        Genre: "Programming",
                        ReleaseDate: "2008-08-01",
                        AvailableQuantity: 5
                    },
                    {
                        ID: "B006",
                        Name: "Murder on the Orient Express",
                        Author: "Agatha Christie",
                        Genre: "Mystery",
                        ReleaseDate: "1934-01-06",
                        AvailableQuantity: 3
                    }
                ]
            });

            this.setModel(oBooksModel, "books");
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
                AvailableQuantity: 0
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
        }
    });
});
