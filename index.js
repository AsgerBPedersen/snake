// const btn = document.getElementById('btn')
// //pathfinding toggle
// const togglePath = () => {
//     if(state.pathfinding == "breadth first") {
//         state.pathfinding = "aStar";
        
//     } else {
//         state.pathfinding = "breadth first"
//     }
//     btn.innerHTML = state.pathfinding;
// }

// btn.addEventListener("click", togglePath);
const pop = new Population(2000);
const btn = document.getElementById("nextGen");
const btnSave = document.getElementById("btnSave");

// loadJSON((response) => {
//     pop.snakes[0].state.brain.loadBrain(JSON.parse(response));
// })
const ng = () => {
    pop.globalBestSnake.state.snake = [[3, 1], [3, 0]];
    pop.globalBestSnake.state.apple = [Math.floor(Math.random() * 12), Math.floor(Math.random() * 12)];
    pop.globalBestSnake.state.alive = true;
    pop.globalBestSnake.state.leftToLive = 50;

    window.requestAnimationFrame(pop.globalBestSnake.step(0));
}

for(let i = 0; i < 2; i++) {
    while(!pop.done()) {
        pop.updateAlive();
    }
    
    pop.naturalSelection();
    
    console.log(i + " " + pop.globalBestFitness);
}


btn.addEventListener("click", ng);
btnSave.addEventListener("click",() => saveText(JSON.stringify(pop.snakes[0].state.brain, null, 2), "snake.json"));

function saveText(text, filename){
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(text));
    a.setAttribute('download', filename);
    a.click()
  }

  function loadJSON(callback) {   

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'snake.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }



