import { Suspense } from "react";
import { OrderDetail } from "./OrderDetail";

// Static page: the order id comes from the address (?id=FR10244) and is read in the browser.
export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <OrderDetail />
    </Suspense>
  );
}
