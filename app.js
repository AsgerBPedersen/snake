const readline = require('readline');

const state = {
    time: 0,
    size: 10,
    snake: [[3,1],[3,0],[2,1]], // index 0 is row, index 1 is columns
    apple: [1,1],
    score: 0,
    snakeDirection: 1,
    direction: 1, //0 = north, 1 = east, 2 south, 3 west
    path: []
}
moves = (node, allNodes, bool) => {
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
        const edge = allNodes.find(n => {return (n[0] == newEdge[0] && n[1] == newEdge[1])});
        if(bool) {
            if(edge) {
                result.push(edge)
            }
        } else {
            if(edge == undefined) {
                result.push(edge)
            }
        }
    });
    // console.log(node);
    // console.log(allNodes);
    // console.log(result);
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
        if(current[0] == apple[0] && current[1] == apple[1]) {
            break;
        }
        const newEdges = moves(current, nodes, true);
        newEdges.forEach(e => {
            if(!visited.has(e)) {
                frontier.push(e);
                visited.set(e, current)
            }
        });
    }

    let path = [];
    while(current != snake[0]) {
        path.unshift(current);
        current = visited.get(current);
    }
    return path;
}


draw = ({ snake, apple, size, score }) => {

    let map = "";

    for (let i = 0; i < size; i++) {

        let line = Array.from(" ".repeat(size) + "\n");
        
        if(snake.some(e => e[0] == i)) 
            {
                const snakes = snake.filter(e => { if (e[0] == i) return e });
                
                snakes.forEach(e => line[e[1]] = "x");
                
            }
        if(apple[0] == i) {
            line[apple[1]] = "o"
        }
            for(let y = 0; y < size; y++) {
                line[y] += " ";
            }
            map += line.join('');
        }
    console.clear();
    console.log(map);
    console.log(score)
};

willEat = ({ size, snake, apple, score }) => {
   state.score += 10; 
   state.apple = [Math.floor(Math.random()* size), Math.floor(Math.random()* size)];
   while(snake.some(e => e[0] == state.apple[0] && e[1] == state.apple[1])) {
    state.apple = [Math.floor(Math.random()* size), Math.floor(Math.random()* size)];
   }
   state.path = pathFinder(state);
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
    let nextMove;
    if (path[0] == undefined) {
       const nextMoves = moves(snake[0], snake, false);
       if(nextMoves[0] != undefined) {
           nextMove = nextMoves[0];
       } else {
        willCollide()
       }
    } else {
        nextMove = path.shift();
    }
    if(snake.some(e => e[0] == nextMove[0] && nextMove[1] == e[1])) {
        willCollide()
    }
    snake.unshift(nextMove)
    
    if (snake[0][0] == apple[0] && snake[0][1] == apple[1]) {
        willEat(state);
    } else {
        snake.pop();
        path = pathFinder(state);
    }
}

step = t1 => {
    
    if( t1 - state.time > 80 ) {
        moveSnake(state);
        
        draw(state);
        
        state.time = t1;
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

setInterval(() => step(Date.now()), 80)
