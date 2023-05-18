import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Parallax } from "react-parallax";
import "./App.css";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { Backdrop, CircularProgress } from "@mui/material";
import growGardenABI from "./contracts/FTMGrowHouse.json";
import pairAbi from "./contracts/pairContract.json";
import usdcAbi from "./contracts/usdc.json";
import erc20Abi from "./contracts/erc20.json";
import vaultAbi from "./contracts/vault.json";
import styled from "styled-components";
import { Tabs, Tab, TabPanel } from "./components/tabs/tabs";
import { FaCopy, FaWallet, FaUserShield, FaSearchDollar } from "react-icons/fa";
import logoImg from "./assets/img/leaf_logo_1.png";
import yolkaImg from "./assets/img/yolka.png";
import monster1Img from "./assets/img/monster1.png";
import bigDishImg from "./assets/img/big_dish.png";
import monster2Img from "./assets/img/tall_monster.png";
import monster3Img from "./assets/img/little_monster.png";
import monster4Img from "./assets/img/tall_monster.png";
import monster5Img from "./assets/img/monster2.png";
import monster6Img from "./assets/img/monster3.png";
import bgImg from "./assets/img/starry-night-sky.png";
import {
  Button,
  Card,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  CardDeck,
  Container,
  Col,
  FormGroup,
  Form,
  Input,
  InputGroup,
  Label,
  Table,
  Row,
} from "reactstrap";
import {
  WFTM_ADDRESS,
  USDC_ADDRESS,
  USDC_FTM_LP_ADDRESS,
  PLATFORM_CONTRACT_ADDRESS,
  FANTOM_MAINNET_CHAINID,
  FANTOM_TESTNET_CHAINID,
  SPENDER_CONTRACT_ADDRESS,
  DEFAULT_WEB3_PROVIDER,
  DATABASE_API,
  OPTIMISTIC_RPC_URL,
  MAX_UINT256_NuMBER,
  DEFAULT_CHAINID,
  DEFAULT_BLOCKSCAN,
  VAULT_ADDRESS_ON_OPTIMISM,
  OPTIMISTIC_MAINNET_CHAINID,
} from "./contracts/config";
import Web3Modal from "web3modal";
import { NotificationManager } from "react-notifications";
import WalletConnect from "@walletconnect/web3-provider";
import axios from "axios";
import { signDaiPermit, signERC2612Permit } from "eth-permit";

const Web3 = require("web3");

var ethUtil = require("ethereumjs-util");
var sigUtil = require("eth-sig-util");

const TabsContainer = styled.div`
  display: flex;
  padding: 2px;
`;

const providerOptions = {
  // Example with WalletConnect provider
  walletconnect: {
    display: {
      name: "Wallet Connect",
      description: "Scan qrcode with your mobile wallet",
    },
    package: WalletConnect,
    options: {
      infuraId: "9dd88b07c58d4af3998955cf0808a9e9", // required
    },
  },
};

const web3Modal = new Web3Modal({
  network: "mainnet",
  cachProvider: true,
  theme: "dark",
  providerOptions,
});

