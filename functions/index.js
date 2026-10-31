// 출석·하원을 누르면 그 학생 부모님 휴대폰으로 푸시 알림을 보내요.
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const APP_URL = "https://yjdoit007.github.io/attendance/";
const CFG0 = {academy: "", inMsg: "[{학원}] {이름} 학생이 {시간}에 학원에 도착했어요.", outMsg: "[{학원}] {이름} 학생이 {시간}에 수업을 마치고 하원했어요."};
const seoulDate = d => new Intl.DateTimeFormat("en-CA", {timeZone: "Asia/Seoul"}).format(d);
const seoulTime = iso => new Intl.DateTimeFormat("ko-KR", {timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false}).format(new Date(iso));

exports.notifyParents = functions.region("asia-northeast3").firestore.document("users/{uid}/att/{id}").onWrite(async (change, ctx) => {
  const a = change.after.exists ? change.after.data() : null, b = change.before.exists ? change.before.data() : null;
  if (!a || !a.sid) return;
  let kind = null, at = null;
  if (a.status === "present" && a.inAt && a.inAt !== b?.inAt) { kind = "in"; at = a.inAt; }
  else if (a.status === "leave" && a.outAt && a.outAt !== b?.outAt) { kind = "out"; at = a.outAt; }
  if (!kind) return;
  if (a.date !== seoulDate(new Date())) return; // 지난 날짜를 고칠 때는 보내지 않아요.
  if (Date.now() - new Date(at).getTime() > 30 * 60 * 1000) return; // 오프라인에서 늦게 올라온 기록도 건너뛰어요.

  const userRef = db.collection("users").doc(ctx.params.uid);
  const [sSnap, cSnap] = await Promise.all([userRef.collection("students").doc(a.sid).get(), userRef.collection("cfg").doc("main").get()]);
  const s = sSnap.data();
  if (!s || !s.linkCode) return;
  const cfg = {...CFG0, ...(cSnap.data() || {})};
  if (cfg.push === false) return;
  const link = await db.collection("links").doc(s.linkCode).get();
  if (!link.exists || link.data().uid !== ctx.params.uid) return;
  const devs = await link.ref.collection("devices").get();
  if (devs.empty) return;

  const tpl = kind === "in" ? cfg.inMsg : cfg.outMsg;
  const body = (cfg.academy ? tpl : tpl.replaceAll("[{학원}] ", "")).replaceAll("{이름}", s.name).replaceAll("{시간}", seoulTime(at)).replaceAll("{학원}", cfg.academy);
  const res = await admin.messaging().sendEachForMulticast({
    tokens: devs.docs.map(d => d.data().token),
    notification: {title: cfg.academy || "출결 알림", body},
    webpush: {notification: {icon: APP_URL + "icon-192.png"}, fcmOptions: {link: APP_URL + "p/"}},
  });
  // 앱을 지웠거나 알림을 끈 휴대폰은 목록에서 정리해요.
  const dead = [];
  res.responses.forEach((r, i) => {
    const code = r.error?.code || "";
    if (code.includes("registration-token-not-registered") || code.includes("invalid-registration-token") || code.includes("invalid-argument")) dead.push(devs.docs[i].ref.delete());
  });
  await Promise.all(dead);
});
