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

    new Rod(0, 1, 11, 1, false, paperWidth)
    new Rod(1, 1.5, 11, 1, false, paperWidth)
    new Rod(2.5, 6, 11, 1, false, paperWidth)
    new Rod(8.5, 2.5, 11, 1, false, paperWidth)

    new Rod(0, 11, 11, 0, true, paperWidth)

    new Brace(2.5, 2, 3, 11, 2, false, paperWidth)


    new Rod(0, 14, 14, 4, false, paperWidth)
    new Rod(0, 3, 14, 5, false, paperWidth)
    new Rod(3, 3, 14, 5, false, paperWidth)
    new Rod(6, 3, 14, 5, false, paperWidth)
    new Rod(9, 3, 14, 5, false, paperWidth)
    new Rod(12, 2, 14, 5, false, paperWidth)
    new Brace(0, 3, 4, 14, 6, false, paperWidth)

    new Rod(0, 1, 2, 8, false, paperWidth)
    new Rod(0, 1/3, 1, 9, false, paperWidth)
    new Rod(1/3, 1/3, 1, 9, false, paperWidth)
    new Rod(2/3, 1/3, 1, 9, false, paperWidth)


}

/*
shift = somme jusqu'au départ
value = valeur de la barre
sum = valeur totale
line = ligne
*/
var Rod = Base.extend({

    initialize: function(shift, value, sum, line, isValueHidden, paperWidth) {

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

        return this.rodGroup
}})

/*
shift = somme jusqu'au départ
value = valeur itérée
factor = facteur
sum = valeur totale
line = ligne
*/

var Brace = Base.extend({

    initialize: function(shift, value, factor, sum, line, isValueHidden, paperWidth) {

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

        return this.brace
    }
})



