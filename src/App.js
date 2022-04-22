/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { ethers, utils } from "ethers";
import Loader from "./Loader";
import abi from "./contract/Bank.json";
import { Modal } from "./Modal";

const App = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isBankerOwner, setIsBankerOwner] = useState(false);
  const [inputValue, setInputValue] = useState({
    withdraw: "",
    deposit: "",
    bankName: "",
  });
  const [bankOwnerAddress, setBankOwnerAddress] = useState(null);
  const [customerTotalBalance, setCustomerTotalBalance] = useState(null);
  const [currentBankName, setCurrentBankName] = useState(null);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [settingBankName, setSettingBankName] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalHeader, setModalHeader] = useState("");
  const [modalBody, setModalBody] = useState("");
  const [modalType, setModalType] = useState("error"); // could either be error or success

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const contractABI = abi.abi;

  const displayError = (errorHeader, errorBody = "An error occured") => {
    setModalType("error");
    setShowModal(true);
    setModalHeader(errorHeader);
    setModalBody(errorBody);
  };

  const displaySuccess = (
    header = "Transaction Success",
    body = "Your transaction was successful"
  ) => {
    setModalType("success");
    setShowModal(true);
    setModalHeader(header);
    setModalBody(body);
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        setIsWalletConnected(true);
        setCustomerAddress(account);
        console.log("Account Connected: ", account);
      } else {
        const errorBody = "Install Metamask to use our crypto bank...";
        displayError("Metamask not installed", errorBody);
      }
    } catch (error) {
      const errorBody =
        (error.error && formatContractError(error.error.message)) ||
        error.message ||
        "An error occured";
      displayError("Transaction Error", errorBody);
      console.log("check if wallet is connected error >>>>>>>>>>>>> ", error);
    }
  };

  const getBankName = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let bankName = await bankContract.bankName();
        bankName = utils.parseBytes32String(bankName);
        setCurrentBankName(bankName.toString());
      } else {
        const errorBody = "Install Metamask to use our crypto bank...";
        displayError("Metamask not installed", errorBody);
      }
    } catch (error) {
      const errorBody =
        (error.error && formatContractError(error.error.message)) ||
        error.message ||
        "An error occured";
      displayError("Transaction Error", errorBody);
      console.log("get bank name error >>>>>>>>>>>>> ", error);
    }
  };

  const setBankNameHandler = async (event) => {
    setSettingBankName(true);
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const txn = await bankContract.setBankName(
          utils.formatBytes32String(inputValue.bankName)
        );
        console.log("Setting Bank Name...");
        await txn.wait();
        console.log("Bank Name Changed", txn.hash);
        await getBankName();
        displaySuccess();
      } else {
        const errorBody = "Install Metamask to use our crypto bank...";
        displayError("Metamask not installed", errorBody);
      }
    } catch (error) {
      const errorBody =
        (error.error && formatContractError(error.error.message)) ||
        error.message ||
        "An error occured";
      displayError("Transaction Error", errorBody);
    } finally {
      setSettingBankName(false);
    }
  };

  const formatContractError = (errorMsg) => {
    return errorMsg.split(":")[1];
  };

  const getbankOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let owner = await bankContract.bankOwner();
        setBankOwnerAddress(owner);

        const [account] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsBankerOwner(true);
        }
      } else {
        const errorBody = "Install Metamask to use our crypto bank...";
        displayError("Metamask not installed", errorBody);
      }
    } catch (error) {
      const errorBody =
        (error.error && formatContractError(error.error.message)) ||
        error.message ||
        "An error occured";
      displayError("Transaction Error", errorBody);
      console.log("get bank owner handler error >>>>>>>>>>>>> ", error);
    }
  };

  const customerBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let balance = await bankContract.getCustomerBalance();
        setCustomerTotalBalance(utils.formatEther(balance));
        console.log("Retrieved balance...", balance);
      } else {
        const errorBody = "Install Metamask to use our crypto bank...";
        displayError("Metamask not installed", errorBody);
      }
    } catch (error) {
      const errorBody =
        (error.error && formatContractError(error.error.message)) ||
        error.message ||
        "An error occured";
      displayError("Transaction Error", errorBody);
      console.log("customer balance handler error >>>>>>>>>>>>> ", error);
    }
  };

  const deposityMoneyHandler = async (event) => {
    setDepositing(true);
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const txn = await bankContract.depositMoney({
          value: ethers.utils.parseEther(inputValue.deposit),
        });
        console.log("Deposting money...");
        await txn.wait();
        console.log("Deposited money...done", txn.hash);

        customerBalanceHandler();
        displaySuccess();
      } else {
        const errorBody = "Install Metamask to use our crypto bank...";
        displayError("Metamask not installed", errorBody);
      }
    } catch (error) {
      const errorBody =
        (error.error && formatContractError(error.error.message)) ||
        error.message ||
        "An error occured";
      displayError("Transaction Error", errorBody);
    } finally {
      setDepositing(false);
    }
  };

  const withDrawMoneyHandler = async (event) => {
    setWithdrawing(true);
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let myAddress = await signer.getAddress();
        console.log("provider signer...", myAddress);

        const txn = await bankContract.withdrawMoney(
          myAddress,
          ethers.utils.parseEther(inputValue.withdraw)
        );
        console.log("Withdrawing money...");
        await txn.wait();
        console.log("Money with drew...done", txn.hash);

        customerBalanceHandler();
        displaySuccess();
      } else {
        const errorBody = "Install Metamask to use our crypto bank...";
        displayError("Metamask not installed", errorBody);
      }
    } catch (error) {
      const errorBody =
        (error.error && formatContractError(error.error.message)) ||
        error.message ||
        "An error occured";
      displayError("Transaction Error", errorBody);
    } finally {
      setWithdrawing(false);
    }
  };

  const handleInputChange = (event) => {
    setInputValue((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getBankName();
    getbankOwnerHandler();
    customerBalanceHandler();
  }, [isWalletConnected]);

  return (
    <>
      <main
        className={
          showModal
            ? "main-container pointer-events-none opacity-95"
            : "main-container"
        }
      >
        <h2 className="headline">
          <span className="headline-gradient">Bank Contract Project</span> 💰
        </h2>
        <section className="customer-section px-10 pt-5 pb-10">
          <div className="mt-5">
            {currentBankName === "" && isBankerOwner ? (
              <p>"Setup the name of your bank." </p>
            ) : (
              <p className="text-3xl font-bold">{currentBankName}</p>
            )}
          </div>
          <div className="mt-7 mb-9">
            <div className="form-style">
              <input
                type="text"
                className="input-style"
                onChange={handleInputChange}
                name="deposit"
                placeholder="0.0000 ETH"
                value={inputValue.deposit}
              />
              <button className="btn-purple" onClick={deposityMoneyHandler}>
                Deposit Money In ETH
                <Loader classStyle="ml-4" loading={depositing} />
              </button>
            </div>
          </div>
          <div className="mt-10 mb-10">
            <form className="form-style">
              <input
                type="text"
                className="input-style"
                onChange={handleInputChange}
                name="withdraw"
                placeholder="0.0000 ETH"
                value={inputValue.withdraw}
              />
              <button className="btn-purple" onClick={withDrawMoneyHandler}>
                Withdraw Money In ETH
                <Loader classStyle="ml-4" loading={withdrawing} />
              </button>
            </form>
          </div>
          <div className="mt-5">
            <p>
              <span className="font-bold">Customer Balance: </span>
              {customerTotalBalance}
            </p>
          </div>
          <div className="mt-5">
            <p>
              <span className="font-bold">Bank Owner Address: </span>
              {bankOwnerAddress}
            </p>
          </div>
          <div className="mt-5">
            {isWalletConnected && (
              <p>
                <span className="font-bold">Your Wallet Address: </span>
                {customerAddress}
              </p>
            )}
            <button className="btn-connect" onClick={checkIfWalletIsConnected}>
              {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
            </button>
          </div>
        </section>
        {isBankerOwner && (
          <section className="bank-owner-section">
            <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">
              Bank Admin Panel
            </h2>
            <div className="p-10">
              <div className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="bankName"
                  placeholder="Enter a Name for Your Bank"
                  value={inputValue.bankName}
                />
                <button className="btn-grey" onClick={setBankNameHandler}>
                  Set Bank Name
                  <Loader loading={settingBankName} classStyle="ml-4" />
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
      <Modal
        type={modalType}
        showModal={showModal}
        modalHeader={modalHeader}
        setShowModal={setShowModal}
        modalBody={modalBody}
        modalFooterBtnText={modalHeader === "Error" ? "Close" : "Ok"}
      />
    </>
  );
};
export default App;
