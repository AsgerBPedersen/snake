const readline = require('readline');

const state = {
    time: 0,
    size: 15,
    snake: [[3,1],[3,0],[3,4]], // index 0 is row, index 1 is columns
    apple: [0,1],
    score: 0,
    snakeDirection: 1,
    direction: 1, //0 = north, 1 = east, 2 south, 3 west
    path: []
}

edges = (node, allNodes) => {
    const directions = [[-1, 0], [0, 1], [1,0], [0, -1]];  //0 = north, 1 = east, 2 south, 3 west
    let result = [];
    directions.forEach(d => {    
        const edge = [node[0] + d[0], node[1] + d[1]];
        if(allNodes.some(n => n[0] == edge[0] && n[1] == edge[1])) {
            result.push(edge)
        }
    });
    return result;
}
path = ({snake, apple, size}) => {

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
        const newEdges = edges(current, nodes);
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
   state.path = path(state);
};

willCollide = () => {
    console.log("game over");
    process.exit()
};

moveSnake = ({ size, snake, apple, direction, snakeDirection }) => {

    switch(direction) {
        case 0: if(snakeDirection == 2) {
            const head = [(snake[0][0] == size -1 ? 0 : snake[0][0] + 1), snake[0][1]];
            if(snake.some(e => e[0] == head[0] && head[1] == e[1])) {
                willCollide()
            }
            snake.unshift(head);
        } else {
            const head = [(snake[0][0] == 0 ? size - 1 : snake[0][0] - 1), snake[0][1]];
            if(snake.some(e => e[0] == head[0] && head[1] == e[1])) {
                willCollide()
            }
            snake.unshift(head);
            state.snakeDirection = direction;
        }; break
        case 1: if(snakeDirection == 3) {
            const head = [snake[0][0], (snake[0][1] == 0 ? size - 1 : snake[0][1] - 1)];
            if(snake.some(e => e[0] == head[0] && head[1] == e[1])) {
                willCollide()
            }
            snake.unshift(head);
        } else {
            const head = [snake[0][0], (snake[0][1] == size -1 ? 0 : snake[0][1] + 1)];
            if(snake.some(e => e[0] == head[0] && head[1] == e[1])) {
                willCollide()
            }
            snake.unshift(head);
            state.snakeDirection = direction;
        }; break
        case 2: if(snakeDirection == 0) {
            const head = [(snake[0][0] == 0 ? size - 1 : snake[0][0] - 1), snake[0][1]];
            if(snake.some(e => e[0] == head[0] && head[1] == e[1])) {
                willCollide()
            }
            snake.unshift(head);
        } else {
            const head = [(snake[0][0] == size -1 ? 0 : snake[0][0] + 1), snake[0][1]];
            if(snake.some(e => e[0] == head[0] && head[1] == e[1])) {
                willCollide()
            }
            snake.unshift(head);
            state.snakeDirection = direction;
        }; break
        case 3: if(snakeDirection == 1) {
            const head = [snake[0][0], (snake[0][1] == size -1 ? 0 : snake[0][1] + 1)];
            if(snake.some(e => e[0] == head[0] && head[1] == e[1])) {
                willCollide()
            }
            snake.unshift(head);
        } else {
            const head = [snake[0][0], (snake[0][1] == 0 ? size - 1 : snake[0][1] - 1)];
            if(snake.some(e => e[0] == head[0] && head[1] == e[1])) {
                willCollide()
            }
            snake.unshift(head);
            state.snakeDirection = direction;
        };  break
    }
    if (snake[0][0] == apple[0] && snake[0][1] == apple[1]) {
        willEat(state);
    } else {
        snake.pop();
    }
}

step = t1 => {
    state.path = path(state);
    if( t1 - state.time > 160 ) {
        moveSnake(state);
        
        draw(state);
        
        state.time = t1;
    }
};


readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') process.exit()
    switch (key.name.toUpperCase()) {
        case 'UP': state.direction = 0; break
        case 'RIGHT': state.direction = 1; break
        case 'DOWN': state.direction = 2; break
        case 'LEFT': state.direction = 3; break
    }
})


setInterval(() => step(Date.now()), 80)
// console.log(path(state));
