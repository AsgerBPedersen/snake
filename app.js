const readline = require('readline');

const state = {
    time: 0,
    size: 10,
    snake: [[3,3],[3,4],[3,5]], // index 0 is row, index 1 is columns
    apple: [7,7],
    direction: 0 //0 = north, 1 = east, 2 south, 3 west
}

draw = (snake, apple, size) => {

    let map = "";

    for (let i = 0; i < size; i++) {
        
        if(snake.some(e => e[0] == i)) 
            {
                const snakes = snake.filter(e => { if (e[0] == i) return e });

                let line = Array.from(" ".repeat(size) + "\n");
                
                snakes.forEach(e => line[e[1]] = "x");
                
                map += line.join('');
            } else {
            map += " ".repeat(size) + "\n";
            }
        }
    console.clear();
    console.log(map);
};

willEat = () => {

};

willCollide = () => {

};

moveSnake = (snake, direction, size) => {

    switch(direction) {
        case 0: snake.unshift([(snake[0][0] == 0 ? size - 1 : snake[0][0] - 1), snake[0][1]]); break
        case 1: snake.unshift([snake[0][0], (snake[0][1] == size -1 ? 0 : snake[0][1] + 1)]); break
        case 2: snake.unshift([(snake[0][0] == size -1 ? 0 : snake[0][0] + 1), snake[0][1]]); break
        case 3: snake.unshift([snake[0][0], (snake[0][1] == 0 ? size - 1 : snake[0][1] - 1)]); break
    }
    snake.pop();
}

step = t1 => {
    const { time, size, snake, apple, direction } = state;
    if( t1 - time > 320 ) {
        draw( snake, apple, size );
        moveSnake(snake, direction, size);
        
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


setInterval(() => step(Date.now()), 80);
