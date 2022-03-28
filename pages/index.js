import React, { useEffect, useState } from "react";
import { Button, Grid, Item, Box, Container } from "@mui/material";
import {
  Mainnet,
  DAppProvider,
  useEtherBalance,
  useEthers,
  Config,
  shortenAddress,
  useTokenList,
  useCalls,
  ERC20Interface,
  useSendTransaction,
  useTransactions,
  useContractFunction,
} from "@usedapp/core";
import { formatEther } from "@ethersproject/units";
import { useSnackbar } from "notistack";
import { useCoingeckoPrice, useCoingeckoTokenPrice } from "@usedapp/coingecko";
import { Contract } from "@ethersproject/contracts";
import { formatUnits } from "@ethersproject/units";
import { utils } from "ethers";
import WethAbi from "../abi/Weth10.json";
// import WethAbi from '../abi.json'

export default function Home() {
  const [activateError, setActivateError] = useState("");
  const [showConnectModal, setShowConnectModal] = useState(true);
  const [amount, setAmount] = useState("0.1");
  const [signedMessage, setSignedMessage] = useState("");

  const {
    activateBrowserWallet,
    deactivate,
    account,
    error,
    chainId,
    library,
  } = useEthers();

  // 弹框
  const { enqueueSnackbar } = useSnackbar();

  // 钱包余额
  const etherBalance = useEtherBalance(account);
  if (account !== "" && showConnectModal) {
    enqueueSnackbar("connect success", { variant: "success" });
    setShowConnectModal(false);
  }

  // eth价格
  const etherPrice = useCoingeckoPrice("ethereum", "usd");
  const WETH_CONTRACT = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  const wethPrice = useCoingeckoTokenPrice(WETH_CONTRACT, "usd");

  // 查币价和对应钱包余额
  const UNISWAP_DEFAULT_TOKEN_LIST_URI =
    "https://gateway.ipfs.io/ipns/tokens.uniswap.org";
  const { name, logoURI, tokens } =
    useTokenList(UNISWAP_DEFAULT_TOKEN_LIST_URI, chainId) || {};
  if (tokens && tokens.length > 0) {
    console.log(tokens);
  }
  const balances = useTokensBalance(tokens, account);
  if (balances && balances.length > 0) {
    console.log(balances);
  }
  function useTokensBalance(tokenList, account) {
    return useCalls(
      tokenList && account
        ? tokenList.map((token) => ({
            contract: new Contract(token.address, ERC20Interface),
            method: "balanceOf",
            args: [account],
          }))
        : []
    );
  }

  // 链接钱包报错
  useEffect(() => {
    if (error) {
      setActivateError(error.message);
      console.log(error.message);
      enqueueSnackbar(error.message, { variant: "error" });
    }
  }, [error]);

  // 链接钱包
  const handleConnectWallet = async () => {
    setActivateError("");
    activateBrowserWallet();
  };

  // 发送eth
  const { sendTransaction, state } = useSendTransaction({
    transactionName: "Send Ethereum",
  });

  const sendETH = () => {
    sendTransaction({
      to: "0x8ddD1Dbef0B19746751fCA32F0481E82EF0Ac001",
      value: utils.parseEther("0.1"),
    });
  };

  //签名
  async function onSign() {
    const msg = "I sign Wallet Connect test message on @usedapp";
    const provider = library;
    try {
      const signedMsg = await provider.getSigner().signMessage(msg);
      setSignedMessage(signedMsg);
    } catch (error) {
      console.error(error);
    }
  }

  // 历史操作
  if (account !== "") {
    const { transactions } = useTransactions();
    console.log(transactions);
  }

  // 调用合约
  const wethInterface = new utils.Interface(WethAbi);
  const wethContractAddress = "0xA243FEB70BaCF6cD77431269e68135cf470051b4";
  const contract = new Contract(wethContractAddress, wethInterface);
  const { send } = useContractFunction(contract, "deposit", {
    transactionName: "Wrap",
  });
  const onContract = () => {
    send({ value: utils.parseEther("0.1") });
  };
  return (
    <div>
      {!account && (
        <Button variant="contained" onClick={handleConnectWallet}>
          connect
        </Button>
      )}

      {account && (
        <Button variant="contained" onClick={() => deactivate()}>
          disconnect
        </Button>
      )}
      {account && <p>Account: {account}</p>}
      {account && <p>shortAccount: {shortenAddress(account)}</p>}

      {etherBalance && <p>Balance: {formatEther(etherBalance)}</p>}

      {etherPrice && (
        <p>
          <span>Ethereum price:</span> <span>$ </span>
          <span>{etherPrice}</span>
        </p>
      )}
      {wethPrice && (
        <p>
          <span>WETH price:</span> <span>$ </span>
          <span>{wethPrice}</span>
        </p>
      )}
      <p>
        <span>Chain id:</span>
        <span>{chainId}</span>
      </p>
      {tokens &&
        tokens.map((token, idx) => {
          const balance = balances[idx];
          return (
            <p key={token.address}>
              <span>
                {token.name}&nbsp;&nbsp;&nbsp; {token.symbol}
              </span>

              {balance && !balance.error && (
                <span>{formatUnits(balance.value[0], token.decimals)}</span>
              )}
            </p>
          );
        })}
      {account && (
        <Button variant="contained" onClick={() => sendETH()}>
          send 0.1eth to 0x8ddD1Dbef0B19746751fCA32F0481E82EF0Ac001
        </Button>
      )}
      <br></br>
      {account && (
        <Button variant="contained" onClick={() => onSign()}>
          sign
        </Button>
      )}
      {account && <div>{transactions}</div>}
      {account && (
        <Button variant="contained" onClick={() => onContract()}>
          contract
        </Button>
      )}
    </div>
  );
}
