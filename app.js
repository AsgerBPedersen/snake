//const readline = require('readline');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const state = {
    time: 0,
    size: 20,
    snake: [[3,1],[3,0]], // index 0 is row, index 1 is columns
    apple: [1,1],
    score: 0,
    frontier: [],
    calcPath: false,
    snakeDirection: 1,
    direction: 1, //0 = north, 1 = east, 2 south, 3 west
    path: []
}



const xy = c => Math.round(c * canvas.width / state.size);
const pointEq = (x, y) => (x[0] == y[0] && x[1] == y[1])? true : false;


const moves = (node, allNodes, bool) => {
    const {size} = state;
    const directions = [[-1, 0], [0, 1], [1,0], [0, -1]];  //0 = north, 1 = east, 2 south, 3 west
    let result = [];
    directions.forEach(d => {
        let newEdge;
        if(node[0] + d[0] == -1) {
            newEdge = [size - 1, node[1]];
        } else if(node[0] + d[0] == size) {
            newEdge = [0, node[1]]
        } else if(node[1] + d[1] == -1) {
            newEdge = [node[0], size -1]
        } else if(node[1] + d[1] == size) {
            newEdge = [node[0], 0]
        } else {
            newEdge = [node[0] + d[0],node[1] + d[1]]
        }
        const edge = allNodes.find(n => pointEq(n, newEdge));
        if(bool) {
            if(edge) {
                result.push(edge)
            }
        } else {
            if(edge == undefined) {
                result.push(newEdge)
            }
        }
    });
    
    return result;
}

pathFinder = ({snake, apple, size}) => {
    
    let nodes = [];

    for(i = 0; i < size; i++) {
        for (y = 0; y < size; y++) {
            if(!snake.some(s => s[0] == i && s[1] == y)) {
                nodes.push([i,y]);
            }
        }
    }

    let frontier = [snake[0]];
    let visited = new Map();
    visited.set(snake[0], null)
    let current;
    while(frontier.length != 0) {
        current = frontier.shift();
        if(pointEq(current, apple)) {
            break;
        }
        const newEdges = moves(current, nodes, true);
        newEdges.forEach(e => {
            if(!visited.has(e)) {
                frontier.push(e);
                visited.set(e, current);
                if(state.calcPath) {
                    state.frontier.push(frontier.map(f => f))
                }
            }
        });
        
    }

    let path = [];
    while(current != snake[0]) {
        path.unshift(current);
        current = visited.get(current);
    }
    if(path.length == 0) {
        const nextMoves = moves(snake[0], snake, false);
        
        if(nextMoves.length == 0) {
            willCollide()
        } else {
            path.push(nextMoves[Math.floor(Math.random()*nextMoves.length)])
        }
    }
    return path;
}


draw = ({ snake, apple, size, score }) => {

    ctx.fillStyle = '#232323';
    ctx.fillRect(0,0,canvas.width, canvas.height);

    ctx.fillStyle = 'rgb(0,200,50)';
    snake.map(s,i => ctx.fillRect(xy(s[1]), xy(s[0]), xy(1), xy(1)) if(i==0));

    ctx.fillStyle = 'rgb(255,50,0)';
    ctx.fillRect(xy(apple[1]), xy(apple[0]), xy(1), xy(1));
    // let map = "";

    // for (let i = 0; i < size; i++) {

    //     let line = Array.from(" ".repeat(size) + "\n");
        
    //     if(snake.some(e => e[0] == i)) 
    //         {
    //             const snakes = snake.filter(e => { if (e[0] == i) return e });
                
    //             snakes.forEach(e => line[e[1]] = "x");
                
    //         }
    //     if(apple[0] == i) {
    //         line[apple[1]] = "o"
    //     }
    //         for(let y = 0; y < size; y++) {
    //             line[y] += " ";
    //         }
    //         map += line.join('');
    //     }
    // console.clear();
    // console.log(map);
    // console.log(score)
};

drawFrontier = ({ snake, apple, size, score }, frontier) => {

    ctx.fillStyle = '#232323';
    ctx.fillRect(0,0,canvas.width, canvas.height);

    ctx.fillStyle = 'rgb(0,200,50)';
    snake.map(s => ctx.fillRect(xy(s[1]), xy(s[0]), xy(1), xy(1)));

    ctx.fillStyle = 'rgb(255,50,0)';
    ctx.fillRect(xy(apple[1]), xy(apple[0]), xy(1), xy(1));

    ctx.fillStyle = '#fefefe';
    const newFrontier = frontier.shift();
    newFrontier.map(f => ctx.fillRect(xy(f[1]), xy(f[0]), xy(1), xy(1)));

    if(frontier.length == 0) {
        state.calcPath = false;
        state.frontier = [];
    }
};

