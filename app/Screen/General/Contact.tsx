import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function Contact() {
  const openEmail = () => {
    Linking.openURL('mailto:maharajahublk@gmail.com');
  };

  const openPhone = () => {
    Linking.openURL('tel:+919422755307');
  };

  const openMap = () => {
    const address = 'Maharajahub, Pathanamthitta, Kerala';
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
  };

  const openWebsite = () => {
    Linking.openURL('https://maharajahub.in');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Contact Us</Text>
          <Text style={styles.headerSubtitle}>We'd love to hear from you</Text>
        </View>

        <View style={styles.contactMethods}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          
          <TouchableOpacity style={styles.contactCard} onPress={openEmail}>
            <View style={styles.contactIcon}>
              <Ionicons name="mail" size={24} color="#2563eb" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactMethod}>Email</Text>
              <Text style={styles.contactDetail}>maharajahublk@gmail.com</Text>
              <Text style={styles.contactResponse}>Response within 24 hours</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={openPhone}>
            <View style={styles.contactIcon}>
              <Ionicons name="call" size={24} color="#2563eb" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactMethod}>Phone</Text>
              <Text style={styles.contactDetail}>+91 9422755307</Text>
              <Text style={styles.contactResponse}>Mon-Fri, 9am-5pm IST</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={openMap}>
            <View style={styles.contactIcon}>
              <Ionicons name="location" size={24} color="#2563eb" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactMethod}>Office</Text>
              <Text style={styles.contactDetail}>Maharajahub, Pathanamthitta, Kerala</Text>
              <Text style={styles.contactResponse}>Visit by appointment</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={openWebsite}>
            <View style={styles.contactIcon}>
              <Ionicons name="globe" size={24} color="#2563eb" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactMethod}>Website</Text>
              <Text style={styles.contactDetail}>maharajahub.in</Text>
              <Text style={styles.contactResponse}>FAQs & resources</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.socialContainer}>
          <Text style={styles.socialTitle}>Follow Us</Text>
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={24} color="#2563eb" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-twitter" size={24} color="#2563eb" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-instagram" size={24} color="#2563eb" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-linkedin" size={24} color="#2563eb" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
  },
  contactMethods: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactMethod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: 14,
    color: '#2563eb',
    marginBottom: 4,
    fontWeight: '500',
  },
  contactResponse: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  socialContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  socialTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});