const variableWithValue = /^\s*([\w\d<>$_]+) +([\w\d_]+)( += +(.*))/i;
const objectDefinition = /^\s*([\w\d<>$_]+) +([\w\d_]+)/i;
const indentCountRegex = /^(\t*)/i;
const arraySizeRegex = /^\s*.+\s+size += +(\d+)/;
const arrayIndexRegex = /^\s*\[(\d+)\]/;
const stringValueRegex = /^"(.*)"$/;

const indentCount = (line: string): number => (line.match(indentCountRegex)![0].split('\t').length - 1);
const getArrayIndex = (line: string): number => parseInt(line.match(arrayIndexRegex)![1], 10);

export interface ITK2DObject {
	[key: string]: string | number | ITK2DObject | TK2DArray;
}

export type TK2DArray = Array<ITK2DObject | TK2DArray>;
type ParseResult<T> = {
	lastLineNumber: number;
	parsed: T;
};

function parseArray(
	lines: string[], lineNumber: number, currentIndentCount: number, size: number
): ParseResult<TK2DArray> {
	const res: TK2DArray = [];

	if (size === 0) {
		return {
			lastLineNumber: lineNumber,
			parsed: res,
		};
	}

	let lineNum = lineNumber;
	let arrayIndex: number;

	do {
		arrayIndex = getArrayIndex(lines[lineNum]);

		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		const aRes = parseObject(lines, ++lineNum, currentIndentCount);
		res.push(aRes.parsed);
		lineNum = aRes.lastLineNumber;
	} while (arrayIndex !== size - 1);

	return {
		lastLineNumber: lineNum,
		parsed: res,
	};
}

function parseObject(lines: string[], lineNumber: number, currentIndentCount: number): ParseResult<ITK2DObject> {
	const res: ITK2DObject = {};

	let lineNum = lineNumber;

	while (!!lines[lineNum] && indentCount(lines[lineNum]) >= currentIndentCount) {
		const line = lines[lineNum];

		if (line.match(arrayIndexRegex)) {
			break;
		}

		const variableRes = line.match(variableWithValue);

		if (variableRes) {
			let value = variableRes[4];

			const isString = value.match(stringValueRegex);

			// eslint-disable-next-line prefer-destructuring
			if (isString) value = isString[1];

			res[variableRes[2]] = value;
			++lineNum;
			continue;
		}

		const objectRes = line.match(objectDefinition);

		if (objectRes) {
			const name = objectRes[2];
			const type = objectRes[1];

			const aRes = (
				type === 'Array'
					? parseArray(
						lines, lineNum + 2, currentIndentCount + 1,
						parseInt(lines[lineNum + 1].match(arraySizeRegex)![1], 10)
					)
					: parseObject(lines, lineNum + 1, currentIndentCount + 1)
			);

			lineNum = aRes.lastLineNumber;
			res[name] = aRes.parsed;

			continue;
		}

		lineNum++;
	}

	return {
		lastLineNumber: lineNum,
		parsed: res,
	};
}

export default function parseTK2D(input: string): ITK2DObject {
	return parseObject(input.split('\n').filter(l => !!l), 0, 0).parsed;
}
