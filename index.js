var readl = require('readl-async')
var chalk = require('chalk');
var allGood = chalk.green('✓')
var somethingWrong = chalk.red('✖')

module.exports = function asciidocBlocksCheck(asciidoc) {

    var lineNumber, 
    //isClosed, 
    blockObject, 
    mainStack

    //Initialize the reader object 
    var reader = new readl(asciidoc, {
        encoding: 'utf8',
        emptyLines: 'true'
    })

    lineNumber = 0
    //isClosed = true
    blockObject = {}
    mainStack = []
    ifdefstack= []

    function validateValues(obj) {
        //using a seperate stack for ifdef blocks
        if (obj.blockType == 'ifdef (ifdef::)' || obj.blockType == 'endif (endif::)') {
            if (ifdefstack[0] != null) {
                var lastElement = ifdefstack[ifdefstack.length - 1]
                
                // we are ony dealing with two items therefore its okay to say
                // if they dont match just add it to the stack
                if (lastElement.blockType == obj.blockType) {
                    //console.log("CHKBLOCK: ", lastElement.blockType)
                    //console.log("OBJBLOCK: ", obj.blockType)
                    //console.log("Its a Match, keeping it.")
                    ifdefstack.push(obj)
                    //console.log("ARRAY1: ", ifdefstack)
                } else {
                    ifdefstack.pop()
                    //console.log("No a Match, removing last element")
                    //console.log("ARRAY2: ", ifdefstack)
                }
            } else {
                //console.log("Array Empty, adding value")
                ifdefstack.push(obj)
            }
            
        } else
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

        if (line.includes('====') && line.length<6) {
            var isTitle = (/(====)\s\w+/ig).test(line)
            if (!isTitle) {
                blockObject.blockType = "Admonition (====)"
                blockObject.onLineNumber = lineNumber

                validateValues(blockObject)
            }
        } else

        if (line.includes('----') && line.length<=6) {
            //<=6 fixes instances where code block is inside a table cell `|----`
            blockObject.blockType = "Code (----)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('|===') && line.length<6) {
            blockObject.blockType = "Table (|===)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('....') && line.length<6) {
            blockObject.blockType = "Literal (....)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('****') && line.length<6) {
            blockObject.blockType = "Sidebar (****)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('____') && line.length<6) {
            blockObject.blockType = "Blockquote (____)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('""') && line.length<3) {
            blockObject.blockType = 'Airquote ("")'
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('++++') && line.length<6) {
            blockObject.blockType = "Passthrough (++++)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('--') && line.length<3) {
            blockObject.blockType = "Open (--)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('////') && line.length<6) {
            blockObject.blockType = "Comment (////)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('ifdef::')) {
            //ifdefs and endifs require different logic
            blockObject.blockType = "ifdef (ifdef::)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        } else

        if (line.includes('endif::')) {
            //ifdefs and endifs require different logic
            blockObject.blockType = "endif (endif::)"
            blockObject.onLineNumber = lineNumber

            validateValues(blockObject)
        }

    });

    //Emit this function when the file is full read
    reader.on('end', function () {
        //Do more magic
        // ....
        //console.log(mainStack)
        console.log('FILE: ', asciidoc)
        if (mainStack[0] != null) {
            mainStack.forEach((item) => {
                console.log("[" + somethingWrong + "]" + " The " + item.blockType + " block on line: " + item.onLineNumber + " is not closed!")
            })
        } else 
        if (ifdefstack[0] != null) {
            ifdefstack.forEach((item) => {
                console.log("[" + somethingWrong + "]" + " Not all " + item.blockType + " blocks are properly closed. Check the block on line: " + item.onLineNumber )
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