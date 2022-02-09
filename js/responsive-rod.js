// when view is resized...
paper.view.onResize = function() {
    drawApp(paper.view.bounds.width, formulaInput.value)
};

/* utils */
var reducer = function(previousValue, currentValue) { return previousValue + currentValue }

/* scene */
var textPosition = 27
var rodHeight = 40
var rodMarginTop = 100

/* formula input */
var divFormInline = document.createElement('div')
divFormInline.className = 'form-inline'

var formulaInput = document.createElement('input');
formulaInput.setAttribute('type', 'text');
formulaInput.className = 'form-input'
formulaInput.size = 37
formulaInput.value = '15=3?*5'

divFormInline.appendChild(formulaInput)

var divFormSwitch = document.createElement('div')
divFormSwitch.className = 'form-switch form-check-inline'

var checkInput = document.createElement('input')
checkInput.setAttribute('type', 'checkbox')
checkInput.className = 'form-check-input'

var labelCheckbox = document.createElement('label')
labelCheckbox.className = 'form-check-label'
labelCheckbox.innerText = 'Cacher / Montrer'

divFormSwitch.append(checkInput, labelCheckbox)

var div = document.createElement('div')
div.className = 'd-flex justify-content-center'
div.style = 'margin-top: 30px'

div.append(divFormInline, divFormSwitch)

document.body.insertBefore(div, document.body.firstChild);

formulaInput.addEventListener('keyup', function(event) {
    if(event.key != 'Shift') {
        drawApp(paper.view.bounds.width, formulaInput.value)
    }
})  
checkInput.addEventListener('change', function() {
    if (formulaInput.type === "password") {
        formulaInput.type = "text";
    } else {
        formulaInput.type = "password";
    }
})  

function keyup(event) { window.dispatchEvent(new Event('keyup')); }
function change(event) { window.dispatchEvent(new Event('change')); }

