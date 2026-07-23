import { OrderConfirmation } from '@/widgets/order-confirmation';

type OrderPageProps = Readonly<{
  params: Promise<{
    orderId: string;
  }>;
}>;

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId } = await params;

  return <OrderConfirmation orderId={orderId} />;
}
