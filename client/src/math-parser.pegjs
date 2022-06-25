/* entry point */
entry = 
	_ res: expression _
	{
		return {
			type: "root",
			parseType: "root",
			children: res.flat()
		}
	}

expression =
	terms: (binaryOperation / term)+
	{
		return terms
	}

binaryOperation = 
	_ left: term _ operator: operator _ right: expression _
	{
		let children = [left.flat(), operator, right.flat()]
		children = children.flat()

		return {
			type: "mrow",
			parseType: "binary-operation-row",
			children: children
		}
	}

fraction = 
	"\\frac" _ "{" _ numerator: expression _ "}" _ "{" _ denominator: expression _ "}"
	{
		const numeratorRow = {
			type: "mrow",
			parseType: "fraction-numerator-row",
			children: numerator.flat()
		}

		const denominatorRow = {
			type: "mrow",
			parseType: "fraction-denominator-row",
			children: denominator.flat()
		}

		return {
			type: "mfrac",
			parseType: "fraction",
			children: [numeratorRow, denominatorRow]
		}	
	}

function = 
	"\\func" _ "{" _ name: [a-zA-Z]+ _ "}" _ "{" _ args: expression _ "}"
	{
		const functionName = {
			type: "mi",
			parseType: "function-name",
			children: [{
				type: "string",
				parseType: "content",
				content: name.join(""),
				children: []
			}]
		}

		const functionArgument = {
			type: "mrow",
			parseType: "function-argument",
			children: args.flat()
		}

		return {
			type: "mrow",
			parseType: "function",
			children: [functionName, functionArgument]
		}	
	}

rowVector =
	"\\rvec" + components: vectorComponent+
	{
		const children = []
		components.forEach(component => {
			children.push({
				type: "mtd",
				parseType: "row-vector-mtd",
				children: component
			})
		})
		
		return {
			type: "mrow",
			parseType: "row-vector",
			children: [
				{
					type: "mo",
					parseType: "row-vector-bracket",
					children: [{
						type: "string",
						parseType: "content",
						content: "[",
						children: []
					}]
				},
				{
					type: "mtable",
					parseType: "row-vector-table",
					children: [{
							type: "mtr",
							parseType: "row-vector-table-row",
							children: children.flat()
						}]
				},
				{
					type: "mo",
					parseType: "row-vector-bracket",
					children: [{
						type: "string",
						parseType: "content",
						content: "]",
						children: []
					}]
				},
			]
		}
	}

columnVector =
	"\\cvec" + components: vectorComponent+
	{
		const children = []
		components.forEach(component => {
			children.push(
				{
					type: "mtr",
					parseType: "col-vector-mtd",
					children: [
						{
							type: "mtd",
							parseType: "col-vector-mtd",
							children: component
						}
					]
				}
			)
		})
		
		return {
			type: "mrow",
			parseType: "col-vector",
			children: [
				{
					type: "mo",
					parseType: "col-vector-bracket",
					children: [{
						type: "string",
						parseType: "content",
						content: "[",
						children: []
					}]
				},
				{
					type: "mtable",
					parseType: "col-vector-table",
					children: children.flat()
				},
				{
					type: "mo",
					parseType: "col-vector-bracket",
					children: [{
						type: "string",
						parseType: "content",
						content: "]",
						children: []
					}]
				},
			]
		}
	}

vectorComponent = 
	_ "{" _ exp: expression _ "}" _
	{
		return exp.flat()
	}


term = 
	factors: factor+
	{
		return factors
	}


factor =
	group / function / fraction / rowVector / columnVector / variable / number

group =
(
	"\\props{" _ props: propList _ "}" _ "{" _ exp: expression _ "}"
	{
		return {
			type: "mrow",
			parseType: "prop-container",
			props: props,
			children: exp.flat()
		}
	}
) /
(
	"(" _ exp: expression _ ")"
	{
		const leftBracket = {
			type: "mo",
			parseType: "operator",
			children: [
				{
					type: "string",
					parseType: "content",
					content: "(",
					children: []
				}
			]
		}

		const rightBracket = {
			type: "mo",
			parseType: "operator",
			children: [
				{
					type: "string",
					parseType: "content",
					content: ")",
					children: []
				}
			]
		}

		return {
			type: "mrow",
			parseType: "group-container",
			children: [leftBracket, exp.flat(), rightBracket].flat()
		}
	}
) /
(
	"|" _ exp: expression _ "|"
	{
		const leftBracket = {
			type: "mo",
			parseType: "operator",
			children: [
				{
					type: "string",
					parseType: "content",
					content: "|",
					children: []
				}
			]
		}

		const rightBracket = {
			type: "mo",
			parseType: "operator",
			children: [
				{
					type: "string",
					parseType: "content",
					content: "|",
					children: []
				}
			]
		}

		return {
			type: "mrow",
			parseType: "group-container",
			children: [leftBracket, exp.flat(), rightBracket].flat()
		}
	}
) /
(
	"{" _ exp: expression _ "}"
	{
		const leftBracket = {
			type: "mo",
			parseType: "operator",
			children: [
				{
					type: "string",
					parseType: "content",
					content: "{",
					children: []
				}
			]
		}

		const rightBracket = {
			type: "mo",
			parseType: "operator",
			children: [
				{
					type: "string",
					parseType: "content",
					content: "}",
					children: []
				}
			]
		}

		return {
			type: "mrow",
			parseType: "group-container",
			children: [leftBracket, exp.flat(), rightBracket].flat()
		}
	}
)




/* primitives */
number =
	float / integer 

float =
	first: [0-9]+ '.' second: [0-9]+ 
	{
		const value = first + "." + second
		return {
			type: "mn",
			parseType: "number",
			children: [
				{
					type: "string",
					parseType: "content",
					content: value,
					children: []
				}
			]
		}
	}


integer = 
	digits: [0-9]+ 
	{	
		const value = digits.join("")
		return {
			type: "mn",
			parseType: "number",
			children: [
				{
					type: "string",
					parseType: "content",
					content: value,
					children: []
				}
			]
		}
	}


variable =
	symbol: [a-zA-Z]
	{
		const value = symbol
		return {
			type: "mi",
			parseType: "variable",
			children: [
				{
					type: "string",
					parseType: "content",
					content: value,
					children: []
				}
			]
		}
	}

operator = 
(
	_ operator: ("+" / "-" / "*" / "/" / "=" / ",") _
	{
		return {
			type: "mo",
			parseType: "operator",
			children: [
				{
					type: "string",
					parseType: "content",
					content: operator,
					children: []
				}
			]
		}
	}
) /
(
	_ "\\props{" _ props: propList _ "}" _ "{" _ operator: ("+" / "-" / "*" / "/" / "=" / ",") _ "}" _
	{
		return {
			type: "mrow",
			props: props,
			parseType: "prop-container",
			children: [{
				type: "mo",
				parseType: "operator",
				children: [
					{
						type: "string",
						parseType: "content",
						content: operator,
						children: []
					}
				]
			}]
		}
	}
) 


propList = 
	props: prop+
	{
		return props
	}

prop = 
	name: [a-zA-Z0-9\.\-\_\/]+ _ ":" _ "\"" value: [a-zA-Z0-9\.\-\_\/]+ "\"" _ ","? _
	{
		return {
			name: name.join(""),
			value: value.join("")
		}
	}

/* white space */
_ "whitespace"
  = [ \t\n\r]*

