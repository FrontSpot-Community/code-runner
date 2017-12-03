function listen(err) {
    return err
        ? console.log(err)
        : console.log(`Server is running on port:${3003}`);
}

function errorHandler(err, req, res, next) {
    return res.status(err.status ? err.status : 500).json(err);
}

module.exports = {
    listen,
    errorHandler
};