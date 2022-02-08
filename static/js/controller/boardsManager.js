import {dataHandler} from "../data/dataHandler.js";
import {
    htmlFactory,
    htmlTemplates,
    buttonBuilder,
    modalBuilder,
    makeDroppable,
    inputBuilder,
    addButtonBuilder,
    newColumnBuilder
} from "../view/htmlFactory.js";
import {domManager} from "../view/domManager.js";
import {cardsManager} from "./cardsManager.js";


export let boardsManager = {
        loadBoards: async function () {
            await this.newBoard()
            const boards = await dataHandler.getBoards();
            let columns = document.getElementsByClassName('board-content');
            for (let board of boards) {
                const statuses =  await dataHandler.getStatuses(board.id)
                const boardBuilder = htmlFactory(htmlTemplates.board);
                const content = boardBuilder(statuses, board); //ezek a script-ek
                domManager.addChild("#root", content); //itt kerül be a script, és lesz valós elem
                makeDroppable.droppableBoards();
                domManager.addEventListenerToMore(
                    `.board-title`,
                    "dblclick",
                    renameBoardTitle
                );

                domManager.addEventListener(
                    `.board-toggle[data-board-id="${board.id}"]`,
                    "click",
                    showHideButtonHandler
                );

                domManager.addEventListenerToMore(
                    '.board-column-title',
                    'dblclick',
                    renameColumnTitle
                );
            }
            for (let column of columns) {
                column.style.visibility = "hidden";
            }
        },
        newBoard: async function () {
            const button = buttonBuilder()
            domManager.addChild("#root", button);
            domManager.addEventListener(`#create_new_board`, 'click', addBoardTitle)
        }
    }
;

function addNewCard(clickEvent) {
    const boardId = clickEvent.target.parentElement.parentElement.dataset.boardId
    const newCardModalTitle = modalBuilder('new_card')
    domManager.addChild('#root', newCardModalTitle);
    $('.modal').modal('toggle');
    domManager.addEventListener('#create', 'click', async function () {
        const cardTitle = $('#new-element-title').val()
        await dataHandler.createNewCard(cardTitle, boardId, 1);
        document.getElementsByClassName('modal')[0].remove()

        $(`.board-toggle[data-board-id="${boardId}"]`).click()// akkor fog működni ha össze mergeltük a close branch eredményével
        $(`.board-toggle[data-board-id="${boardId}"]`).click()

    })
    domManager.addEventListener('.close', 'click', async function () {
        document.getElementById('root').innerHTML = ''
        await boardsManager.loadBoards()
    })
}

function renameBoardTitle(clickEvent) {
    const boardId = clickEvent.target.dataset.boardId;
    let actualBoard = clickEvent.target
    actualBoard.style.visibility = 'hidden'
    const inputbar = inputBuilder(actualBoard.textContent)
    let parent = clickEvent.target.parentElement
    parent.insertBefore(inputbar[1], parent.childNodes[0])
    parent.insertBefore(inputbar[0], parent.childNodes[0])


    domManager.addEventListener('.rename-board', 'click', async function () {
            let newTitle = inputbar[0].value
            await dataHandler.renameBoard(boardId, newTitle)
            inputbar[0].remove()
            inputbar[1].remove()
            actualBoard.style.visibility = 'visible'
            actualBoard.textContent = newTitle
        }
    )
}

function addBoardTitle() {
    const newBoardModalTitle = modalBuilder('new_board')
    domManager.addChild('#root', newBoardModalTitle);
    $('.modal').modal('toggle');
    domManager.addEventListener('#create', 'click', async function () {
        const boardTitle = $('#new-element-title').val()
        const boardId = await dataHandler.createNewBoard(boardTitle);
        await dataHandler.writeDefaultColumns(boardId[0].id)

        document.getElementById('root').innerHTML = ''

        await boardsManager.loadBoards()
    })
    domManager.addEventListener('.close', 'click', async function () {
        document.getElementById('root').innerHTML = ''
        await boardsManager.loadBoards()
    })
}

async function showHideButtonHandler(clickEvent) {
    let header = clickEvent.target.parentElement
    let columns = document.getElementsByClassName('board-content')
    let boardId = clickEvent.target.dataset.boardId
    if (clickEvent.target.dataset.show === "false") {
        const boardId = clickEvent.target.dataset.boardId;
        const addColumnButton = addButtonBuilder('column')
        const addCardButton = addButtonBuilder('card')
        await cardsManager.loadCards(boardId);
        clickEvent.target.dataset.show = "true";
        for (let column of columns) {
            if (boardId === column.dataset.boardId) {
                column.previousElementSibling.children[1].insertAdjacentHTML('beforebegin', addColumnButton)
                column.previousElementSibling.children[1].insertAdjacentHTML('beforebegin', addCardButton)
                column.style.visibility = "visible";
                domManager.addEventListenerToMore(
                    '.add-card',
                    'click',
                    addNewCard);
                domManager.addEventListenerToMore(
                    '.add-column',
                    'click',
                    addNewColumn);
            }
        }
    } else {
        header.removeChild(header.children[1])
        header.removeChild(header.children[1])
        for (let column of columns) {
            if (boardId === column.dataset.boardId) {

                let cards = document.getElementsByClassName('board-column-content')

                for (let col of cards) {
                    col.innerHTML = ''
                }
                column.style.visibility = "hidden";
                clickEvent.target.dataset.show = "false";
            }
        }

    }

}

function renameColumnTitle(clickEvent) {
    // const boardId = clickEvent.target.dataset.boardId;
    const columnId = clickEvent.target.dataset.status; //1_1, vagy 1_2
    console.log(columnId);
    // const boardId = clickEvent.target.dataset.status[2];
    let actualColumn = clickEvent.target
    actualColumn.style.visibility = 'hidden'
    const inputbar = inputBuilder(1)
    let parent = clickEvent.target.parentElement //board-header
    parent.insertBefore(inputbar[1], parent.childNodes[0])
    parent.insertBefore(inputbar[0], parent.childNodes[0])


    domManager.addEventListener('.rename-column', 'click', async function () {
            let newStatus = inputbar[0].value //input mező
            await dataHandler.renameColumn(columnId, newStatus)
            inputbar[0].remove() //input field
            inputbar[1].remove() //button
            actualColumn.style.visibility = 'visible'
            actualColumn.textContent = newStatus
        }
    )
}

async function addNewColumn(clickEvent) {
    const boardId = clickEvent.target.parentElement.parentElement.dataset.boardId
    const newColumnModalTitle = modalBuilder('new_column')
    domManager.addChild('#root', newColumnModalTitle);
    $('.modal').modal('toggle');
    domManager.addEventListener('#create', 'click', async function () {
        const columnTitle = $('#new-element-title').val()
        let columns = clickEvent.target.parentElement.nextElementSibling.children
        let status = await dataHandler.writeNewStatus(columnTitle, boardId)
        let newColumn = newColumnBuilder(columnTitle, boardId, status[0].id);
        document.getElementsByClassName('modal')[0].remove()
        columns[0].insertAdjacentHTML('beforeend',newColumn)
        makeDroppable.droppableBoards()

    })
    domManager.addEventListener('.close', 'click', async function () {
        document.getElementById('root').innerHTML = ''
        await boardsManager.loadBoards()
    })
}