const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];

module.exports = {
  basePath: repo ? `/${repo}` : "",
};
