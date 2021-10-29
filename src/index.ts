import { runExample } from "./run-example";

const exampleNumber = process.argv[2];

if (!exampleNumber) {
    console.log('Run the first example with the following command:');
    console.log('npm start -- 1');
    console.log();
    console.log('There are 5 examples');
} else {
    runExample(exampleNumber)
        .then(result => {
            if (!result) {
                console.log('Available examples: 1 to 5');
            }
        });
}
