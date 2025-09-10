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

        <Text style={styles.sectionTitle}>1. Use of the Application</Text>
        <Text style={styles.paragraph}>
          You are granted a non-commercial, personal license to use our app. You may not modify, copy, or use it for commercial purposes.
        </Text>

        <Text style={styles.sectionTitle}>2. Data Privacy</Text>
        <Text style={styles.paragraph}>
          We value your privacy. Your data is used solely within the app for management purposes, such as account handling and service tracking. 
          We do not use your data for any other activities, and it will never be shared publicly or with third parties without your consent.
        </Text>

        <Text style={styles.sectionTitle}>3. Account Responsibilities</Text>
        <Text style={styles.paragraph}>
          You are responsible for keeping your account and password secure and for all activities under your account.
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