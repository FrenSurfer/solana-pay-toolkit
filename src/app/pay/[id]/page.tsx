import { notFound } from "next/navigation";
import { getLink } from "@/lib/payment-links";
import { PaymentCard } from "./components/PaymentCard";

export const dynamic = "force-dynamic";

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const link = getLink(id);
  if (!link) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <PaymentCard link={link} />
    </div>
  );
}
