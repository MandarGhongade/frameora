import { Suspense } from "react";
import { AdminOrder } from "./AdminOrder";

// Static page: the order id comes from the address (?id=FR10244) and is read in the browser.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminOrder />
    </Suspense>
  );
}
