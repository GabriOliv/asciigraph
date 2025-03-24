
const express = require('express');
const app = express();



app.get('/gen.svg', (req, res) => {

	try {
		// Validation
		// console.log('Received query params:', req.query);
		const numbers = req.query.n ? req.query.n.split(',').map(Number) : [];

		// - [x] only numbers
		if (numbers.some(num => isNaN(num))) {
			return res.status(400).send('Error: Only numbers are allowed as parameter.');
		}

		// - [x] limit number for 0 - 999
		if (numbers.some(num => num < 0 || num > 999)) {
			return res.status(400).send('Error: Numbers must be between 0 and 999.');
		}
		
		// - [x] length of numbers 2 - 100
		if (numbers.length < 2 || numbers.length > 100) {
			return res.status(400).send('Error: Limit is between 2 and 100 numbers.');
		}

		const [intervals, indexes] = createGraphLogic(numbers);

		const graphText = transposeText(createGraphText(intervals, indexes));

		let svgContent = [];
		svgContent.push('<svg version="1.1" baseProfile="basic" xmlns="http://www.w3.org/2000/svg" ');
		svgContent.push('height="200" ');
		svgContent.push(`width="${68 + (indexes.length * 7.890)}">`);

		graphText.split('\n').forEach((line, index) => {
			line = line.replace(/ /g, '&#160;'); // Replace spaces with non-breaking spaces
			svgContent.push(`<text x="05" y="${(index + 1) * 15}" font-family="monospace">${line}</text>`);
		});

		svgContent.push('Sorry, your browser does not support inline SVG.');
		svgContent.push('</svg>');
		svgContent = svgContent.join('\n');

		// Set the content type to SVG and send the response
		res.setHeader('Content-Type', 'image/svg+xml');
		res.send(svgContent);

	} catch (error) {
		res.status(500).send('Internal Server Error');
	}
});



app.get('/gen.txt', (req, res) => {

	try {
		// Validation
		// console.log('Received query params:', req.query);
		const numbers = req.query.n ? req.query.n.split(',').map(Number) : [];

		// - [x] only numbers
		if (numbers.some(num => isNaN(num))) {
			return res.status(400).send('Error: Only numbers are allowed as parameter.');
		}

		// - [x] limit number for 0 - 999
		if (numbers.some(num => num < 0 || num > 999)) {
			return res.status(400).send('Error: Numbers must be between 0 and 999.');
		}
		
		// - [x] length of numbers 2 - 100
		if (numbers.length < 2 || numbers.length > 100) {
			return res.status(400).send('Error: Limit is between 2 and 100 numbers.');
		}

		const [intervals, indexes] = createGraphLogic(numbers);

		// draw the ascii graph
		const graphTransposedDraw = createGraphText(intervals,indexes);

		let graphDraw = transposeText(graphTransposedDraw);

		// Set the content type to TEXT and send the response
		res.set('Content-Type', 'text/plain');
		// res.send(originalText);
		res.send(graphDraw);

	} catch (error) {
		res.status(500).send('Internal Server Error');
	}
});



function createGraphLogic(numbers) {

	// console.log('Received query params:', req.query);

	// Min Limit
		// console.log('\nMin Limit');

		// find the minimum number
		const minNumber = Math.min(...numbers);
		// console.log('Minimum number:', minNumber);

		// find the first multiple of 10 number before min number
		let newMinNumber = Math.floor(minNumber / 10) * 10;
		// console.log('Previous multiple of 10:', newMinNumber);

	// Max Limit
		// console.log('\nMax Limit');

		// find the maximum number
		const maxNumber = Math.max(...numbers);
		// console.log('Maximum number:', maxNumber);

		// find the first multiple of 10 number after max number
		let newMaxNumber = Math.ceil(maxNumber / 10) * 10;
		// console.log('Next multiple of 10:', newMaxNumber);

	// Intervals
		// console.log('\nIntervals');

		// array intervals
		// fill between min and max, 11 numbers on equal intervals
		// given: 0,100
		// result: 0,10,20,30,40,50,60,70,80,90,100
		// given: 0,10
		// result: 0,1,2,3,4,5,6,7,8,9,10
		const intervals = [];
		for (let i = newMinNumber; i <= newMaxNumber; i += (newMaxNumber - newMinNumber) / 10) {
			intervals.push(i);
		}

		// console.log('Intervals:', intervals);

	// Values

		// for each number in the parameter, find the closest interval, and create an array of numbers
		const values = [];
		for (let i = 0; i < numbers.length; i++) {
			let closestInterval = intervals[0];
			let closestDiff = Math.abs(numbers[i] - closestInterval);
			for (let j = 1; j < intervals.length; j++) {
				const diff = Math.abs(numbers[i] - intervals[j]);
				if (diff < closestDiff) {
					closestDiff = diff;
					closestInterval = intervals[j];
				}
			}
			values.push(closestInterval);
		}

	// Translate values to indexes
	// Example:
	// values: [ 20, 20, 20, 28, 28, 100 ]
	// index:  [ 00, 00, 00, 01, 01, 10 ]
	const indexes = [];
	for (let i = 0; i < values.length; i++) {
		let index = intervals.indexOf(values[i]);
		if (index === -1) {
			// If the value is not found in the intervals, find the closest one
			let closestInterval = intervals[0];
			let closestDiff = Math.abs(values[i] - closestInterval);
			for (let j = 1; j < intervals.length; j++) {
				const diff = Math.abs(values[i] - intervals[j]);
				if (diff < closestDiff) {
					closestDiff = diff;
					closestInterval = intervals[j];
				}
			}
			index = intervals.indexOf(closestInterval);
		}
		indexes.push(index);
	}
	
	// Print the results
	// console.log('\nValues for drawing:');

	// console.log('    Params:', numbers.map(num => num.toString().padStart(3, ' ')));
	// console.log('New Values:', values.map(num => num.toString().padStart(3, ' ')));
	// console.log('   Indexes:', indexes.map(num => num.toString().padStart(3, ' ')));

	// console.log('    Params:', numbers);
	// console.log('New Values:', values);
	// console.log('   Indexes:', indexes);

	return [intervals, indexes];
}



