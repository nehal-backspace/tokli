const Userdetails = artifacts.require("UserDetails");

module.exports = function (deployer) {
    deployer.deploy(Userdetails);
};
