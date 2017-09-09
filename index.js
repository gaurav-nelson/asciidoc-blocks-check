var readl = require('readl-async')

var chalk = require('chalk');

var allGood = chalk.green('✓')
var somethingWrong = chalk.red('✖')

module.exports = function asciidocBlocksCheck(asciidoc) {

    var lineNumber, isClosed, blockObject, mainStack

    //Initialize the reader object 
    var reader = new readl(asciidoc, {
        encoding: 'utf8',
        emptyLines: 'true'
    })

    lineNumber = 0
    isClosed = true
    blockObject = {}
    mainStack = []

    function validateValues(obj) {
        //console.log("OBJ: ", obj)
        if (mainStack[0] != null) {

            var lastElement = mainStack[mainStack.length - 1]
            //console.log("LAST Element: ", lastElement)

            if (lastElement.blockType != obj.blockType) {
                //mainStack.push(checkPop)
                //console.log("CHKBLOCK: ", lastElement.blockType)
                //console.log("OBJBLOCK: ", obj.blockType)
                //console.log("Not a Match, keeping it.")
                mainStack.push(obj)
                //console.log("ARRAY1: ", mainStack)
            } else {
                mainStack.pop()
                //console.log("Match, removing last element")
                //console.log("ARRAY2: ", mainStack)
            }

        } else {
            //console.log("Array Empty, adding value")
            mainStack.push(obj)
            //console.log("ARRAY3: ", mainStack)
        }

        //console.log(mainStack)
    }

    //Emit this function when one line is read:
    reader.on('line', function (line, index, start, end) {
        lineNumber++
        blockObject = {}

        // text.match(/(====)\s\w+/ig); this means it is a level 3 title and not an admonition block
        /*
          line.includes('====') || //Admonition
            line.includes('|===') || //table
            line.includes('....') || //Literal block
            line.includes('****') || // Sidebar
            line.includes('____') || //Blockquote
            line.include('""') || //Air quotes
            line.include('++++') || //Passthrough block
            line.include('--') || //Open block
            line.include('////') //Comment block 
        */

        if (line.includes('====')) {
            var isTitle = (/(====)\s\w+/ig).test(line)
            if (!isTitle) {
                blockObject.blockType = "Admonition (====)"
                blockObject.onLineNumber = lineNumber

                validateValues(blockObject)
            }
        } else

        if (line.includes('----')) {
            blockObject.blockType = "Code (----)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('|===')) {
            blockObject.blockType = "Table (|===)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('....')) {
            blockObject.blockType = "Literal (....)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('****')) {
            blockObject.blockType = "Sidebar (****)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('____')) {
            blockObject.blockType = "Blockquote (____)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('""')) {
            blockObject.blockType = 'Airquote ("")'
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('++++')) {
            blockObject.blockType = "Passthrough (++++)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('--')) {
            blockObject.blockType = "Open (--)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('////')) {
            blockObject.blockType = "Comment (////)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        }

    });

    //Emit this function when the file is full read
    reader.on('end', function () {
        //Do more magic
        // ....
        //console.log(mainStack)
        if (mainStack[0] != null) {
            mainStack.forEach((item) => {
                console.log("[" + somethingWrong + "]" + " The " + item.blockType + " block on line: " + item.onLineNumber + " is not closed!")
            })
        } else {
            console.log("[" + allGood + "]" + " All Blocks are properly closed!")
        }
    });

    //Emit this function when an error occurs
    reader.on('error', function (error) {
        //Do some stuff with the error
        // ....
    });

    //Start reading the file
    reader.read();



}