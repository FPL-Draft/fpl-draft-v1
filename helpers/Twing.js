const { TwingEnvironment, TwingLoaderFilesystem } = require('twing');
let loader = new TwingLoaderFilesystem('./views');
let twing = new TwingEnvironment(loader);

module.exports = (res, target, arguments = {}) => {
  twing.render(`${target}.twig`, arguments)
    .then(output => res.end(output))
}