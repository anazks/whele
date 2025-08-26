import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('General Inquiry');

  const handleSendMessage = () => {
    if (!name || !email || !message) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    // Here you would typically send the message to your backend
    Alert.alert(
      'Message Sent', 
      'Thank you for contacting us. We will get back to you within 24 hours.',
      [{ text: 'OK', onPress: () => {
        setName('');
        setEmail('');
        setMessage('');
        setSubject('General Inquiry');
      }}]
    );
  };

  const openEmail = () => {
    Linking.openURL('mailto:support@yourcompany.com');
  };

  const openPhone = () => {
    Linking.openURL('tel:+1234567890');
  };

  const openMap = () => {
    const address = '123+Business+Street+City+State+12345';
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
  };

  const openWebsite = () => {
    Linking.openURL('https://www.yourcompany.com');
  };

  return (
    <ScrollView style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <Text style={styles.headerSubtitle}>We'd love to hear from you</Text>
      </View> */}

      <View style={styles.contactMethods}>
        <Text style={styles.sectionTitle}>Get in Touch</Text>
        
        <TouchableOpacity style={styles.contactCard} onPress={openEmail}>
          <View style={styles.contactIcon}>
            <Ionicons name="mail" size={24} color="#4267B2" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactMethod}>Email</Text>
            <Text style={styles.contactDetail}>support@yourcompany.com</Text>
            <Text style={styles.contactResponse}>Response within 24 hours</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={openPhone}>
          <View style={styles.contactIcon}>
            <Ionicons name="call" size={24} color="#4267B2" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactMethod}>Phone</Text>
            <Text style={styles.contactDetail}>(123) 456-7890</Text>
            <Text style={styles.contactResponse}>Mon-Fri, 9am-5pm EST</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={openMap}>
          <View style={styles.contactIcon}>
            <Ionicons name="location" size={24} color="#4267B2" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactMethod}>Office</Text>
            <Text style={styles.contactDetail}>123 Business Street, City, State 12345</Text>
            <Text style={styles.contactResponse}>Visit by appointment</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={openWebsite}>
          <View style={styles.contactIcon}>
            <Ionicons name="globe" size={24} color="#4267B2" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactMethod}>Website</Text>
            <Text style={styles.contactDetail}>www.yourcompany.com</Text>
            <Text style={styles.contactResponse}>FAQs & resources</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Send us a Message</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Subject</Text>
          <View style={styles.picker}>
            <Text style={styles.pickerText}>{subject}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Message *</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Type your message here"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
          />
        </View>

        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send Message</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.faqSuggestion}>
        <Text style={styles.faqText}>Have a quick question? Check out our FAQs first</Text>
        <TouchableOpacity style={styles.faqButton}>
          <Text style={styles.faqButtonText}>View FAQs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.socialContainer}>
        <Text style={styles.socialTitle}>Follow Us</Text>
        <View style={styles.socialIcons}>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-facebook" size={24} color="#4267B2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-instagram" size={24} color="#E1306C" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-linkedin" size={24} color="#0077B5" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  contactMethods: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
   
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 15,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8eeff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactMethod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  contactDetail: {
    fontSize: 14,
    color: '#4267B2',
    marginBottom: 3,
  },
  contactResponse: {
    fontSize: 12,
    color: '#666',
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  messageInput: {
    height: 120,
    paddingTop: 15,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#fff',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#4267B2',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  faqSuggestion: {
    padding: 20,
    backgroundColor: '#e8eeff',
    marginTop: 10,
    alignItems: 'center',
  },
  faqText: {
    fontSize: 16,
    color: '#4267B2',
    marginBottom: 15,
    textAlign: 'center',
  },
  faqButton: {
    borderWidth: 1,
    borderColor: '#4267B2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  faqButtonText: {
    color: '#4267B2',
    fontWeight: '500',
  },
  socialContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
});