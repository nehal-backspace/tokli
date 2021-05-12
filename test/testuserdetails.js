const testUSerDetails = artifacts.require('UserDetails');

contract('Description of contract', () => {

    let contract_instance = null;

    before(async () => {
        contract_instance = await testUSerDetails.deployed();
    });

    it('should resgister user', async () => {

        await contract_instance.register("nehal", "pass", "pub", "pri");

        const result = await contract_instance.user(0);

        assert(result[0].toNumber() === 1);
        assert(result[1] === "nehal");
        assert(result[2] === "pass");
        assert(result[3] === "pub");
        assert(result[4] === "pri");
        assert(result[5].toNumber() === 18);
    })

    it('should authenticate user ', async () => {

        const result = await contract_instance.auth("nehal", "pass")
        const result2 = await contract_instance.auth("jitu", "pass")

        assert(result === true);
        assert(result2 === false);
    })


});