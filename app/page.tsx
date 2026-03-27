import { VendimiaWorld } from '@/components/vendimia/vendimia-world';
import { TransactionPanel } from '@/components/wallet/transaction-panel';

export default function Home() {
  return (
    <>
      <VendimiaWorld />
      <TransactionPanel />
    </>
  );
}
