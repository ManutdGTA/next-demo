import "../styles/globals.css";
import { Mainnet, DAppProvider } from "@usedapp/core";
import { SnackbarProvider } from 'notistack';
const config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]:
      "https://mainnet.infura.io/v3/57fc2c19095745e59ab96a4aa87dada8",
  },
};
function MyApp({ Component, pageProps }) {
  return (
    <DAppProvider config={config}>
      <SnackbarProvider maxSnack={2}>
        <Component {...pageProps} />
      </SnackbarProvider>
    </DAppProvider>
  );
  // return <Component {...pageProps} />
}

export default MyApp;