willEat = ({ size, snake, apple, score }) => {
   state.score += 10; 
   state.apple = [Math.floor(Math.random()* size), Math.floor(Math.random()* size)];
   while(snake.some(e => e[0] == state.apple[0] && e[1] == state.apple[1])) {
    state.apple = [Math.floor(Math.random()* size), Math.floor(Math.random()* size)];
   }
   
};

willCollide = () => {
    console.log("game over");
    process.exit()
};

moveSnake = ({ path, size, snake, apple, direction, snakeDirection }) => {

    // switch(direction) {
    //     case 0: if(snakeDirection == 2) {
    //         const head = [(snake[0][0] == size -1 ? 0 : snake[0][0] + 1), snake[0][1]];
    //         if(snake.some(e => e[0] == head[0] && head[1] == e[1])) {
    //             willCollide()
    //         }
    //         snake.unshift(head);
    //     } else {
    //         const head = [(snake[0][0] == 0 ? size - 1 : snake[0][0] - 1), snake[0][1]];
    //         if(snake.some(e => e[0] == head[0] && head[1] == e[1])) {
    //             willCollide()
    //         }
    //         snake.unshift(head);
    //         state.snakeDirection = direction;
    //     }; break
    //     case 1: if(snakeDirection == 3) {
    //         const head = [snake[0][0], (snake[0][1] == 0 ? size - 1 : snake[0][1] - 1)];
    //         if(snake.some(e => e[0] == head[0] && head[1] == e[1])) {
    //             willCollide()
    //         }
    //         snake.unshift(head);
    //     } else {
    //         const head = [snake[0][0], (snake[0][1] == size -1 ? 0 : snake[0][1] + 1)];
    //         if(snake.some(e => e[0] == head[0] && head[1] == e[1])) {
    //             willCollide()
    //         }
    //         snake.unshift(head);
    //         state.snakeDirection = direction;
    //     }; break
    //     case 2: if(snakeDirection == 0) {
    //         const head = [(snake[0][0] == 0 ? size - 1 : snake[0][0] - 1), snake[0][1]];
    //         if(snake.some(e => e[0] == head[0] && head[1] == e[1])) {
    //             willCollide()
    //         }
    //         snake.unshift(head);
    //     } else {
    //         const head = [(snake[0][0] == size -1 ? 0 : snake[0][0] + 1), snake[0][1]];
    //         if(snake.some(e => e[0] == head[0] && head[1] == e[1])) {
    //             willCollide()
    //         }
    //         snake.unshift(head);
    //         state.snakeDirection = direction;
    //     }; break
    //     case 3: if(snakeDirection == 1) {
    //         const head = [snake[0][0], (snake[0][1] == size -1 ? 0 : snake[0][1] + 1)];
    //         if(snake.some(e => e[0] == head[0] && head[1] == e[1])) {
    //             willCollide()
    //         }
    //         snake.unshift(head);
    //     } else {
    //         const head = [snake[0][0], (snake[0][1] == 0 ? size - 1 : snake[0][1] - 1)];
    //         if(snake.some(e => e[0] == head[0] && head[1] == e[1])) {
    //             willCollide()
    //         }
    //         snake.unshift(head);
    //         state.snakeDirection = direction;
    //     };  break
    // }
    // let nextMove;
    // if (path[0] == undefined) {
    //    const nextMoves = moves(snake[0], snake, false);
    //    console.log(nextMoves);
    //    if(nextMoves[0] != undefined) {
    //        nextMove = nextMoves[0];
    //    } else {
    //     willCollide()
    //    }
    // } else {
    // }
    const nextMove = path.shift();
    if(snake.some(e => pointEq(e, nextMove))) {
        willCollide()
    }
    snake.unshift(nextMove)
    
    if (pointEq(snake[0], apple)) {
        willEat(state);
        state.calcPath = true;
    } else {
        snake.pop();
    }
    state.path = pathFinder(state);
}


step = t1 => t2 => {
    if(state.calcPath) {
        
        if( t2 - t1 > 1 ) {
            console.log(state.frontier);
            drawFrontier(state, state.frontier);
            window.requestAnimationFrame(step(t2))
        }
        else {
            window.requestAnimationFrame(step(t1))
        }
    } else {
        if( t2 - t1 > 10 ) {
            moveSnake(state);
            draw(state);
            window.requestAnimationFrame(step(t2))
        }
        else {
            window.requestAnimationFrame(step(t1))
        }
    }
};


// readline.emitKeypressEvents(process.stdin);
// process.stdin.setRawMode(true);
// process.stdin.on('keypress', (str, key) => {
//     if (key.ctrl && key.name === 'c') process.exit()
//     switch (key.name.toUpperCase()) {
//         case 'UP': state.direction = 0; break
//         case 'RIGHT': state.direction = 1; break
//         case 'DOWN': state.direction = 2; break
//         case 'LEFT': state.direction = 3; break
//     }
// })

state.path = pathFinder(state);

draw(state)
window.requestAnimationFrame(step(0))
//setInterval(() => step(Date.now()), 40)
