const commands = {
  suite: '<DESCRIBE::>',
  test: '<IT::>',
  passed: '<PASSED::>',
  failed: '<FAILED::>',
  error: '<ERROR::>',
  time: '<COMPLETEDIN::>'
};

class OutputParser {
  format(output) {
    const parsedOutput = this.parse(output);
    const statistics = this.getStatistics(parsedOutput);
    let combinedOutput;
    try {
      combinedOutput = this.combineOutput(parsedOutput);
    }
    catch(err) {
      console.log(`Cobined output parsing issue: ${err}`);
    }

    return {
      statistics,
      json: combinedOutput || parsedOutput,
      output
    };
  }

  parse(output) {
    const lines = output.split('\n');

    return lines.map(line => {
      const key = Object.keys(commands).find(commandKey => line.startsWith(commands[commandKey]));
      if (!key) return null;
      return {
        name: key,
        value: line.replace(commands[key], '')
      }
    }).filter(Boolean)
  }

  combineOutput(parsedOutput) {
    let suiteIndex = -1;
    let testIndex = 0;

    return parsedOutput.reduce((accum, item) => {
      switch(item.name) {
        case 'suite':
          suiteIndex = suiteIndex + 1;
          accum[suiteIndex] = {
            name: item.value,
            tests: []
          }
          break;
        case 'test':
          if (suiteIndex === -1) {
            suiteIndex = 0;
            accum[suiteIndex] = {
              name: 'No description',
              tests: []
            }
          }

          accum[suiteIndex].tests[testIndex] = {
            name: item.value,
            status: 'unknown'
          };
          break;
        case 'passed':
          accum[suiteIndex].tests[testIndex].status = 'passed'
          break;
        case 'failed':
          accum[suiteIndex].tests[testIndex].status = 'failed'
          break;
        case 'error':
          accum[suiteIndex].tests[testIndex].status = 'error'
          break;
        default:
          break;
      }
      return accum;
    }, [])
  }

  getStatistics(parsedOutput) {
    const initial = {
      describe: 0,
      test: 0,
      passed: 0,
      failed: 0,
      error: 0
    };

    return parsedOutput.reduce((accum, item) => {
      if (accum[item.name] === undefined) return accum;

      return {
        ...accum,
        [item.name]: accum[item.name] + 1
      };
    }, initial)
  }
}

module.exports = OutputParser;