function createGraphText(intervals,indexes) {

	const numberdigitsize = 3
	const limitY = indexes.length
	let firstIndex = indexes[0]
	let lastIndex = indexes[limitY - 1]
	let graph = '';

	// Invert the array
	intervals.reverse();

	// Legend of Y axis

		// box: left side
		graph += '┌|||||||||||└\n';

		let arrayPrintableNumbers = [];
		intervals.forEach((item) => {
			arrayPrintableNumbers.push(item.toString().padStart(numberdigitsize, ' '));
		})

		// Numbers of scale
		for (let i = 0; i < numberdigitsize; i++) {
			// box: superior side
			graph += '─';
			// add numbers of intervals (digit by digit)
			arrayPrintableNumbers.forEach((item) => {
				graph += item[i];
			});
			// box: inferior side
			graph += '─\n';
		}

		// box: right side of the scale
		graph += '─-----------─\n';
		graph += '─           ─\n';

		// box: graph left side
		graph += '┬';
		graph += '┤'.repeat(10 - firstIndex);
		graph += '┼';
		graph += '┤'.repeat(firstIndex);
		graph += '┴\n';
	
	// Points on graph

		// Draw points on the graph
		for (let i = 0; i < limitY; i++) {

			// box: superior side
			graph += '─';

			// line: next connection is bigger
				// is not the last point
				if (i < limitY -1){
					// next one is bigger
					if (indexes[i] < indexes[i+1]) {
						graph += ' '.repeat(10 - indexes[i+1]);
						graph += '┌';
						graph += '|'.repeat(indexes[i+1] - indexes[i]-1);
					// next one is smaller
					} else if (indexes[i] > indexes[i+1]) {
						graph += ' '.repeat(10 - indexes[i]);
						graph += '┐';
						graph += '|'.repeat(indexes[i] - indexes[i+1]-1);
					// next one is equal
					} else {
						graph += ' '.repeat(10 - indexes[i]);
					}
				// last point
				} else {
					graph += ' '.repeat(10 - indexes[i]);
				}

			// line: orientation of the point (up or down)
				// is not the last point
				if (indexes[i+1] !== undefined) {
					if (indexes[i] < indexes[i+1]) {
						// next one is bigger
						graph += '┘';
					} else if (indexes[i] > indexes[i+1]) {
						// if the next is smaller
						graph += '└';
					} else {
						// if the next is equal
						graph += '─';
					}
				} else {
					// end of the graph
					graph += '─';
				}

			// line: space between points and the X axis base
				// is not the last point
				if (i < limitY -1){
					// next one is bigger
					if (indexes[i] > indexes[i+1]) {
						graph += ' '.repeat(indexes[i+1]);
					// next one is smaller
					} else if (indexes[i] < indexes[i+1]) {
						graph += ' '.repeat(indexes[i]);
					// next one is equal
					} else {
						graph += ' '.repeat(indexes[i]);
					}
				// last point
				} else {
					graph += ' '.repeat(indexes[i]);
				}

			// box: inferior side
			graph += '─\n';
		}

	// box: graph right side
		graph += '┐';
		graph += '|'.repeat(10 - lastIndex);
		graph += '┤';
		graph += '|'.repeat(lastIndex);
		graph += '┘';

	return graph;
}



function transposeText(text) {
	const lines = text.split('\n'); // Split the input text into lines
	const maxLength = Math.max(...lines.map(line => line.length)); // Find the longest line length

	// Pad each line to the maximum length with spaces for alignment
	const paddedLines = lines.map(line => line.padEnd(maxLength, ' '));

	// Transpose the text by iterating column by column
	let transposed = '';
	for (let i = 0; i < maxLength; i++) {
		for (let j = 0; j < paddedLines.length; j++) {
			transposed += paddedLines[j][i] || ' '; // Add character or space
		}
		transposed += '\n'; // Add a newline at the end of each column
	}

	return transposed.trim(); // Return the transposed text without trailing spaces
}



app.use(function(req, res){
	res.status(404).send('Not Found');
});



app.listen(3000, () => console.log('Server running at http://localhost:3000'));
