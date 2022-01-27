import { domManager } from "../view/domManager.js";
import {cardsManager} from "../controller/cardsManager.js";



export const htmlTemplates = {
    board: 1,
    card: 2
}

export function htmlFactory(template) {
    switch (template) {
        case htmlTemplates.board:
            return boardBuilder
        case htmlTemplates.card:
            return cardBuilder
        default:
            console.error("Undefined template: " + template)
            return () => { return "" }
    }
}

export function inputBuilder(prevTitle){
        let inp = document.createElement("input")
        inp.setAttribute('class', 'rename')
        inp.setAttribute('type', 'text')

        let butt = document.createElement('button')
        butt.setAttribute('class', 'rename-board')
        butt.setAttribute('type', 'submit')
        butt.textContent = 'Save'
        let string =
            `<input class="rename" type="text" placeholder="${prevTitle}">
            <button class="rename-board" type="submit"> Save</button>`
    return [inp, butt]
}


function boardBuilder(board) {
    return `<div class="board-container">
                <section class="board" data-board-id=${board.id}>
                <div class="board-header"><span id='title' class="board-title" data-board-id=${board.id}>${board.title}</span>
                    <button class="board-add">Add Card</button>
                    <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
                    <button class="toggle-board-button" data-board-id="${board.id}">Show Cards</button>
                </div>
                <div class="board-columns">
                <div class="board-column">
                    <div class="board-column-title">New</div>
                    <div class="board-column-content" data-status="1_${board.id}"></div>
                </div>
                <div class="board-column">
                    <div class="board-column-title">In progress</div>
                    <div class="board-column-content" data-status="2_${board.id}"></div>
                </div>
                <div class="board-column">
                    <div class="board-column-title">Testing</div>
                    <div class="board-column-content" data-status="3_${board.id}"></div>
                </div>
                <div class="board-column">
                    <div class="board-column-title">Done</div>
                    <div class="board-column-content" data-status="4_${board.id}"></div>
                </div>
                </div>
                </section>
            </div>`;
}

function cardBuilder(card) {
    return `<div class="card" data-card-id="${card.id}" draggable="true">${card.title}</div>`;
}


let dragged;
export const makeDroppable = {
    droppableBoards: function(){
        domManager.addEventListenerToMore(".board-column-content", 'dragover', makeDroppable.dragOver)
        domManager.addEventListenerToMore(".board-column-content", 'dragenter', makeDroppable.dragEnter)
        domManager.addEventListenerToMore(".board-column-content", 'dragleave', makeDroppable.dragLeave)
        domManager.addEventListenerToMore(".board-column-content", 'drop', makeDroppable.dragDrop)

    },
    draggableCard: function() {
        domManager.addEventListenerToMore(".card", 'dragstart', makeDroppable.dragStart)
        domManager.addEventListenerToMore(".card", 'dragend', makeDroppable.dragEnd)
    },
    dragStart: function(e){
        dragged = e.target; // ez azért kell, mert ez adja a felkapott card azonosítóját és ezt fogjuk SQL felé továbbadni (py-on keresztül), hogy átírjuk adatbázis részen is azt, hogy melyik oszlopban van

    },
    dragEnd: function(){

    },
    dragOver: function(e){
        e.preventDefault();

    },
    dragEnter: function(){

    },
    dragLeave: function(){

    },
    dragDrop: function(e){
        e.preventDefault();
        //e.currentTarget az, ahova visszük azt, amit megfogunk
        //.board-column-content -hez kell a targetet hozzátennünk
        // az oszlopokat megfoghatjuk ez alapján: data-status="1_${board.id}"
        e.currentTarget.appendChild(dragged);
        let newCardStatus = e.currentTarget.dataset.status[0] // ahová a kártyát letesszük, az az oszlop a táblázatban, aminek a számát átadjuk az SQLnek
        let cardId = dragged.dataset.cardId
        cardsManager.changeCardStatus(cardId, newCardStatus)


    }
}


export function buttonBuilder() {
    return `<button type="button" class='btn btn-outline-dark' data-toggle='modal' data-target='#newBoard'
            id="create_new_board" name="new_board">Create new board</button>`
}

export function modalBuilder() {
    return `<div class="modal" id="newBoard" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">For create a new board choose a title </h5>
                    <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
<!--                    <button type="button" class="btn-close" data-bs-dismiss="modal" style="float: right" aria-label="Close">X</button>-->
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    <form>
                      <div class="form-group">
                        <label for="new-board-title" class="col-form-label">Title:</label>
                        <input type="text" class="form-control" id="new-board-title">
                      </div>
                    </form>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="create" data-bs-dismiss="modal">Create</button>
                  </div>
                </div>
              </div>
            </div>`
}