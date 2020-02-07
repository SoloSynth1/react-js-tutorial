import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    const className = 'square' + (props.highlight ? ' highlight' : '');
    return (
        <button className={className} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: 3,
            cols: 3
        }
    }
    renderSquare(i) {
        const winLine = this.props.winLine;
        return (
            <Square
                value={this.props.squares[i]}
                onClick={()=> this.props.onClick(i)}
                highlight={winLine && winLine.includes(i)}
            />
        );
    }

    renderBoard() {
        const rows = this.state.rows;
        const cols = this.state.cols;

        let table = [];
        for (let i = 0; i < rows; i++ ) {
            let children = [];
            for (let j = 0; j < cols; j++ ) {
                children.push(this.renderSquare(i*cols+j));
            }
            table.push(<div className="board-row">{children}</div>);
        }
        return table;
    }

    render() {
        return (
            <div>
                {this.renderBoard()}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                row: null,
                col: null,
            }],
            stepNumber: 0,
            xIsNext: true,
            movesIsAsc: true,
        }
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const row = Math.floor(i/3);
        const col = i % 3;

        if (calculateWinner(squares).winner || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                row: row,
                col: col,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    handleSortToggle() {
        this.setState({
            movesIsAsc: !this.state.movesIsAsc,
        });
    }

    jumpTo(step) {
        if (step < 0){
            step = 0;
        } else if (step > this.state.stepNumber) {
            step = this.state.stepNumber;
        }
        this.setState({
            stepNumber: step,
            xIsNext: (step%2) === 0,
        })
    }

    render() {
        const history = this.state.history;
        const stepNumber = this.state.stepNumber;
        const current = history[stepNumber];
        const winInfo = calculateWinner(current.squares);
        const winner = winInfo.winner;
        const movesIsAsc = this.state.movesIsAsc;

        const moves = history.map((step, move) => {
            const col = this.state.history[move].col;
            const row = this.state.history[move].row;
            const desc = move ?
                `Go to move #${move} (col: ${col}, row: ${row})`:
                'Go to game start';
            return (
                <li key={move}>
                    <button
                        className={move === stepNumber ? 'move-list-item-selected' : ''}
                        onClick={()=>{this.jumpTo(move)}}
                    >
                        {desc}
                    </button>
                </li>
            )
        });

        const sort = (<button
            className="sort-button"
            onClick={() => {this.handleSortToggle()}}>Sort moves (Currently {movesIsAsc ? "Ascending" : "Descending"})</button>);

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext? "X": "O");
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winLine={winInfo.line}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>{sort}</div>
                    <ol>{movesIsAsc ? moves : moves.reverse()}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winner: squares[a],
                line: lines[i],
            };
        }
    }
    return {
        winner: null,
        line: null,
    };
}