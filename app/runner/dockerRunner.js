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
  try {
    const isContainerAvailable = await exports.checkCointaier(containerName);

    if (!isContainerAvailable) {
      exports.runContainer(containerName);
    }

    const container = docker.getContainer(containerName);

    const exec = await container.exec({
      Cmd: ['node', 'run-json', JSON.stringify(task)],
      AttachStdout: true,
      AttachStderr: true
    });
    const stream = await exec.start();

    const resultStream = new PassThrough();
    const errorStream = new PassThrough();

    let output = '';
    resultStream.on('data', chunk => {
      output += chunk;
    });

    let error = null;
    errorStream.on('data', chunk => {
      error += chunk;
    });

    const result = new Promise((resolve, reject) => {
      stream.output.on('end', () => resolve({
        output,
        error
      }));
    })

    container.modem.demuxStream(stream.output, resultStream, errorStream);

    return result;
   }
  catch(err) {
    console.log(`Err: ${err}`);
    throw(err);
  }
}