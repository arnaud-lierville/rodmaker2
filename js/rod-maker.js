/* Golbal Settings */
const scale = 30                            // in pixel
const modelWitdh = 30                       // in unity = scale pixels
const lineModelHeight = scale/10            // in unity = scale pixels
const modelPosition = { x:1.5, y:1.5 }      // in unity = scale pixels

const redModelColor = '#F95D62'
const blueModelColor = '#48B2F9'
const greenModelColor = '#6AB04D'
const grayModelColor = '#999999'

let baseURL = window.location.origin

let ID = function () {
  return Math.random().toString(36).substr(2, 9);
};

let currentID = ID();
const params = new URLSearchParams(location.search);
let mode = params.get('mode')
let urlID = params.get('id')

let c = document.getElementById("rodCanvas");

c.width = 2000;
c.height = 2000;
c.style.width = "1000px";
c.style.height = "1000px";
c.getContext("2d").scale(2,2)

/* Display tags */

let editDiv = document.getElementById("edit")
let viewDiv = document.getElementById("view")
let inputField = document.getElementById('calculus')
let qrcodeDiv = document.getElementById('qrcodeDiv')
let body = document.getElementById('main')

if (mode == "edit") {
  editDiv.style.display = "inline"
  viewDiv.style.display = "none"
  qrcodeDiv.style.display = "none"
} else {
  editDiv.style.display = "none"
  viewDiv.style.display = "inline"
}

/* qrcode */

let qrcode = new QRCode(document.getElementById("qrcode"), {
    width : 100,
    height : 100
  });

qrcode.makeCode(`${baseURL}?mode=edit&id=${currentID}`);

/* Firebase settings */

document.addEventListener('DOMContentLoaded', function() {
    try {
      let app = firebase.app();
      let features = [
        'auth', 
        'database', 
        'firestore',
        'functions',
        'messaging', 
        'storage', 
        'analytics', 
        'remoteConfig',
        'performance',
      ].filter(feature => typeof app[feature] === 'function');
      console.log(`Firebase SDK loaded with ${features.join(', ')}`);

      // listen to new command on the currentID session
      let db = firebase.firestore();
      db.collection("command").doc(currentID)
      .onSnapshot(doc => {
          if(doc.exists) {
            console.log(`New command on ${currentID} session`, doc.data());
            if (doc.data()) {
              qrcodeDiv.style.display = "none"
              drawModel(doc.data()['cmd'])
            }
          }
      });

    } catch (e) {
      console.error(e);
    }
  });

/* tools and listeners */

function launch_toast() {
    let x = document.getElementById("toast")
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000);
}

const sumReducer = (accumulator, currentValue) => accumulator + currentValue;

let deepEval = function(part, getStart) {
    try {
        if (getStart) {
            let startPart = part.match(/[^a-zA-Z]*/g)[0]
            let evalPart = math.evaluate(startPart)
            if (evalPart != undefined) {
                return math.evaluate(startPart)
            } else {
                return false
            } 
        } else {
            return math.evaluate(part)    
        }
    } catch (e) {
        return false
    }
}

inputField.addEventListener("keyup", function(event) {
    if (event.key === 'Enter') {
        event.preventDefault()

        trigInput(inputField.value)
    }
})

inputField.addEventListener('input', (e) => {

    if(e.currentTarget.value === '') {

        trigFlash()

        let db = firebase.firestore();          // push at the top ???

        // push the new command in the urlID session
        db.collection("command").doc(urlID).set({
            cmd: ''
        })
        .then(function() {
            console.log(`Clear command was pushed for ${urlID} session`);
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
        });
    }
})

/* Functions */

let paste = function(formula) {
    inputField.value = formula
    trigInput(formula)
}

let trigFlash = function() {
    body.classList.add("flash");
    window.setTimeout(function() { body.classList.remove("flash"); }, 500);
}

