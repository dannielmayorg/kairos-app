import webpush from "web-push";

function getWebPush() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  return webpush;
}

export async function enviarNotificacion(
  endpoint: string,
  keys: { p256dh: string; auth: string },
  payload: { title: string; body: string; url?: string }
) {
  return getWebPush().sendNotification(
    { endpoint, keys },
    JSON.stringify(payload)
  );
}

export default webpush;
