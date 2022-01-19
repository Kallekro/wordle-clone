import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { words } from './data.js'

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
                const idx = i*colCount + j;
                const character = this.props.guesses[i][j];
                const res = this.props.results[i][j];
                const resultClass = res === 2 ? "correct" : res === 1 ? "partlyCorrect" : res === 0 ? "incorrect" : null;
                row.push(<Square value={character} resultClass={resultClass} key={idx}/>);
            }
            rows.push(<div className="board-row" key={i}>{row}</div>);
        }
        return rows;
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

class Game extends React.Component {
    constructor(props) {
        super(props);
        var guesses = [];
        var results = [];
        for (var i=0; i < 6; i++) {
            guesses.push(Array(5).fill(null));
            results.push(Array(5).fill(null));
        }
        this.state = {
            guesses: guesses,
            currentRow: 0,
            currentCol: 0,
            solution: words[Math.floor(Math.random()*words.length)],
            results: results,
        };
    }

    checkWord(word) {
        var results = this.state.results.slice();
        for (var i=0; i < word.length; i++) {
            if (word[i] === this.state.solution[i]) {
                results[this.state.currentRow][i] = 2;
            } else if (this.state.solution.includes(word[i])) {
                results[this.state.currentRow][i] = 1;
            } else {
                results[this.state.currentRow][i] = 0;
            }
        }
        this.setState({results: results});
    }

    handleKeyPress(event) {
        const guesses = this.state.guesses.slice();
        var currentCol = this.state.currentCol;
        var currentRow = this.state.currentRow;
        if (event.key.match(/^[a-zA-Z]$/)) {
            if (currentCol < 5) {
                guesses[this.state.currentRow][this.state.currentCol] = event.key.toUpperCase();
                currentCol += 1;
            }
        } else if (event.key === "Backspace") {
            if (this.state.currentCol > 0) {
                guesses[this.state.currentRow][this.state.currentCol-1] = null;
                currentCol -= 1;
            }
        } else if (event.key === "Enter" && this.state.currentCol === 5) {
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
        document.addEventListener("keydown", this.handleKeyPress.bind(this));
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