function drawApp(paperWidth, formula) {

    project.clear()

    var formulaSplitEqual = formula.split('=')
    var lines = formulaSplitEqual.map(function(item) { return item.replace(/[a-zA-Z\s\?]*/g, '') }) 

    var sumList = []
    var modelLines = []
    var modelMax
    var nbModelLine = lines.length

    for(var index in lines) {

        if(parseInt(lines[index])) {

            var line = lines[index].split('+')
            modelLines.push(line)
    
            var tempSum = [0]
            for(var rod in line) {
                if(line[rod].indexOf('*') > -1) {
                    var productSplited = line[rod].split('*')
                    var factor = parseFloat(productSplited[0])
                    var value = parseFloat(productSplited[1])
                    if(factor && value) {
                        tempSum.push(parseFloat(productSplited[0])*parseFloat(productSplited[1]))
                    }
                } else {
                    tempSum.push(parseFloat(line[rod]))
                }
            }
            var lineSum = tempSum.reduce(reducer)
            sumList.push(lineSum)
        }
    }
    modelMax = Math.max.apply(Math, sumList)

    var modelLinesIsValueHidden = []
    for(var index in formulaSplitEqual) {
        var line = formulaSplitEqual[index].split('+').map(function(item) { return item.replace(/[0-9.a-zA-Z\s]*/g, '') })
        modelLinesIsValueHidden.push(line)
    }

    for(var i in modelLines) {
        var shift = 0
        for(var j in modelLines[i]) {
            if(modelLinesIsValueHidden[i][j] == '*?') {
                var productSplited = modelLines[i][j].split('*')
                    var factor = parseFloat(productSplited[0])
                    var value = parseFloat(productSplited[1])
                if(factor && value) {
                    new MultiPartition(shift, value, factor, modelMax, parseInt(i), true, paperWidth)
                    shift += factor*value
                }
            } else if(modelLinesIsValueHidden[i][j] == '*' || modelLinesIsValueHidden[i][j] == '?*?') {
                var productSplited = modelLines[i][j].split('*')
                    var factor = parseFloat(productSplited[0])
                    var value = parseFloat(productSplited[1])
                if(factor && value && modelMax) {
                    new MultiPartition(shift, value, factor, modelMax, parseInt(i), false, paperWidth)
                    shift += factor*value
                }
            } else if(modelLinesIsValueHidden[i][j] == '?*') {

                var isLastLine = nbModelLine == parseInt(i) + 1
                var isFirstLine = parseInt(i) == 0
                var type = 'none'
                if (isFirstLine) { type = 'top' }
                if (isLastLine) { type = 'bottom' }

                var productSplited = modelLines[i][j].split('*')
                var factor = parseFloat(productSplited[0])
                var value = parseFloat(productSplited[1])
                if(factor && value && modelMax) {
                    new MultiQuotition(shift, value, factor, modelMax, parseInt(i), type, paperWidth)
                    shift += factor*value
                }
            } else if(modelLinesIsValueHidden[i][j] == '?') {
                new Rod(shift, parseFloat(modelLines[i][j]), modelMax, parseInt(i), true, true, paperWidth)
                shift += parseFloat(modelLines[i][j])
            }  else {
                new Rod(shift, parseFloat(modelLines[i][j]), modelMax, parseInt(i), false, true, paperWidth)
                shift += parseFloat(modelLines[i][j])
            }  
        }
    }
}
/* ########### Rod ###############
shift : somme jusqu'au départ
value : valeur de la barre
sum : valeur totale de la ligne
line : numéro de la ligne
isValueHidden : true => la valeur de la barre est cachée
isSwitchON : true => value / ?
*/
var Rod = Base.extend({

    initialize: function(shift, value, sum, line, isValueHidden, isSwitchON, paperWidth) {

        if(value) {
            this.rodGroup = new Group();
            this.isValueHidden = isValueHidden
            var rodLength = paperWidth/2
        
            var rectangle = new Rectangle(new Point(paperWidth/4 + shift*rodLength/sum, rodMarginTop + line*rodHeight), new Size(value*rodLength/sum, rodHeight));
            this.path = new Path.Rectangle(rectangle);
            this.path.fillColor = '#FFFFFF'
            this.path.strokeColor = '#0';
            this.path.strokeWidth = 2
            this.path.selected = false;
            this.text = new PointText(new Point(paperWidth/4 + 0.5*value*rodLength/sum + shift*rodLength/sum, rodMarginTop + textPosition + line*rodHeight));
            this.text.justification = 'center';
            this.text.fillColor = 'black';
            this.text.fontSize = 20
            this.text.content = value.toString();
            if (isValueHidden) {
                this.text.content = '?'
            }
    
            this.rodGroup.addChild(this.path)
            this.rodGroup.addChild(this.text)
    
    
            if(isSwitchON) {
    
                var that = this
    
                this.rodGroup.onMouseDown = function() {
    
                    if(that.isValueHidden) {
                        that.isValueHidden = false
                        that.text.content = value.toString();
                    } else {
                        that.isValueHidden = true
                        that.text.content = '?'
                    }
                }
        
                this.rodGroup.onMouseEnter = function() {
                    view.element.style.setProperty('cursor', 'pointer');
                },
                this.rodGroup.onMouseLeave = function() {
                    view.element.style.setProperty('cursor', null);
                }
    
            }
    
            return this.rodGroup
        } else {
            return null
        }
}})

/* ########### Brace ###############
shift : somme jusqu'au départ
value : valeur itérée
factor : nombre de fois la value
sum : valeur totale de la ligne
line : numéro de la ligne
isValueHidden : le factor est caché
isSwitchON : factor / ?
*/

