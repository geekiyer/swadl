import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - Swadl",
  description: "Swadl Privacy Policy",
};

const SECTIONS = [
  { title: "1. Introduction", content: `Swadl ("we," "our," or "us") is developed by Gopal Iyer. This Privacy Policy explains how we collect, use, and protect information when you use the Swadl mobile application ("App"). We take your privacy \u2014 especially your child\u2019s privacy \u2014 seriously.` },
  { title: "2. Information We Collect", content: `Account Information: Email address, display name, and password (hashed, never stored in plain text).\n\nBaby Information: Baby\u2019s first name, date of birth, and feeding method. This information is provided by you and used solely to power the App\u2019s features.\n\nActivity Logs: Feeding, diaper, sleep, and pumping logs that you voluntarily enter.\n\nHousehold Data: Household name, care mode preference, chore lists, and caregiver shift information.\n\nDevice Information: Push notification token for delivering notifications. We do not collect device identifiers, location data, or browsing history.` },
  { title: "3. Children\u2019s Privacy (COPPA Compliance)", content: `Swadl is designed for parents and caregivers \u2014 not for use by children. We do not:\n\u2022 Collect information directly from children\n\u2022 Display advertising to children\n\u2022 Share children\u2019s information with third parties for marketing\n\u2022 Collect more information than is reasonably necessary\n\nA parent or guardian may review, request deletion of, or refuse further collection of their child\u2019s information at any time by contacting us at swadl.support@gmail.com or by deleting their account within the App.` },
  { title: "4. How We Use Your Information", content: `We use your information to:\n\u2022 Provide and operate the App\u2019s features\n\u2022 Coordinate between caregivers in your household\n\u2022 Send push notifications you have opted into\n\u2022 Generate summaries and trends from your logged data\n\u2022 Authenticate your identity and secure your account` },
  { title: "5. Data Storage and Security", content: `Your data is stored securely using Supabase, which provides:\n\u2022 Encrypted data at rest and in transit (TLS 1.2+)\n\u2022 Row-Level Security (RLS) ensuring you can only access your own household\u2019s data\n\u2022 Hosted on AWS infrastructure with SOC 2 compliance\n\nPasswords are hashed using bcrypt. We never store or have access to your plain-text password.` },
  { title: "6. Data Sharing", content: `We do not sell, rent, or share your personal information with third parties, except:\n\u2022 Within your household: Other members can see shared activity logs, chores, and briefings.\n\u2022 Service providers: We use Supabase (database/auth) and Expo (push notifications) to operate the App.\n\u2022 Legal requirements: We may disclose information if required by law.` },
  { title: "7. Data Retention and Deletion", content: `Your data is retained as long as your account is active. You may delete your account at any time from Settings. This permanently removes all your data. Account deletion is irreversible.` },
  { title: "8. Your Rights", content: `You have the right to:\n\u2022 Access your data (visible within the App)\n\u2022 Correct your data (editable via Settings)\n\u2022 Delete your data (via Delete Account in Settings)\n\u2022 Withdraw consent for push notifications (via device settings)\n\nFor any privacy-related requests, contact us at swadl.support@gmail.com.` },
  { title: "9. Third-Party Services", content: `The App uses Supabase (authentication, database) and Expo/EAS (push notifications, app distribution). We do not use analytics, advertising, or social media SDKs.` },
  { title: "10. Changes to This Policy", content: `We may update this Privacy Policy from time to time. Changes will be reflected in the App with an updated effective date.` },
  { title: "11. Contact Us", content: `If you have questions, contact us at:\n\nGopal Iyer\nswadl.support@gmail.com` },
];

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0" }}>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", backgroundColor: "rgba(255,249,240,0.85)", borderBottom: "1px solid #F0E4D4" }}>
        <div style={{ maxWidth: 768, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Image src="/bee-mascot.png" alt="Swadl" width={32} height={32} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "#1A1612" }}>Swadl</span>
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 768, margin: "0 auto", padding: "112px 24px 64px" }}>
        <Link href="/" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "#E88A30", display: "inline-block", marginBottom: 24 }}>
          &larr; Back to home
        </Link>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 36, color: "#1A1612", marginBottom: 4 }}>Privacy Policy</h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "#8A7560", marginBottom: 40 }}>Effective Date: March 7, 2026</p>

        {SECTIONS.map((s) => (
          <div key={s.title} style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 18, color: "#2E1F10", marginBottom: 8 }}>{s.title}</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "#4A3828", lineHeight: 1.7, whiteSpace: "pre-line" }}>{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
