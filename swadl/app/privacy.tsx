import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function PrivacyPolicy() {
  return (
    <ScrollView className="flex-1 bg-screen-bg">
      <View className="px-6 pt-14 pb-10">
        <TouchableOpacity className="mb-6" onPress={() => router.back()}>
          <Text className="text-feed-primary text-base">← Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-display text-text-primary mb-1">
          Privacy Policy
        </Text>
        <Text className="text-base text-text-secondary font-mono mb-8">
          Effective Date: March 7, 2026
        </Text>

        <Section title="1. Introduction">
          Swadl ("we," "our," or "us") is developed by Gopal Iyer. This Privacy
          Policy explains how we collect, use, and protect information when you
          use the Swadl mobile application ("App"). We take your privacy —
          especially your child's privacy — seriously.
        </Section>

        <Section title="2. Information We Collect">
          <Bold>Account Information:</Bold> Email address, display name, and
          password (hashed, never stored in plain text).{"\n\n"}
          <Bold>Baby Information:</Bold> Baby's first name, date of birth, and
          feeding method. This information is provided by you and used solely to
          power the App's features.{"\n\n"}
          <Bold>Activity Logs:</Bold> Feeding, diaper, sleep, and pumping logs
          that you voluntarily enter. These are stored to provide tracking,
          trends, and caregiver coordination features.{"\n\n"}
          <Bold>Household Data:</Bold> Household name, care mode preference,
          chore lists, and caregiver shift information.{"\n\n"}
          <Bold>Device Information:</Bold> Push notification token (Expo push
          token) for delivering notifications. We do not collect device
          identifiers, location data, or browsing history.
        </Section>

        <Section title="3. Children's Privacy (COPPA Compliance)">
          Swadl is designed for parents and caregivers — not for use by children.
          The App collects limited information about children (first name, date
          of birth, feeding method) solely as entered by a parent or legal
          guardian for the purpose of baby care tracking.{"\n\n"}
          We do not:{"\n"}
          • Collect information directly from children{"\n"}
          • Display advertising to children{"\n"}
          • Share children's information with third parties for marketing{"\n"}
          • Collect more information than is reasonably necessary{"\n\n"}
          A parent or guardian may review, request deletion of, or refuse further
          collection of their child's information at any time by contacting us at
          swadl.support@gmail.com or by deleting their account within the App.
        </Section>

        <Section title="4. How We Use Your Information">
          We use your information to:{"\n"}
          • Provide and operate the App's features (logging, trends, briefings,
          chore management){"\n"}
          • Coordinate between caregivers in your household{"\n"}
          • Send push notifications you have opted into (chore assignments,
          reminders, shift changes){"\n"}
          • Generate summaries and trends from your logged data{"\n"}
          • Authenticate your identity and secure your account
        </Section>

        <Section title="5. Data Storage and Security">
          Your data is stored securely using Supabase, which provides:{"\n"}
          • Encrypted data at rest and in transit (TLS 1.2+){"\n"}
          • Row-Level Security (RLS) ensuring you can only access your own
          household's data{"\n"}
          • Hosted on AWS infrastructure with SOC 2 compliance{"\n\n"}
          Passwords are hashed using bcrypt via Supabase Auth. We never store or
          have access to your plain-text password.
        </Section>

        <Section title="6. Data Sharing">
          We do not sell, rent, or share your personal information or your
          child's information with third parties, except:{"\n"}
          • <Bold>Within your household:</Bold> Other members of your household
          can see shared activity logs, chores, and briefings.{"\n"}
          • <Bold>Service providers:</Bold> We use Supabase (database/auth) and
          Expo (push notifications) to operate the App. These providers process
          data on our behalf under their respective privacy policies.{"\n"}
          • <Bold>Legal requirements:</Bold> We may disclose information if
          required by law or to protect the safety of users.
        </Section>

        <Section title="7. Data Retention and Deletion">
          Your data is retained as long as your account is active. You may
          delete your account at any time from Settings → Delete Account. This
          permanently removes:{"\n"}
          • Your profile and authentication credentials{"\n"}
          • All activity logs you created{"\n"}
          • Chore completions and shift records{"\n"}
          • If you are the last household member: all baby data, chores, and the
          household itself{"\n\n"}
          Account deletion is irreversible.
        </Section>

        <Section title="8. Your Rights">
          You have the right to:{"\n"}
          • Access your data (visible within the App at all times){"\n"}
          • Correct your data (editable via Settings and the activity feed){"\n"}
          • Delete your data (via Delete Account in Settings){"\n"}
          • Withdraw consent for push notifications (via device settings){"\n\n"}
          For any privacy-related requests, contact us at
          swadl.support@gmail.com.
        </Section>

        <Section title="9. Third-Party Services">
          The App uses the following third-party services:{"\n"}
          • <Bold>Supabase</Bold> — Authentication, database, and edge
          functions (supabase.com/privacy){"\n"}
          • <Bold>Expo / EAS</Bold> — Push notifications and app distribution
          (expo.dev/privacy){"\n\n"}
          We do not use analytics, advertising, or social media SDKs.
        </Section>

        <Section title="10. Changes to This Policy">
          We may update this Privacy Policy from time to time. Changes will be
          reflected in the App with an updated effective date. Continued use of
          the App after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="11. Contact Us" last>
          If you have questions about this Privacy Policy or our data practices,
          contact us at:{"\n\n"}
          Gopal Iyer{"\n"}
          swadl.support@gmail.com
        </Section>
      </View>
    </ScrollView>
  );
}

function Bold({ children }: { children: React.ReactNode }) {
  return <Text className="font-body-bold text-text-primary">{children}</Text>;
}

function Section({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <View className={last ? "" : "mb-6"}>
      <Text className="text-base font-body-semibold text-text-primary mb-2">
        {title}
      </Text>
      <Text className="text-base text-text-secondary leading-5 font-body">{children}</Text>
    </View>
  );
}
