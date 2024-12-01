const environment = process.env.REACT_APP_STAGE || 'development';

let awsmobile;

if (environment === 'production') {
  awsmobile = require('./aws-exports.prod').default;
} else {
  awsmobile = require('./aws-exports.dev').default;
}

console.log(`Environment: ${environment}`);
console.log('AWS Config:', awsmobile);

export default awsmobile;
