class NeuralNetwork {
    constructor(numInputs, numHidden, numOutputs) {
        this.hidden = [];
        this.inputs = [];
        this.numInputs = numInputs;
        this.numHidden = numHidden;
        this.numOutputs = numOutputs;
        this.bias0 = new Matrix(1, this.numHidden);
        this.bias1 = new Matrix(1, this.numOutputs);
        this.weights0 = new Matrix(this.numInputs, this.numHidden);
        this.weights1 = new Matrix(this.numHidden, this.numOutputs);

        this.bias0.randomWeights();
        this.bias1.randomWeights();
        this.weights0.randomWeights();
        this.weights1.randomWeights();
    }

    feedForward(inputArray) {
        // convert input array to a matrix
        this.inputs = Matrix.convertFromArray(inputArray);

        // find the hidden values and apply the activation function
        this.hidden = Matrix.dot(this.inputs, this.weights0);
        this.hidden = Matrix.add(this.hidden, this.bias0); // apply bias
        this.hidden = Matrix.map(this.hidden, x => sigmoid(x));

        // find the output values and apply the activation function
        let outputs = Matrix.dot(this.hidden, this.weights1);
        outputs = Matrix.add(outputs, this.bias1); // apply bias
        outputs = Matrix.map(outputs, x => sigmoid(x));

        return outputs;
    }

    train(inputArray, targetArray) {
        // feed the input data through the network
        let outputs = this.feedForward(inputArray);

        // calculate the output errors (target - output)
        let targets = Matrix.convertFromArray(targetArray);
        let outputErrors = Matrix.subtract(targets, outputs);

        // calculate the deltas (errors * derivitive of the output)
        let outputDerivs = Matrix.map(outputs, x => sigmoid(x, true));
        let outputDeltas = Matrix.multiply(outputErrors, outputDerivs);

        // calculate hidden layer errors (deltas "dot" transpose of weights1)
        let weights1T = Matrix.transpose(this.weights1);
        let hiddenErrors = Matrix.dot(outputDeltas, weights1T);

        // calculate the hidden deltas (errors * derivitive of hidden)
        let hiddenDerivs = Matrix.map(this.hidden, x => sigmoid(x, true));
        let hiddenDeltas = Matrix.multiply(hiddenErrors, hiddenDerivs);

        // update the weights (add transpose of layers "dot" deltas)
        let hiddenT = Matrix.transpose(this.hidden);
        this.weights1 = Matrix.add(this.weights1, Matrix.dot(hiddenT, outputDeltas));
        let inputsT = Matrix.transpose(this.inputs);
        this.weights0 = Matrix.add(this.weights0, Matrix.dot(inputsT, hiddenDeltas));

        // update bias
        this.bias1 = Matrix.add(this.bias1, outputDeltas);
        this.bias0 = Matrix.add(this.bias0, hiddenDeltas);
    }
}


function sigmoid(x, deriv = false) {
    if(deriv) {
        return x * (1 - x);
    }
    return 1/ (1 + Math.exp(-x));
}

class Matrix {
    constructor(rows, cols, data = []) {
        this.rows = rows;
        this.cols = cols;
        this.data = data;

        if(data == null || data.length == 0) {
            this.data = [];
            for (let i = 0; i < this.rows; i++) {
                this.data[i] = [];
                for (let j = 0; j < this.cols; j++) {
                    this.data[i][j] = 0;
                }
            }
        } else {
            if(data.length != rows || data[0].length != cols) {
                throw new Error("Data sucks!");
            }
        }
    }

    static convertFromArray(arr) {
        return new Matrix(1, arr.length, [arr]);
    }

    static dot(m0, m1) {
        if (m0.cols != m1.rows) {
            throw new Error("Matrices are not \"dot\" compatible!");
        }
        let m = new Matrix(m0.rows, m1.cols);
        for (let i = 0; i < m.rows; i++) {
            for (let j = 0; j < m.cols; j++) {
                let sum = 0;
                for (let k = 0; k < m0.cols; k++) {
                    sum += m0.data[i][k] * m1.data[k][j];
                }
                m.data[i][j] = sum;
            }
        }
        return m;
    }

    static multiply(m0, m1) {
        Matrix.checkDimensions(m0, m1);
        let m = new Matrix(m0.rows, m0.cols);
        for (let i = 0; i < m.rows; i++) {
            
            for (let j = 0; j < m.cols; j++) {
                m.data[i][j] = m0.data[i][j] * m1.data[i][j];
            }
        }
        return m;
    }

    static map(m0, mFunction) {
        let m = new Matrix(m0.rows, m0.cols);
        for (let i = 0; i < m.rows; i++) {
            
            for (let j = 0; j < m.cols; j++) {
                m.data[i][j] = mFunction(m0.data[i][j]);
            }
        }
        return m;
    }

    static add(m0, m1) {
        Matrix.checkDimensions(m0, m1);
        let m = new Matrix(m0.rows, m0.cols);
        for (let i = 0; i < m.rows; i++) {
            
            for (let j = 0; j < m.cols; j++) {
                m.data[i][j] = m0.data[i][j] + m1.data[i][j];
            }
        }
        return m;
    }

    static subtract(m0, m1) {
        Matrix.checkDimensions(m0, m1);
        let m = new Matrix(m0.rows, m0.cols);
        for (let i = 0; i < m.rows; i++) {
            
            for (let j = 0; j < m.cols; j++) {
                m.data[i][j] = m0.data[i][j] - m1.data[i][j];
            }
        }
        return m;
    }

    static transpose(m0) {
        let m = new Matrix(m0.cols, m0.rows);
        for (let i = 0; i < m0.rows; i++) {
            for (let j = 0; j < m0.cols; j++) {
                m.data[j][i] = m0.data[i][j];
            }
        }
        return m;
    }

    static checkDimensions(m0, m1) {
        if(m0.rows != m1.rows || m0.cols != m1.cols) {
            throw new Error("Wrong dimensions");
        }
    }

    randomWeights() {
        for (let i = 0; i < this.rows; i++) {
            
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] = Math.random() * 2 - 1;
            }
        }
    }
}
