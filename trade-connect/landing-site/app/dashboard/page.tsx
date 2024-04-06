import Link from "next/link";
import { cookies } from "next/headers";
import { authenticatedRequest } from "@/api-service/auth.api";
import CopyButton from "@/components/CopyButton";

export default async function Dashboard() {
  const access_token = cookies().get("access_token")!.value;

  const fetchedCompany = await authenticatedRequest(access_token);

  const REST_SERVER_URL = (process.env.REST_SERVER_URL as string) || "";
  const WEBSOCKET_SERVER_URL = (process.env.WEBSOCKET_SERVER_URL as string) || "";

  return (
    <div className="flex flex-col min-h-screen">
      <div className="text-center text-2xl py-20">
        <h1>Welcome {fetchedCompany.company.companyName}</h1>
      </div>

      <div className="flex flex-col gap-7 py-20 text-lg">
        <div className="text-center border rounded-xl mx-auto">
          <div className="flex flex-row gap-3 py-3 px-7">
            <p>
              Company ID: <span className="font-extrabold">{fetchedCompany.company.accessKey.companyId}</span>
            </p>
            <CopyButton text={fetchedCompany.company.accessKey.companyId} />
          </div>
        </div>

        <div className="text-center border rounded-xl mx-auto">
          <div className="flex flex-row gap-3 py-3 px-7">
            <p>
              Access Key: <span className="font-extrabold">{fetchedCompany.company.accessKey.accessKey}</span>
            </p>
            <CopyButton text={fetchedCompany.company.accessKey.accessKey} />
          </div>
        </div>

        <div className="text-center border rounded-xl mx-auto">
          <div className="flex flex-row gap-3 py-3 px-7">
            <p>
              REST Server URL: <span className="font-extrabold">{REST_SERVER_URL}</span>
            </p>
            <CopyButton text={REST_SERVER_URL} />
          </div>
        </div>

        <div className="text-center border rounded-xl mx-auto">
          <div className="flex flex-row gap-3 py-3 px-7">
            <p>
              WEBSOCKET Server URL: <span className="font-extrabold">{WEBSOCKET_SERVER_URL}</span>
            </p>
            <CopyButton text={WEBSOCKET_SERVER_URL} />
          </div>
        </div>
      </div>

      <div className="text-center py-10">
        <p>
          Check Out Our{" "}
          <Link href="https://github.com/OpeOginni/solana-trade-connect/blob/main/trade-connect/README.md" target="_blank">
            <span className="text-blue-700">Endpoint DOCS</span>
          </Link>
        </p>
      </div>

      <div className="text-center py-10">
        <p>
          Check Out Our{" "}
          <Link href="https://github.com/OpeOginni/solana-trade-connect/tree/main/example-dapp" target="_blank">
            <span className="text-blue-700">Example DAPP</span>
          </Link>{" "}
          for implementation tips
        </p>
      </div>

      <div className="flex flex-col text-sm font-extrabold text-center gap-2">
        <p>You want to handle the Chat Service Internaly, only needing the swap service?</p>
        <p>gRPC Service COMING SOON!</p>
      </div>
    </div>
  );
}