let trigInput= function(formula) {

    trigFlash()

    let db = firebase.firestore();
    let newCommand = formula

    // push the new command in the urlID session
    db.collection("command").doc(urlID).set({
        cmd: newCommand
    })
    .then(function() {
        console.log(`Command : ${newCommand} was pushed for ${urlID} session`);
        inputField.blur()
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
}

let randomLogo = function() {
    var letter = 'ABCDEF'.substr(Math.floor(Math.random()*6), 1);
    return './img/logo-' + letter + '.png';
}

let openEdit = function() {
    var win = window.open(`${baseURL}?mode=edit&id=${currentID}`, '_blank');
    win.focus();
  }

let clearCanvas = function() {
    let c = document.getElementById("rodCanvas")
    let ctx = c.getContext("2d")
    ctx.clearRect(0, 0, c.width, c.height)
}

let multToAdd = function(operation) {
    let multList = operation.match(/\d*\*[^+=]*/g)
    let newOperation = operation
    for (let index in multList) {
        let mult = multList[index]
        let newMult = mult
        let extract = mult.split('*')
        let a = parseInt(extract[0], 10)  // only integer here (a times ...)
        let b = extract[1]    
        if (!isNaN(a)) {
            newMult = ''
            for (let i = 0; i<a; i++) {
                newMult += b + '+'
            }
            newMult = newMult.slice(0, newMult.length - 1)
        }
        newOperation = newOperation.replace(mult, newMult)
    }
    return newOperation
}

let leftToRight = function(A,B) {
    let regex = /-+([^\+-]*)/g
    const matches = A.matchAll(regex);

    let AA = A.replace(/-+([^\+-]*)/g, '')
    let BB = B
    for (const match of matches) {
        BB += '+' + match[1]
    }
    return [AA, BB]
}

let transposeEquality = function(formula) {
    let splitFormula = formula.split('=')
    let A = splitFormula[0]
    let B = splitFormula[1]
    if (splitFormula.length == 2 & A!=undefined & B!=undefined) {
        let [AA, BB] = leftToRight(A,B)
        let [newB, newA] = leftToRight(BB,AA)
        let newFormula = newA + '=' + newB
        if(newFormula[0]!=undefined & newFormula[0] == '+') {
            newFormula = newFormula.substring(1)
        }
        return newFormula
    } else {
        return formula
    }
}

function drawModel(cmdText) {

    clearCanvas()

    let noSubstract = transposeEquality(cmdText)
    let inputText = multToAdd(noSubstract.replaceAll(",", "."))
    
    if (inputText != '') {

        let computedModel = new Model(inputText)
        let expressionList = computedModel.reverseList
        let isModelNumeric = computedModel.isNumeric
        let isModelCorrect = computedModel.isCorrect

        let modelColor = greenModelColor
        if (isModelNumeric) {
            console.log('Numeric model')
            if (isModelCorrect) {
                console.log('True numeric model')
                modelColor = blueModelColor
            } 
        } else {
            console.log('Aplhanumeric model')
        }

        if (!isModelCorrect) {
                 modelColor = redModelColor
                 console.log('False numeric model')
                 launch_toast()
        }

        for (let line in expressionList) {
            let termList = expressionList[line].split('+')
            let termNumber = termList.length
            if (termNumber == 1) {
                fullBarContent = termList[0]
                new Rod(modelPosition.x, 
                    modelPosition.y + line*lineModelHeight,
                    modelWitdh, 
                    lineModelHeight, 
                    termList[0].replaceAll(".", ","), 
                    scale, modelColor)
            } else {
                let computedLine = termList.map(function(item) {return deepEval(item, true)})
                let alphaCaseNumber = computedLine.filter(val => val === false).length
                let partialLineSum = computedLine.reduce(sumReducer, 0)
                let caseWidth = (computedModel.value - partialLineSum)/alphaCaseNumber
                let isLineNumeric = !computedLine.includes(false)
                let currentX = modelPosition.x
                if(isLineNumeric) {   // si la ligne ne contient que des nombre, repartion proportionnelle
                    let sum = computedLine.reduce(sumReducer, 0)
                    
                    for (let termIndex in termList) {
                        new Rod(currentX, 
                        modelPosition.y + line*lineModelHeight,
                        modelWitdh*deepEval(termList[termIndex], true)/sum ,
                        lineModelHeight ,
                        termList[termIndex].replaceAll(".", ","), 
                        scale, modelColor)
                        currentX += modelWitdh*deepEval(termList[termIndex], true)/sum
                    }
                } else {    // si la ligne ne contient pas que des nombre, répartition uniforme
                    for (let termIndex in termList) {

                        let currentValue = deepEval(termList[termIndex], true)
                        if (!currentValue) { currentValue = caseWidth }

                        new Rod(currentX, 
                            modelPosition.y + line*lineModelHeight,
                            modelWitdh*currentValue/computedModel.value ,
                            lineModelHeight ,
                            termList[termIndex].replaceAll(".", ","), 
                            scale, modelColor)
                        currentX += modelWitdh*currentValue/computedModel.value
                    }
                }
            }
        }
    }
}

/* Classes */

class Rod {
    constructor(x, y, width, height, label, scale, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.label = label;
        this.scale = scale;

        this.build(color)
    }

    build(color) {
        // getting canvas
        let c = document.getElementById("rodCanvas");
        let ctx = c.getContext("2d");

        // rod style
        ctx.lineWidth = 5;
        ctx.strokeStyle = color;
        ctx.font = this.scale + "px Arial";

        // box
        ctx.beginPath();
        ctx.rect(this.x*this.scale, this.y*this.scale, this.width*this.scale, this.height*this.scale);
        ctx.stroke();

        // label
        if (this.label != '0') {
            let xText = (this.x + 0.5*this.width)*this.scale - ctx.measureText(this.label).width/2;
            let yText = (this.y + 0.5*this.height)*this.scale + ctx.measureText(this.label).actualBoundingBoxAscent/2;
            ctx.fillText(this.label, xText, yText);
        }
    }
}


let extractSumValueFromPart = function(part) {

    let valueArray = part
    .split('+')
    .map(item => {return deepEval(item, true)})
    .filter(val => val !== false)

    if (valueArray.length == 0) {
        return null
    } else {
        return valueArray.reduce(sumReducer, 0)    
    }
}

class Model {
    constructor(formula) {
        this.formulaSplit = formula.split("=")
        this.computedModel = this.formulaSplit
        .map(function(item) {return deepEval(item.replace(/[a-zA-Z\s]*/g, ""), false)})
        this.subComputedModel = this.computedModel.filter(val => val !== false)
        this.partialModel = this.formulaSplit
        .map(function(part) {return extractSumValueFromPart(part)})
    }

    get isNumeric() {
        return this.computeIsNumeric()
    }

    get isCorrect() {
        return this.computeIsCorrect()
    }

    get value() {
        let partialModelFiltered = this.partialModel.filter(val => val !== null)
        if (partialModelFiltered.length == 0) {
            return null
        } else {
            return Math.max(...partialModelFiltered)
        }
    }

    get reverseList() {
        return this.formulaSplit.reverse()
    }

    computeIsNumeric() {
        return !this.computedModel.includes(false)
    }

    computeIsCorrect() {
        if (this.subComputedModel.length == 0) {
            return false
        } else {
            return this.subComputedModel.every( (val, i, arr) => math.abs(val - arr[0]) < 1e-12)
        }
    }
}