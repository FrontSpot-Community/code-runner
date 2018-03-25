const express = require('express');
const Joi = require('joi');

const runnerTypes = require('../config/runnerTypes');
const dockerRunner = require('../runner/dockerRunner');
const OutputParser = require('../runner/outputParser');

const router = express.Router();
const outputParser = new OutputParser();

router
  .get('/runner', (req, res, next) => {
    res.send('use post to perform a run')
  })
  .post('/runner', (req, res, next) => {
    const requestData = req.body;

    const scheme = Joi.object().keys({
      runner: Joi.string().valid(Object.keys(runnerTypes)).required(),
      language: Joi.string().valid(Object.values(runnerTypes).map(i => i.language)).required(),
      code: Joi.string().required(),
      fixture: Joi.string().required(),
      testFramework: Joi.string().required()
    });

    const { error, value } = Joi.validate(requestData, scheme, { stripUnknown: true })

    if (error) return next(error);

    const { runner, ...task } = value;

    const runnerConfig = runnerTypes[runner];

    dockerRunner
      .executeTestOnContainer(runnerConfig.containerName, task)
      .then((result) => {
        const { output, error } = result;
        const jsonOutput = outputParser.format(output);

        const status = error ? 'error' : 'completed';

        res.send({
          ...jsonOutput,
          status,
          executionError: error
        });
      })
      .catch((err) => {
        next(err);
        console.log(err);
      });
  });

module.exports = router;