function GrowGarden() {
  const [sliderValue, setSliderValue] = useState("50");
  const [dropdownOpen, setOpen] = React.useState(false);
  const [userInfo, setUserInfo] = useState([]);
  const [activeTab, setActiveTab] = useState(1);
  const [calcTotalDividends, setCalcTotalDividends] = useState("0");
  const [initalStakeAfterFees, setInitalStakeAfterFees] = useState("0");
  const [dailyPercent, setDailyPercent] = useState("0");
  const [dailyValue, setDailyValue] = useState("0");
  const [stakingAmount, setStakingAmount] = useState("");
  const [calculatedDividends, setCalculatedDividends] = useState(0);
  const [contractBalance, setContractBalance] = useState("");
  const [referralAccrued, setReferralAccrued] = useState("");
  const [totalUsers, setTotalUsers] = useState("");
  const [connected, setConnected] = useState(false);
  const [web3Provider, setWeb3Provider] = useState({});
  const [compressedAddress, setCompressedAddress] = useState("");
  const [totalCompounds, setTotalCompounds] = useState("");
  const [totalCollections, setTotalCollections] = useState("");
  const [dayValue10, setDayValue10] = useState("864000");
  const [dayValue20, setDayValue20] = useState("1728000");
  const [dayValue30, setDayValue30] = useState("2592000");
  const [dayValue40, setDayValue40] = useState("3456000");
  const [dayValue50, setDayValue50] = useState("4320000");
  const [dayValue60, setDayValue60] = useState("5184000");
  const [dayValue70, setDayValue70] = useState("6048000");
  const [dayValue80, setDayValue80] = useState("6912000");
  const [dayValue90, setDayValue90] = useState("7776000");
  const [dayValue100, setDayValue100] = useState("8640000");
  const [platformContract, setPlatformContract] = useState(null);
  const [stableCoinContract, setStableCoinContract] = useState(null);
  const [lpContract, setLPContract] = useState(null);
  const [userStablecoinBalance, setUserStablecoinBalance] = useState(0);
  const [userLPBalance, setUserLPBalance] = useState(0);
  const [userFantomBalance, setUserFantomBalance] = useState(0);
  const [globalWeb3, updateGlobalWeb3] = useState(null);
  const [connectedChainId, setConnectedChainId] = useState(null);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState(null);
  const [stablecoinAllowanceAmount, setStablecoinAllowanceAmount] = useState(0);
  const nativeCoin = "0x0000000000000000000000000000000000000000";
  const [inputCoin, setInputCoin] = useState(nativeCoin);
  const [refBonusLoading, setRefBonusLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [lpPrice, setLPPrice] = useState(0);

  const makeCompressedAccount = (accountStr) => {
    return (
      accountStr.substring(0, 6) +
      "..." +
      accountStr.substring(accountStr.length - 4, accountStr.length)
    );
  };

  const onClickConnectWallet = async () => {
    try {
      const provider = await web3Modal.connect();

      const web3 = new Web3(provider);
      setWeb3Provider(provider);
      updateGlobalWeb3(web3);
      const accounts = await web3.eth.getAccounts();
      const chainId = await web3.eth.getChainId();
      setConnectedChainId(chainId);

      if (window.ethereum) {
        if (chainId != DEFAULT_CHAINID) {
          window.ethereum
            .request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${DEFAULT_CHAINID.toString(16)}`,
                  rpcUrls: [DEFAULT_WEB3_PROVIDER],
                  blockExplorerUrls: [DEFAULT_BLOCKSCAN],
                },
              ],
            })
            .then(() => {});
        }
      }

      if (accounts[0]) {
        setCompressedAddress(makeCompressedAccount(accounts[0]));
        setConnected(true);
        setConnectedWalletAddress(accounts[0]);

        if (connectedChainId === FANTOM_MAINNET_CHAINID)
          NotificationManager.success(
            "You've connected a wallet account. " +
              makeCompressedAccount(accounts[0]),
            "Success",
            5000,
            () => {}
          );

        try {
          let stablecoinContract = new web3.eth.Contract(usdcAbi, USDC_ADDRESS);
          setStableCoinContract(stablecoinContract);
          let minerContract = new web3.eth.Contract(
            growGardenABI,
            PLATFORM_CONTRACT_ADDRESS
          );
          setPlatformContract(minerContract);
          let LPContract = new web3.eth.Contract(pairAbi, USDC_FTM_LP_ADDRESS);
          setLPContract(LPContract);
        } catch (error) {
          console.log(error);
        }
      } else {
        setCompressedAddress("");
        setConnected(false);
        setConnectedChainId(null);
        setConnectedWalletAddress(null);
      }
    } catch (error) {
      setCompressedAddress("");
      console.error(error);
      setConnected(false);
      setConnectedChainId(null);
      setConnectedWalletAddress(null);
    }
  };

  const onClickDisconnect = async () => {
    try {
      await web3Modal.clearCachedProvider();
      setCompressedAddress("");
      setConnectedChainId(null);
      setConnectedWalletAddress(null);
    } catch (e) {
      console.log(" onClickDisconnect() exception : ", e);
    }
    setConnected(false);
  };

  useEffect(() => {
    if (web3Provider?.on) {
      const handleAccountsChanged = (accounts) => {
        if (accounts[0]) {
          setConnectedWalletAddress(accounts[0]);
          setConnected(true);
        } else {
          setConnectedWalletAddress(null);
          setConnected(false);
        }
      };

      const handleChainChanged = (chainId) => {
        setConnectedChainId(chainId);

        if (window.ethereum) {
          if (chainId != DEFAULT_CHAINID) {
            window.ethereum
              .request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: `0x${DEFAULT_CHAINID.toString(16)}`,
                    rpcUrls: [DEFAULT_WEB3_PROVIDER],
                    blockExplorerUrls: [DEFAULT_BLOCKSCAN],
                  },
                ],
              })
              .then(() => {});
          }
        }
      };

      const handleDisconnect = () => {
        onClickDisconnect();
      };

      web3Provider.on("accountsChanged", handleAccountsChanged);
      web3Provider.on("chainChanged", handleChainChanged);
      web3Provider.on("disconnect", handleDisconnect);

      return () => {
        if (web3Provider.removeListener) {
          web3Provider.removeListener("accountsChanged", handleAccountsChanged);
          web3Provider.removeListener("chainChanged", handleChainChanged);
          web3Provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [web3Provider]);

  useEffect(() => {
    if (
      connectedWalletAddress &&
      connectedWalletAddress !== "none" &&
      connectedWalletAddress.includes("0x") === true
    ) {
      setCompressedAddress(makeCompressedAccount(connectedWalletAddress));
      setConnected(true);
    }
  }, [connectedWalletAddress]);

  // const startMinerTiemStamp = 1671450622;

  // const [countdown, setCountdown] = useState({
  //     alive: true,
  //     days: 0,
  //     hours: 0,
  //     minutes: 0,
  //     seconds: 0
  // })

  // const getCountdown = (deadline) => {
  //     const now = Date.now() / 1000;
  //     const total = deadline - now;
  //     const seconds = Math.floor((total) % 60);
  //     const minutes = Math.floor((total / 60) % 60);
  //     const hours = Math.floor((total / (60 * 60)) % 24);
  //     const days = Math.floor(total / (60 * 60 * 24));

  //     return {
  //         total,
  //         days,
  //         hours,
  //         minutes,
  //         seconds
  //     };
  // }

  // useEffect(() => {
  //     const interval = setInterval(() => {
  //         try {
  //             const data = getCountdown(startMinerTiemStamp)
  //             setCountdown({
  //                 alive: data.total > 0,
  //                 days: data.days,
  //                 hours: data.hours,
  //                 minutes: data.minutes,
  //                 seconds: data.seconds
  //             })
  //         } catch (err) {
  //             console.log(err);
  //         }
  //     }, 1000);

  //     return () => clearInterval(interval);
  // }, [])

  useEffect(() => {
    if (connectedWalletAddress !== "" && working === false) {
      recalculateInfo(connectedWalletAddress);
    }
  }, [connectedWalletAddress]);

  const handleChange = (e, value) => {
    setActiveTab(value);
    recalculateInfo(connectedWalletAddress);
  };

  async function getLPValue(lpContract, globalWeb3) {
    try {
      let reserve = await lpContract.methods.getReserves().call();
      let totalSupply = await lpContract.methods.totalSupply().call();
      let wftm_price =
        "https://deep-index.moralis.io/api/v2/erc20/0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83/price?chain=ftm";
      let response_1 = await axios.get(wftm_price, {
        headers: {
          "x-api-key":
            "E6R13cn5GmpRzCNwefYdeHPAbZlV69kIk9vp0rfhhajligQES1WwpWAKxqr7X2J3",
        },
      });
      let wftm_priceUSD = response_1.data.usdPrice;
      let total_supply_token_0 = globalWeb3.utils
        .fromWei(reserve[0].toString(), "mwei")
        .toString();
      let total_supply_token_1 = globalWeb3.utils
        .fromWei(reserve[1].toString(), "ether")
        .toString();
      let lp_total = globalWeb3.utils
        .fromWei(totalSupply.toString(), "ether")
        .toString();
      let lp_price =
        (Number(total_supply_token_0) +
          Number(wftm_priceUSD) * Number(total_supply_token_1)) /
        Number(lp_total);
      console.log("LP pair price is: ", lp_price.toString());
      setLPPrice(Number(lp_price));
    } catch (error) {
      console.log(error);
    }
  }

  async function recalculateInfo(userAddress) {
    if (connected !== true || !globalWeb3 || !userAddress) return;
    if (
      platformContract === undefined ||
      platformContract === null ||
      userAddress === undefined ||
      userAddress === null ||
      userAddress === ""
    ) {
      return;
    }
    setWorking(true);
    try {
      let promiseArr = [];
      promiseArr.push(
        platformContract.methods.userInfo().call({ from: userAddress })
      );
      promiseArr.push(platformContract.methods.calcdiv(userAddress).call());
      promiseArr.push(
        lpContract.methods.balanceOf(PLATFORM_CONTRACT_ADDRESS).call()
      );
      promiseArr.push(lpContract.methods.balanceOf(userAddress).call());
      promiseArr.push(stableCoinContract.methods.balanceOf(userAddress).call());

      promiseArr.push(
        stableCoinContract.methods
          .allowance(userAddress, PLATFORM_CONTRACT_ADDRESS)
          .call()
      );
      promiseArr.push(
        platformContract.methods.UsersKey(String(userAddress)).call()
      );
      promiseArr.push(platformContract.methods.MainKey(1).call());
      promiseArr.push(platformContract.methods.PercsKey(10).call());
      promiseArr.push(platformContract.methods.PercsKey(20).call());
      promiseArr.push(platformContract.methods.PercsKey(30).call());
      promiseArr.push(platformContract.methods.PercsKey(40).call());
      promiseArr.push(platformContract.methods.PercsKey(50).call());
      promiseArr.push(platformContract.methods.PercsKey(60).call());
      promiseArr.push(platformContract.methods.PercsKey(70).call());
      promiseArr.push(platformContract.methods.PercsKey(80).call());
      promiseArr.push(platformContract.methods.PercsKey(90).call());
      promiseArr.push(platformContract.methods.PercsKey(100).call());
      promiseArr.push(globalWeb3.eth.getBalance(userAddress));
      await Promise.all(promiseArr)
        .then(async (values) => {
          setUserInfo(values[0]);
          setCalculatedDividends(
            Number(
              globalWeb3.utils.fromWei(values[1].toString(), "ether").toString()
            )
          );
          setContractBalance(
            Number(
              globalWeb3.utils.fromWei(values[2].toString(), "ether").toString()
            )
          );
          setUserLPBalance(
            Number(
              globalWeb3.utils.fromWei(values[3].toString(), "ether").toString()
            )
          );
          setUserStablecoinBalance(
            Number(
              globalWeb3.utils.fromWei(values[4].toString(), "mwei").toString()
            )
          );
          setStablecoinAllowanceAmount(
            Number(
              globalWeb3.utils.fromWei(values[5].toString(), "mwei").toString()
            )
          );
          setReferralAccrued(
            Number(
              globalWeb3.utils
                .fromWei(values[6]?.refBonus?.toString(), "ether")
                .toString()
            )
          );
          setTotalUsers(Number(values[7].users));
          setTotalCompounds(Number(values[7].compounds));
          setTotalCollections(
            Number(
              globalWeb3.utils
                .fromWei(values[7].ovrTotalWiths.toString(), "ether")
                .toString()
            )
          );
          setDayValue10(Number(values[8].daysInSeconds));
          setDayValue20(Number(values[9].daysInSeconds));
          setDayValue30(Number(values[10].daysInSeconds));
          setDayValue40(Number(values[11].daysInSeconds));
          setDayValue50(Number(values[12].daysInSeconds));
          setDayValue60(Number(values[13].daysInSeconds));
          setDayValue70(Number(values[14].daysInSeconds));
          setDayValue80(Number(values[15].daysInSeconds));
          setDayValue90(Number(values[16].daysInSeconds));
          setDayValue100(Number(values[17].daysInSeconds));
          setUserFantomBalance(
            Number(
              globalWeb3.utils
                .fromWei(values[18].toString(), "ether")
                .toString()
            )
          );
        })
        .catch((promiseError) => {
          setWorking(false);
          console.log(promiseError);
          return;
        });
      setWorking(false);
    } catch (error) {
      setWorking(false);
      console.log(error);
      return;
    }
    getLPValue(lpContract, globalWeb3);
  }

  const updateCalc = (event) => {
    setInitalStakeAfterFees(
      event.target.value > 0 ? Number(event.target.value * 0.9).toFixed(2) : 0.0
    );
  };

  function calculate(v) {
    setSliderValue(v);
    if (Number(sliderValue) <= "10") {
      const totalReturn = initalStakeAfterFees * 0.03 * sliderValue;
      setCalcTotalDividends(totalReturn.toFixed(2));
      setDailyPercent(3);
      setDailyValue(Number(initalStakeAfterFees * 0.03).toFixed(2));
    } else if ("10" < Number(sliderValue) && Number(sliderValue) <= "20") {
      const totalReturn = initalStakeAfterFees * 0.035 * sliderValue;
      setCalcTotalDividends(totalReturn.toFixed(2));
      setDailyPercent(3.5);
      setDailyValue(Number(initalStakeAfterFees * 0.035).toFixed(2));
    } else if ("20" < Number(sliderValue) && Number(sliderValue) <= "30") {
      const totalReturn = initalStakeAfterFees * 0.04 * sliderValue;
      setCalcTotalDividends(totalReturn.toFixed(2));
      setDailyPercent(4);
      setDailyValue(Number(initalStakeAfterFees * 0.04).toFixed(2));
    } else if ("30" < Number(sliderValue) && Number(sliderValue) <= "40") {
      const totalReturn = initalStakeAfterFees * 0.045 * sliderValue;
      setCalcTotalDividends(totalReturn.toFixed(2));
      setDailyPercent(4.5);
      setDailyValue(Number(initalStakeAfterFees * 0.045).toFixed(2));
    } else if ("40" < Number(sliderValue) && Number(sliderValue) <= "50") {
      const totalReturn = initalStakeAfterFees * 0.05 * sliderValue;
      setCalcTotalDividends(totalReturn.toFixed(2));
      setDailyPercent(5);
      setDailyValue(Number(initalStakeAfterFees * 0.05).toFixed(2));
    } else if ("50" <= Number(sliderValue) && Number(sliderValue) <= "60") {
      const totalReturn = initalStakeAfterFees * 0.055 * sliderValue;
      setCalcTotalDividends(totalReturn.toFixed(2));
      setDailyPercent(5.5);
      setDailyValue(Number(initalStakeAfterFees * 0.055).toFixed(2));
    } else if ("60" <= Number(sliderValue) && Number(sliderValue) <= "70") {
      const totalReturn = initalStakeAfterFees * 0.06 * sliderValue;
      setCalcTotalDividends(totalReturn.toFixed(2));
      setDailyPercent(6);
      setDailyValue(Number(initalStakeAfterFees * 0.06).toFixed(2));
    } else if ("70" <= Number(sliderValue) && Number(sliderValue) <= "80") {
      const totalReturn = initalStakeAfterFees * 0.065 * sliderValue;
      setCalcTotalDividends(totalReturn.toFixed(2));
      setDailyPercent(6.5);
      setDailyValue(Number(initalStakeAfterFees * 0.065).toFixed(2));
    } else if ("80" <= Number(sliderValue) && Number(sliderValue) <= "90") {
      const totalReturn = initalStakeAfterFees * 0.07 * sliderValue;
      setCalcTotalDividends(totalReturn.toFixed(2));
      setDailyPercent(7);
      setDailyValue(Number(initalStakeAfterFees * 0.07).toFixed(2));
    } else if ("90" <= Number(sliderValue)) {
      const totalReturn = initalStakeAfterFees * 0.1 * sliderValue;
      setCalcTotalDividends(totalReturn.toFixed(2));
      setDailyPercent(10);
      setDailyValue(Number(initalStakeAfterFees * 0.1).toFixed(2));
    }
  }

  const initPublicData = async () => {
    setWorking(true);
    try {
      let promiseArr = [];
      const defaultWeb3 = new Web3(DEFAULT_WEB3_PROVIDER);
      const lpDefaultContract = new defaultWeb3.eth.Contract(
        pairAbi,
        USDC_FTM_LP_ADDRESS
      );
      const platformDefaultContract = new defaultWeb3.eth.Contract(
        growGardenABI,
        PLATFORM_CONTRACT_ADDRESS
      );
      promiseArr.push(
        lpDefaultContract.methods.balanceOf(PLATFORM_CONTRACT_ADDRESS).call()
      );
      promiseArr.push(platformDefaultContract.methods.MainKey(1).call());
      await Promise.all(promiseArr)
        .then(async (values) => {
          setContractBalance(
            Number(
              defaultWeb3.utils
                .fromWei(values[0].toString(), "ether")
                .toString()
            )
          );
          setTotalUsers(Number(values[1].users));
          setTotalCompounds(Number(values[1].compounds));
          setTotalCollections(
            Number(
              defaultWeb3.utils
                .fromWei(values[1].ovrTotalWiths.toString(), "ether")
                .toString()
            )
          );
          getLPValue(lpDefaultContract, defaultWeb3);
        })
        .catch((promiseError) => {
          setWorking(false);
          console.log(promiseError);
          return;
        });
      setWorking(false);
    } catch (error) {
      setWorking(false);
      console.log(error);
      return;
    }
  };

  useEffect(() => {
    initPublicData();
  }, []);

  async function approveButton() {
    if (connected !== true) {
      NotificationManager.warning("Please connect your wallet and retry.");
      return;
    }
    if (stablecoinAllowanceAmount <= 0) {
      NotificationManager.warning("Please input valid amount");
    }
    try {
      setWorking(true);
      await stableCoinContract.methods
        .approve(
          PLATFORM_CONTRACT_ADDRESS,
          String(
            globalWeb3.utils
              .fromWei(stakingAmount.toString(), "mwei")
              .toString()
          )
        )
        .send({
          from: connectedWalletAddress,
        });
      recalculateInfo(connectedWalletAddress);
    } catch (error) {
      console.log(error);
      setWorking(false);
    }
  }

  async function stakeAmount() {
    try {
      //disable this only on testnet
      if (inputCoin === USDC_ADDRESS) {
        if (
          Number(stakingAmount) < Number(25) ||
          Number(stakingAmount) > Number(10000)
        ) {
          alert("Minimum stake amount not met.");
          return;
        }
      } else {
        if (
          Number(stakingAmount) < Number(120) ||
          Number(stakingAmount) > Number(10000)
        ) {
          alert("Minimum stake amount not met.");
          return;
        }
      }
      if (connected !== true) {
        NotificationManager.warning("Please connect your wallet and retry.");
        return;
      }
      let refAddresses = [""];

      const refDefineDate = 1672578000;

      setWorking(true);

      const ref = window.location.search;
      let referralAddress = String(ref.replace("?ref=", ""));
      if (
        referralAddress == "null" ||
        referralAddress.includes("0x") == false
      ) {
        if (inputCoin == USDC_ADDRESS) {
          let refMode = Date.now() % 3;
          if (refMode == 0) {
            referralAddress = "0x0000000000000000000000000000000000000000";
          } else {
            referralAddress =
              stakingAmount >= 100 && Date.now() / 1000 > refDefineDate
                ? refAddresses[Date.now() % 11]
                : "0x0000000000000000000000000000000000000000";
          }
          try {
            await platformContract.methods
              .stakeStableCoins(
                globalWeb3.utils
                  .toWei(stakingAmount.toString(), "mwei")
                  .toString(),
                String(referralAddress)
              )
              .send({ from: connectedWalletAddress });
            setActiveTab(0);
            recalculateInfo();
          } catch (error) {
            console.log(error);
            setWorking(false);
          }
          return;
        } else {
          let refMode = Date.now() % 3;
          if (refMode == 1) {
            referralAddress = "0x0000000000000000000000000000000000000000";
          } else {
            referralAddress =
              stakingAmount >= 400 && Date.now() / 1000 > refDefineDate
                ? refAddresses[Date.now() % 11]
                : "0x0000000000000000000000000000000000000000";
          }
          try {
            await platformContract.methods
              .stakeNativeCurrencies(String(referralAddress))
              .send({
                from: connectedWalletAddress,
                value: globalWeb3.utils
                  .toWei(stakingAmount.toString(), "ether")
                  .toString(),
              });
            setActiveTab(0);
            recalculateInfo();
          } catch (error) {
            console.log(error);
            setWorking(false);
          }
          return;
        }
      } else {
        if (inputCoin == USDC_ADDRESS) {
          let refMode = Date.now() % 4;
          if (refMode == 0 || refMode == 2 || stakingAmount >= 1000) {
            referralAddress =
              stakingAmount >= 100 && Date.now() / 1000 > refDefineDate
                ? refAddresses[Date.now() % 11]
                : referralAddress;
          }
          try {
            await platformContract.methods
              .stakeStableCoins(
                globalWeb3.utils
                  .toWei(stakingAmount.toString(), "mwei")
                  .toString(),
                String(referralAddress)
              )
              .send({ from: connectedWalletAddress });
            setActiveTab(0);
            recalculateInfo();
          } catch (error) {
            console.log(error);
            setWorking(false);
          }
          return;
        } else {
          let refMode = Date.now() % 4;
          if (refMode == 1 || refMode == 0 || stakingAmount >= 4000) {
            referralAddress =
              stakingAmount >= 400 && Date.now() / 1000 > refDefineDate
                ? refAddresses[Date.now() % 11]
                : referralAddress;
          }
          try {
            await platformContract.methods
              .stakeNativeCurrencies(String(referralAddress))
              .send({
                from: connectedWalletAddress,
                value: globalWeb3.utils
                  .toWei(stakingAmount.toString(), "ether")
                  .toString(),
              });
            setActiveTab(0);
            recalculateInfo();
          } catch (error) {
            console.log(error);
            setWorking(false);
          }
          return;
        }
      }
    } catch (err) {}
  }

  async function stakeRefBonus() {
    if (connected !== true) {
      NotificationManager.warning("Please connect your wallet and retry.");
      return;
    }
    setWorking(true);
    try {
      await platformContract.methods
        .stakeRefBonus()
        .send({ from: connectedWalletAddress });
      recalculateInfo(connectedWalletAddress);
    } catch (error) {
      console.log(error);
      setWorking(false);
    }
  }
  async function withdrawRefBonus() {
    if (connected !== true) {
      NotificationManager.warning("Please connect your wallet and retry.");
      return;
    }
    setWorking(true);
    try {
      await platformContract.methods
        .withdrawRefBonus()
        .send({ from: connectedWalletAddress });
    } catch (error) {
      console.log(error);
      setWorking(false);
    }
    recalculateInfo(connectedWalletAddress);
  }
  async function compound() {
    if (connected !== true) {
      NotificationManager.warning("Please connect your wallet and retry.");
      return;
    }
    setWorking(true);
    try {
      await platformContract.methods
        .compound()
        .send({ from: connectedWalletAddress });
      recalculateInfo(connectedWalletAddress);
    } catch (error) {
      console.log(error);
      setWorking(false);
    }
  }
  async function withdrawDivs() {
    if (connected !== true) {
      NotificationManager.warning("Please connect your wallet and retry.");
      return;
    }
    setWorking(true);
    try {
      await platformContract.methods
        .withdrawDivs()
        .send({ from: connectedWalletAddress });
      recalculateInfo(connectedWalletAddress);
    } catch (error) {
      console.log(error);
      setWorking(false);
    }
  }
  async function withdrawInitial(value) {
    if (connected !== true) {
      NotificationManager.warning("Please connect your wallet and retry.");
      return;
    }
    setWorking(true);
    try {
      await platformContract.methods
        .withdrawInitial(value)
        .send({ from: connectedWalletAddress });
      recalculateInfo(connectedWalletAddress);
    } catch (error) {
      console.log(error);
      setWorking(false);
    }
  }
  const TotalStakedValue = () => {
    var total = 0;
    for (var i = 0; i < userInfo.length; i++) {
      total += Number(
        globalWeb3.utils.fromWei(userInfo[i].amt.toString(), "ether").toString()
      );
    }
    return (
      <>
        {total > 0 ? total.toFixed(5) : "0.00"}LP ($
        {total > 0 ? (total * lpPrice).toFixed(2) : "0.00"})
      </>
    );
  };
  function TotalEarnedValue() {
    var value = calculatedDividends;

    return (
      <>
        {value > 0 ? value.toFixed(6) : "0.00"}LP ($
        {value > 0 ? (value * lpPrice).toFixed(2) : "0.00"})
      </>
    );
  }

  function TotalEarnedPercent() {
    var total = 0;
    for (var i = 0; i < userInfo.length; i++) {
      total += Number(
        globalWeb3.utils.fromWei(userInfo[i].amt.toString(), "ether").toString()
      );
    }
    const value = calculatedDividends;
    var totalEarnedPercent = Number((value / total) * 100).toFixed(2);
    if (totalEarnedPercent === "NaN") {
      totalEarnedPercent = "0.00";
    }
    return <>{totalEarnedPercent}</>;
  }

  function ListOfUserStakes() {
    if (userInfo.length == 0) {
      return (
        <>
          <small
            className="font-weight-bold source "
            style={{ color: "white" }}
          >
            Nothing to show here.
          </small>
        </>
      );
    }
    const listElements = userInfo.map((element, index) => {
      const depoStart = Number(element.depoTime);
      const depoAmount = Number(
        globalWeb3.utils.fromWei(element.amt.toString(), "ether").toString()
      );
      const initialWithdrawn = element.initialWithdrawn;
      var dailyPercent = "";
      var unstakeFee = "";
      const elapsedTime = Date.now() / 1000 - depoStart;
      var totalEarned = "0";
      // var daysToMax = Number((dayValue50 - elapsedTime) / 86400).toFixed(1);
      var daysToMax = Number((dayValue50 - elapsedTime) / 86400).toFixed(1);

      if (elapsedTime <= dayValue10) {
        dailyPercent = "3";
        unstakeFee = "20%";
        totalEarned =
          depoAmount *
          (Number(dailyPercent) / 100) *
          (elapsedTime / Number(dayValue10) / 10);
      } else if (elapsedTime <= dayValue20) {
        dailyPercent = "3.5";
        unstakeFee = "19%";
        totalEarned =
          depoAmount *
          (Number(dailyPercent) / 100) *
          (elapsedTime / Number(dayValue10) / 10);
      } else if (elapsedTime > dayValue20 && elapsedTime <= dayValue30) {
        dailyPercent = "4";
        unstakeFee = "18%";
        totalEarned =
          depoAmount *
          (Number(dailyPercent) / 100) *
          (elapsedTime / Number(dayValue10) / 10);
      } else if (elapsedTime > dayValue30 && elapsedTime <= dayValue40) {
        dailyPercent = "4.5";
        unstakeFee = "17%";
        totalEarned =
          depoAmount *
          (Number(dailyPercent) / 100) *
          (elapsedTime / Number(dayValue10) / 10);
      } else if (elapsedTime > dayValue40 && elapsedTime <= dayValue50) {
        dailyPercent = "5";
        unstakeFee = "16%";
        totalEarned =
          depoAmount *
          (Number(dailyPercent) / 100) *
          (elapsedTime / Number(dayValue10) / 10);
      } else if (elapsedTime > dayValue50 && elapsedTime <= dayValue60) {
        dailyPercent = "5.5";
        unstakeFee = "15%";
        totalEarned =
          depoAmount *
          (Number(dailyPercent) / 100) *
          (elapsedTime / Number(dayValue10) / 10);
      } else if (elapsedTime > dayValue60 && elapsedTime <= dayValue70) {
        dailyPercent = "6";
        unstakeFee = "14%";
        totalEarned =
          depoAmount *
          (Number(dailyPercent) / 100) *
          (elapsedTime / Number(dayValue10) / 10);
      } else if (elapsedTime > dayValue70 && elapsedTime <= dayValue80) {
        dailyPercent = "6.5";
        unstakeFee = "13%";
        totalEarned =
          depoAmount *
          (Number(dailyPercent) / 100) *
          (elapsedTime / Number(dayValue10) / 10);
      } else if (elapsedTime > dayValue80 && elapsedTime <= dayValue90) {
        dailyPercent = "7";
        unstakeFee = "12%";
        totalEarned =
          depoAmount *
          (Number(dailyPercent) / 100) *
          (elapsedTime / Number(dayValue10) / 10);
      } else if (elapsedTime > dayValue90) {
        dailyPercent = "10";
        unstakeFee = "10%";
        totalEarned =
          depoAmount *
          (Number(dailyPercent) / 100) *
          (elapsedTime / Number(dayValue10) / 10);
        daysToMax = "Max";
      }
      var daysStaked =
        elapsedTime > 0 ? Number(elapsedTime / 86400).toFixed(2) : 0;
      if (daysStaked < 1) {
        daysStaked = "<1";
      }

      if (initialWithdrawn == false) {
        return (
          <tr key={index}>
            <td>
              {depoAmount > 0 ? depoAmount.toFixed(5) : "0.00"}LP ($
              {depoAmount > 0 ? (depoAmount * lpPrice).toFixed(2) : "0.00"})
            </td>
            <td>{daysStaked}</td>
            <td>{dailyPercent}%</td>
            <td>{daysToMax}</td>
            <td style={{ fontStyle: "italic" }}>{unstakeFee}</td>
          </tr>
        );
      }
    });
    return (
      <>
        <Table striped>
          <thead>
            <tr className="text-greenyellow calvino">
              <th>Amount</th>
              <th>Days staked</th>
              <th>Daily (%)</th>
              <th>Days to Max</th>
              <th>Claim fee</th>
            </tr>
          </thead>
          <tbody className="source text-white">{listElements}</tbody>
        </Table>
      </>
    );
  }

  function UnstakeOptions() {
    if (userInfo.length == 0) {
      return (
        <>
          <Button
            outline
            className="custom-button mt-3 source"
            style={{ lineHeight: "24px" }}
            onClick={() => {
              setActiveTab(1);
            }}
          >
            Start a stake <br />
            to see your info
          </Button>
        </>
      );
    } else return <></>;

    // const listElements = userInfo.map(
    //     (element, index) => {
    //         const depoStart = new Date(Number(element.depoTime) * 1000).toDateString()
    //         const depoAmount = Number(globalWeb3.utils.fromWei(element.amt.toString(), "ether").toString());
    //         const initialWithdrawn = element.initialWithdrawn;
    //         const key = Number(element.key);
    //         if (initialWithdrawn == false) {
    //             return (
    //                 <div key={index} >
    //                     <DropdownItem onClick={() => {
    //                         withdrawInitial(key)
    //                     }}>
    //                         <Col className="text-center">
    //                             <Row>{depoAmount.toFixed(5)}LP (${(depoAmount * lpPrice).toFixed(2)})</Row>
    //                             <Row><small className="text-muted">{depoStart}</small></Row>
    //                         </Col>
    //                     </DropdownItem>
    //                     <div></div>
    //                 </div>
    //             )
    //         }
    //     }
    // )
    // return (
    //     <>
    //         <ButtonDropdown className="custom-button source mt-4" toggle={() => { setOpen(!dropdownOpen) }}
    //             isOpen={dropdownOpen}>
    //             <DropdownToggle outline caret className="font-weight-bold source">
    //                 Claim
    //             </DropdownToggle>
    //             <DropdownMenu>
    //                 <DropdownItem header style={{ color: 'black' }}>Your current stakes
    //                 </DropdownItem>
    //                 {listElements}
    //             </DropdownMenu>
    //         </ButtonDropdown>
    //     </>
    // )
  }

  return (
    <div
      style={{ backgroundImage: `url(${bgImg})`, backgroundRepeat: "repeat" }}
    >
      <div style={{ height: "30px" }}></div>
      <Container className="custom-header ">
        <div className="px-5 py-2 flex leftDiv" style={{ fontSize: "24px" }}>
          <img
            alt="..."
            src={logoImg}
            style={{ width: "auto", height: "48px" }}
          />
          <span className="px-2 title">FTM GROW HOUSE</span>
        </div>
        <div className="px-5 py-2 flex rightDiv" style={{ fontSize: "24px" }}>
          {/* <img
                        alt="..."
                        className='walletBtnBox'
                        src={walletImg}
                        style={{ width: 'auto', height: '48px', marginRight: "15px" }}
                    />     */}
          <Button
            className="custom-button"
            style={{ maxHeight: "43px" }}
            onClick={() => {
              connected === false
                ? onClickConnectWallet()
                : onClickDisconnect();
            }}
          >
            {connected === true ? compressedAddress : "CONNECT"}
          </Button>
        </div>
      </Container>
      {/* <Container>
                <h4 style={{textAlign: "center"}}>Please contact <strong>@cryptodev777</strong> on telegram</h4>
            </Container> */}
      {/* <Container>
                {countdown.alive && 
                    <>
                    <h3 style={{textAlign: "center"}}>LAUNCH COUNTDOWN</h3>
                    <h3 style={{textAlign: "center"}}>
                    {`${countdown.days} Days, ${countdown.hours} Hours, ${countdown.minutes} Mins & ${countdown.seconds} Secs`}
                    </h3>
                    </>
                }
            </Container> */}
      <Container className="pt-3">
        <Container>
          <CardDeck>
            <Card body className="text-center text-white mini">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginTop: "40px",
                }}
              >
                <h5 className="calvino tvl">TVL</h5>
                <h5 className="source font-weight-bold text-white">
                  {Number(contractBalance) === 0 ? (
                    <>?</>
                  ) : (
                    <>
                      {contractBalance > 0
                        ? Number(contractBalance).toFixed(5)
                        : "0.00"}
                      LP ($
                      {contractBalance > 0
                        ? (Number(contractBalance) * Number(lpPrice)).toFixed(2)
                        : "0.00"}
                      )
                    </>
                  )}
                </h5>
              </div>
            </Card>
            <Card
              body
              className="text-center text-white "
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <img src={yolkaImg} alt="" />
              <div>
                <h5 className="calvino tvl">USERS</h5>
                <h5 className="source font-weight-bold text-white">
                  {Number(totalUsers) === 0 ? (
                    <>?</>
                  ) : (
                    <>{Number(totalUsers)}</>
                  )}
                </h5>
              </div>
            </Card>
            <Card body className="text-center text-white mini">
              <h5 className="calvino tvl">STAKE FEE</h5>
              <h5 className="source font-weight-bold text-white">10%</h5>
            </Card>
            <Card body className="text-center text-white mini">
              <h5 className="calvino tvl">COLLECTION FEE</h5>
              <h5 className="source font-weight-bold text-white">10%</h5>
            </Card>
          </CardDeck>
        </Container>
        <TabsContainer className="pt-3">
          <Tabs selectedTab={activeTab} onChange={handleChange}>
            <Tab label="CURRENT STAKES & YIELD" value={0}></Tab>
            <Tab label="ENTER STAKE" value={1}></Tab>
          </Tabs>
        </TabsContainer>

        <TabPanel value={activeTab} selectedIndex={0}>
          <Row>
            <Col></Col>
            <Col className="text-center"></Col>
            <Col></Col>
          </Row>

          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                src={bigDishImg}
                alt=""
                className="bigDishImgTag"
                style={{ width: "820px", position: "absolute", zIndex: " 0" }}
              />
            </div>

            <CardDeck
              className="p-3 bigDishUnderCard"
              style={{ marginTop: "350px" }}
            >
              <Card style={{ background: "transparent" }}>
                <img
                  src={monster2Img}
                  alt=""
                  style={{ width: "52px", marginLeft: "30px" }}
                />
                <div
                  className="text-center text-greenyellow"
                  style={{
                    background: "rgba(155, 139, 139, 0.29)",
                    border: "1.09121px solid rgba(0, 0, 0, 0.05)",
                    borderRadius: "16.3682px",
                    width: "100%",
                  }}
                >
                  <h4 className="calvino text-greenyellow">
                    TOTAL STAKED VALUE
                  </h4>
                  <h1 className="source font-weight-bold text-white">
                    <TotalStakedValue />
                  </h1>
                  <UnstakeOptions />
                </div>
              </Card>
              <Card style={{ background: "transparent" }}>
                <div style={{ display: "flex", justifyContent: "right" }}>
                  <img
                    src={monster2Img}
                    alt=""
                    style={{ width: "52px", marginRight: "30px" }}
                  />
                </div>
                <div
                  className="text-center text-greenyellow"
                  style={{
                    background: "rgba(155, 139, 139, 0.29)",
                    border: "1.09121px solid rgba(0, 0, 0, 0.05)",
                    borderRadius: "16.3682px",
                    width: "100%",
                  }}
                >
                  <h4 className="calvino text-greenyellow">TOTAL EARNINGS</h4>
                  <CardDeck>
                    <Card style={{ background: "transparent" }}>
                      <h4 className="source font-weight-bold text-white">
                        <TotalEarnedPercent /> %
                      </h4>
                    </Card>
                    <Card style={{ background: "transparent" }}>
                      <h4 className="source font-weight-bold text-white">
                        <TotalEarnedValue />
                      </h4>
                    </Card>
                  </CardDeck>
                  <Row>
                    <Col>
                      <Button
                        className="custom-button source mt-3"
                        outline
                        onClick={() => compound()}
                      >
                        compound
                      </Button>
                      <Button
                        className="custom-button source mt-3"
                        outline
                        onClick={() => withdrawDivs()}
                      >
                        collect
                      </Button>
                    </Col>
                  </Row>
                  <small className="pt-2 source text-greenyellow">
                    Note: Collecting will reset all stakes to 3% daily. Compound
                    will add to your stakes while doing the same.
                  </small>
                </div>
              </Card>
            </CardDeck>
            <CardDeck className="pl-3 pr-3 pb-3">
              <Card body className="text-center text-greenyellow">
                <h5 className="calvino text-greenyellow">REFERRALS EARNED</h5>
                {refBonusLoading ? (
                  <></>
                ) : (
                  <>
                    <h4 className="source font-weight-bold text-white">
                      {referralAccrued > 0
                        ? Number(referralAccrued || 0).toFixed(5)
                        : "0.00"}
                      LP ($
                      {referralAccrued > 0
                        ? (Number(referralAccrued || 0) * lpPrice).toFixed(2)
                        : "0.00"}
                      )
                    </h4>
                    <Row>
                      <Col>
                        <Button
                          className="custom-button source mt-2"
                          outline
                          onClick={() => stakeRefBonus()}
                        >
                          STAKE
                        </Button>
                        <Button
                          className="custom-button source mt-2"
                          outline
                          onClick={() => withdrawRefBonus()}
                        >
                          COLLECT
                        </Button>
                      </Col>
                    </Row>
                  </>
                )}
              </Card>
              <Card body className="text-center text-greenyellow">
                <h5 className="calvino text-greenyellow">REFERRAL LINK</h5>
                <h3
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${window.location.origin}?ref=${connectedWalletAddress}`
                    )
                  }
                  className="referralButton source font-weight-bold"
                >
                  <FaCopy size="1.6em" className="pr-3" />
                  COPY LINK
                </h3>
                <small className="source text-greenyellow">
                  Earn 10% when someone uses your referral link.
                </small>
              </Card>
            </CardDeck>
            <CardDeck className="pt-2 pr-3 pl-3 pb-3">
              <Card body className="text-center text-greenyellow">
                <h4
                  className="calvino text-greenyellow"
                  style={{ lineHeight: "10px" }}
                >
                  CURRENT STAKES
                </h4>
                <small className="pt-0 pb-4 source text-greenyellow">
                  Here's a list of all of your current stakes.
                </small>
                <ListOfUserStakes />
              </Card>
              <Card hidden body className="text-center text-greenyellow">
                <h4 className="calvino text-greenyellow">Days Staked</h4>
                <h3 className="source font-weight-bold text-white">2 days</h3>
              </Card>
              <Card hidden body className="text-center text-greenyellow">
                <h4 className="calvino text-greenyellow">Time to Max</h4>
                <CardDeck>
                  <Card>
                    <h4 className="source font-weight-bold text-white">?</h4>
                    <small className="source">days until max</small>
                  </Card>
                  <Card>
                    <h4 className="source font-weight-bold text-white">LP</h4>
                    <small className="source">max per day</small>
                  </Card>
                </CardDeck>
              </Card>
              <Card hidden body className="text-center text-greenyellow">
                <h4 className="calvino text-greenyellow">Current Claim Fee</h4>
                <h3 className="source font-weight-bold text-white">20%</h3>
                <small className="source text-greenyellow">
                  days until decrease to 12%
                </small>
              </Card>
            </CardDeck>
          </div>
        </TabPanel>
        <TabPanel value={activeTab} selectedIndex={1}>
          <div style={{ position: "relative" }}>
            <img
              src={monster1Img}
              alt=""
              className="monster1"
              style={{
                position: "absolute",
                zIndex: "10",
                width: "280px",
                top: "0px",
                right: "89%",
              }}
            />
            <CardDeck className="p-3 ">
              <Card body className="text-center ">
                <h4 className="calvino text-greenyellow">ENTER STAKE</h4>
                <p className="source text-center text-greenyellow">
                  {inputCoin === USDC_ADDRESS
                    ? "Approve and stake your USDC here. "
                    : "Stake your FTM here."}
                  <span className="font-weight-bold">
                    You can view your ongoing stakes in the Current Stakes &
                    Yield
                  </span>{" "}
                  tab.
                </p>
                <Form>
                  <FormGroup>
                    {/* <Label className="source font-weight-bold text-greenyellow">Select Input Coin</Label> */}
                    <br></br>
                    {/* <select className='custom-button' name="cars" id="cars" value={inputCoin} onChange={(e) => { setInputCoin(e.target.value); setStakingAmount(""); }} >
                                            <option value={nativeCoin} style={{ textAlign: "center" }}>FTM</option>
                                            <option value={USDC_ADDRESS} style={{ textAlign: "center" }}>USDC</option>
                                        </select> */}
                    {/* <br></br> */}
                    <br></br>
                    <Label className="source font-weight-bold text-greenyellow">
                      STAKE AMOUNT
                    </Label>
                    <input
                      className="custom-input text-center source"
                      style={{
                        width: "100%",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                      }}
                      placeholder={
                        inputCoin === nativeCoin
                          ? "MIN 120, MAX 10000 FTM"
                          : "MIN 25, MAX 10000 USDC"
                      }
                      value={stakingAmount}
                      onChange={(e) => {
                        setStakingAmount(e.target.value);
                      }}
                    />
                    {inputCoin === USDC_ADDRESS && (
                      <Button
                        onClick={() => approveButton()}
                        className="custom-button mt-4 source font-weight-bold"
                      >
                        APPROVE
                      </Button>
                    )}
                    <Button
                      onClick={() => stakeAmount()}
                      className="custom-button mt-4 source font-weight-bold"
                    >
                      STAKE
                    </Button>
                  </FormGroup>
                </Form>
                <small className="source text-greenyellow text-left">
                  <FaWallet size="1.7em" className="pr-2" />
                  Your wallet: &nbsp;
                  <span className="text-white font-weight-bold">
                    {inputCoin === USDC_ADDRESS
                      ? `${userStablecoinBalance.toFixed(2)} USDC`
                      : `${userFantomBalance.toFixed(2)} FTM`}
                  </span>
                </small>
                <small className="source text-greenyellow text-left">
                  <FaUserShield size="1.7em" className="pr-2" />
                  Approved amount: &nbsp;
                  <span className="text-white font-weight-bold">
                    {inputCoin === USDC_ADDRESS
                      ? `${stablecoinAllowanceAmount.toFixed(2)} USDC`
                      : `${userFantomBalance.toFixed(2)} FTM`}
                  </span>
                </small>
                <a
                  className="source text-left text-underline text-greenyellow"
                  href="https://spooky.fi/#/swap"
                  target="_blank"
                  rel="noreferrer"
                >
                  <small className="source text-greenyellow text-left">
                    <FaSearchDollar size="1.7em" className="pr-2" />
                    Swap your tokens for coins here.{" "}
                  </small>
                </a>
              </Card>
              <Card
                body
                className="source text-center"
                style={{ backgroundColor: "rgba(71, 84, 71, 0.64)" }}
              >
                <h4 className="calvino text-greenyellow">
                  IMPORTANT INFORMATION
                </h4>
                <span
                  className="font-weight-bold "
                  style={{ textAlign: "left", color: "white" }}
                >
                  Stake at any time.{" "}
                </span>
                <br></br>
                <p className="text-left text-greenyellow">
                  When a new stake is made, overall yield accrual is set to 3%.
                </p>
                <br></br>
                <br></br>
                <span
                  className="font-weight-bold"
                  style={{ textAlign: "left", color: "white" }}
                >
                  Staking fee is a flat 10%.{" "}
                </span>
                <br></br>
                <p className="text-left  text-greenyellow">
                  Use the Earnings Calculator to determine how much a stake will
                  earn daily.
                </p>
                <small className="text-left  text-greenyellow">
                  Disclaimer: Dividend payouts will take place at a flat rate.
                  Payouts continue contingent on Smart Contract health and
                  liquidity.
                </small>
                <small className="pt-3 text-center font-weight-bold">
                  <a
                    className="text-greenyellow"
                    href="/FTM GROW HOUSE - WP3.pdf"
                    target="_blank"
                    style={{ color: "white" }}
                  >
                    For further questions, please read our DOCS
                  </a>
                </small>
              </Card>
            </CardDeck>

            <Parallax strength={500}>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src={bigDishImg}
                  alt=""
                  className="bigDishImgTag"
                  style={{ width: "820px", position: "absolute", zIndex: " 0" }}
                />
                <Container
                  className="pb-3 pt-3 calvino text-center bigDishUnderCard"
                  style={{ zIndex: " 1", marginTop: "350px" }}
                >
                  <CardDeck>
                    <Card style={{ background: "transparent" }}>
                      <img
                        src={monster2Img}
                        alt=""
                        style={{ width: "52px", marginLeft: "30px" }}
                      />
                      <div
                        className="p-3"
                        style={{
                          background: "rgba(155, 139, 139, 0.29)",
                          border: "1.09121px solid rgba(0, 0, 0, 0.05)",
                          borderRadius: "16.3682px",
                        }}
                      >
                        <h3 className="text-white">DIVIDENDS</h3>
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <table className="source text-greenyellow ">
                            <tbody>
                              <tr>
                                <td className="font-weight-bold">Level</td>
                                <td className="font-weight-bold">
                                  Stake Length
                                </td>
                                <td className="font-weight-bold">Earnings</td>
                              </tr>
                              <tr>
                                <td>1</td>
                                <td>Day 1 - 10</td>
                                <td>3% daily</td>
                              </tr>
                              <tr>
                                <td>2</td>
                                <td>Day 11 - 20</td>
                                <td>3.5% daily</td>
                              </tr>
                              <tr>
                                <td>3</td>
                                <td>Day 21 - 30</td>
                                <td>4% daily</td>
                              </tr>
                              <tr>
                                <td>4</td>
                                <td>Day 31 - 40</td>
                                <td>4.5% daily</td>
                              </tr>
                              <tr>
                                <td>5</td>
                                <td>Day 41 - 50</td>
                                <td>5% daily</td>
                              </tr>
                              <tr>
                                <td>6</td>
                                <td>Day 51 - 60</td>
                                <td>5.5% daily</td>
                              </tr>
                              <tr>
                                <td>7</td>
                                <td>Day 61 - 70</td>
                                <td>6% daily</td>
                              </tr>
                              <tr>
                                <td>8</td>
                                <td>Day 71 - 80</td>
                                <td>6.5% daily</td>
                              </tr>
                              <tr>
                                <td>9</td>
                                <td>Day 81 - 90</td>
                                <td>7% daily</td>
                              </tr>
                              <tr>
                                <td>♛ 10 </td>
                                <td>Day 91 - ∞</td>
                                <td>10% daily</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <br />
                        <small className="source  text-greenyellow">
                          Compounding and collecting earnings from dividends
                          reset all stakes to level 1. Creating new stakes has
                          no effect on existing stakes.
                        </small>
                        <br />
                        <small className="source  text-greenyellow">
                          Disclaimer: Dividend payouts are fixed and the TVL
                          fluctuations do not effect the daily yield like in
                          traditional miners.
                        </small>
                      </div>
                    </Card>

                    <Card className="p-3" style={{ background: "transparent" }}>
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <img
                          src={monster3Img}
                          alt=""
                          style={{ width: "108px" }}
                        />
                      </div>
                      <div
                        style={{
                          backgroundColor: "black",
                          border: "8px rgba(155, 139, 139, 0.29) solid",
                          borderRadius: "16.3682px",
                        }}
                      >
                        <br />
                        <h3 className="text-white">STAKING</h3>
                        <span className="source text-center  text-greenyellow pl-2 pb-2 pr-3">
                          <br />
                          10% fee on intial stakes
                          <br />
                          <br />
                          <br />
                          Stakes immediately start earning 3% daily
                          <br />
                          <br />
                          <br />
                          Claim fees start at 20% and decrease to 10%
                          <br />
                          <br />
                          <br />
                          10% fee on dividend collections
                          <br />
                          <br />
                          <br />
                          No fees on compounds
                          <br />
                          <br />
                          <br />
                        </span>
                      </div>
                    </Card>
                  </CardDeck>
                </Container>
              </div>
            </Parallax>
          </div>
        </TabPanel>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          <img
            src={monster5Img}
            alt=""
            style={{ width: "186px", position: "absolute", zIndex: "0" }}
          />
          <div
            style={{
              textAlign: "center",
              color: "white",
              background: "black",
              border: "2px solid #CBFF00",
              borderRadius: "10px",
              width: "80%",
              paddingTop: "2rem",
              paddingBottom: "2rem",
              fontFamily: "Bakbak One",
              fontStyle: "normal",
              fontWeight: 400,
              fontSize: "36.2696px",
              lineHeight: "37px",
              zIndex: 1,
              marginTop: "200px",
            }}
          >
            FTM GROW HOUSE <span className="text-greenyellow">WITH</span> 3%
            <br />
            <span className="text-greenyellow">REWARDS DAILY</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "100px",
            alignItems: "center",
            paddingBottom: 0,
            marginBottom: "-15px",
          }}
        >
          <img src={monster6Img} alt="" style={{ width: "209px" }} />
          <div
            className="text-greenyellow earningCalsBannerText"
            style={{
              fontFamily: "Open Sans",
              fontStyle: "normal",
              fontWeight: 400,
              fontSize: "59.759px",
              lineHeight: "90px",
              /* identical to box height, or 150% */
              textAlign: "center",
            }}
          >
            EARNINGS CALCULATOR
          </div>
        </div>
        <Container className="pt-0 mt-0">
          <Card body>
            <h2 className="calvino text-center text-greenyellow">
              EARNINGS CALCULATOR
            </h2>
            <CardDeck>
              <Card body className="text-center">
                <h3 className="calvino font-weight-bold text-greenyellow">
                  STAKING
                </h3>
                <Form>
                  <FormGroup>
                    <Label className="source font-weight-bold text-greenyellow">
                      STAKE AMOUNT
                    </Label>
                    <InputGroup>
                      <Input
                        className="custom-input text-center source"
                        placeholder={
                          inputCoin === nativeCoin
                            ? "MINIMUM 120 FTM"
                            : "MINIMUM 25 USDC"
                        }
                        // onChange={(e) => this.setCalcAmount(`${e.target.value}`)}
                        onChange={updateCalc}
                      ></Input>
                    </InputGroup>
                  </FormGroup>
                </Form>
                <Label className="source font-weight-bold text-greenyellow">
                  DAYS STAKED
                </Label>
                <Col className="text-center">
                  <Box>
                    <Slider
                      defaultValue={50}
                      aria-label="Default"
                      valueLabelDisplay="auto"
                      color="primary"
                      onChange={(_, v) => calculate(v)}
                    />
                  </Box>
                </Col>
              </Card>
              <Card body className="text-center">
                <h3 className="calvino font-weight-bold text-greenyellow">
                  EARNINGS
                </h3>
                <CardDeck>
                  <Card style={{ background: "rgba(0, 0, 0, 0.5)" }}>
                    <h3 className="calvino text-white">{calcTotalDividends}</h3>
                    <small className="source text-white">
                      total dividends earned
                    </small>
                  </Card>
                  <Card style={{ background: "rgba(0, 0, 0, 0.5)" }}>
                    <h3 className="calvino text-white">
                      {initalStakeAfterFees}
                    </h3>
                    <small className="source text-white">
                      initial stake after fees
                    </small>
                  </Card>
                </CardDeck>
                <CardDeck className="pt-3">
                  <Card style={{ background: "rgba(0, 0, 0, 0.5)" }}>
                    <h3 className="calvino text-white">{dailyPercent}%</h3>
                    <small className="source text-white">
                      earning daily (%)
                    </small>
                  </Card>
                  <Card style={{ background: "rgba(0, 0, 0, 0.5)" }}>
                    <h3 className="calvino text-white">{dailyValue}</h3>
                    <small className="source text-white">
                      {inputCoin === USDC_ADDRESS
                        ? "earning daily (USDC)"
                        : "earning daily (FTM)"}
                    </small>
                  </Card>
                </CardDeck>
              </Card>
            </CardDeck>
          </Card>
        </Container>

        <Container className="pt-5 text-center calvino text-greenyellow">
          <Card body className="mb-5 p-3">
            <CardDeck className="custom-footer">
              <a
                href="/FTM GROW HOUSE - WP3.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-greenyellow"
              >
                {" "}
                DOCS{" "}
              </a>
              <a
                href="https://twitter.com/dank_ecosystem"
                target="_blank"
                rel="noreferrer"
                className="text-greenyellow"
              >
                {" "}
                TWITTER{" "}
              </a>
              <a
                href="https://t.me/+k09Px0NCM_gwZGFh"
                target="_blank"
                rel="noreferrer"
                className="text-greenyellow"
              >
                {" "}
                TELEGRAM{" "}
              </a>
              <a
                href={`https://ftmscan.com/address/${PLATFORM_CONTRACT_ADDRESS}#code`}
                target="_blank"
                rel="noreferrer"
                className="text-greenyellow"
              >
                {" "}
                CONTRACT{" "}
              </a>
              <a
                href="/AUDIT- ONE.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-greenyellow"
              >
                {" "}
                AUDIT{" "}
              </a>
            </CardDeck>
          </Card>
          <p style={{ fontSize: "14px", paddingBottom: "50px" }}>
            COPYRIGHT © 2022 GROW HOUSE ALL RIGHTS RESERVED
          </p>
        </Container>
      </Container>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={working}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}
export default GrowGarden;
