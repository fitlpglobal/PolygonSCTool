import dynamic from "next/dynamic";

const CardModule = dynamic(() => import("~/modules/card"), { ssr: false });

export default function Home() {
  return <CardModule />;
}
