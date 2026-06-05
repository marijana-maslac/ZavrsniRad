"use client";

import { useRouter } from "next/navigation";
interface Props {
  className?: string;
}
const BackButton = ({ className }: Props) => {
  const router = useRouter();

  return (
    <button onClick={() => router.back()} className={className}>
      Natrag
    </button>
  );
};

export default BackButton;
