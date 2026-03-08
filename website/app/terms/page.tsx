import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service - Swadl",
  description: "Swadl Terms of Service.",
};

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: `By downloading, installing, or using Swadl ("App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the App. The App is developed and maintained by Gopal Iyer ("we," "our," or "us").`,
  },
  {
    title: "2. Description of Service",
    content: `Swadl is a parenting coordination app that helps caregivers track baby care activities (feeding, sleep, diapers, pumping), manage household chores, coordinate shifts, and share briefings. It is not a medical device and does not provide medical advice.`,
  },
  {
    title: "3. Eligibility",
    content: `You must be at least 18 years old (or the age of majority in your jurisdiction) to create an account. The App is intended for use by parents, legal guardians, and authorized caregivers. Children are not permitted to use the App directly.`,
  },
  {
    title: "4. Account Responsibilities",
    content: `You are responsible for:
- Maintaining the security of your account credentials
- All activity that occurs under your account
- Ensuring that anyone you invite to your household is an authorized caregiver

You may delete your account at any time from Settings. Account deletion is permanent and irreversible.`,
  },
  {
    title: "5. Acceptable Use",
    content: `You agree not to:
- Use the App for any unlawful purpose
- Attempt to gain unauthorized access to other users' data
- Reverse engineer, decompile, or disassemble the App
- Transmit malware or interfere with the App's operation
- Use the App to harass, abuse, or harm others
- Create accounts using false or misleading information`,
  },
  {
    title: "6. Your Data",
    content: `You retain ownership of all data you enter into the App (activity logs, baby information, notes, etc.). By using the App, you grant us a limited license to store, process, and display your data solely for the purpose of providing the App's features.

Data within a household is shared among all household members based on their assigned role (admin, caregiver, or restricted). You are responsible for managing who has access to your household.

See our Privacy Policy for full details on how we handle your data.`,
  },
  {
    title: "7. Not Medical Advice",
    content: `Swadl is a care coordination tool, not a medical device. The App does not provide medical advice, diagnoses, or treatment recommendations.

Features like feeding trends, sleep summaries, and diaper counts are for informational purposes only. Always consult a qualified healthcare provider for medical concerns about your child.

We are not liable for any decisions made based on information displayed in the App.`,
  },
  {
    title: "8. Availability and Changes",
    content: `We strive to keep the App available and functional, but we do not guarantee uninterrupted service. We may:
- Modify, suspend, or discontinue features at any time
- Perform maintenance that temporarily affects availability
- Update these Terms with reasonable notice via the App

Continued use after changes constitutes acceptance of updated Terms.`,
  },
  {
    title: "9. Limitation of Liability",
    content: `To the maximum extent permitted by law:

THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE APP WILL BE ERROR-FREE, UNINTERRUPTED, OR SECURE.

IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE APP, INCLUDING BUT NOT LIMITED TO LOSS OF DATA.

OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE APP (IF ANY) IN THE 12 MONTHS PRECEDING THE CLAIM.`,
  },
  {
    title: "10. Indemnification",
    content: `You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of the App, violation of these Terms, or infringement of any third party's rights.`,
  },
  {
    title: "11. Termination",
    content: `We may suspend or terminate your access to the App if you violate these Terms. You may terminate your account at any time by deleting it from Settings. Upon termination, your data will be deleted in accordance with our Privacy Policy.`,
  },
  {
    title: "12. Governing Law",
    content: `These Terms are governed by the laws of the United States. Any disputes shall be resolved through good-faith negotiation before pursuing formal proceedings.`,
  },
  {
    title: "13. Contact Us",
    content: `If you have questions about these Terms, contact us at:

Gopal Iyer
swadl.support@gmail.com`,
  },
];

export default function TermsOfService() {
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
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 36, color: "#1A1612", marginBottom: 4 }}>Terms of Service</h1>
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
