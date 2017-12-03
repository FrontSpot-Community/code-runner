const Docker = require('dockerode');
const process = require('process');
const { PassThrough } = require('stream');

const dockerStatus = require('../config/dockerStatus');


const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

exports.checkCointaier = async (containerName) => {
  let nodeContainer = null;
  try {
    const containers = await docker.listContainers();

    containers.forEach((containerInfo) => {
      const isNodeRunner = containerInfo.Names.some((name) => {
        return name.includes(containerName);
      })

      if (isNodeRunner && (containerInfo.State === dockerStatus.RUNNING)) {
        nodeContainer = containerInfo;
      }
    });
  } catch(err) {
    console.log(`Err: ${err}`);
    throw(err);
  }

  return !!nodeContainer;
}

exports.runContainer = async (containerName) => {
  console.log('Container stopped. Try to run...');

  try {
    const container = docker.getContainer(containerName);

    container.start();

  } catch(err) {
    console.log(`Err: ${err}`);
    throw(err);
  }
}

exports.executeTestOnContainer = async (containerName, task, timeout=1000) => {
  console.log(containerName);
  try {
    const isContainerAvailable = await exports.checkCointaier(containerName);

    if (!isContainerAvailable) {
      exports.runContainer(containerName);
    }

    const container = docker.getContainer(containerName);

    const exec = await container.exec({
        Cmd: ['bash', '-c', `node run-json '${JSON.stringify(task)}'`],
        AttachStdout: true,
        AttachStderr: true
      });
    const execSession = await exec.start();

    const resultStream = new PassThrough();

    let output = '';
    resultStream.on('data', chunk => {
      output += chunk;
    });

    const result = new Promise((resolve, reject) => {
      resultStream.on('end', () => resolve(output));
    })

    // TODO:
    // It makes test run unflexible because it always executes timeout time
    // Rethink how to check that executing is finished
    setTimeout(() => {
      resultStream.destroy();
    }, timeout);

    container.modem.demuxStream(exec.output, resultStream, process.stderr);

    return result;
   }
  catch(err) {
    console.log(`Err: ${err}`);
    throw(err);
  }
}