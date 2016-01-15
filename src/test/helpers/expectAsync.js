// Allows the use of chai assertions inside an async block
function expectAsync(fn, done) {
  try {
    fn();
    done()
  }
  catch (e) {
    done(e);
  }
}

export default expectAsync;
