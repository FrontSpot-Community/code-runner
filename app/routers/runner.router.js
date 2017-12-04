const express = require('express');
const Joi = require('joi');

const runnerTypes = require('../config/runnerTypes');
const dockerRunner = require('../runner/dockerRunner');

const router = express.Router();

router
  .get('/runner', (req, res, next) => {
    res.send('use post to perform a run')
  })
  .post('/runner', (req, res, next) => {
    const requestData = req.body;

    const { NODE } = runnerTypes;

    const scheme = Joi.object().keys({
      runner: Joi.string().valid(Object.keys(runnerTypes)).required(),
      language: Joi.string().valid(NODE.language).required(),
      code: Joi.string().required(),
      fixture: Joi.string().required(),
      testFramework: Joi.string().required()
    });

    const { error, value } = Joi.validate(requestData, scheme, { stripUnknown: true })

    if (error) next(error);

    const { runner, ...task } = value;

    const runnerConfig = runnerTypes[runner];

    dockerRunner
      .executeTestOnContainer(runnerConfig.containerName, task)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        next(err);
        console.log(err);
      });
  });

module.exports = router;
