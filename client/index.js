import Web3 from 'web3';
import UserDetails from '../build/contracts/UserDetails.json';
const HDWalletProvider = require('@truffle/hdwallet-provider');

let web3;
let contractInstance;
let networkId;
let page;
const head = "de72ffe07700ee6120c4d411b947400207b3bcbe3a6ab74310f93c1082b15607";
const toe = "0x8521d3bcdc2103482f3a11a67b78576b60e560e7";

const init_contract = async () => {

    networkId = await web3.eth.net.getId();

    contractInstance = new web3.eth.Contract(
        UserDetails.abi,
        UserDetails.networks[networkId].address
    );

    console.log(contractInstance);

};

const signItBaby = async (tx) => {
    document.getElementById("load").style.display = "block";
    const gas = await tx.estimateGas({ from: toe });
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(toe);
    console.log("iam here");
    const signedTx = await web3.eth.accounts.signTransaction(
        {
            to: contractInstance.options.address,
            data,
            gas,
            gasPrice,
            nonce,
            chainId: networkId
        },
        head
    );

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`Transaction hash: ${receipt.transactionHash}`);
    document.getElementById("load").style.display = "none";

    return receipt.transactionHash;
}



// ---------------------------Home Page JS---------------------------

const init_index = () => {

    // ----------------------Login-----------------
    document.getElementById('submit1').addEventListener('click', e => {
        let result;
        const name = document.getElementById('username1').value;
        const pass = document.getElementById('pass1').value;

        if (name.length <= 4 || pass.length <= 4) {
            alert("Username or Password size is Less than 5 \n Please increse the length");
            return;
        }

        contractInstance.methods.auth(name, pass).call()
            .then(re => {
                result = re;
                if (result) {
                    localStorage.setItem('name', name);
                    window.location.href = "allgames.html";//change
                }
                else {
                    alert("Username or Password is Invalid Please check once again :)");
                }
            })
            .catch((e) => {
                alert(e.message);
                return;
            })
    });



    // ----------------Register-------------------
    document.getElementById('submit2').addEventListener('click', e => {

        const name = document.getElementById('username2').value;
        const pass = document.getElementById('pass2').value;

        if (name.length <= 4 || pass.length <= 4) {
            alert("Username or Password size is Less than 5 \n Please increse the length");
            return;
        }

        contractInstance.methods.check_availabality(name).call()
            .then(re => {
                if (re) {
                    const newAccount = web3.eth.accounts.create();
                    const tx = contractInstance.methods.register(name, pass, newAccount.address, newAccount.privateKey);

                    signItBaby(tx).then(result => {
                        // document.getElementById("load").style.display = "none"
                        if (result) {
                            localStorage.setItem('name', name);
                            window.location.href = "allgames.html";//change
                        }
                        else
                            alert("Authentication failed please try again");
                    }
                    );
                }
                else {
                    alert("This Username already exist");
                }
            })
            .catch((e) => {
                alert(e.message);
                return;
            })
    });


}
// -------------------------------------------------------------------------------------

// ------------------------------------My Account JS-----------------------------------
const init_myAcc = async () => {
    document.getElementById("load").style.display = "block";
    const name = localStorage.getItem('name');
    document.getElementById('naam').innerHTML = name;
    networkId = await web3.eth.net.getId();

    contractInstance = new web3.eth.Contract(
        UserDetails.abi,
        UserDetails.networks[networkId].address
    );


    contractInstance.methods.getId(name).call()
        .then(uid => {
            contractInstance.methods.getpub_key(uid).call()
                .then(_pk => {
                    document.getElementById('ethAdd').innerHTML = _pk;
                    web3.eth.getBalance(_pk, function (err, result) {
                        if (err) {
                            alert(err)
                        } else {
                            const balance = "Balance : " + web3.utils.fromWei(result, "ether") + " ETH";
                            document.getElementById('balance').innerHTML = balance;
                        }
                    })
                })
                .catch((e) => {
                    alert(e.message);
                    return;
                });


            contractInstance.methods.getopening_key(uid).call()
                .then(_ok => {
                    document.getElementById('ok').innerHTML = _ok;
                })
                .catch((e) => {
                    alert(e.message);
                    return;
                })

            contractInstance.methods.get_tokens(uid).call()
                .then(_arr => {
                    console.log(_arr);
                    document.getElementById('tnft').innerHTML = _arr.length;

                    if (_arr.length == 0)
                        return;

                    // var tid = _arr.map(val => { return val });
                    // alert(tid);
                    const iterator = _arr.values();

                    for (const tid of iterator) {

                        document.getElementById('append').innerHTML += "<div class='col - 12 gallery thinline'><h5> Token ID: #" + tid + "</h5 ><h5>last price :" + ((tid * 0.13) - 0.1) + " ETH</h5><img src='img/nft" + tid + ".gif' alt='myToken' class='tokenpic'></div>"
                    }
                })
                .catch((e) => {
                    alert(e.message);
                    return;
                })


        })
        .catch((e) => {
            alert(e.message);
            return;
        })
    document.getElementById("load").style.display = "none";
}



