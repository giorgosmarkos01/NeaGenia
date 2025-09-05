// src/lib/viva/getAccessToken.ts
export async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.VIVA_CLIENT_ID}:${process.env.VIVA_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(
    "https://demo-accounts.vivapayments.com/connect/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    }
  );

  const text = await res.text();
  console.log("[DEBUG getAccessToken response TEXT]:", text);

  const data = JSON.parse(text);
  return data.access_token;
}
