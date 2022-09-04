const booksComplete = [];
const booksIncomplete = [];
const currentBook = {};
const RENDER_ELEMENT = "render-element";
const COMPLETE_KEY = "BOOKS_COMPLETE";
const INCOMPLETE_KEY = "BOOKS_INCOMPLETE";

function generateId() {
    return +new Date();
}

function searchBookIndex(id, books) {
    let counter = -1;
    for (let book of books) {
        counter++;
        if (book.id === id) {
            return counter;
        }
    }
    return -1;
}

function searchBookTitle(title, books) {
    let bookTitle;
    const inputTitle = title.toLowerCase();
    const booksCollection = [];
    for (let book of books) {
        bookTitle = book.title.toLowerCase();
        if (bookTitle.includes(inputTitle)) {
            booksCollection.push(book);
        }
    }
    return booksCollection;
}

function changeBookShelf(id, isComplete) {
    if (isComplete) {
        const bookIndex = searchBookIndex(id, booksComplete);
        booksComplete[bookIndex].isComplete = false;
        const book = booksComplete[bookIndex];
        booksComplete.splice(bookIndex, 1);
        booksIncomplete.unshift(book);
    } else {
        const bookIndex = searchBookIndex(id, booksIncomplete);
        booksIncomplete[bookIndex].isComplete = true;
        const book = booksIncomplete[bookIndex];
        booksIncomplete.splice(bookIndex, 1);
        booksComplete.unshift(book);
    }
    document.dispatchEvent(new Event(RENDER_ELEMENT));
    saveBookToLocal();
    showNotif("Buku Berhasil Dipindahkan!");
}

function deleteBookConfirm() {
    showNotif("Yakin Ingin Dihapus?");
    const cancelButton = document.querySelector("#closeNotif");
    cancelButton.innerText = "Tidak";
    const yesButton = document.createElement("button");
    yesButton.setAttribute("id", "yes");
    yesButton.classList.add("margin-top-8", "red");
    yesButton.innerText = "Ya";
    yesButton.addEventListener("click", function () {
        deleteBook(currentBook.id, currentBook.isComplete);
        notification.remove();
        const cover = document.querySelector(".cover");
        cover.classList.toggle("visible");
    });
    const notification = document.querySelector("#notification");
    notification.insertBefore(yesButton, cancelButton);
}

function deleteBook(id, isComplete) {
    if (isComplete) {
        const bookIndex = searchBookIndex(id, booksComplete);
        booksComplete.splice(bookIndex, 1);
    } else {
        const bookIndex = searchBookIndex(id, booksIncomplete);
        booksIncomplete.splice(bookIndex, 1);
    }
    document.dispatchEvent(new Event(RENDER_ELEMENT));
    saveBookToLocal();
    showNotif("Buku Berhasil Dihapus!");
}

function showNotif(message) {
    const body = document.body;
    const cover = document.querySelector(".cover");
    const notifSection = document.createElement("section");
    notifSection.setAttribute("id", "notification");
    const notifMessage = document.createElement("h2");
    notifMessage.innerText = message;
    const notifButton = document.createElement("button");
    notifButton.setAttribute("id", "closeNotif");
    notifButton.setAttribute("class", "margin-y-8");
    notifButton.innerText = "Okay";
    notifButton.addEventListener("click", function () {
        const section = document.querySelector("#notification");
        section.remove();
        cover.classList.toggle("visible");
    });
    notifSection.append(notifMessage, notifButton);
    cover.classList.toggle("visible");
    body.insertBefore(notifSection, body.children[1]);
}

function toggleFormEditVisibility() {
    const cover = document.querySelector(".cover");
    const editSection = document.querySelector(".edit_section");
    cover.classList.toggle("visible");
    editSection.classList.toggle("visible");
}

