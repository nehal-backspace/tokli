pragma solidity ^0.5.0;

contract UserDetails {
    struct User {
        uint256 uid;
        string username;
        string password;
        string public_add;
        string private_add;
        uint256 opening_keys;
    }
    mapping(string => uint256) public map;
    mapping(uint256 => uint256[]) public mytokes;
    User[] public user;
    uint256 nextId = 1;

    //----------------functions for new user------------
    function getId(string memory _username) public view returns (uint256) {
        return map[_username];
    }

    function check_availabality(string memory _username)
        public
        view
        returns (bool)
    {
        uint256 _id = map[_username];

        if (_id == 0) {
            return true;
        }

        return false;
    }

    function register(
        string memory _username,
        string memory _password,
        string memory _pubkey,
        string memory _prikey
    ) public {
        map[_username] = nextId;
        user.push(User(nextId, _username, _password, _pubkey, _prikey, 18));
        nextId++;
    }

    // -------------------functions for Authenticating EXISTING Users-----------
    function auth(string memory _username, string memory _password)
        public
        view
        returns (bool)
    {
        uint256 _id = map[_username];

        if (_id == 0) {
            return false;
        }
        _id--; //as array starts with 0;

        if (
            keccak256(bytes(user[_id].password)) == keccak256(bytes(_password))
        ) {
            return true;
        }

        return false;
    }

    // --------------------functions for website -----------------------------

    function getpub_key(uint256 _id) public view returns (string memory) {
        return (user[_id - 1].public_add);
    }

    function getpri_key(uint256 _id) public view returns (string memory) {
        return (user[_id - 1].private_add);
    }

    function getopening_key(uint256 _id) public view returns (uint256) {
        return (user[_id - 1].opening_keys);
    }

    function insert_tokens(uint256 _id, uint256 _tokenID) public {
        mytokes[_id].push(_tokenID);
    }

    function get_tokens(uint256 _id) public view returns (uint256[] memory) {
        return mytokes[_id];
    }

    function update_openingkey(uint256 _id) public {
        user[_id - 1].opening_keys--;
    }
}
