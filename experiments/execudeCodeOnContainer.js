const { executeTestOnContainer } = require('../app/runner/dockerRunner');

const task = {
  language: 'javascript',
  languageVersion: '8.x/babel',
  code: "const React = require('react'); const a = <h1>Hello, world</h1>;",
  fixture: "Test.assertEquals(a.props.children, 'Hello, world')",
  testFramework: 'cw'
};

executeTestOnContainer('code-runner-node', task).then(result =>
  console.log(result)
);
