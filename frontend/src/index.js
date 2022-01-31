import React from 'react';
import ReactDOM from 'react-dom';
import axios from "axios";
import './index.css';

function statusCodeToClass(status) {
    switch (status) {
        case 2:
            return "correct";
        case 1:
            return "partlyCorrect";
        case 0:
            return "incorrect";
        default:
            return "";
    }
}

function charMap(val) {
    var obj = {};
    for (var x=65; x <= 90; x++) {
        obj[String.fromCharCode(x)] = val;
    }
    return obj;
}

class Header extends React.Component {
    render() {
        return (
            <div className='header'>
                <div className='title'>Wordle Clone</div>
            </div>
        );
    }
}

function Square(props) {
    return (
        <div className={'square-container ' + props.revealed}>
            <div className='square-inner'>
                <div className={'square front'}>{props.value}</div>
                <div className={'square back ' + props.resultClass}>{props.value}</div>
            </div>
        </div>

    )
}

class Board extends React.Component {
    render() {
        const rowCount = 6;
        const colCount = 5;
        var rows = [];
        for (var i=0; i < rowCount; i++) {
            var row = [];
            for (var j=0; j < colCount; j++) {
                const idx = i*rowCount + j;
                const character = this.props.guesses[i][j];
                const res = this.props.results[i][j];
                const revealed = this.props.revealedIdx > idx ? "revealed" : ""
                row.push(<Square value={character} resultClass={statusCodeToClass(res)} revealed={revealed} key={'cell' + idx}/>);
            }
            rows.push(<div className="board-row" key={'boardrow' + i}>{row}</div>);
        }
        return rows;
    }
}

function Backspace() {
    return <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path fill="var(--color-tone-1)" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"></path>
    </svg>
}

function Key(props) {
    const displayVal = props.value === "BACKSPACE" ? Backspace() : props.value;
    return (
        <button type="button"
            className={'key ' + props.sizeClass + ' ' + props.resultClass}
            data-key={props.value}
            onClick={() => props.onClick()}>
                {displayVal}
        </button>
    )
}

class Keyboard extends React.Component {
    render() {
        const keylayout = [
            ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
            ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
            ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"]
        ];

        var keys = [];
        for (var i=0; i<keylayout.length; i++) {
            var row = [];
            for (var j=0; j<keylayout[i].length; j++) {
                const idx = i*keylayout.length + j;
                const character = keylayout[i][j];
                const sizeClass = character.length > 1 ? 'big' : '';
                row.push(
                    <Key value={character}
                         key={'key' + idx}
                         sizeClass={sizeClass}
                         resultClass={statusCodeToClass(this.props.usedCharacters[character])}
                         onClick={() => this.props.onClick(character)}
                    />
                )
            }
            keys.push(<div className="keyboard-row" key={'keyrow' + i}>{row}</div>);
        }

        return keys;
    }
}

function Popup(props) {
    return (
        <div className={'popup ' + (props.isShowingPopup ? "popup-shown" : "popup-hidden")}
             onTransitionEnd={props.onTransitionEnd}>
            <div className='popupText'>{props.text}</div>
        </div>
    )
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        var guesses = [];
        var results = [];
        for (var i=0; i<6; i++) {
            guesses.push(Array(5).fill(null));
            results.push(Array(5).fill(null));
        }
        var usedCharacters = charMap(null);

        this.state = {
            gameID: null,
            guesses: guesses,
            currentRow: 0,
            currentCol: 0,
            results: results,
            usedCharacters: usedCharacters,
            solved: false,
            solution: null,
            message: null,
            isShowingPopup: false,
            revealedIdx: 0,
        };

        axios
        .post('http://localhost:8000/api/newgame/', {})
        .then((resp) => {
            this.setState({gameID: resp.data["game_id"]})
        })
        .catch((err) => console.log(err));
    }

    guessURL(guess) {
        return "/api/check/?id=" + this.state.gameID + "&guess=" + guess.join('')
    }

    getWinningMessage(row) {
        switch (row) {
            case 0:
                return "Lucky guess!";
            case 1:
                return "You're a champion!"
            case 2:
                return "Impressive!"
            case 3:
                return "Splendid!"
            case 4:
                return "Good job!"
            case 5:
                return "You made it!"
        }
    }

    popupMessage(text, timeout) {
        this.setState({message: text, isShowingPopup: true});
        setTimeout(() => {
            this.setState({
                isShowingPopup: false
            });
        }, timeout);
    }

    revealTo(idx) {
        if (this.state.revealedIdx < idx) {
            setTimeout(() => { this.revealTo(idx) }, 200);
            this.setState({ revealedIdx: this.state.revealedIdx + 1});
        }
    }

    async checkWord(word) {
        axios
        .get(this.guessURL(word))
        .then((resp) => {
            if (resp.data[0]['error'].length > 0) {
                this.popupMessage("Not in word list.", 200);
                return;
            }
            this.revealTo((this.state.currentRow + 1) * 6);

            const result = resp.data[0]['result']
            const solved = resp.data[0]['solved']

            var results = this.state.results.slice();
            results[this.state.currentRow] = result;

            var usedCharacters = Object.assign({}, this.state.usedCharacters);
            for (var i=0; i<result.length; i++) {
                usedCharacters[word[i]] = result[i];
            }

            if (solved) {
                this.popupMessage(this.getWinningMessage(this.state.currentRow), 200);
            }

            const currentRow = this.state.currentRow += 1;
            if (currentRow === 6) {
                this.getSolution()
                .then ((res) => this.popupMessage(res, 2000))
            }

            this.setState({
                results: results,
                usedCharacters: usedCharacters,
                solved: solved,
                currentRow: currentRow,
                currentCol: 0,
            });
        })
        .catch((err) => console.log(err));
    }

    getSolution() {
        return axios
        .get("/api/solution?id=" + this.state.gameID)
        .then((resp) => {
            return resp.data[0]['solution'];
        })
        .catch((err) => console.log(err));
    }

    handleKeyPress(key) {
        const guesses = this.state.guesses.slice();
        var currentCol = this.state.currentCol;
        var currentRow = this.state.currentRow;
        const keyUpper = key.toUpperCase();
        if (keyUpper.match(/^[A-Z]$/)) {
            if (currentCol < 5) {
                guesses[currentRow][currentCol] = keyUpper;
                currentCol += 1;
            }
        } else if (keyUpper === "BACKSPACE") {
            if (this.state.currentCol > 0) {
                currentCol -= 1;
                guesses[currentRow][currentCol] = null;
            }
        } else if (keyUpper === "ENTER" && currentCol === 5) {
            this.checkWord(guesses[currentRow]);
            return;
        }

        this.setState({
            guesses: guesses,
            currentCol: currentCol,
            currentRow: currentRow,
        });
    }

    componentDidMount() {
        document.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                // Prevent clicking focused buttons on 'Enter' clicks
                event.preventDefault();
            }
            this.handleKeyPress(event.key);
        });
    }

    render() {
        return (
            <div className='game'>
                <Header/>
                <div className='game-board'>
                    <Board
                        guesses={this.state.guesses}
                        results={this.state.results}
                        currentRow={this.state.currentRow}
                        currentCol={this.state.currentCol}
                        revealedIdx={this.state.revealedIdx}
                    />
                    <Popup text={this.state.message} isShowingPopup={this.state.isShowingPopup}/>
                </div>
                <div className='keyboard'>
                    <Keyboard
                        usedCharacters={this.state.usedCharacters}
                        onClick={(key) => this.handleKeyPress(key)}
                    />
                </div>

            </div>
        );
    }
}

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
