import type { Metadata } from "next";
import { cookies } from "next/headers";
import { authenticatedRequest } from "@/api-service/auth.api";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Trade Connect | Dashboard",
  description: "Integrate NFT Swap Feature easily in you Solana Dapps",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const access_token = cookies().get("access_token")?.value;

  if (!access_token) {
    redirect(`/`); // Navigate to new route
  }

  const fetchedCompany = await authenticatedRequest(access_token);

  if (!fetchedCompany) {
    redirect(`/`); // Navigate to new route
  }

  return <main>{children}</main>;
}
