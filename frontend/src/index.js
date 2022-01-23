import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { words } from './data.js'

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

function SolutionPopup(props) {
    return <div className='solutionPopup'><div className='solutionText'>{props.solution}</div></div>
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

        var solution = words[Math.floor(Math.random()*words.length)];
        var solutionCharCount = charMap(0);
        for (var i=0; i<solution.length; i++) {
            solutionCharCount[solution[i]] += 1;
        }

        this.state = {
            guesses: guesses,
            currentRow: 0,
            currentCol: 0,
            solution: solution,
            solutionCharCount: solutionCharCount,
            results: results,
            usedCharacters: usedCharacters,
            solved: false,
        };
    }

    checkWord(word) {
        var results = this.state.results.slice();
        var usedCharacters = Object.assign({}, this.state.usedCharacters);
        var wordCharCount = charMap(0);
        for (var i=0; i < word.length; i++) {
            wordCharCount[word[i]] += 1;
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

        for (var i=word.length-1; i >= 0; i--) {
            if (results[this.state.currentRow][i] === 1 &&
                wordCharCount[word[i]] > this.state.solutionCharCount[word[i]]) {
                results[this.state.currentRow][i] = 0;
                wordCharCount[word[i]] -= 1;
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
            if (event.key === "Enter") {
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
