var RSession = function(URLToOpenCPUServer) {
  this._openCPUConnection = new OpenCPUConnection(URLToOpenCPUServer);
  this._datasetSession = undefined;
};

RSession.prototype.loadDataset = function(csvFilePath, callback) {
  self = this;
  this._openCPUConnection.execute(
    "/library/regressionCube/R",
    'load_dataset',
  {"csv_filepath": csvFilePath},
  function(session){
    self._datasetSession = session;
    if (callback != undefined) callback(session);
  },
  function(req) {
    console.error("Error: " + req.responseText);
  });
};

RSession.prototype.calculateRSquaredValues = function(session, callback) {
  self = this;
  this._openCPUConnection.execute(
    "/library/regressionCube/R",
    'r_squared_matrix',
  {"data": session, "dependent": "gender"},
  function(_session){
    self._rSquaredSession = _session;
    if (callback != undefined) callback(_session);
  },
  function(req) {
    console.error("Error: " + req.responseText);
  });
}