function setFormEditBook(id, isComplete) {
    const title = document.querySelector("#editBookTitle");
    const author = document.querySelector("#editBookAuthor");
    const year = document.querySelector("#editBookYear");
    if (isComplete) {
        const bookIndex = searchBookIndex(id, booksComplete);
        title.value = booksComplete[bookIndex].title;
        author.value = booksComplete[bookIndex].author;
        year.value = booksComplete[bookIndex].year;
    } else {
        const bookIndex = searchBookIndex(id, booksIncomplete);
        title.value = booksIncomplete[bookIndex].title;
        author.value = booksIncomplete[bookIndex].author;
        year.value = booksIncomplete[bookIndex].year;
    }
}

function createEditBookObj() {
    return {
        title: document.querySelector("#editBookTitle").value,
        author: document.querySelector("#editBookAuthor").value,
        year: document.querySelector("#editBookYear").value,
    };
}

function addEditBook(id, isComplete) {
    const editBookObj = createEditBookObj();
    if (isComplete) {
        const bookIndex = searchBookIndex(id, booksComplete);
        booksComplete[bookIndex].title = editBookObj.title;
        booksComplete[bookIndex].author = editBookObj.author;
        booksComplete[bookIndex].year = editBookObj.year;
    } else {
        const bookIndex = searchBookIndex(id, booksIncomplete);
        booksIncomplete[bookIndex].title = editBookObj.title;
        booksIncomplete[bookIndex].author = editBookObj.author;
        booksIncomplete[bookIndex].year = editBookObj.year;
    }
    document.dispatchEvent(new Event(RENDER_ELEMENT));
    saveBookToLocal();
    showNotif("Buku Berhasil Diedit!");
}

function saveBookToLocal() {
    if (typeof Storage !== undefined) {
        const booksCompleteString = JSON.stringify(booksComplete);
        const booksIncompleteString = JSON.stringify(booksIncomplete);
        localStorage.setItem(COMPLETE_KEY, booksCompleteString);
        localStorage.setItem(INCOMPLETE_KEY, booksIncompleteString);
    } else {
        showNotif("Browser Tidak Mendukung Local Storage!");
    }
}

function loadBooksFromLocal() {
    const loadBooksComplete = JSON.parse(localStorage.getItem(COMPLETE_KEY));
    const loadBooksIncomplete = JSON.parse(localStorage.getItem(INCOMPLETE_KEY));
    if (loadBooksComplete !== null || booksIncomplete !== null) {
        for (let bookComplete of loadBooksComplete) {
            booksComplete.push(bookComplete);
        }
        for (let bookIncomplete of loadBooksIncomplete) {
            booksIncomplete.push(bookIncomplete);
        }
    }
    document.dispatchEvent(new Event(RENDER_ELEMENT));
}

document.addEventListener(RENDER_ELEMENT, function () {
    const completeBookShelf = document.querySelector("#completeBookshelfList");
    const incompleteBookShelf = document.querySelector("#incompleteBookshelfList");
    const searchBookValue = document.querySelector("#searchBookTitle").value;
    completeBookShelf.innerHTML = "";
    incompleteBookShelf.innerHTML = "";
    if (searchBookValue !== "") {
        const booksCompleteSearch = searchBookTitle(searchBookValue, booksComplete);
        const booksIncompleteSearch = searchBookTitle(searchBookValue, booksIncomplete);
        for (let bookCompleteSearch of booksCompleteSearch) {
            const bookElement = makeBook(bookCompleteSearch);
            completeBookShelf.appendChild(bookElement);
        }
        for (let bookIncompleteSearch of booksIncompleteSearch) {
            const bookElement = makeBook(bookIncompleteSearch);
            incompleteBookShelf.appendChild(bookElement);
        }
    } else {
        for (let bookComplete of booksComplete) {
            const bookElement = makeBook(bookComplete);
            completeBookShelf.appendChild(bookElement);
        }
        for (let bookIncomplete of booksIncomplete) {
            const bookElement = makeBook(bookIncomplete);
            incompleteBookShelf.appendChild(bookElement);
        }
    }
});

