import Link from "next/link";
import { cookies } from "next/headers";
import { authenticatedRequest } from "@/api-service/auth.api";

export default async function Dashboard() {
  const access_token = cookies().get("access_token")!.value;

  const fetchedCompany = await authenticatedRequest(access_token);

  console.log(fetchedCompany);
  return (
    <div className="flex flex-col min-h-screen">
      <div className="text-center text-2xl py-12">
        <h1>Welcome EMI</h1>
      </div>

      <div className="flex flex-col gap-7 py-12">
        <div className="text-center border rounded-xl">
          <p>Company ID: ---------</p>
        </div>

        <div className="text-center border rounded-xl">
          <p>Access Key: ---------</p>
        </div>
      </div>

      <div className="text-center py-12">
        <p>
          Check Out
          <Link href="https://github.com" target="_blank">
            <span className="text-blue-700">Example DAPP</span>
          </Link>
        </p>
      </div>

      <div className="text-center border rounded-xl">
        <p>You want to handle the Chat Service Internaly, only needing the swap service?</p>
        <p>gRPC Service COMING SOON!</p>
      </div>
    </div>
  );
}
