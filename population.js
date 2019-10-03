class Population {
    constructor(size) {
        this.snakes = [];//all the snakes in the population

        for (let i = 0; i < size; i++) {
            this.snakes.push(new Snake());       
        }

        this.gen = 1;//which generation we are up to 
        this.globalBest = 4;// the best score ever achieved by this population
        this.globalBestFitness = 0; // the best fitness ever achieved by this population
        this.currentBest = 4;//the current best score
        this.currentBestSnake = 0; //the position of the current best snake (highest score) in the array

        this.globalBestSnake; //a clone of the best snake this population has ever seen
        this.globalMutationRate = 0.01;
    }

    updateAlive() {
        for (let i = 0; i < this.snakes.length; i++) {
            if(this.snakes[i].state.alive) {
                this.snakes[i].moveSnake(this.snakes[i].state);
            }
            
        }
        this.setCurrentBest();
    }

    done() {
        for (let i = 0; i< this.snakes.length; i++) {
            if (this.snakes[i].state.alive) {
              return false;
            }
          }
      
          return true;
    }

    calcFitness() {
        for (let i = 0; i< this.snakes.length; i++) {
    
          this.snakes[i].calcFitness();
        }
      }

      mutate() {
        for (let i =1; i < this.snakes.length; i++) {
            this.snakes[i].state.brain.mutate(this.globalMutationRate);
        }
      }

      naturalSelection() {

        let newSnakes = []; //next generation of snakes
        
        //set the first snake as the best snake without crossover or mutation
        this.setBestSnake();
        this.newSnakes[0] = this.globalBestSnake.clone();
        for (let i = 1; i< this.snakes.length; i++) {
          
          //select 2 parents based on fitness
          parent1 = this.selectSnake();
          parent2 = this.selectSnake();
          
          //crossover the 2 snakes to create the child
          child = parent1.crossover(parent2);
          //mutate the child (weird thing to type)
          child.mutate(globalMutationRate);
          //add the child to the next generation
          newSnakes[i] = child;
          
          //newSnakes[i] = selectSnake().clone().mutate(globalMutationRate); //uncomment this line to do natural selection without crossover
        }
        this.snakes = newSnakes;// set the current generation to the next generation
        
        
        gen+=1;
        //currentBest = 4;
      }

      selectSnake() {
        let fitnessSum = 0;
        for (let i =0; i<this.snakes.length; i++) {
          fitnessSum += this.snakes[i].calcFitness();
        }
    
        
        //set random value
        let rand = Math.floor(Math.random() * fitnessSum);
        
        //initialise the running sum
        let runningSum = 0;
    
        for (let i = 0; i< this.snakes.length; i++) {
          runningSum += this.snakes[i].calcFitness(); 
          if (runningSum > rand) {
            return this.snakes[i];
          }
        }
        //unreachable code to make the parser happy
        return this.snakes[0];
      }

      setBestSnake() {
        //calculate max fitness
        let max = 0;
        let maxIndex = 0;
        for (let i =0; i<this.snakes.length; i++) {
          if (this.snakes[i].calcFitness() > max) {
            max = this.snakes[i].calcFitness();
            maxIndex = i;
          }
        }
        //if best this gen is better than the global best then set the global best as the best this gen
        if(max > this.globalBestFitness){
          this.globalBestFitness = max;
          this.globalBestSnake = this.snakes[maxIndex].clone();
        }
        
        
      }

      setCurrentBest() {
        if (!this.done()) {//if any snakes alive
          let max = 0;
          let maxIndex = 0;
          for (let i = 0; i < this.snakes.length; i++) {
            if (this.snakes[i].state.alive && this.snakes[i].state.snake.length > max) {
              max = this.snakes[i].state.snake.length;
              maxIndex = i;
            }
          }
    
          if (max > this.currentBest) {
            this.currentBest = max;
          }
    
          //if the best length is more than 1 greater than the 5 stored in currentBest snake then set it;
          //the + 5 is to stop the current best snake from jumping from snake to snake
          if (!this.snakes[this.currentBestSnake].state.alive || max > this.snakes[this.currentBestSnake].state.snake.length +5   ) {
    
            this.currentBestSnake  = maxIndex;
          }
    
          
          if (this.currentBest > this.globalBest) {
            this.globalBest = this.currentBest;
          }
        }
      }
}