function createBookObj() {
    return {
        id: generateId(),
        title: document.querySelector("#inputBookTitle").value,
        author: document.querySelector("#inputBookAuthor").value,
        year: document.querySelector("#inputBookYear").value,
        isComplete: document.querySelector("#inputBookIsComplete").checked,
    };
}

function addBook(bookObj) {
    if (bookObj.isComplete) {
        booksComplete.unshift(bookObj);
        if (booksComplete.length > 10) {
            booksComplete.pop();
        }
    } else {
        booksIncomplete.unshift(bookObj);
        if (booksIncomplete.length > 10) {
            booksIncomplete.pop();
        }
    }
    document.dispatchEvent(new Event(RENDER_ELEMENT));
    saveBookToLocal();
    showNotif("Buku Berhasil Ditambahkan!");
}

function makeBook(bookObj) {
    const bookItem = document.createElement("article");
    // bookItem.setAttribute("id", `${bookObj.id}-${bookObj.isComplete}`);
    bookItem.setAttribute("class", "book_item");
    const bookData = document.createElement("div");
    bookData.setAttribute("class", "data");
    const bookHeading = document.createElement("h3");
    bookHeading.innerText = bookObj.title;
    const bookAuthor = document.createElement("p");
    bookAuthor.innerText = "Penulis: " + bookObj.author;
    const bookYear = document.createElement("p");
    bookYear.innerText = "Tahun: " + bookObj.year;
    const actionDiv = document.createElement("div");
    actionDiv.setAttribute("class", "action");
    const buttonEdit = document.createElement("button");
    buttonEdit.setAttribute("class", "edit");
    const buttonDelete = document.createElement("button");
    buttonDelete.setAttribute("class", "delete");
    const buttonFinish = document.createElement("button");
    if (bookObj.isComplete) {
        buttonFinish.setAttribute("class", "undo");
    } else {
        buttonFinish.setAttribute("class", "check");
    }
    buttonFinish.addEventListener("click", function () {
        changeBookShelf(bookObj.id, bookObj.isComplete);
    });
    buttonDelete.addEventListener("click", function () {
        currentBook.id = bookObj.id;
        currentBook.isComplete = bookObj.isComplete;
        deleteBookConfirm();
    });
    buttonEdit.addEventListener("click", function () {
        setFormEditBook(bookObj.id, bookObj.isComplete);
        currentBook.id = bookObj.id;
        currentBook.isComplete = bookObj.isComplete;
        toggleFormEditVisibility();
    });
    bookData.append(bookHeading, bookAuthor, bookYear);
    actionDiv.append(buttonFinish, buttonEdit, buttonDelete);
    bookItem.append(bookData, actionDiv);
    return bookItem;
}

window.addEventListener("DOMContentLoaded", function () {
    loadBooksFromLocal();
    const inputBookIsComplete = document.querySelector("#inputBookIsComplete");
    inputBookIsComplete.addEventListener("click", function () {
        const bookSubmitSpan = document.querySelector("#bookSubmitSpan");
        if (inputBookIsComplete.checked) {
            bookSubmitSpan.innerText = "Sudah Selesai Dibaca";
        } else {
            bookSubmitSpan.innerText = "Belum Selesai Dibaca";
        }
    });
    const formInputBook = document.querySelector("#inputBook");
    formInputBook.addEventListener("submit", function (e) {
        const bookObj = createBookObj();
        addBook(bookObj);
        e.preventDefault();
    });
    const formEditBook = document.querySelector("#editBook");
    formEditBook.addEventListener("submit", function (e) {
        toggleFormEditVisibility();
        addEditBook(currentBook.id, currentBook.isComplete);
        e.preventDefault();
    });
    const cancelEditBook = document.querySelector("#cancelEditBook");
    cancelEditBook.addEventListener("click", function (e) {
        toggleFormEditVisibility();
        e.preventDefault();
    });
    const searchBookTitleInput = document.querySelector("#searchBookTitle");
    searchBookTitleInput.addEventListener("input", function () {
        document.dispatchEvent(new Event(RENDER_ELEMENT));
    });
});
