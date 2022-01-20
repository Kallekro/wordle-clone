import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { words } from './data.js'


/* TODO:
* If same letter occurs twice in guess, but only once in solution, only mark one of the guesses.
  - If one if correct, mark that one. Otherwise mark the first.
*/

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
        <div className={'square ' + props.resultClass}>{props.value}</div>
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
                row.push(<Square value={character} resultClass={statusCodeToClass(res)} key={'cell' + idx}/>);
            }
            rows.push(<div className="board-row" key={'boardrow' + i}>{row}</div>);
        }
        return rows;
    }
}

function Key(props) {
    const displayVal = props.value === 'BACKSPACE' ? '<--' : props.value;
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

function SolutionPopup(props) {
    return <div className='solutionPopup'><div className='solutionText'>{props.solution}</div></div>
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        var guesses = [];
        var results = [];
        for (var i=0; i < 6; i++) {
            guesses.push(Array(5).fill(null));
            results.push(Array(5).fill(null));
        }
        var usedCharacters = {};
        for (var x=65; x <= 90; x++) {
            usedCharacters[String.fromCharCode(x)] = null;
        }

        this.state = {
            guesses: guesses,
            currentRow: 0,
            currentCol: 0,
            solution: words[Math.floor(Math.random()*words.length)],
            results: results,
            usedCharacters: usedCharacters,
            solved: false,
        };
    }

    checkWord(word) {
        var results = this.state.results.slice();
        var usedCharacters = Object.assign({}, this.state.usedCharacters);
        for (var i=0; i < word.length; i++) {
            if (word[i] === this.state.solution[i]) {
                results[this.state.currentRow][i] = 2;
                usedCharacters[word[i]] = 2;
            } else if (this.state.solution.includes(word[i])) {
                results[this.state.currentRow][i] = 1;
                if (usedCharacters[word[i]] < 2) {
                    usedCharacters[word[i]] = 1;
                }
            } else {
                results[this.state.currentRow][i] = 0;
                if (usedCharacters[word[i]] < 1) {
                    usedCharacters[word[i]] = 0;
                }
            }
        }

        var solved = this.state.solved;
        if (results[this.state.currentRow].every((x) => x === 2)) {
            solved = true;
        }
        this.setState({
            results: results,
            usedCharacters: usedCharacters,
            solved: solved,
        });
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
            if (words.includes(guesses[currentRow].join(''))) {
                this.checkWord(guesses[currentRow]);
                currentRow += 1;
                currentCol = 0;
            }
        }

        this.setState({
            guesses: guesses,
            currentCol: currentCol,
            currentRow: currentRow,
        });
    }

    componentDidMount() {
        document.addEventListener("keydown", (event) => {
            if (event.key == "Enter") {
                // Prevent clicking focused buttons on 'Enter' clicks
                event.preventDefault();
            }
            this.handleKeyPress(event.key);
        });
    }

    render() {
        const solutionPopup = this.state.currentRow === 6 && !this.state.solved ?
            <SolutionPopup solution={this.state.solution} /> : null;
        return (
            <div className='game'>
                <Header/>
                <div className='game-board'>
                    <Board
                        guesses={this.state.guesses}
                        results={this.state.results}
                        currentRow={this.state.currentRow}
                        currentCol={this.state.currentCol}
                    />
                    {solutionPopup}
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
