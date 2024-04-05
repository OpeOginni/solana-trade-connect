"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

export default function NFTImage({ uri }: { uri: string }) {
  const [image, setImage] = useState<string | null>(null);
  useEffect(() => {
    async function fetchImage() {
      try {
        const res = await fetch(uri);
        const data = await res.json();
        console.log(data);
        setImage(data.image);
      } catch (err) {
        console.log(err);
      }
    }
    fetchImage();
  }, [uri]);

  if (!image) return <Skeleton className="w-[100px] h-[100px] bg-gray-300" />;

  return <Image src={image} width={100} height={100} alt="NFT" />;
}
