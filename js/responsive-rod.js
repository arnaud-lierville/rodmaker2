// when view is resized...
paper.view.onResize = function() {
    project.clear()
    drawApp(paper.view.bounds.width)
};

/* scene */
var textPosition = 27
var rodHeight = 40
var rodMarginTop = 100

function drawApp(paperWidth) {

    // 1 + 2 + 3 + 5 = 11

    // new Rod(0, 1, 11, 1, false, true, paperWidth)
    // new Rod(1, 1.5, 11, 1, false, true, paperWidth)
    // new Rod(2.5, 6, 11, 1, false, true, paperWidth)
    // new Rod(8.5, 2.5, 11, 1, false, true, paperWidth)

    // new Rod(0, 11, 11, 0, true, true, paperWidth)

    // new Brace(2.5, 2, 3, 11, 2, false, true, paperWidth)


    // new Rod(0, 14, 14, 4, false, true, paperWidth)
    // new Rod(0, 3, 14, 5, false, true, paperWidth)
    // new Rod(3, 3, 14, 5, false, true, paperWidth)
    // new Rod(6, 3, 14, 5, false, true, paperWidth)
    // new Rod(9, 3, 14, 5, false, true, paperWidth)
    // new Rod(12, 2, 14, 5, false, true, paperWidth)
    // new Brace(0, 3, 4, 14, 6, false, true, paperWidth)

    // new Rod(0, 1, 2, 8, false, true, paperWidth)
    // new Rod(0, 1/3, 1, 9, false, true, paperWidth)
    // new Rod(1/3, 1/3, 1, 9, false, true, paperWidth)
    // new Rod(2/3, 1/3, 1, 9, false, true, paperWidth)


    // shift, value, factor, sum, line, isValueHidden, paperWidth

    new Rod(0, 12, 12, 0, false, true, paperWidth)
    new MultiQuotition(0, 3, 4, 12, 1, paperWidth)

    new Rod(0, 12, 12, 4, false, true, paperWidth)
    new MultiPartition(0, 3, 4, 12, 5, true, paperWidth)

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

    initialize: function(shift, value, factor, sum, line, isValueHidden, isSwitchON, paperWidth) {

        this.brace = new Group()
        this.isValueHidden = isValueHidden

        var u = value*factor*paperWidth/(8*sum)
        var barceLength = paperWidth/2
        var yShift = rodMarginTop + line*rodHeight
        var xShift = shift*barceLength/sum
        
        this.path = new Path();
        this.path.add(xShift + paperWidth/4, yShift);
        this.path.curveTo(new Point(xShift + paperWidth/4 + .25*u, .2*rodHeight + yShift), new Point(xShift + paperWidth/4 + 1*u, .25*rodHeight + yShift));
        this.path.curveTo(new Point(xShift + paperWidth/4 + 1.75*u, .3*rodHeight + yShift), new Point(xShift + paperWidth/4 + 2*u, .5*rodHeight + yShift));
        this.path.curveTo(new Point(xShift + paperWidth/4 + 2.25*u, .3*rodHeight + yShift), new Point(xShift + paperWidth/4 + 3*u, .25*rodHeight + yShift));
        this.path.curveTo(new Point(xShift + paperWidth/4 + 3.75*u, .2*rodHeight + yShift), new Point(xShift + paperWidth/4 + 4*u, yShift));
        this.path.strokeColor = '#0';
        this.path.strokeWidth = 2
        this.path.selected = false;
        this.text = new PointText(new Point(xShift + paperWidth/4 + 2*u, rodHeight + yShift));
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
            console.log(factor)
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

    initialize: function(shift, value, factor, sum, line, paperWidth) {

        this.multiQuotition = new Group()

        var xShift = shift*paperWidth/(2*sum)
        var u = value*factor*paperWidth/(8*sum)

        var startRod = new Rod(shift, value, sum, line, false, false, paperWidth)
        var endRod = new Rod(shift + (factor - 1)*value, value, sum, line, false, false, paperWidth)
        var coma = new PointText()
        coma = new PointText(new Point(xShift + paperWidth/4 + 2*u, textPosition + rodMarginTop + line*rodHeight));
        coma.justification = 'center';
        coma.fillColor = 'black';
        coma.fontSize = 40
        coma.content = '...';

        this.brace = new Brace(shift, value, factor, sum, line + 1, true, true, paperWidth)
        this.multiQuotition.addChild(startRod)
        this.multiQuotition.addChild(endRod)
        this.multiQuotition.addChild(coma)
        this.multiQuotition.addChild(this.brace)

        this.multiPartition = new Group()

        for(var rodNumber = 0; rodNumber < factor; rodNumber++) {
            var rod = new Rod(shift + rodNumber*value, value, sum, line, false, false, paperWidth)
            this.multiPartition.addChild(rod)
        }

        this.multiPartition.visible = false

        var that = this
        this.brace.onMouseDown = function() {
            that.multiPartition.visible = !that.multiPartition.visible
            that.brace.switch()
        }

        return this.multiQuotition
    }
})

