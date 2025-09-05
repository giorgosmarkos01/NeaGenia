import { getAccessToken } from "./getAccessToken";

export async function verifyTransaction(transactionId: string) {
  const token = await getAccessToken();

  const res = await fetch(
    `${process.env.VIVA_BASE_URL}/checkout/v2/transactions/${transactionId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error("Failed to verify transaction");

  return data; // statusId, orderCode, amount, etc.
}
