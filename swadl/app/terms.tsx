import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function TermsOfService() {
  return (
    <ScrollView className="flex-1 bg-screen-bg">
      <View className="px-6 pt-14 pb-10">
        <TouchableOpacity className="mb-6" onPress={() => router.back()}>
          <Text className="text-feed-primary text-base">← Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-display text-text-primary mb-1">
          Terms of Service
        </Text>
        <Text className="text-sm text-text-secondary font-mono mb-8">
          Effective Date: March 7, 2026
        </Text>

        <Section title="1. Acceptance of Terms">
          By downloading, installing, or using Swadl ("App"), you agree to be
          bound by these Terms of Service ("Terms"). If you do not agree, do not
          use the App. The App is developed and maintained by Gopal Iyer ("we,"
          "our," or "us").
        </Section>

        <Section title="2. Description of Service">
          Swadl is a parenting coordination app that helps caregivers track baby
          care activities (feeding, sleep, diapers, pumping), manage household
          chores, coordinate shifts, and share briefings. It is not a medical
          device and does not provide medical advice.
        </Section>

        <Section title="3. Eligibility">
          You must be at least 18 years old (or the age of majority in your
          jurisdiction) to create an account. The App is intended for use by
          parents, legal guardians, and authorized caregivers. Children are not
          permitted to use the App directly.
        </Section>

        <Section title="4. Account Responsibilities">
          You are responsible for:{"\n"}
          • Maintaining the security of your account credentials{"\n"}
          • All activity that occurs under your account{"\n"}
          • Ensuring that anyone you invite to your household is an authorized
          caregiver{"\n\n"}
          You may delete your account at any time from Settings. Account
          deletion is permanent and irreversible.
        </Section>

        <Section title="5. Acceptable Use">
          You agree not to:{"\n"}
          • Use the App for any unlawful purpose{"\n"}
          • Attempt to gain unauthorized access to other users' data{"\n"}
          • Reverse engineer, decompile, or disassemble the App{"\n"}
          • Transmit malware or interfere with the App's operation{"\n"}
          • Use the App to harass, abuse, or harm others{"\n"}
          • Create accounts using false or misleading information
        </Section>

        <Section title="6. Your Data">
          You retain ownership of all data you enter into the App (activity
          logs, baby information, notes, etc.). By using the App, you grant us a
          limited license to store, process, and display your data solely for
          the purpose of providing the App's features.{"\n\n"}
          Data within a household is shared among all household members based on
          their assigned role (admin, caregiver, or restricted). You are
          responsible for managing who has access to your household.{"\n\n"}
          See our Privacy Policy for full details on how we handle your data.
        </Section>

        <Section title="7. Not Medical Advice">
          Swadl is a care coordination tool, not a medical device. The App does
          not provide medical advice, diagnoses, or treatment
          recommendations.{"\n\n"}
          Features like feeding trends, sleep summaries, and diaper counts are
          for informational purposes only. Always consult a qualified healthcare
          provider for medical concerns about your child.{"\n\n"}
          We are not liable for any decisions made based on information displayed
          in the App.
        </Section>

        <Section title="8. Availability and Changes">
          We strive to keep the App available and functional, but we do not
          guarantee uninterrupted service. We may:{"\n"}
          • Modify, suspend, or discontinue features at any time{"\n"}
          • Perform maintenance that temporarily affects availability{"\n"}
          • Update these Terms with reasonable notice via the App{"\n\n"}
          Continued use after changes constitutes acceptance of updated Terms.
        </Section>

        <Section title="9. Limitation of Liability">
          To the maximum extent permitted by law:{"\n\n"}
          THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
          IMPLIED. WE DO NOT WARRANT THAT THE APP WILL BE ERROR-FREE,
          UNINTERRUPTED, OR SECURE.{"\n\n"}
          IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE APP,
          INCLUDING BUT NOT LIMITED TO LOSS OF DATA.{"\n\n"}
          OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE APP
          (IF ANY) IN THE 12 MONTHS PRECEDING THE CLAIM.
        </Section>

        <Section title="10. Indemnification">
          You agree to indemnify and hold us harmless from any claims, damages,
          or expenses arising from your use of the App, violation of these
          Terms, or infringement of any third party's rights.
        </Section>

        <Section title="11. Termination">
          We may suspend or terminate your access to the App if you violate
          these Terms. You may terminate your account at any time by deleting it
          from Settings. Upon termination, your data will be deleted in
          accordance with our Privacy Policy.
        </Section>

        <Section title="12. Governing Law">
          These Terms are governed by the laws of the United States. Any
          disputes shall be resolved through good-faith negotiation before
          pursuing formal proceedings.
        </Section>

        <Section title="13. Contact Us" last>
          If you have questions about these Terms, contact us at:{"\n\n"}
          Gopal Iyer{"\n"}
          swadl.support@gmail.com
        </Section>
      </View>
    </ScrollView>
  );
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
      <Text className="text-sm text-text-secondary leading-5 font-body">{children}</Text>
    </View>
  );
}
