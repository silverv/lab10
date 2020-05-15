let displayName = document.querySelector("#displayName");
let nameInput = document.querySelector("#name");
let btnAccept = document.querySelector("#accept");
let btnAdd = document.querySelector("#btnAdd");
let productTable = document.querySelector("#productTable");
let spanLogout = document.querySelector("#logout");
let enterName = document.querySelector("#enterName");
let header = document.querySelector("#header");
let btnLogout = document.querySelector("#btnLogout");
let shoppingListCounter = 0;
class ShoppingLists {
    static getShoppingLists() {
        const stringData = Cookies.get("shoppingLists");
        return objectData = JSON.parse(stringData);
    }
    static getShoppingList(personName) {
        if (typeof (personName) !== "string") { throw "personName needs to be String" }
        const stringData = Cookies.get(personName + "shoppingList");
        if (stringData === undefined) {
            return undefined;
        }
        console.log(`stringData=${stringData}, type=${typeof (stringData)}`);
        let objectData = JSON.parse(stringData);
        let shoppingList = new ShoppingList(objectData);
        return shoppingList;
    }
    static saveShoppingList(shoppingList) {
        if (!Object.getOwnPropertyNames(shoppingList).includes("personName")) { throw "shoppingList needs to have a person name property!" }
        Cookies.set(Cookies.get("name") + "shoppingList", JSON.stringify(shoppingList));
    }
}
class ShoppingList {
    constructor(param) {
        if (typeof (param) === "string") {
            this.shoppingListCounter = 0;
            this.personName = param;
            this.rows = [];
        } else {
            Object.assign(this, param);
        }
    }
    addRow(name, quantity) {
        if (typeof (name) !== "string" || typeof (quantity) !== "number") {
            throw "illegal parameters";
        }
        this.rows.push(new ListRow(this.shoppingListCounter, name, quantity));
        this.shoppingListCounter++;
    }
    removeRow(id) {
        if (typeof (id) !== "number"){ throw "id is not a number"}
        
        this.rows = this.rows.filter(row => row.id !== id);
        this.shoppingListCounter--;
        this.rows = this.rows.map((row, index) => {
            row.id = index;
            console.log(Object.getOwnPropertyNames(row));
            return row;
        });
    }
}
class ListRow {
    constructor(id, name, quantity) {
        this.id = id;
        this.name = name;
        this.quantity = quantity;
    }
}
class Application {
    static showShoppingList(shoppingList) {
        if (shoppingList === undefined) { throw "Shoppinglist is undefined" };
        if (!Object.getOwnPropertyNames(shoppingList).includes("personName")) { throw "shoppingList needs to have a person name property!" }
        console.log(Object.getOwnPropertyNames(shoppingList));
        let table = document.querySelector("#productTable");
        console.log(shoppingList.rows);
        for (let row of shoppingList.rows) {
            let domRow = document.createElement("tr");
            domRow.classList.add("data");
            table.appendChild(domRow);
            for (let column of ['id', 'name', 'quantity']) {
                let domColumn = document.createElement("td");
                domRow.appendChild(domColumn);
                let domColumnText = document.createTextNode(row[column]);
                domColumn.appendChild(domColumnText);
                if (column === 'name') {
                    let btnRemove = document.createElement("button");
                    domColumn.appendChild(btnRemove);
                    let btnRemoveText = document.createTextNode("Remove");
                    btnRemove.appendChild(btnRemoveText);
                    btnRemove.addEventListener("click", function () {
                        console.log("remove button clicked");
                        console.log(`name = ${Cookies.get("name")}`);
                        let sl = ShoppingLists.getShoppingList(Cookies.get('name'));
                        if (sl === undefined) { throw "Shopping list doesn't exist although it is displayed." }
                        if (row === undefined || row.id === undefined) { throw "row is not accessible here" };
                        console.log(`row.id = ${row.id}`)
                        sl.removeRow(row.id);
                    })
                }
            }
        }
    }
    static clearShoppingList() {
        let table = document.querySelector("#productTable");
        if (table === null) { throw "There is no #productTable"; }
        let rows = table.querySelectorAll("tr");
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].classList.contains("data")) {
                table.removeChild(rows[i]);
            }
        }
    }
    static logIn() {
        let name = nameInput.value;
        Cookies.set('name', name, { expires: 600 });
        localStorage.setItem("name", name);
        header.style["flex-direction"] = "row";
        displayName.style.display = "flex"
        productTable.style.display = "table";
        spanLogout.style.display = "flex";
        enterName.style.display = "none";
        Application.changeDisplayName(name);
        Application.clearShoppingList();
        let shoppingList = ShoppingLists.getShoppingList(name);
        if (shoppingList === undefined) {
            console.log("Creating a new shopping list for the user.");
            shoppingList = new ShoppingList(name);
            ShoppingLists.saveShoppingList(shoppingList);
        }
        Application.showShoppingList(shoppingList);
    }

    static logout() {
        name = "";
        Cookies.set('name', "", { expires: 600 });
        header.style["flex-direction"] = "column";
        localStorage.setItem("name", "");
        productTable.style.display = "none";
        spanLogout.style.display = "none"
        displayName.style.display = "none"
        enterName.style.display = "flex";
    }

    static changeDisplayName(name) {
        displayName.textContent = `${name}'s shopping list`;
    }
    static startUp() {
        let currentUser = Cookies.get('name');
        if (currentUser) {
            Application.changeDisplayName(currentUser);
        }
        btnAccept.addEventListener("click", function () {
            Application.logIn();
        });
        btnAdd.addEventListener("click", function () {
            let productName = document.querySelector("#productName").value;
            let productQuantity = Number(document.querySelector("#productQuantity").value);
            if (typeof (productName) !== "string") {
                throw "typeof (productName) !== \"string\""
            }
            if (typeof (productQuantity) !== "number") {
                throw "typeof (productQuantity) !== \"number\""
            }
            console.log(`add name: ${productName}, ${productQuantity}`)
            let sl = ShoppingLists.getShoppingList(Cookies.get('name'));
            if (sl === undefined) { throw `no shopping list found for person ${name}.` }
            sl.addRow(productName, productQuantity);
            ShoppingLists.saveShoppingList(sl);
            Application.clearShoppingList();
            Application.showShoppingList(sl);
        });

        btnLogout.addEventListener("click", function () {
            Application.logout();
        })
        nameInput.addEventListener("keyup", function (event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                // Cancel the default action, if needed
                event.preventDefault();
                // Trigger the button element with a click
                Application.logIn();
            }
        });
    }
}

Application.startUp();