import { type AppType } from "next/app";
import { Geist } from "next/font/google";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import "@radix-ui/themes/styles.css";

import { Theme } from "@radix-ui/themes";

const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <Theme>
      <div className={geist.className}>
        <Component {...pageProps} />
      </div>
    </Theme>
  );
};

export default api.withTRPC(MyApp);