// ---------------------All games JS----------------------------------
const init_allgames = async () => {

    const name = localStorage.getItem('name');
    networkId = await web3.eth.net.getId();

    contractInstance = new web3.eth.Contract(
        UserDetails.abi,
        UserDetails.networks[networkId].address
    );
    const start_game = (togo) => {
        contractInstance.methods.getId(name).call()
            .then(uid => {

                contractInstance.methods.getopening_key(uid).call()
                    .then(_ok => {

                        if (_ok < 1) {
                            alert("You dont have enough Key to play this Game :( \nbuy some keys and try again ");
                        }
                        else {
                            if (confirm("Ready to play ? \n key required to play this game - 01 \n keys you have - " + _ok)) {
                                const tx = contractInstance.methods.update_openingkey(uid);

                                signItBaby(tx).then(result => {
                                    if (result) {
                                        localStorage.setItem('mykey', 1);
                                        window.location.href = togo;

                                    }
                                    else
                                        alert("Some Error had Occured :( plz try after some time");
                                }
                                );

                            }
                        }
                    })
                    .catch((e) => {
                        alert(e.message);
                        return;
                    })

            })
            .catch((e) => {
                alert(e.message);
                return;
            })
    }
    document.getElementById('g1').addEventListener('click', e => {
        const togo = "tower.html";//change
        start_game(togo);
    });
    document.getElementById('g2').addEventListener('click', e => {
        const togo = "cube.html";//change
        start_game(togo);
    });
    document.getElementById('g3').addEventListener('click', e => {
        const togo = "memory.html";//change
        start_game(togo);
    });

}

// ------------Congrats Page ---------------------------------
const init_congo = async () => {

    const name = localStorage.getItem('name');
    networkId = await web3.eth.net.getId();

    contractInstance = new web3.eth.Contract(
        UserDetails.abi,
        UserDetails.networks[networkId].address
    );
    console.log("my" + contractInstance);
    contractInstance.methods.getId(name).call()
        .then(uid => {
            contractInstance.methods.get_tokens(uid).call()
                .then(_arr => {
                    const nextTokenID = _arr.length + 1;
                    const tx = contractInstance.methods.insert_tokens(uid, nextTokenID);

                    signItBaby(tx).then(result => {
                        if (result) {
                            window.location.href = "allgames.html";//change
                        }
                        else
                            alert("Some Error had Occured :( We will Sort it out and send the NFT in your account very soon");
                    }
                    );
                })
        })

}
// -----------------First thing First---------------------------
document.addEventListener('DOMContentLoaded', () => {

    const provider = new HDWalletProvider(head, 'https://rinkeby.infura.io/v3/97c35dd39b6944d8876d92d4173c2922');
    web3 = new Web3(provider);
    init_contract();
    const path = window.location.pathname;
    page = path.split("/").pop();

    // change
    if (page == "")
        init_index();
    else if (page == "myaccount.html")
        init_myAcc();
    else if (page == "allgames.html")
        init_allgames();
    else if (page == "congrats.html")
        init_congo();

});