var Brace = Base.extend({

    initialize: function(shift, value, factor, sum, line, isValueHidden, isSwitchON, type, paperWidth) {

        this.brace = new Group()
        this.isValueHidden = isValueHidden

        var u = value*factor*paperWidth/(8*sum)
        var barceLength = paperWidth/2
        var yShift = rodMarginTop + line*rodHeight
        var xShift = shift*barceLength/sum

        var epsilon = 0
        if (type == 'top') { epsilon = 1}
        
        this.path = new Path();
        this.path.add(xShift + paperWidth/4, -rodHeight*epsilon + yShift);
        this.path.curveTo(new Point(xShift + paperWidth/4 + .25*u, -1.4*rodHeight*epsilon + .2*rodHeight + yShift), new Point(xShift + paperWidth/4 + 1*u, -1.5*rodHeight*epsilon + .25*rodHeight + yShift));
        this.path.curveTo(new Point(xShift + paperWidth/4 + 1.75*u, -1.6*rodHeight*epsilon + .3*rodHeight + yShift), new Point(xShift + paperWidth/4 + 2*u, -2*rodHeight*epsilon + .5*rodHeight + yShift));
        this.path.curveTo(new Point(xShift + paperWidth/4 + 2.25*u, -1.6*rodHeight*epsilon + .3*rodHeight + yShift), new Point(xShift + paperWidth/4 + 3*u, -1.5*rodHeight*epsilon + .25*rodHeight + yShift));
        this.path.curveTo(new Point(xShift + paperWidth/4 + 3.75*u, -1.4*rodHeight*epsilon + .2*rodHeight + yShift), new Point(xShift + paperWidth/4 + 4*u, -rodHeight*epsilon + yShift));
        this.path.strokeColor = '#0';
        this.path.strokeWidth = 2
        this.path.selected = false;
        this.text = new PointText(new Point(xShift + paperWidth/4 + 2*u, rodHeight + epsilon*(-2.75*rodHeight) + yShift));
        this.text.justification = 'center';
        this.text.fillColor = 'black';
        this.text.fontSize = 20
        this.text.content = factor.toString() + ' x';
        if (isValueHidden) {
            this.text.content = '? x'
        }

        this.brace.addChild(this.path)
        this.brace.addChild(this.text)

        if(isSwitchON) {
            var that = this

            this.brace.onMouseDown = function() {

                if(that.isValueHidden) {
                    that.isValueHidden = false
                    that.text.content = factor.toString() + ' x';
                } else {
                    that.isValueHidden = true
                    that.text.content = '? x'
                }
            }

            this.brace.onMouseEnter = function() {
                view.element.style.setProperty('cursor', 'pointer');
            },
            this.brace.onMouseLeave = function() {
                view.element.style.setProperty('cursor', null);
            }
        }

        this.brace.switch = function() {
            if (that.isValueHidden) {
                that.isValueHidden = false
                that.text.content = factor.toString() + ' x';
            } else {
                that.isValueHidden = true
                that.text.content = '? x'
            }
        }
        return this.brace
    }
})

/*  ########### MultiPartition ###############

(On connait le nombre de part, on cherche la taille de chaque part)

!!!!! FACTOR > 1

shift : somme jusqu'au départ
value : valeur itérée
factor : nombre de fois la value => CONNU
sum : valeur totale de la ligne
line : numéro de la ligne
isValueHidden : valeur / ?
*/

var MultiPartition = Base.extend({

    initialize: function(shift, value, factor, sum, line, isValueHidden, paperWidth) {

        this.multiPartition = new Group()

        for(var rodNumber = 0; rodNumber < factor; rodNumber++) {
            var rod = new Rod(shift + rodNumber*value, value, sum, line, isValueHidden, true, paperWidth)
            this.multiPartition.addChild(rod)
        }

        return this.multiPartition
    }
})

/* ########### MultiQuotition ###############

(on connait la taille des part, on cherche le nombre de parts)

!!!!! FACTOR > 1

shift : somme jusqu'au départ
value : valeur itérée => CONNU
factor : nombre de fois la value 
sum : valeur totale de la ligne
line : numéro de la ligne
*/

var MultiQuotition = Base.extend({

    initialize: function(shift, value, factor, sum, line, type, paperWidth) {

        this.multiQuotition = new Group()

        var xShift = shift*paperWidth/(2*sum)
        var u = value*factor*paperWidth/(8*sum)

        this.multiPartition = new Group()

        for(var rodNumber = 0; rodNumber < factor; rodNumber++) {
            var rod = new Rod(shift + rodNumber*value, value, sum, line, false, factor < 3, paperWidth)
            this.multiPartition.addChild(rod)
        }

        this.multiPartition.visible = false

        if(factor > 2) {
            var startRod = new Rod(shift, value, sum, line, false, false, paperWidth)
            var endRod = new Rod(shift + (factor - 1)*value, value, sum, line, false, false, paperWidth)
            var coma = new PointText()
            coma = new PointText(new Point(xShift + paperWidth/4 + 2*u, textPosition + rodMarginTop + line*rodHeight));
            coma.justification = 'center';
            coma.fillColor = 'black';
            coma.fontSize = 40
            coma.content = '...';

        if(type != 'none') {
            this.brace = new Brace(shift, value, factor, sum, line + 1, true, true, type, paperWidth)
            this.multiQuotition.addChild(startRod)
            this.multiQuotition.addChild(endRod)
            this.multiQuotition.addChild(coma)
            this.multiQuotition.addChild(this.brace)

            var that = this
            this.brace.onMouseDown = function() {
                that.multiPartition.visible = !that.multiPartition.visible
                that.brace.switch()
            }
        }
            return this.multiQuotition
        } else {
            this.multiPartition.visible = true
            return this.multiPartition
        }
    }
})

