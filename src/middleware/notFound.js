module.exports = function notFound(req, res, next) {
  res.status(404).send("Not Found");
};
