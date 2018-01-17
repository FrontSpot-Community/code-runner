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
    let time;
    try {
      combinedOutput = this.combineOutput(parsedOutput);
      time = this.calculateTotalTime(combinedOutput);
    }
    catch(err) {
      console.log(`Cobined output parsing issue: ${err}`);
    }

    return {
      statistics: {
        ...statistics,
        time
      },
      json: combinedOutput || parsedOutput,
      output
    };
  }

  calculateTotalTime(combinedOutput) {
    return combinedOutput.reduce((acc, item) => {
      return acc + item.time;
    }, 0);
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
    let testIndex = -1;

    return parsedOutput.reduce((accum, item) => {
      switch(item.name) {
        case 'suite':
          suiteIndex++;
          testIndex = -1;
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

          testIndex++;
          accum[suiteIndex].tests[testIndex] = {
            name: item.value,
            status: 'unknown'
          };
          break;
        case 'passed':
        case 'failed':
        case 'error':
          accum[suiteIndex].tests[testIndex].status = item.name
          accum[suiteIndex].tests[testIndex].text = item.value
          break;
        case 'time':
          if (accum[suiteIndex].tests[testIndex].time) {
            accum[suiteIndex].time = item.value;
            break;
          }
          accum[suiteIndex].tests[testIndex].time = item.value
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