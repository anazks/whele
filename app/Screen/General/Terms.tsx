import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Terms() {
  const handleOpenEmail = () => {
    Linking.openURL('mailto:maharajahublk@gmail.com?subject=Question%20About%20Terms')
      .catch(() => Alert.alert('Error', 'Unable to open email app'));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.subtitle}>Last updated: September 11, 2025</Text>

        <Text style={styles.paragraph}>
          By using our application, you agree to these Terms and Conditions. Please read them carefully.
        </Text>

        <Text style={styles.sectionTitle}>1. Policy</Text>
        <Text style={styles.paragraph}>
          This privacy policy sets out how Maharajahub uses and protects any information that you give Maharajahub when you visit their website and/or agree to purchase from them.

Maharajahub is committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, and then you can be assured that it will only be used in accordance with this privacy statement.

Maharajahub may change this policy from time to time by updating this page. You should check this page from time to time to ensure that you adhere to these changes.
        </Text>

        <Text style={styles.sectionTitle}>2. Data Privacy</Text>
        <Text style={styles.paragraph}>
          We value your privacy. Your data is used solely within the app for management purposes, such as account handling and service tracking. 
          We do not use your data for any other activities, and it will never be shared publicly or with third parties without your consent.
        </Text>

        <Text style={styles.sectionTitle}>3. Cancellation and Refund Policy</Text>
        <Text style={styles.paragraph}>
          Maharajahub believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:

            Cancellations will be considered only if the request is made within 3-5 days of placing the order.
            However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.
            Maharajahub does not accept cancellation requests for perishable items like flowers, eatables etc.
            However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.
            In case of receipt of damaged or defective items please report the same to our Customer Service team.
            The request will, however, be entertained once the merchant has checked and determined the same at his own end.
            This should be reported within 3-5 days of receipt of the products.
            In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 3-5 days of receiving the product.
            The Customer Service Team after looking into your complaint will take an appropriate decision.
            In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.
            In case of any Refunds approved by the Maharajahub, it'll take 3-5 days for the refund to be processed to the end customer.
        </Text>

        <Text style={styles.sectionTitle}>4. Limitations</Text>
        <Text style={styles.paragraph}>
          We are not liable for any damages from using or being unable to use the app, even if notified of potential issues.
        </Text>

        <Text style={styles.sectionTitle}>5. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may update these terms at any time. Continued use of the app means you agree to the updated terms.
        </Text>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Have Questions?</Text>
          <Text style={styles.contactText}>
            Contact our support team for any questions about these terms.
          </Text>
          <TouchableOpacity style={styles.contactButton} onPress={handleOpenEmail} activeOpacity={0.7}>
            <Ionicons name="mail-outline" size={18} color="#ffffff" />
            <Text style={styles.contactButtonText}>support@yourapp.com</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          By using our app, you agree to these Terms and Conditions.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    marginTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  contactSection: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginTop: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  contactButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
});