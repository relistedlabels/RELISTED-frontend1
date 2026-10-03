import { readFileSync } from "fs";

const TWILIO_ACCOUNT_SID =
  process.env.TWILIO_ACCOUNT_SID ?? "";
const TWILIO_AUTH_TOKEN =
  process.env.TWILIO_AUTH_TOKEN ?? "";

const CUSTOMER_PROFILE_SID =
  process.env.CUSTOMER_PROFILE_SID ??
  "BU3a87a3474913086663266caac740cc5c";

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.error(
    "Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.",
  );
  process.exit(1);
}

async function deleteDraftProfile(): Promise<void> {
  const url = `https://trusthub.twilio.com/v1/CustomerProfiles/${CUSTOMER_PROFILE_SID}`;

  console.log(`Deleting profile: ${CUSTOMER_PROFILE_SID}`);

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`,
      ).toString("base64")}`,
    },
  });

  if (res.status === 204) {
    console.log("Profile deleted successfully.");
  } else {
    const body = await res.text();
    console.error(`Request failed (${res.status}): ${body}`);
    process.exit(1);
  }
}

deleteDraftProfile();
