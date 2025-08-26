import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function Terms() {
  const handleOpenEmail = () => {
    Linking.openURL('mailto:support@yourapp.com?subject=Question%20About%20Terms')
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {/* <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.subtitle}>Last updated: {new Date().toLocaleDateString()}</Text> */}
      </View>

      <View style={styles.content}>
        <Text style={styles.paragraph}>
          Please read these terms and conditions carefully before using our application.
        </Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using our application, you agree to be bound by these Terms and Conditions. 
          If you disagree with any part of the terms, you may not access the application.
        </Text>

        <Text style={styles.sectionTitle}>2. Use License</Text>
        <Text style={styles.paragraph}>
          Permission is granted to temporarily use our application for personal, non-commercial 
          purposes only. This is the grant of a license, not a transfer of title.
        </Text>

        <Text style={styles.paragraph}>
          Under this license you may not:
        </Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>• Modify or copy the materials</Text>
          <Text style={styles.listItem}>• Use the materials for any commercial purpose</Text>
          <Text style={styles.listItem}>• Attempt to reverse engineer any software</Text>
          <Text style={styles.listItem}>• Remove any copyright or proprietary notations</Text>
        </View>

        <Text style={styles.sectionTitle}>3. Account Responsibilities</Text>
        <Text style={styles.paragraph}>
          You are responsible for maintaining the confidentiality of your account and password 
          and for restricting access to your device. You agree to accept responsibility for all 
          activities that occur under your account.
        </Text>

        <Text style={styles.sectionTitle}>4. Privacy</Text>
        <Text style={styles.paragraph}>
          Your privacy is important to us. Our Privacy Policy explains how we collect, use, 
          and protect your personal information. By using our application, you agree to the 
          collection and use of information in accordance with our Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>5. Limitations</Text>
        <Text style={styles.paragraph}>
          In no event shall we be liable for any damages arising out of the use or inability 
          to use the materials on our application, even if we have been notified of the 
          possibility of such damage.
        </Text>

        <Text style={styles.sectionTitle}>6. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may revise these terms of service at any time without notice. By using this 
          application, you are agreeing to be bound by the current version of these terms.
        </Text>

        <Text style={styles.sectionTitle}>7. Governing Law</Text>
        <Text style={styles.paragraph}>
          These terms and conditions are governed by and construed in accordance with the laws 
          of your country, and you irrevocably submit to the exclusive jurisdiction of the courts 
          in that location.
        </Text>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Questions About Our Terms?</Text>
          <Text style={styles.contactText}>
            If you have any questions about these Terms and Conditions, please contact us:
          </Text>
          
          <View style={styles.contactButton} onTouchEnd={handleOpenEmail}>
            <Ionicons name="mail-outline" size={18} color="#0066CC" />
            <Text style={styles.contactLink}>support@yourapp.com</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          By continuing to use our application, you acknowledge that you have read, understood, 
          and agree to be bound by these Terms and Conditions.
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 15,
  },
  list: {
    marginLeft: 20,
    marginBottom: 15,
  },
  listItem: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 5,
  },
  contactSection: {
    marginTop: 30,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 15,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactLink: {
    fontSize: 16,
    color: '#0066CC',
    marginLeft: 8,
  },
  footer: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 24,
    marginTop: 20,
    marginBottom: 40,
    textAlign: 'center',
  },
})