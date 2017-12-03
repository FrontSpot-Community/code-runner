const { executeTestOnContainer } = require('../app/runner/dockerRunner');

const task = {
  language: 'javascript',
  code: 'var a = 1;',
  fixture: 'Test.assertEquals(a, 1)',
  testFramework: 'cw'
};

executeTestOnContainer('code-runner-node', task)
  .then(result => console.log(result));